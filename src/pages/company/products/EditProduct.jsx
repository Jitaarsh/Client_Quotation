import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Save, Loader2, Package, Tag, Box,
  DollarSign, IndianRupee, Euro, PoundSterling, Hash, Info, MapPin, Truck, Plus, Trash2, Layers
} from 'lucide-react';
import useProductFormStore from '../../../store/productFormStore';
import productApi from '../../../services/productApi';
import { getServerAssetUrl } from '../../../config/api';

const InputField = ({ label, name, type = 'text', icon: Icon, placeholder, required = false, value, onChange, error, className = "" }) => (
  <div className={`space-y-1.5 transition-all ${className}`}>
    <label className={`text-sm font-bold block ml-1 flex items-center transition-colors ${error ? 'text-rose-500' : 'text-[#1a2b4b]'}`}>
      {label} {required && <span className={`${error ? 'text-rose-600' : 'text-red-500'} ml-1`}>*</span>}
    </label>
    <div className="relative group">
      {Icon && (
        <div className={`absolute ${type === 'textarea' ? 'top-3.5' : 'inset-y-0'} left-0 pl-4 flex items-center pointer-events-none transition-colors ${error ? 'text-rose-400' : 'text-gray-400 group-focus-within:text-[#145be9]'
          }`}>
          <Icon className="w-4 h-4" />
        </div>
      )}
      {type === 'textarea' ? (
        <textarea
          name={name}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={4}
          className={`w-full transition-all ${Icon ? 'pl-11' : 'pl-4'} pr-6 py-3 rounded-xl text-sm focus:outline-none font-medium resize-none ${error
              ? 'bg-rose-50/50 border-rose-300 focus:border-rose-500 focus:bg-white text-rose-900 placeholder:text-rose-200'
              : 'bg-[#f0f4ff]/50 border-transparent focus:border-[#145be9] focus:bg-white placeholder:text-gray-300'
            } border focus:ring-4 ${error ? 'focus:ring-rose-500/5' : 'focus:ring-blue-500/5'}`}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full transition-all ${Icon ? 'pl-11' : 'pl-4'} pr-6 py-3 rounded-xl text-sm focus:outline-none font-medium ${error
              ? 'bg-rose-50/50 border-rose-300 focus:border-rose-500 focus:bg-white text-rose-900 placeholder:text-rose-200'
              : 'bg-[#f0f4ff]/50 border-transparent focus:border-[#145be9] focus:bg-white placeholder:text-gray-300'
            } border focus:ring-4 ${error ? 'focus:ring-rose-500/5' : 'focus:ring-blue-500/5'}`}
        />
      )}
    </div>
    {error && (
      <p className="text-rose-500 text-[11px] font-semibold ml-1 animate-in fade-in slide-in-from-top-1 duration-200">
        {error}
      </p>
    )}
  </div>
);

const CustomSelect = ({ label, name, icon: Icon, options, required = false, value, onChange, activeDropdown, setActiveDropdown, error }) => {
  const isOpen = activeDropdown === name;
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="space-y-1.5 relative transition-all">
      <label className={`text-sm font-bold block ml-1 flex items-center transition-colors ${error ? 'text-rose-500' : 'text-[#1a2b4b]'}`}>
        {label} {required && <span className={`${error ? 'text-rose-600' : 'text-red-500'} ml-1`}>*</span>}
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setActiveDropdown(isOpen ? null : name)}
        className={`w-full flex items-center transition-all pl-4 pr-6 py-3 rounded-xl text-sm font-medium focus:outline-none border ${error
            ? 'bg-rose-50/50 border-rose-300 ring-rose-500/5'
            : isOpen ? 'border-[#145be9] bg-white ring-blue-500/5' : 'border-transparent hover:border-gray-200 bg-[#f0f4ff]/50'
          } ${isOpen ? 'ring-4' : ''}`}
      >
        <div className={`${error ? 'text-rose-400' : isOpen ? 'text-[#145be9]' : 'text-gray-400'} mr-3.5 transition-colors`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className={`flex-1 text-left ${value ? 'text-[#1a2b4b]' : error ? 'text-rose-300' : 'text-gray-300'}`}>
          {selectedOption ? selectedOption.label : `Select ${label}`}
        </span>
        <ArrowLeft className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-90' : 'rotate-[270deg]'} ${error ? 'text-rose-300' : isOpen ? 'text-[#145be9]' : 'text-gray-400'
          }`} />
      </button>

      {/* Error Message */}
      {error && (
        <p className="text-rose-500 text-[11px] font-semibold ml-1">
          {error}
        </p>
      )}

      {/* Options Dropdown */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setActiveDropdown(null)}></div>
          <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-gray-100 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] py-2 z-[70] animate-in fade-in zoom-in-95 duration-200">
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(name, opt.value);
                    setActiveDropdown(null);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-sm font-semibold transition-all hover:pl-6 ${value === opt.value ? 'text-[#145be9] bg-blue-50' : 'text-gray-600 hover:bg-gray-50 hover:text-[#1a2b4b]'
                    }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full mr-3 transition-all ${value === opt.value ? 'bg-[#145be9] scale-100' : 'bg-transparent scale-0'
                    }`}></div>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [errors, setErrors] = useState({});

  // Currency to Icon mapper
  const currencyIcons = {
    INR: IndianRupee,
    USD: DollarSign,
    EUR: Euro,
    GBP: PoundSterling
  };

  // Zustand Store
  const { formData, setField, setFormData, addTier, updateTier, removeTier, resetForm } = useProductFormStore();

  // Re-calculate icon when formData changes
  const CurrentIcon = currencyIcons[formData.currency] || DollarSign;

  // Fetch product data
  const { data: productResponse, isLoading: isFetching } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.getProductById(id),
    enabled: !!id
  });

  // Populate form when data is loaded
  useEffect(() => {
    if (productResponse?.data) {
      setFormData(productResponse.data);
    }
  }, [productResponse, setFormData]);

  // Clear form when component unmounts
  useEffect(() => {
    return () => resetForm();
  }, [resetForm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setField(name, value);
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSelectChange = (name, value) => {
    setField(name, value);
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Product name is required';
    if (!formData.sku) newErrors.sku = 'SKU is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.basePrice || isNaN(formData.basePrice) || formData.basePrice <= 0) {
      newErrors.basePrice = 'Valid base price is required';
    }

    // Tier validation
    let hasTierError = false;
    formData.pricingTiers.forEach((tier, index) => {
      if (!tier.minQty || !tier.maxQty || !tier.price) hasTierError = true;
      if (Number(tier.minQty) >= Number(tier.maxQty)) hasTierError = true;
    });

    if (hasTierError) {
      newErrors.tiers = 'Please ensure all pricing tier fields are valid (Min < Max)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateMutation = useMutation({
    mutationFn: (data) => productApi.updateProduct({ id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      queryClient.invalidateQueries(['product', id]);
      resetForm();
      navigate('/dashboard/products');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to update product');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const formDataToSend = new FormData();

      // List of fields allowed to be updated
      const allowedFields = [
        'name', 'sku', 'category', 'description', 'basePrice',
        'unit', 'status', 'currency', 'pricingTiers',
        'portOfImport', 'addressDetail'
      ];

      // Append standard fields
      allowedFields.forEach(key => {
        if (key === 'pricingTiers') {
          formDataToSend.append(key, JSON.stringify(formData[key].map(t => ({
            minQty: Number(t.minQty),
            maxQty: Number(t.maxQty),
            price: Number(t.price)
          }))));
        } else if (formData[key] !== undefined && formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Handle File fields specifically
      ['productImage', 'cataloguePdf'].forEach(key => {
        if (formData[key] instanceof File) {
          // New file uploaded
          formDataToSend.append(key, formData[key]);
        } else if (formData[key] === null && productResponse?.data?.[key]) {
          // File was removed (it was there in data but now null in form)
          formDataToSend.append(key, "");
        }
        // If it's a string, it's the existing path, we don't need to send it back
      });

      updateMutation.mutate(formDataToSend);
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setField(name, files[0]);
    }
  };

  const removeFile = (name) => {
    setField(name, null);
  };

  const getFilePreview = (fileOrPath) => {
    if (!fileOrPath) return null;
    if (fileOrPath instanceof File) return URL.createObjectURL(fileOrPath);
    return getServerAssetUrl(fileOrPath);
  };

  const categoryOptions = [
    { label: 'Materials', value: 'Materials' },
    { label: 'Services', value: 'Services' },
    { label: 'Consulting', value: 'Consulting' }
  ];

  const unitOptions = [
    { label: 'Square Meter (sqm)', value: 'sqm' },
    { label: 'Hour (hr)', value: 'hr' },
    { label: 'Unit', value: 'unit' },
    { label: 'Kilogram (kg)', value: 'kg' },
    { label: 'Ton', value: 'ton' }
  ];

  const statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
  ];

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-[#145be9] animate-spin" />
        <p className="text-gray-400 font-bold tracking-widest text-xs uppercase text-center">Loading Product Data...</p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard/products')}
            className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-[#145be9] hover:border-blue-200 hover:bg-blue-50 transition-all active:scale-95 flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-[#1a2b4b] text-[2rem] font-black tracking-tight leading-tight">Edit Product</h1>
            <p className="text-gray-500 text-sm font-medium">Update the details for {formData.name || 'this item'}.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Basic Information */}
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 lg:p-10 shadow-sm shadow-blue-500/5">
          <div className="flex items-center space-x-3 mb-8 ml-1">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-[#145be9]" />
            </div>
            <div>
              <h2 className="text-[#1a2b4b] font-bold text-lg leading-none mb-1">Product Identity</h2>
              <p className="text-gray-400 text-xs font-medium">Core details and categorization.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <InputField label="Product Name" name="name" icon={Box} placeholder="e.g. Black Granite Paving" required value={formData.name} onChange={handleInputChange} error={errors.name} />
            <InputField label="SKU / Internal Code" name="sku" icon={Hash} placeholder="e.g. MAT-GRN-001" required value={formData.sku} onChange={handleInputChange} error={errors.sku} />
            <CustomSelect label="Category" name="category" icon={Tag} options={categoryOptions} required value={formData.category} onChange={handleSelectChange} activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown} error={errors.category} />
            <CustomSelect label="Status" name="status" icon={Info} options={statusOptions} required value={formData.status} onChange={handleSelectChange} activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown} />
            <div className="md:col-span-2">
              <InputField label="Description" name="description" type="textarea" icon={Info} placeholder="Enter detailed specifications..." value={formData.description} onChange={handleInputChange} />
            </div>
          </div>
        </div>

        {/* Section 2: Pricing & Units */}
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 lg:p-10 shadow-sm shadow-blue-500/5">
          <div className="flex items-center space-x-3 mb-8 ml-1">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-[#1a2b4b] font-bold text-lg leading-none mb-1">Pricing & Discounts</h2>
              <p className="text-gray-400 text-xs font-medium">Set base price and bulk quantity rules.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            <CustomSelect
              label="Currency"
              name="currency"
              icon={CurrentIcon}
              options={[
                { label: 'INR (₹)', value: 'INR' },
                { label: 'USD ($)', value: 'USD' },
                { label: 'EUR (€)', value: 'EUR' },
                { label: 'GBP (£)', value: 'GBP' }
              ]}
              required
              value={formData.currency}
              onChange={handleSelectChange}
              activeDropdown={activeDropdown}
              setActiveDropdown={setActiveDropdown}
            />
            <InputField label="Base Price" name="basePrice" type="number" icon={CurrentIcon} placeholder="0.00" required value={formData.basePrice} onChange={handleInputChange} error={errors.basePrice} />
            <CustomSelect label="Unit of Measure" name="unit" icon={Layers} options={unitOptions} required value={formData.unit} onChange={handleSelectChange} activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown} />
          </div>

          <hr className="border-gray-100 mb-8" />

          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-[#1a2b4b]">Bulk Pricing Rules</h3>
            <button
              type="button"
              onClick={addTier}
              className="px-3 py-1.5 bg-[#eef2ff] hover:bg-blue-100 text-[#145be9] text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Rule
            </button>
          </div>

          {errors.tiers && <p className="text-rose-500 text-[11px] font-semibold mb-4">{errors.tiers}</p>}

          <div className="space-y-4">
            {formData.pricingTiers.length === 0 ? (
              <p className="text-sm text-gray-400 font-medium italic p-4 bg-gray-50 rounded-xl border border-gray-100/50">No bulk pricing rules added.</p>
            ) : (
              formData.pricingTiers.map((tier, index) => (
                <div key={index} className="flex items-end gap-4 p-4 bg-[#f8fafc] rounded-2xl border border-gray-100">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <InputField label="Min Qty" name={`minQty`} type="number" placeholder="e.g. 100" value={tier.minQty} onChange={(e) => updateTier(index, 'minQty', e.target.value)} />
                    <InputField label="Max Qty" name={`maxQty`} type="number" placeholder="e.g. 499" value={tier.maxQty} onChange={(e) => updateTier(index, 'maxQty', e.target.value)} />
                    <InputField label="Tier Price" name={`price`} type="number" icon={CurrentIcon} placeholder="0.00" value={tier.price} onChange={(e) => updateTier(index, 'price', e.target.value)} />
                  </div>
                  <button type="button" onClick={() => removeTier(index)} className="mb-1 p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Section 3: Logistics & Attachments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Logistics */}
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 lg:p-10 shadow-sm shadow-blue-500/5 h-full">
            <div className="flex items-center space-x-3 mb-8 ml-1">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <Truck className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <h2 className="text-[#1a2b4b] font-bold text-lg leading-none mb-1">Logistics & Storage</h2>
                <p className="text-gray-400 text-xs font-medium">Sourcing ports and warehouse details.</p>
              </div>
            </div>

            <div className="space-y-6">
              <InputField label="Port of Import" name="portOfImport" icon={MapPin} placeholder="e.g. Mundra Port" value={formData.portOfImport} onChange={handleInputChange} />
              <InputField label="Warehouse Details" name="addressDetail" icon={Box} placeholder="e.g. Aisle 4, Shelf B" value={formData.addressDetail} onChange={handleInputChange} />
            </div>
          </div>

          {/* Attachments */}
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 lg:p-10 shadow-sm shadow-blue-500/5 h-full">
            <div className="flex items-center space-x-3 mb-8 ml-1">
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                <Layers className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <h2 className="text-[#1a2b4b] font-bold text-lg leading-none mb-1 flex items-center gap-2">
                  Media & Documents <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md tracking-wide uppercase">New</span>
                </h2>
                <p className="text-gray-400 text-xs font-medium">Product photos and PDF catalogues.</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Product Image */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1a2b4b] ml-1">Product Image</label>
                <div className="relative group">
                  {formData.productImage ? (
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
                      <img
                        src={getFilePreview(formData.productImage)}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile('productImage')}
                        className="absolute top-3 right-3 p-2 bg-rose-500 text-white rounded-xl shadow-lg hover:bg-rose-600 transition-all active:scale-90"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-gray-200 rounded-[2rem] hover:bg-gray-50 hover:border-[#145be9] transition-all cursor-pointer group">
                      <div className="w-12 h-12 bg-gray-50 group-hover:bg-blue-50 rounded-2xl flex items-center justify-center mb-3 transition-colors">
                        <Box className="w-6 h-6 text-gray-400 group-hover:text-[#145be9]" />
                      </div>
                      <span className="text-sm font-bold text-gray-500 group-hover:text-[#1a2b4b]">Upload Photo</span>
                      <span className="text-[10px] font-medium text-gray-400 mt-1 uppercase tracking-wider">PNG, JPG up to 10MB</span>
                      <input type="file" name="productImage" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              {/* PDF Catalogue */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1a2b4b] ml-1">PDF Catalogue</label>
                <div className="relative group">
                  {formData.cataloguePdf ? (
                    <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                          <Layers className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-emerald-900 truncate max-w-[150px]">
                            {formData.cataloguePdf instanceof File ? formData.cataloguePdf.name : 'View Current Catalogue'}
                          </p>
                          <p className="text-[10px] font-bold text-emerald-600 uppercase">
                            {formData.cataloguePdf instanceof File ? 'New PDF Ready' : 'Existing Document'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {!(formData.cataloguePdf instanceof File) && (
                          <a
                            href={getFilePreview(formData.cataloguePdf)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                          >
                            <Info className="w-5 h-4" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => removeFile('cataloguePdf')}
                          className="p-2 text-rose-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex items-center justify-between p-4 bg-[#f0f4ff]/50 border border-transparent hover:border-blue-200 rounded-2xl cursor-pointer group transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-blue-50">
                          <Layers className="w-5 h-5 text-gray-400 group-hover:text-[#145be9]" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-gray-400 group-hover:text-[#1a2b4b]">Add Catalogue</p>
                          <p className="text-[10px] font-bold text-gray-300 uppercase">Documents Only</p>
                        </div>
                      </div>
                      <input type="file" name="cataloguePdf" accept="application/pdf" onChange={handleFileChange} className="hidden" />
                      <Plus className="w-5 h-5 text-gray-300 group-hover:text-[#145be9]" />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="sticky bottom-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-100 -mx-4 -mb-4 lg:-mx-8 lg:-mb-8 px-4 lg:px-8 py-4 lg:py-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 sm:gap-4 mt-8 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
          <button
            type="button"
            onClick={() => navigate('/dashboard/products')}
            className="w-full sm:w-auto text-slate-500 font-bold text-[15px] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all px-6 py-3.5 active:scale-95"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="w-full sm:w-auto flex items-center justify-center space-x-3 bg-[#0557cc] text-white px-12 py-4 rounded-xl font-bold hover:bg-[#0449ad] shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-70 group whitespace-nowrap"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Updating...</span>
              </>
            ) : (
              <>
                <span>Update Product</span>
                <Save className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
