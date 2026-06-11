import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Globe, ArrowLeft, User, Building2, MapPin, Phone, Mail, Save, Loader2, Tag, UserCheck, DollarSign, Layers, CheckCircle2, Search, X } from 'lucide-react';
import customerApi from '../../../services/customerApi';

const InputField = ({ label, name, type = 'text', icon: Icon, placeholder, required = false, value, onChange, error, helperText, className = "" }) => {
  const isSuccess = value !== undefined && value !== null && value !== '' && !error;
  
  return (
    <div className={`space-y-1.5 transition-all ${className}`}>
      <label className={`text-sm font-bold block ml-1 flex items-center transition-colors ${error ? 'text-rose-500' : 'text-[#1a2b4b]'}`}>
        {label} {required && <span className={`${error ? 'text-rose-600' : 'text-red-500'} ml-1`}>*</span>}
      </label>
      <div className="relative group">
        {Icon && (
          <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${
            error ? 'text-rose-400' : isSuccess ? 'text-emerald-500' : 'text-gray-400 group-focus-within:text-[#145be9]'
          }`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          type={type}
          name={name}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full transition-all ${Icon ? 'pl-11' : 'pl-4'} pr-10 py-3.5 sm:py-3 rounded-xl text-sm focus:outline-none font-medium ${
            error 
              ? 'bg-rose-50/50 border-rose-300 focus:border-rose-500 focus:bg-white text-rose-900 placeholder:text-rose-200' 
              : isSuccess
                ? 'bg-emerald-50/30 border-emerald-200 focus:border-emerald-500 focus:bg-white text-emerald-900'
                : 'bg-[#f0f4ff]/50 border-transparent focus:border-[#145be9] focus:bg-white placeholder:text-gray-300'
          } border focus:ring-4 ${error ? 'focus:ring-rose-500/5' : isSuccess ? 'focus:ring-emerald-500/5' : 'focus:ring-blue-500/5'}`}
        />
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

const CustomSelect = ({ label, name, icon: Icon = null, options, required = false, value, onChange, activeDropdown, setActiveDropdown, error, helperText }) => {
  const isOpen = activeDropdown === name;
  const selectedOption = options.find(opt => opt.value === value);
  const isSuccess = value !== undefined && value !== null && value !== '' && !error;
  const triggerRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  // Calculate position once when dropdown opens
  useLayoutEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [isOpen]);

  // Close dropdown on any scroll or resize so fixed position never drifts
  useEffect(() => {
    if (!isOpen) return;
    const close = () => setActiveDropdown(null);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [isOpen, setActiveDropdown]);

  return (
    <div className="space-y-1.5 relative">
      <label className={`text-sm font-bold block ml-1 flex items-center transition-colors ${error ? 'text-rose-500' : 'text-[#1a2b4b]'}`}>
        {label} {required && <span className={`${error ? 'text-rose-600' : 'text-red-500'} ml-1`}>*</span>}
      </label>

      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setActiveDropdown(isOpen ? null : name)}
        className={`w-full flex items-center transition-all ${Icon ? 'pl-4' : 'pl-5'} pr-6 py-3.5 sm:py-3 rounded-xl text-sm font-medium focus:outline-none border ${
          error
            ? 'bg-rose-50/50 border-rose-300 ring-rose-500/5'
            : isSuccess
              ? 'bg-emerald-50/30 border-emerald-200 ring-emerald-500/5'
              : isOpen
                ? 'border-[#145be9] bg-white ring-4 ring-blue-500/5'
                : 'border-transparent hover:border-gray-200 bg-[#f0f4ff]/50'
        }`}
      >
        {Icon && (
          <div className={`${error ? 'text-rose-400' : isSuccess ? 'text-emerald-500' : isOpen ? 'text-[#145be9]' : 'text-gray-400'} mr-3.5 transition-colors`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
        <span className={`flex-1 text-left ${value ? 'text-[#1a2b4b]' : error ? 'text-rose-300' : 'text-gray-300'}`}>
          {selectedOption ? selectedOption.label : `Select ${label}`}
        </span>
        {isSuccess && !isOpen && (
          <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2" />
        )}
        <ArrowLeft className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-90' : 'rotate-[270deg]'} ${
          error ? 'text-rose-300' : isOpen ? 'text-[#145be9]' : 'text-gray-400'
        }`} />
      </button>

      {/* Error / Helper */}
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

      {/* Portal Dropdown — rendered on document.body, fixed positioning */}
      {isOpen && createPortal(
        <>
          {/* Backdrop to close */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
            onClick={() => setActiveDropdown(null)}
          />
          {/* Dropdown panel */}
          <div
            style={{
              position: 'fixed',
              top: dropdownPos.top,
              left: dropdownPos.left,
              width: dropdownPos.width,
              zIndex: 9999,
            }}
            className="bg-white border border-gray-100 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] py-2"
          >
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange({ target: { name, value: opt.value } });
                    setActiveDropdown(null);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-sm font-semibold transition-colors hover:pl-6 ${
                    value === opt.value ? 'text-[#145be9] bg-blue-50' : 'text-gray-600 hover:bg-gray-50 hover:text-[#1a2b4b]'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full mr-3 flex-shrink-0 ${
                    value === opt.value ? 'bg-[#145be9]' : 'bg-transparent'
                  }`} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

const AddCustomer = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeDropdown, setActiveDropdown] = useState(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    businessName: '',
    email: '',
    phone: '',
    category: '',
    leadType: '',
    assignedUser: '',
    currency: 'INR',
    country: 'India',
    state: '',
    city: ''
  });

  const [errors, setErrors] = useState({});

  const validate = (data = formData) => {
    const newErrors = {};
    
    // Required Fields Validation
    if (!data.fullName) newErrors.fullName = 'Full Name is required';
    if (!data.businessName) newErrors.businessName = 'Business Name is required';
    if (!data.category) newErrors.category = 'Category is required';
    if (!data.leadType) newErrors.leadType = 'Lead Type is required';
    if (!data.assignedUser) newErrors.assignedUser = 'Assigned user is required';
    if (!data.state) newErrors.state = 'State is required';
    if (!data.city) newErrors.city = 'City is required';

    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email) {
      newErrors.email = 'Email Address is required';
    } else if (!emailRegex.test(data.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone Validation
    const phoneDigits = data.phone.replace(/\D/g, '');
    if (!data.phone) {
      newErrors.phone = 'Contact Number is required';
    } else if (phoneDigits.length < 10) {
      newErrors.phone = 'Enter a valid 10-digit number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Mutation for creating customer
  const createMutation = useMutation({
    mutationFn: customerApi.createCustomer,
    onSuccess: () => {
      // Invalidate queries so the directory list updates
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      navigate('/dashboard/customers');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to create customer');
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Real-time error clearing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] p-4 sm:p-6 lg:p-10 font-sans w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-[#145be9] hover:border-blue-200 hover:bg-blue-50 transition-all active:scale-95 flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-[#1a2b4b] text-[2rem] font-black tracking-tight leading-tight">Add New Customer</h1>
            <p className="text-gray-500 text-sm font-medium hidden sm:block">Create a new customer profile with specific details.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Basic Information */}
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 lg:p-10 shadow-sm shadow-blue-500/5">
          <div className="flex items-center space-x-3 mb-8 ml-1">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-[#145be9]" />
            </div>
            <div>
              <h2 className="text-[#1a2b4b] font-bold text-lg leading-none mb-1">Personal & Business</h2>
              <p className="text-gray-400 text-xs font-medium">Primary identity and company names.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <InputField label="Customer Full Name" name="fullName" icon={User} placeholder="Enter full name" required value={formData.fullName} onChange={handleInputChange} error={errors.fullName} helperText="Legal name of the individual contact." />
            <InputField label="Business/Company Name" name="businessName" icon={Building2} placeholder="Enter company name" required value={formData.businessName} onChange={handleInputChange} error={errors.businessName} helperText="Registered company or entity name." />
            <InputField label="Email Address" name="email" type="email" icon={Mail} placeholder="name@company.com" required value={formData.email} onChange={handleInputChange} error={errors.email} helperText="Primary email for communications." />
            <InputField label="Contact Number" name="phone" icon={Phone} placeholder="e.g. 9876543210" required value={formData.phone} onChange={handleInputChange} error={errors.phone} helperText="Primary phone with country code if applicable." />
          </div>
        </div>

        {/* Section 2: Classification */}
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 lg:p-10 shadow-sm shadow-blue-500/5">
          <div className="flex items-center space-x-3 mb-8 ml-1">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Layers className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <h2 className="text-[#1a2b4b] font-bold text-lg leading-none mb-1">Customer Classification</h2>
              <p className="text-gray-400 text-xs font-medium">Define customer type and assignment.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <CustomSelect 
              label="Customer Category" 
              name="category" 
              icon={Tag} 
              options={[
                { label: 'Individual', value: 'individual' },
                { label: 'Corporate', value: 'corporate' },
                { label: 'Wholesaler', value: 'wholesaler' },
                { label: 'Retailer', value: 'retailer' }
              ]} 
              required 
              value={formData.category}
              onChange={handleInputChange}
              activeDropdown={activeDropdown}
              setActiveDropdown={setActiveDropdown}
              error={errors.category}
              helperText="Segment by business type."
            />
            <CustomSelect 
              label="Lead Type" 
              name="leadType" 
              icon={Layers} 
              options={[
                { label: 'Hot', value: 'hot' },
                { label: 'Warm', value: 'warm' },
                { label: 'Cold', value: 'cold' }
              ]} 
              required 
              value={formData.leadType}
              onChange={handleInputChange}
              activeDropdown={activeDropdown}
              setActiveDropdown={setActiveDropdown}
              error={errors.leadType}
              helperText="Level of conversion potential."
            />
            <CustomSelect 
              label="Assigned User" 
              name="assignedUser" 
              icon={UserCheck} 
              options={[
                { label: 'Admin User', value: 'admin' },
                { label: 'Sales Manager', value: 'sales_mgr' },
                { label: 'Service Rep', value: 'service_rep' }
              ]} 
              required 
              value={formData.assignedUser}
              onChange={handleInputChange}
              activeDropdown={activeDropdown}
              setActiveDropdown={setActiveDropdown}
              error={errors.assignedUser}
              helperText="The agent responsible for this lead."
            />
          </div>
        </div>

        {/* Section 3: Localization */}
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 lg:p-10 shadow-sm shadow-blue-500/5">
          <div className="flex items-center space-x-3 mb-8 ml-1">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Globe className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-[#1a2b4b] font-bold text-lg leading-none mb-1">Financial & Regional</h2>
              <p className="text-gray-400 text-xs font-medium">Currency and geographic location.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <CustomSelect 
              label="Currency" 
              name="currency" 
              icon={DollarSign} 
              options={[
                { label: 'INR (₹)', value: 'INR' },
                { label: 'USD ($)', value: 'USD' },
                { label: 'EUR (€)', value: 'EUR' },
                { label: 'GBP (£)', value: 'GBP' }
              ]} 
              required 
              value={formData.currency}
              onChange={handleInputChange}
              activeDropdown={activeDropdown}
              setActiveDropdown={setActiveDropdown}
              error={errors.currency}
              helperText="Operational currency for quotes."
            />
            <InputField label="Country" name="country" icon={Globe} placeholder="e.g. India" required value={formData.country} onChange={handleInputChange} error={errors.country} helperText="Registered country." />
            <InputField label="State" name="state" icon={MapPin} placeholder="Enter state" required value={formData.state} onChange={handleInputChange} error={errors.state} helperText="Primary operating state." />
            <InputField label="City" name="city" icon={MapPin} placeholder="Enter city" required value={formData.city} onChange={handleInputChange} error={errors.city} helperText="Primary business city." />
          </div>
        </div>

        {/* Form Actions */}
        <div className="sticky bottom-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-100 -mx-4 -mb-4 lg:-mx-8 lg:-mb-8 px-4 lg:px-8 py-4 lg:py-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 sm:gap-4 mt-8 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
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
                <span>Creating Profile...</span>
              </>
            ) : (
              <>
                <span>Save Customer</span>
                <Save className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCustomer;
