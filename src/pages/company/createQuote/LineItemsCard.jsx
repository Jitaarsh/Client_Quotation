import React, { useState } from 'react';
import { Archive, Plus, ListPlus, Trash2, Search, Package } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import productApi from '../../../services/productApi';

const LineItemsCard = ({ lineItems, setLineItems, currency }) => {
  const [isProductMenuOpen, setIsProductMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // ── Fetch Products ─────────────────────────────────────────
  const { data: productsResponse, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productApi.getProducts
  });

  const allProducts = productsResponse?.data || [];

  // Filter based on search
  const filteredProducts = allProducts.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            discount: 0,
            total: initialPrice
        };
        setLineItems([...lineItems, newItem]);
    }
    setSearchTerm('');
    setIsProductMenuOpen(false);
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
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Archive className="w-5 h-5 text-[#145be9]" />
          <h2 className="text-[#1a2b4b] font-bold text-lg">Line Items</h2>
        </div>
        <div className="relative">
            <button 
                type="button"
                onClick={() => setIsProductMenuOpen(!isProductMenuOpen)}
                className="bg-[#dce6fa] hover:bg-blue-200 text-[#145be9] px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
            >
                <ListPlus className="w-4 h-4" />
                Add from List Product
            </button>

            {/* Product Selection Menu */}
            {isProductMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-gray-100 rounded-xl shadow-xl z-50 p-2 overflow-hidden">
                    <div className="p-2 border-b border-gray-50 mb-2">
                        <div className="relative">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input 
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search products..."
                                className="w-full pl-9 pr-3 py-2 bg-gray-50 border-none rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
                            />
                        </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        {isLoading ? (
                            <div className="p-4 text-center text-gray-400 text-xs">Loading...</div>
                        ) : filteredProducts.length > 0 ? (
                            filteredProducts.map(p => (
                                <div 
                                    key={p._id}
                                    onClick={() => addProductToItems(p)}
                                    className="p-3 hover:bg-blue-50 cursor-pointer rounded-lg border-b border-gray-50 last:border-0 transition-colors"
                                >
                                    <div className="font-bold text-[#1a2b4b] text-xs underline decoration-blue-100">{p.name}</div>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-[10px] text-gray-400 font-bold">{p.sku}</span>
                                        <span className="text-[10px] text-[#145be9] font-black">{formatCurrency(p.basePrice)}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-gray-400 text-xs">No products found</div>
                        )}
                    </div>
                </div>
            )}
        </div>
      </div>

      <div className="w-full">
        {/* Table Header */}
        <div className="grid grid-cols-[2fr_0.5fr_1fr_0.5fr_1fr_0.2fr] gap-4 mb-3 px-4">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">PRODUCT / SERVICE DESCRIPTION</div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">QTY</div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">UNIT PRICE</div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">DISC %</div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">TOTAL</div>
          <div className="w-5"></div>
        </div>

        {/* Dynamic Items */}
        <div className="space-y-2 mb-6">
            {lineItems.length > 0 ? (
                lineItems.map((item, index) => (
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
                ))
            ) : (
                <div className="p-12 border border-dashed border-gray-200 rounded-[2rem] text-center bg-gray-50/50">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100 shadow-sm text-gray-300">
                        <Archive className="w-6 h-6" />
                    </div>
                    <p className="text-gray-400 text-sm font-bold">Your line items list is currently empty.</p>
                    <p className="text-gray-400 text-[11px] font-medium mt-1">Select products using the button above to populate the ledger.</p>
                </div>
            )}
        </div>

        {/* Add More Product Button */}
        <button 
            type="button"
            onClick={() => setIsProductMenuOpen(true)}
            className="w-full py-4 border-2 border-dashed border-[#dce6fa] hover:border-[#145be9] hover:bg-[#f8fafc] transition-all rounded-xl flex items-center justify-center gap-2 text-[#145be9] font-bold appearance-none group"
        >
          <Plus className="w-5 h-5 text-[#145be9] group-hover:scale-110 transition-transform" />
          <span>Add More Product</span>
        </button>
      </div>
    </div>
  );
};

export default LineItemsCard;
