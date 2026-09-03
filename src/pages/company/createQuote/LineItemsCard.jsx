import React, { useMemo, useState } from 'react';
import { Archive, Trash2, Search, Package } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import productApi from '../../../services/productApi';

const normalizeSearchText = (value = '') =>
  String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9.]+/g, ' ')
    .trim();

const getEditDistance = (source = '', target = '') => {
  if (source === target) return 0;
  if (!source.length) return target.length;
  if (!target.length) return source.length;

  const distances = Array.from({ length: target.length + 1 }, (_, index) => index);

  for (let i = 1; i <= source.length; i += 1) {
    let previous = distances[0];
    distances[0] = i;

    for (let j = 1; j <= target.length; j += 1) {
      const current = distances[j];
      distances[j] = source[i - 1] === target[j - 1]
        ? previous
        : Math.min(previous, distances[j], distances[j - 1]) + 1;
      previous = current;
    }
  }

  return distances[target.length];
};

const getTokenScore = (query, value) => {
  const normalizedValue = normalizeSearchText(value);
  if (!query || !normalizedValue) return 0;
  if (normalizedValue === query) return 1;
  if (normalizedValue.startsWith(query)) return 0.9;
  if (normalizedValue.includes(query)) return 0.75;

  const tokens = normalizedValue.split(' ').filter(Boolean);
  return tokens.reduce((bestScore, token) => {
    if (token === query) return Math.max(bestScore, 0.95);
    if (token.startsWith(query)) return Math.max(bestScore, 0.85);
    if (token.includes(query)) return Math.max(bestScore, 0.65);

    const shorter = query.length <= token.length ? query : token;
    const longer = query.length <= token.length ? token : query;
    const distance = getEditDistance(shorter, longer.slice(0, Math.max(shorter.length, query.length)));
    const tolerance = query.length <= 4 ? 1 : 2;

    if (distance <= tolerance) {
      return Math.max(bestScore, 0.55 - distance * 0.1);
    }

    return bestScore;
  }, 0);
};

const getPriceScore = (query, product) => {
  const queryNumber = Number(query);
  if (!Number.isFinite(queryNumber)) return 0;

  const prices = [
    product?.basePrice,
    ...(product?.pricingTiers || []).map((tier) => tier.price)
  ]
    .map(Number)
    .filter(Number.isFinite);

  return prices.reduce((bestScore, price) => {
    if (price === queryNumber) return Math.max(bestScore, 1);
    if (String(price).includes(query)) return Math.max(bestScore, 0.8);

    const distance = Math.abs(price - queryNumber);
    const allowedDistance = Math.max(queryNumber * 0.08, 25);
    if (distance <= allowedDistance) {
      return Math.max(bestScore, 0.65 * (1 - distance / allowedDistance));
    }

    return bestScore;
  }, 0);
};

const getProductSearchScore = (product, rawQuery) => {
  const query = normalizeSearchText(rawQuery);
  if (!query) return 0;

  const tiers = product?.pricingTiers || [];
  const searchableFields = [
    { value: product?.name, weight: 120 },
    { value: product?.sku, weight: 90 },
    { value: product?.category, weight: 70 },
    { value: product?.productType || product?.type, weight: 55 },
    { value: product?.description, weight: 45 },
    { value: product?.features, weight: 45 },
    { value: product?.tags, weight: 45 },
    { value: product?.unit, weight: 35 },
    { value: product?.currency, weight: 20 },
    { value: product?.portOfImport, weight: 20 },
    { value: product?.addressDetail, weight: 20 },
    {
      value: tiers.length > 0 ? `tier tiers quantity pricing ${tiers.length}` : '',
      weight: 35
    },
    {
      value: tiers.map((tier) => `${tier.minQty} ${tier.maxQty} ${tier.price}`).join(' '),
      weight: 25
    }
  ];

  const fieldScore = searchableFields.reduce((score, field) => {
    const value = Array.isArray(field.value) ? field.value.join(' ') : field.value;
    return score + getTokenScore(query, value) * field.weight;
  }, 0);

  return fieldScore + getPriceScore(query, product) * 40;
};

const LineItemsCard = ({ lineItems, setLineItems, currency }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // ── Fetch Products ─────────────────────────────────────────
  const { data: productsResponse, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productApi.getProducts
  });

  const allProducts = useMemo(() => productsResponse?.data || [], [productsResponse]);

  const filteredProducts = useMemo(() => {
    const query = normalizeSearchText(searchTerm);
    if (!query) return [];

    return allProducts
      .map((product) => ({
        product,
        score: getProductSearchScore(product, query)
      }))
      .filter((result) => result.score > 0)
      .sort((first, second) => second.score - first.score)
      .map((result) => result.product);
  }, [allProducts, searchTerm]);

  const activeHighlightedIndex =
    highlightedIndex >= 0 || !isDropdownOpen || !searchTerm || filteredProducts.length === 0
      ? highlightedIndex
      : 0;

  const calculateItemTotal = (price, qty, discount) => {
    return (price * qty) * (1 - (discount || 0) / 100);
  };

  const getTierPrice = (product, qty) => {
    if (!product || !product.pricingTiers || product.pricingTiers.length === 0) {
      return product?.basePrice || 0;
    }

    // Sort tiers by minQty to ensure consistent selection
    const sortedTiers = [...product.pricingTiers].sort((a, b) => a.minQty - b.minQty);

    // 1. Find exact match within tiers
    const matchedTier = sortedTiers.find(
      tier => qty >= tier.minQty && (tier.maxQty === null || tier.maxQty === undefined || qty <= tier.maxQty)
    );
    
    if (matchedTier) return matchedTier.price;

    // 2. If qty exceeds the highest defined tier, use the highest tier's price
    const highestTier = sortedTiers[sortedTiers.length - 1];
    if (qty > highestTier.maxQty) {
      return highestTier.price;
    }

    return product.basePrice;
  };


  const addProductToItems = (product) => {
    // Check if item already exists
    const existingIndex = lineItems.findIndex(item => item.product === product._id);
    
    if (existingIndex > -1) {
        // Increment qty
        const updatedItems = [...lineItems];
        const newQty = updatedItems[existingIndex].qty + 1;
        
        // Lookup tier price for new quantity
        const newPrice = getTierPrice(product, newQty);
        
        updatedItems[existingIndex].qty = newQty;
        updatedItems[existingIndex].price = newPrice;
        updatedItems[existingIndex].total = calculateItemTotal(
            newPrice, 
            newQty, 
            updatedItems[existingIndex].discount
        );
        setLineItems(updatedItems);
    } else {
        // Add new item
        const initialPrice = getTierPrice(product, 1);
        const newItem = {
            product: product._id,
            name: product.name,
            sku: product.sku,
            qty: 1,
            price: initialPrice,
            productImage: product.productImage,
            cataloguePdf: product.cataloguePdf || '',
            discount: 0,
            total: initialPrice
        };
        setLineItems([...lineItems, newItem]);
    }
    setSearchTerm('');
    setIsDropdownOpen(false);
    setHighlightedIndex(-1);
  };

  const handleSearchKeyDown = (e) => {
    if (!isDropdownOpen && ['ArrowDown', 'ArrowUp', 'Enter'].includes(e.key)) {
      setIsDropdownOpen(true);
    }

    if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      setHighlightedIndex(-1);
      return;
    }

    if (!searchTerm || filteredProducts.length === 0) {
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % filteredProducts.length);
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev <= 0 ? filteredProducts.length - 1 : prev - 1
      );
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      const selectedIndex = activeHighlightedIndex >= 0 ? activeHighlightedIndex : 0;
      addProductToItems(filteredProducts[selectedIndex]);
    }
  };

  const updateItem = (index, field, value) => {
    const updatedItems = [...lineItems];
    updatedItems[index][field] = value;
    
    // If quantity changed, check for new tier price
    if (field === 'qty') {
        const productData = allProducts.find(p => p._id === updatedItems[index].product);
        if (productData) {
            updatedItems[index].price = getTierPrice(productData, value);
        }
    }

    // Recalculate total for this row
    updatedItems[index].total = calculateItemTotal(
        updatedItems[index].price, 
        updatedItems[index].qty, 
        updatedItems[index].discount
    );
    
    setLineItems(updatedItems);
  };


  const removeItem = (index) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const formatCurrency = (amount) => {
    const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
    const symbol = symbols[currency] || '$';
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 font-sans mb-6 xl:mb-0 relative">
      <div className="flex items-center gap-2 mb-5">
        <Archive className="w-5 h-5 text-[#145be9]" />
        <h2 className="text-[#1a2b4b] font-bold text-lg">Line Items</h2>
      </div>

      <div className="border border-gray-100 rounded-2xl p-4 mb-6 bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-[#145be9]" />
          <h3 className="text-[#1a2b4b] font-bold text-base">Product Selection</h3>
        </div>

        <div className="relative mt-4">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input 
                type="text"
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsDropdownOpen(true);
                    setHighlightedIndex(-1);
                }}
                onFocus={() => {
                    setIsDropdownOpen(true);
                    setHighlightedIndex(-1);
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search products by name or SKU..."
                className="block w-full pl-11 pr-4 py-3.5 bg-[#f4f7fe] border-transparent rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#145be9] focus:bg-white transition-all"
            />

            {isDropdownOpen && searchTerm && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto custom-scrollbar">
                {isLoading ? (
                    <div className="p-4 text-center text-gray-400 text-sm">Loading products...</div>
                ) : filteredProducts.length > 0 ? (
                    filteredProducts.map((p, index) => (
                        <button 
                            key={p._id}
                            type="button"
                            onClick={() => addProductToItems(p)}
                            onMouseEnter={() => setHighlightedIndex(index)}
                            className={`w-full text-left p-4 cursor-pointer border-b border-gray-50 last:border-0 transition-colors ${
                                activeHighlightedIndex === index ? 'bg-blue-50' : 'hover:bg-blue-50'
                            }`}
                        >
                            <div className="font-bold text-[#1a2b4b] text-sm">{p.name}</div>
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-xs text-gray-500 font-medium">{p.sku}</span>
                                <span className="text-xs text-[#145be9] font-black">{formatCurrency(p.basePrice)}</span>
                            </div>
                        </button>
                    ))
                ) : (
                    <div className="p-4 text-center text-gray-400 text-sm">No products found</div>
                )}
              </div>
            )}
        </div>
      </div>

      <div className="w-full">
        {lineItems.length > 0 ? (
          <>
            <div className="grid grid-cols-[2fr_0.5fr_1fr_0.5fr_1fr_0.2fr] gap-4 mb-3 px-4">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">PRODUCT / SERVICE DESCRIPTION</div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">QTY</div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">UNIT PRICE</div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">DISC %</div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">TOTAL</div>
              <div className="w-5"></div>
            </div>

            <div className="space-y-2 mb-6">
                {lineItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-[2fr_0.5fr_1fr_0.5fr_1fr_0.2fr] gap-4 items-center bg-[#f8fafc] p-4 rounded-xl transition-all hover:shadow-sm hover:bg-[#f3f7ff]">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white border border-blue-50 rounded-lg flex items-center justify-center text-blue-400">
                                <Package className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-[#1a2b4b] font-bold text-sm mb-0.5">{item.name}</h3>
                                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-tighter">{item.sku}</p>
                            </div>
                        </div>
                        <div className="text-center">
                            <input 
                                type="number"
                                min="1"
                                value={item.qty}
                                onChange={(e) => updateItem(index, 'qty', parseInt(e.target.value) || 1)}
                                className="w-full text-center bg-white border border-gray-100 rounded-lg py-1 font-bold text-[#145be9] text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        <div className="text-right font-bold text-gray-700 text-sm">
                            {formatCurrency(item.price)}
                        </div>
                        <div className="text-center">
                            <input 
                                type="number"
                                min="0"
                                max="100"
                                value={item.discount}
                                onChange={(e) => updateItem(index, 'discount', parseInt(e.target.value) || 0)}
                                className="w-full text-center bg-white border border-gray-100 rounded-lg py-1 font-bold text-emerald-500 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                        </div>
                        <div className="text-right font-black text-[#1a2b4b] text-sm bg-white/50 px-2 py-1 rounded-lg border border-gray-100/50">
                            {formatCurrency(item.total)}
                        </div>
                        <button 
                            onClick={() => removeItem(index)}
                            className="text-gray-300 hover:text-red-500 transition-colors p-1"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
          </>
        ) : (
          <div className="border border-dashed border-gray-200 rounded-xl p-6 text-center bg-gray-50/50">
            <p className="text-gray-500 text-sm font-medium">
              No product selected. Search above or select a product.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LineItemsCard;
