import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Save, Loader2, Package, Tag, Box,
  DollarSign, IndianRupee, Euro, PoundSterling, Hash, Info, MapPin, Truck, Plus, Trash2, Layers, CheckCircle2
} from 'lucide-react';
import useProductFormStore from '../../../store/productFormStore';
import productApi from '../../../services/productApi';

const InputField = ({ label, name, type = 'text', icon: Icon, placeholder, required = false, value, onChange, error, helperText, className = "" }) => {
  const isSuccess = value !== undefined && value !== null && value !== '' && !error;
  return (
    <div className={`space-y-1.5 transition-all ${className}`}>
      <label className={`text-sm font-bold block ml-1 flex items-center transition-colors ${error ? 'text-rose-500' : 'text-[#1a2b4b]'}`}>
        {label} {required && <span className={`${error ? 'text-rose-600' : 'text-red-500'} ml-1`}>*</span>}
      </label>
      <div className="relative group">
        {Icon && (
          <div className={`absolute ${type === 'textarea' ? 'top-3.5' : 'inset-y-0'} left-0 pl-4 flex items-center pointer-events-none transition-colors ${error ? 'text-rose-400' : isSuccess ? 'text-emerald-500' : 'text-gray-400 group-focus-within:text-[#145be9]'
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
            className={`w-full transition-all ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-3.5 sm:py-3 rounded-xl text-sm focus:outline-none font-medium resize-none ${error
                ? 'bg-rose-50/50 border-rose-300 focus:border-rose-500 focus:bg-white text-rose-900 placeholder:text-rose-200'
                : isSuccess
                  ? 'bg-emerald-50/30 border-emerald-200 focus:border-emerald-500 focus:bg-white text-emerald-900'
                  : 'bg-[#f0f4ff]/50 border-transparent focus:border-[#145be9] focus:bg-white placeholder:text-gray-300'
              } border focus:ring-4 ${error ? 'focus:ring-rose-500/5' : isSuccess ? 'focus:ring-emerald-500/5' : 'focus:ring-blue-500/5'}`}
          />
        ) : (
          <input
            type={type}
            name={name}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className={`w-full transition-all ${Icon ? 'pl-11' : 'pl-4'} pr-10 py-3.5 sm:py-3 rounded-xl text-sm focus:outline-none font-medium ${error
                ? 'bg-rose-50/50 border-rose-300 focus:border-rose-500 focus:bg-white text-rose-900 placeholder:text-rose-200'
                : isSuccess
                  ? 'bg-emerald-50/30 border-emerald-200 focus:border-emerald-500 focus:bg-white text-emerald-900'
                  : 'bg-[#f0f4ff]/50 border-transparent focus:border-[#145be9] focus:bg-white placeholder:text-gray-300'
              } border focus:ring-4 ${error ? 'focus:ring-rose-500/5' : isSuccess ? 'focus:ring-emerald-500/5' : 'focus:ring-blue-500/5'}`}
          />
        )}
        {isSuccess && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none animate-in zoom-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
        )}
      </div>
      {error && (
        <p className="text-rose-500 text-[11px] font-semibold ml-1 animate-in fade-in slide-in-from-top-1 duration-200">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p className="text-gray-400 text-[11px] font-medium ml-1">
          {helperText}
        </p>
      )}
    </div>
  );
};

const CustomSelect = ({ label, name, icon: Icon, options, required = false, value, onChange, activeDropdown, setActiveDropdown, error, helperText }) => {
  const isOpen = activeDropdown === name;
  const selectedOption = options.find(opt => opt.value === value);
  const isSuccess = value !== undefined && value !== null && value !== '' && !error;

  return (
    <div className="space-y-1.5 relative transition-all">
      <label className={`text-sm font-bold block ml-1 flex items-center transition-colors ${error ? 'text-rose-500' : 'text-[#1a2b4b]'}`}>
        {label} {required && <span className={`${error ? 'text-rose-600' : 'text-red-500'} ml-1`}>*</span>}
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setActiveDropdown(isOpen ? null : name)}
        className={`w-full flex items-center transition-all pl-4 pr-6 py-3.5 sm:py-3 rounded-xl text-sm font-medium focus:outline-none border ${error
            ? 'bg-rose-50/50 border-rose-300 ring-rose-500/5'
            : isSuccess ? 'bg-emerald-50/30 border-emerald-200 ring-emerald-500/5' : isOpen ? 'border-[#145be9] bg-white ring-blue-500/5' : 'border-transparent hover:border-gray-200 bg-[#f0f4ff]/50'
          } ${isOpen ? 'ring-4' : ''}`}
      >
        <div className={`${error ? 'text-rose-400' : isSuccess ? 'text-emerald-500' : isOpen ? 'text-[#145be9]' : 'text-gray-400'} mr-3.5 transition-colors`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className={`flex-1 text-left ${value ? 'text-[#1a2b4b]' : error ? 'text-rose-300' : 'text-gray-300'}`}>
          {selectedOption ? selectedOption.label : `Select ${label}`}
        </span>
        {isSuccess && !isOpen && (
          <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 transition-transform duration-200 zoom-in" />
        )}
        <ArrowLeft className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-90' : 'rotate-[270deg]'} ${error ? 'text-rose-300' : isOpen ? 'text-[#145be9]' : 'text-gray-400'
          }`} />
      </button>

      {/* Error Message */}
      {error && (
        <p className="text-rose-500 text-[11px] font-semibold ml-1">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p className="text-gray-400 text-[11px] font-medium ml-1">
          {helperText}
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

const AddProduct = () => {
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

  const ActiveCurrencyIcon = currencyIcons[useProductFormStore.getState().formData.currency] || DollarSign;

  // Zustand Store
  const { formData, setField, addTier, updateTier, removeTier, resetForm } = useProductFormStore();

  // Re-calculate icon when formData changes
  const CurrentIcon = currencyIcons[formData.currency] || DollarSign;

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

  const createMutation = useMutation({
    mutationFn: productApi.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      resetForm();
      navigate('/dashboard/products');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to create product');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const formDataToSend = new FormData();
      // Map and append all fields to FormData
      const fields = [
        'name', 'sku', 'category', 'description', 'basePrice',
        'unit', 'status', 'currency', 'pricingTiers',
        'portOfImport', 'addressDetail', 'productImage', 'cataloguePdf'
      ];

      fields.forEach(key => {
        if (key === 'pricingTiers') {
          // Send tiers as stringified JSON for backend parsing
          formDataToSend.append(key, JSON.stringify(formData[key].map(t => ({
            minQty: Number(t.minQty),
            maxQty: Number(t.maxQty),
            price: Number(t.price)
          }))));
        } else if (key === 'productImage' || key === 'cataloguePdf') {
          // Only append if a file is actually selected
          if (formData[key] instanceof File) {
            formDataToSend.append(key, formData[key]);
          }
        } else if (formData[key] !== undefined && formData[key] !== null && formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      });

      createMutation.mutate(formDataToSend);
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
            <h1 className="text-[#1a2b4b] text-[2rem] font-black tracking-tight leading-tight">Add New Product</h1>
            <p className="text-gray-500 text-sm font-medium hidden sm:block">Create a new item in your inventory or service catalog.</p>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <InputField label="Product Name" name="name" icon={Box} placeholder="e.g. Black Granite Paving" required value={formData.name} onChange={handleInputChange} error={errors.name} helperText="The public-facing name of the item." />
            <InputField label="SKU / Internal Code" name="sku" icon={Hash} placeholder="e.g. MAT-GRN-001" required value={formData.sku} onChange={handleInputChange} error={errors.sku} helperText="Unique identifier for inventory tracking." />
            <CustomSelect label="Category" name="category" icon={Tag} options={categoryOptions} required value={formData.category} onChange={handleSelectChange} activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown} error={errors.category} helperText="Group similar products together." />
            <CustomSelect label="Status" name="status" icon={Info} options={statusOptions} required value={formData.status} onChange={handleSelectChange} activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown} helperText="Control visibility of this item." />
            <div className="md:col-span-2">
              <InputField label="Description" name="description" type="textarea" icon={Info} placeholder="Enter detailed specifications..." value={formData.description} onChange={handleInputChange} helperText="Provide any necessary technical details or dimensions." />
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8">
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
              helperText="Trading currency for this item."
            />
            <InputField label="Base Price" name="basePrice" type="number" icon={CurrentIcon} placeholder="0.00" required value={formData.basePrice} onChange={handleInputChange} error={errors.basePrice} helperText="Initial price without any discounts." />
            <CustomSelect label="Unit of Measure" name="unit" icon={Layers} options={unitOptions} required value={formData.unit} onChange={handleSelectChange} activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown} helperText="How this item is quantified." />
          </div>

          <hr className="border-gray-100 mb-8" />

          {/* Dynamic Pricing Tiers */}
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-bold text-[#1a2b4b]">Bulk Pricing Rules</h3>
            <button
              type="button"
              onClick={addTier}
              className="px-4 py-2 sm:px-3 sm:py-1.5 bg-[#eef2ff] hover:bg-blue-100 text-[#145be9] text-sm sm:text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors active:scale-95"
            >
              <Plus className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> <span className="sm:inline">Add Rule</span>
            </button>
          </div>

          {errors.tiers && <p className="text-rose-500 text-[11px] font-semibold mb-4">{errors.tiers}</p>}

          <div className="space-y-4">
            {formData.pricingTiers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-200">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-4">
                  <Tag className="w-6 h-6 text-gray-400" />
                </div>
                <h4 className="text-[#1a2b4b] font-bold text-[15px] mb-1.5">No Bulk Rules</h4>
                <p className="text-sm text-gray-400 font-medium text-center max-w-[250px]">Add bulk pricing rules to offer discounts for higher quantities.</p>
              </div>
            ) : (
              formData.pricingTiers.map((tier, index) => (
                <div key={index} className="flex items-end gap-4 p-4 bg-[#f8fafc] rounded-2xl border border-gray-100">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <InputField label="Min Qty" name={`minQty`} type="number" placeholder="e.g. 100" value={tier.minQty} onChange={(e) => updateTier(index, 'minQty', e.target.value)} />
                    <InputField label="Max Qty" name={`maxQty`} type="number" placeholder="e.g. 499" value={tier.maxQty} onChange={(e) => updateTier(index, 'maxQty', e.target.value)} />
                    <InputField label="Tier Price" name={`price`} type="number" icon={CurrentIcon} placeholder="0.00" value={tier.price} onChange={(e) => updateTier(index, 'price', e.target.value)} />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTier(index)}
                    className="mb-1 p-3 flex-shrink-0 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
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
                <h2 className="text-[#1a2b4b] font-bold text-lg leading-none mb-1 flex items-center gap-2">
                  Logistics & Storage <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md tracking-wide uppercase">Optional</span>
                </h2>
                <p className="text-gray-400 text-xs font-medium">Sourcing ports and warehouse details.</p>
              </div>
            </div>

            <div className="space-y-6">
              <InputField label="Port of Import" name="portOfImport" icon={MapPin} placeholder="e.g. Mundra Port" value={formData.portOfImport} onChange={handleInputChange} helperText="Primary port for origin imports." />
              <InputField label="Warehouse Details" name="addressDetail" icon={Box} placeholder="e.g. Aisle 4, Shelf B" value={formData.addressDetail} onChange={handleInputChange} helperText="Location inside the warehouse." />
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
                        src={URL.createObjectURL(formData.productImage)}
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
                          <p className="text-sm font-bold text-emerald-900 truncate max-w-[150px]">{formData.cataloguePdf.name}</p>
                          <p className="text-[10px] font-bold text-emerald-600 uppercase">PDF Ready</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile('cataloguePdf')}
                        className="p-2 text-emerald-400 hover:text-emerald-600 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
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
            disabled={createMutation.isPending}
            className="w-full sm:w-auto flex items-center justify-center space-x-3 bg-[#0557cc] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#0449ad] shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed group whitespace-nowrap"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Saving Product...</span>
              </>
            ) : (
              <>
                <span>Save Product</span>
                <Save className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
