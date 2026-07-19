import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Globe, ArrowLeft, User, Building2, MapPin, Phone, Mail, Save, Loader2, Tag, UserCheck, DollarSign, Layers } from 'lucide-react';
import customerApi from '../../../services/customerApi';

const emptyCustomerFormData = {
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
};

const mapCustomerToFormData = (customer) => ({
  fullName: customer?.fullName || '',
  businessName: customer?.businessName || '',
  email: customer?.email || '',
  phone: customer?.phone || '',
  category: customer?.category || '',
  leadType: customer?.leadType || '',
  assignedUser: customer?.assignedUser || '',
  currency: customer?.currency || 'INR',
  country: customer?.country || 'India',
  state: customer?.state || '',
  city: customer?.city || ''
});

const InputField = ({ label, name, type = 'text', icon: Icon = null, placeholder, required = false, value, onChange, error }) => (
  <div className="space-y-1.5 transition-all">
    <label className={`text-sm font-bold block ml-1 flex items-center transition-colors ${error ? 'text-rose-500' : 'text-[#1a2b4b]'}`}>
      {label} {required && <span className={`${error ? 'text-rose-600' : 'text-red-500'} ml-1`}>*</span>}
    </label>
    <div className="relative group">
      {Icon && (
        <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${
          error ? 'text-rose-400' : 'text-gray-400 group-focus-within:text-[#145be9]'
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
        className={`w-full transition-all ${Icon ? 'pl-11' : 'pl-4'} pr-6 py-3 rounded-xl text-sm focus:outline-none font-medium ${
          error 
            ? 'bg-rose-50/50 border-rose-300 focus:border-rose-500 focus:bg-white text-rose-900 placeholder:text-rose-200' 
            : 'bg-[#f0f4ff]/50 border-transparent focus:border-[#145be9] focus:bg-white placeholder:text-gray-300'
        } border focus:ring-4 ${error ? 'focus:ring-rose-500/5' : 'focus:ring-blue-500/5'}`}
      />
    </div>
    {error && (
      <p className="text-rose-500 text-[11px] font-semibold ml-1 animate-in fade-in slide-in-from-top-1 duration-200">
        {error}
      </p>
    )}
  </div>
);

const CustomSelect = ({ label, name, icon: Icon = null, options, required = false, value, onChange, activeDropdown, setActiveDropdown, error }) => {
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
        className={`w-full flex items-center transition-all ${Icon ? 'pl-4' : 'pl-5'} pr-6 py-3 rounded-xl text-sm font-medium focus:outline-none border ${
          error
            ? 'bg-rose-50/50 border-rose-300 ring-rose-500/5'
            : isOpen ? 'border-[#145be9] bg-white ring-blue-500/5' : 'border-transparent hover:border-gray-200 bg-[#f0f4ff]/50'
        } ${isOpen ? 'ring-4' : ''}`}
      >
        {Icon && (
          <div className={`${error ? 'text-rose-400' : isOpen ? 'text-[#145be9]' : 'text-gray-400'} mr-3.5 transition-colors`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
        <span className={`flex-1 text-left ${value ? 'text-[#1a2b4b]' : error ? 'text-rose-300' : 'text-gray-300'}`}>
          {selectedOption ? selectedOption.label : `Select ${label}`}
        </span>
        <ArrowLeft className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-90' : 'rotate-[270deg]'} ${
          error ? 'text-rose-300' : isOpen ? 'text-[#145be9]' : 'text-gray-400'
        }`} />
      </button>

      {/* Error Message */}
      {error && (
        <p className="text-rose-500 text-[11px] font-semibold ml-1 animate-in fade-in slide-in-from-top-1 duration-200">
          {error}
        </p>
      )}

      {/* Options Dropdown */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-[60]" 
            onClick={() => setActiveDropdown(null)}
          ></div>
          <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-gray-100 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] py-2 z-[70] animate-in fade-in zoom-in-95 duration-200">
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange({ target: { name, value: opt.value } });
                    setActiveDropdown(null);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-sm font-semibold transition-all hover:pl-6 ${
                    value === opt.value 
                      ? 'text-[#145be9] bg-blue-50' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-[#1a2b4b]'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full mr-3 transition-all ${
                    value === opt.value ? 'bg-[#145be9] scale-100' : 'bg-transparent scale-0'
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

const EditCustomer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [formData, setFormData] = useState(null);

  const [errors, setErrors] = useState({});


  // Fetch existing customer data
  const { data: customerData, isLoading: isFetching } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => customerApi.getCustomerById(id),
    enabled: !!id
  });

  const fetchedFormData = useMemo(() => {
    return customerData?.data ? mapCustomerToFormData(customerData.data) : emptyCustomerFormData;
  }, [customerData]);

  const activeFormData = formData || fetchedFormData;

  const validate = (data = activeFormData) => {
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

  // Mutation for updating customer
  const updateMutation = useMutation({
    mutationFn: (data) => customerApi.updateCustomer({ id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
      navigate('/dashboard/customers');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to update customer');
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...(prev || activeFormData), [name]: value }));

    // Real-time error clearing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      updateMutation.mutate(activeFormData);
    }
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-[#145be9] animate-spin" />
        <p className="text-gray-400 font-bold tracking-widest text-xs uppercase text-center">Loading Profile Data...</p>
      </div>
    );
  }

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
            <h1 className="text-[#1a2b4b] text-[2rem] font-black tracking-tight leading-tight">Edit Customer</h1>
            <p className="text-gray-500 text-sm font-medium">Update calculations and details for {activeFormData.businessName || 'this customer'}.</p>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <InputField label="Customer Full Name" name="fullName" icon={User} placeholder="Enter full name" required value={activeFormData.fullName} onChange={handleInputChange} error={errors.fullName} />
            <InputField label="Business/Company Name" name="businessName" icon={Building2} placeholder="Enter company name" required value={activeFormData.businessName} onChange={handleInputChange} error={errors.businessName} />
            <InputField label="Email Address" name="email" type="email" icon={Mail} placeholder="name@company.com" required value={activeFormData.email} onChange={handleInputChange} error={errors.email} />
            <InputField label="Contact Number" name="phone" icon={Phone} placeholder="Phone number" required value={activeFormData.phone} onChange={handleInputChange} error={errors.phone} />
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
              value={activeFormData.category}
              onChange={handleInputChange}
              activeDropdown={activeDropdown}
              setActiveDropdown={setActiveDropdown}
              error={errors.category}
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
              value={activeFormData.leadType}
              onChange={handleInputChange}
              activeDropdown={activeDropdown}
              setActiveDropdown={setActiveDropdown}
              error={errors.leadType}
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
              value={activeFormData.assignedUser}
              onChange={handleInputChange}
              activeDropdown={activeDropdown}
              setActiveDropdown={setActiveDropdown}
              error={errors.assignedUser}
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
              value={activeFormData.currency}
              onChange={handleInputChange}
              activeDropdown={activeDropdown}
              setActiveDropdown={setActiveDropdown}
              error={errors.currency}
            />
            <InputField label="Country" name="country" icon={Globe} placeholder="e.g. India" required value={activeFormData.country} onChange={handleInputChange} error={errors.country} />
            <InputField label="State" name="state" icon={MapPin} placeholder="State" required value={activeFormData.state} onChange={handleInputChange} error={errors.state} />
            <InputField label="City" name="city" icon={MapPin} placeholder="City" required value={activeFormData.city} onChange={handleInputChange} error={errors.city} />
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
            disabled={updateMutation.isPending}
            className="w-full sm:w-auto flex items-center justify-center space-x-3 bg-[#0557cc] text-white px-12 py-4 rounded-xl font-bold hover:bg-[#0449ad] shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed group whitespace-nowrap"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Updating Profile...</span>
              </>
            ) : (
              <>
                <span>Update Customer</span>
                <Save className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCustomer;
