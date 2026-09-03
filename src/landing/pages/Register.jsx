import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Check, Zap, Building2, MapPin, Phone, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useRegister } from '../../hooks/useAuth';
import { getPlans } from '../../api/planApi';
import termsApi from '../../services/termsApi';
import { extractStructuredText, plainTextToHtml } from '../../utils/pdfTextExtractor';

const Register = () => {
  const [step, setStep] = useState(1);
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [termsFileName, setTermsFileName] = useState('');
  const [termsPdfLoading, setTermsPdfLoading] = useState(false);
  const [termsPdfError, setTermsPdfError] = useState('');
  const [formData, setFormData] = useState({
    // Step 1
    companyName: '',
    ownerName: '',
    gstNo: '',
    websiteUrl: '',
    // Step 2
    fullAddress: '',
    country: '',
    state: '',
    city: '',
    pincode: '',
    // Step 3
    companyDescription: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Step 5
    termsLabel: 'Standard Terms v1.0',
    termsContent: ''
  });

  // ── React Query mutation for registration ───────────────────
  const { mutate: register, isPending, error, isError } = useRegister();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoadingPlans(true);
        const response = await getPlans();
        if (response.success) {
          setPlans(response.data);
          // Auto-select first plan if available
          if (response.data.length > 0) {
            setSelectedPlan(response.data[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching plans:', err);
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, []);

  const getStepForField = (field) => {
    if (['companyName', 'ownerName', 'gstNo', 'website'].includes(field)) return 1;
    if (['address', 'country', 'state', 'city', 'pincode'].includes(field)) return 2;
    if (['description', 'phone', 'email', 'password'].includes(field)) return 3;
    if (['selectedPlan'].includes(field)) return 4;
    return 5;
  };

  useEffect(() => {
    const serverErrors = error?.response?.data?.errors || [];
    if (serverErrors.length > 0) {
      const errorSteps = serverErrors.map(e => getStepForField(e.field));
      const firstErrorStep = Math.min(...errorSteps);
      if (firstErrorStep < 5) {
        setStep(firstErrorStep);
      }
    }
  }, [error]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const [stepError, setStepError] = useState('');

  // ── Validation check for each step ──────────────────────────
  const isStepValid = () => {
    setStepError(''); // Clear previous errors

    if (step === 1) {
      if (!formData.companyName || !formData.ownerName || !formData.gstNo) {
        setStepError('Please fill in all required company details.');
        return false;
      }
      if (formData.gstNo.length !== 15) {
        setStepError('GST number must be exactly 15 characters.');
        return false;
      }
    }

    if (step === 2) {
      if (!formData.fullAddress || !formData.country || !formData.state || !formData.city || !formData.pincode) {
        setStepError('Please provide your complete address details.');
        return false;
      }
    }

    if (step === 3) {
      if (!formData.phoneNumber || !formData.email || !formData.password || !formData.confirmPassword) {
        setStepError('Contact and security details are required.');
        return false;
      }
      // Simple email regex for client-side check
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        setStepError('Please enter a valid email address.');
        return false;
      }
      if (formData.password.length < 6) {
        setStepError('Password must be at least 6 characters.');
        return false;
      }
      // Check password complexity (must match backend: uppercase, lowercase, digit)
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
      if (!passwordRegex.test(formData.password)) {
        setStepError('Password must contain at least one uppercase letter, one lowercase letter, and one number.');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setStepError('Passwords do not match.');
        return false;
      }
    }

    if (step === 4) {
      if (plans.length > 0 && !selectedPlan) {
        setStepError('Please select a subscription plan to continue.');
        return false;
      }
    }

    if (step === 5) {
      if (formData.termsContent.trim() && !formData.termsLabel.trim()) {
        setStepError('Please provide a version label for your T&C.');
        return false;
      }
    }

    return true;
  };

  const nextStep = () => {
    if (isStepValid()) {
      setStep(prev => prev + 1);
      window.scrollTo(0, 0); // Scroll to top on step change
    }
  };

  const prevStep = () => {
    setStepError('');
    setStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleTermsPdfUpload = async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setTermsPdfError('Please upload a valid PDF file.');
      return;
    }

    setTermsPdfError('');
    setTermsPdfLoading(true);
    setTermsFileName(file.name);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pages = await extractStructuredText(arrayBuffer);
      const extracted = pages
        .flatMap((page) => page.map((line) => line.items.map((item) => item.text).join(' ')))
        .join('\n');

      setFormData((prev) => ({
        ...prev,
        termsContent: extracted,
        termsLabel: prev.termsLabel === 'Standard Terms v1.0' ? file.name.replace(/\.pdf$/i, '') : prev.termsLabel,
      }));
      setTermsPdfError('');
    } catch {
      setTermsPdfError('Could not extract text from this PDF. Please paste your T&C manually.');
    } finally {
      setTermsPdfLoading(false);
    }
  };

  const handleTermsFileChange = async (event) => {
    const file = event.target.files?.[0];
    await handleTermsPdfUpload(file);
  };

  const handleRegister = async () => {
    // ── Map frontend field names to server field names ──────
    // The server expects these exact keys per the schema and validation
    const payload = {
      // Step 1: Company Info
      companyName: formData.companyName,
      ownerName: formData.ownerName,
      gstNo: formData.gstNo,
      website: formData.websiteUrl,       // websiteUrl → website
      // Step 2: Address Info
      address: formData.fullAddress,      // fullAddress → address
      country: formData.country,
      state: formData.state,
      city: formData.city,
      pincode: formData.pincode,
      // Step 3: Contact & Auth
      description: formData.companyDescription, // companyDescription → description
      phone: formData.phoneNumber,              // phoneNumber → phone
      email: formData.email,
      password: formData.password,
      // Step 4: Plan selection
      selectedPlan: selectedPlan?._id || null,
    };

    register(payload, {
      onSuccess: async () => {
        if (formData.termsContent.trim()) {
          try {
            await termsApi.createTerms({
              versionLabel: formData.termsLabel || 'Standard Terms v1.0',
              content: plainTextToHtml(formData.termsContent),
              status: 'active',
              isDefault: true,
            });
          } catch (e) {
            console.warn('Could not save default T&C:', e);
          }
        }
      },
    });
  };

  // ── Parse server error message ───────────────────────────────
  const errorMessage =
    error?.response?.data?.message ||
    error?.message ||
    'Something went wrong. Please try again.';

  // ── Parse field-level validation errors from server ──────────
  const serverErrors = error?.response?.data?.errors || [];
  const getFieldError = (field) =>
    serverErrors.find((e) => e.field === field)?.message;

  const ReviewSection = ({ title, icon, children }) => (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center space-x-2 mb-4">
        {React.createElement(icon, { className: 'w-5 h-5 text-[#145be9]' })}
        <h3 className="text-[#1a2b4b] font-bold text-lg">{title}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
        {children}
      </div>
    </div>
  );

  const ReviewField = ({ label, value }) => (
    <div className="flex flex-col">
      <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{label}</span>
      <span className="text-[#1a2b4b] font-medium text-[15px] break-words">{value || 'Not provided'}</span>
    </div>
  );

  // ── Reusable error field message ──────────────────────────────
  const FieldError = ({ field }) => {
    const msg = getFieldError(field);
    if (!msg) return null;
    return <p className="text-red-500 text-xs font-medium mt-1 ml-2">{msg}</p>;
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f8fbff] flex flex-col items-center justify-center p-4 py-8 font-sans overflow-y-auto">
      <div className={`w-full ${step === 4 ? 'max-w-6xl' : step === 5 || step === 6 ? 'max-w-4xl' : 'max-w-2xl'} transition-all duration-700 ease-in-out px-4`}>
        {/* Header */}
        <h1 className="text-[#1a2b4b] text-2xl md:text-3xl font-bold text-center mb-6">
          Step {step}: {
            step === 1 ? 'Company Information' :
              step === 2 ? 'Address Information' :
                step === 3 ? 'Contact & Security' :
                  step === 4 ? 'Choose Your Plan' :
                    step === 5 ? 'Default Terms & Conditions' :
                      'Review Your Details'
          }
        </h1>
        <div className="mb-8 flex flex-wrap justify-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
          {['Company', 'Address', 'Contact', 'Plan', 'Terms', 'Review'].map((label, index) => {
            const stepIndex = index + 1;
            const isActive = step === stepIndex;
            const isCompleted = step > stepIndex;
            return (
              <div key={label} className={`flex items-center gap-2 rounded-full px-3 py-2 transition ${isActive ? 'bg-[#145be9] text-white' : isCompleted ? 'bg-slate-100 text-slate-700' : 'bg-white text-slate-400 border border-slate-200'}`}>
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-black ${isActive ? 'bg-white text-[#145be9]' : isCompleted ? 'bg-[#145be9]/10 text-[#145be9]' : 'bg-slate-200 text-slate-500'}`}>
                  {stepIndex}
                </span>
                <span>{label}</span>
              </div>
            );
          })}
        </div>

        {/* ── Client-side Step Validation Error Banner ──── */}
        {stepError && (
          <div className="mb-4 flex items-start space-x-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{stepError}</span>
          </div>
        )}

        {/* ── Server Error Banner (shown on step 6 submit) ──── */}
        {isError && step === 6 && (
          <div className="mb-4 flex items-start space-x-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white border border-gray-200 rounded-[2rem] p-8 md:p-10 shadow-sm shadow-blue-500/5">
          <div className="space-y-6">
            {step === 1 && (
              /* --- STEP 1: COMPANY INFORMATION --- */
              <>
                <div className="space-y-2">
                  <label className="text-[#1a2b4b] text-base font-bold block ml-1">Company Name*</label>
                  <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} placeholder="Your company name" className="w-full bg-[#f0f4ff] px-6 py-3.5 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-400 font-medium" />
                  <FieldError field="companyName" />
                </div>
                <div className="space-y-2">
                  <label className="text-[#1a2b4b] text-base font-bold block ml-1">Owner Name*</label>
                  <input type="text" name="ownerName" value={formData.ownerName} onChange={handleInputChange} placeholder="Owner name" className="w-full bg-[#f0f4ff] px-6 py-3.5 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-400 font-medium" />
                  <FieldError field="ownerName" />
                </div>
                <div className="space-y-2">
                  <label className="text-[#1a2b4b] text-base font-bold block ml-1">GST No.*</label>
                  <input type="text" name="gstNo" value={formData.gstNo} onChange={handleInputChange} placeholder="GST number (15 characters)" className="w-full bg-[#f0f4ff] px-6 py-3.5 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-400 font-medium" />
                  <FieldError field="gstNo" />
                </div>
                <div className="space-y-2">
                  <label className="text-[#1a2b4b] text-base font-bold block ml-1">Website URL</label>
                  <input type="text" name="websiteUrl" value={formData.websiteUrl} onChange={handleInputChange} placeholder="https://yourcompany.com" className="w-full bg-[#f0f4ff] px-6 py-3.5 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-400 font-medium" />
                  <FieldError field="website" />
                </div>
                <div className="flex items-center justify-center pt-6">
                  <button onClick={nextStep} className="flex items-center space-x-2 bg-[#145be9] text-white px-12 py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-colors cursor-pointer shadow-lg shadow-blue-500/25 text-base active:scale-95 transition-transform">
                    <span>Next</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}

            {step === 2 && (
              /* --- STEP 2: ADDRESS INFORMATION --- */
              <>
                <div className="space-y-2">
                  <label className="text-[#1a2b4b] text-base font-bold block ml-1">Full Address*</label>
                  <input type="text" name="fullAddress" value={formData.fullAddress} onChange={handleInputChange} placeholder="Enter your full address" className="w-full bg-[#f0f4ff] px-6 py-3.5 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-400 font-medium" />
                  <FieldError field="address" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><label className="text-[#1a2b4b] text-base font-bold block ml-1">Country*</label><input type="text" name="country" value={formData.country} onChange={handleInputChange} placeholder="Country" className="w-full bg-[#f0f4ff] px-6 py-3.5 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-400 font-medium" /><FieldError field="country" /></div>
                  <div className="space-y-2"><label className="text-[#1a2b4b] text-base font-bold block ml-1">State*</label><input type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="State" className="w-full bg-[#f0f4ff] px-6 py-3.5 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-400 font-medium" /><FieldError field="state" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><label className="text-[#1a2b4b] text-base font-bold block ml-1">City*</label><input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="City" className="w-full bg-[#f0f4ff] px-6 py-3.5 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-400 font-medium" /><FieldError field="city" /></div>
                  <div className="space-y-2"><label className="text-[#1a2b4b] text-base font-bold block ml-1">Pincode*</label><input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} placeholder="Pincode" className="w-full bg-[#f0f4ff] px-6 py-3.5 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-400 font-medium" /><FieldError field="pincode" /></div>
                </div>
                <div className="flex items-center justify-center space-x-4 pt-6">
                  <button onClick={prevStep} className="flex items-center justify-center space-x-2 border-2 border-[#145be9] text-[#145be9] px-10 py-3.5 rounded-xl font-bold hover:bg-blue-50 transition-colors cursor-pointer text-base active:scale-95 transition-transform"><ArrowLeft className="w-5 h-5" /><span>Previous</span></button>
                  <button onClick={nextStep} className="flex items-center justify-center space-x-2 bg-[#145be9] text-white px-12 py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-colors cursor-pointer shadow-lg shadow-blue-500/25 text-base active:scale-95 transition-transform"><span>Next</span><ArrowRight className="w-5 h-5" /></button>
                </div>
              </>
            )}

            {step === 3 && (
              /* --- STEP 3: CONTACT & SECURITY --- */
              <>
                <div className="space-y-2">
                  <label className="text-[#1a2b4b] text-base font-bold block ml-1">Company Description</label>
                  <input type="text" name="companyDescription" value={formData.companyDescription} onChange={handleInputChange} placeholder="Short description" className="w-full bg-[#f0f4ff] px-6 py-3.5 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-400 font-medium" />
                  <FieldError field="description" />
                </div>
                <div className="space-y-2">
                  <label className="text-[#1a2b4b] text-base font-bold block ml-1">Phone Number*</label>
                  <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder="Phone number" className="w-full bg-[#f0f4ff] px-6 py-3.5 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-400 font-medium" />
                  <FieldError field="phone" />
                </div>
                <div className="space-y-2">
                  <label className="text-[#1a2b4b] text-base font-bold block ml-1">Email Address*</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email address" className="w-full bg-[#f0f4ff] px-6 py-3.5 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-400 font-medium" />
                  <FieldError field="email" />
                </div>
                <div className="space-y-2">
                  <label className="text-[#1a2b4b] text-base font-bold block ml-1">Password*</label>
                  <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••" className="w-full bg-[#f0f4ff] px-6 py-3.5 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-400 font-medium" />
                  <p className="text-[11px] text-gray-500 mt-1 ml-3 leading-tight">
                    <span className="font-bold">Requirements:</span> Min. 6 characters, must include at least one uppercase letter (A-Z) and one number (0-9).
                  </p>
                  <FieldError field="password" />
                </div>
                <div className="space-y-2">
                  <label className="text-[#1a2b4b] text-base font-bold block ml-1">Confirm Password*</label>
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder="••••••••" className="w-full bg-[#f0f4ff] px-6 py-3.5 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-400 font-medium" />
                  <FieldError field="confirmPassword" />
                </div>
                <div className="flex items-center justify-center space-x-4 pt-6">
                  <button onClick={prevStep} className="flex items-center justify-center space-x-2 border-2 border-[#145be9] text-[#145be9] px-10 py-3.5 rounded-xl font-bold hover:bg-blue-50 transition-colors cursor-pointer text-base active:scale-95 transition-transform"><ArrowLeft className="w-5 h-5" /><span>Previous</span></button>
                  <button onClick={nextStep} className="flex items-center justify-center space-x-2 bg-[#145be9] text-white px-12 py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-colors cursor-pointer shadow-lg shadow-blue-500/25 text-base active:scale-95 transition-transform"><span>Next</span><ArrowRight className="w-5 h-5" /></button>
                </div>
              </>
            )}

            {step === 4 && (
              /* --- STEP 4: CHOOSE YOUR PLAN --- */
              <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-8">
                  <p className="text-gray-500 font-medium text-sm uppercase tracking-widest mb-1">Subscription Plans</p>
                  <h2 className="text-[#1a2b4b] text-2xl font-black">Select the perfect tier for your business</h2>
                </div>

                {loadingPlans ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-[2rem] border border-gray-100 shadow-inner">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-blue-100 border-t-[#145be9] rounded-full animate-spin"></div>
                      <Zap className="w-6 h-6 text-[#145be9] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                    </div>
                    <p className="mt-6 text-gray-400 font-bold uppercase tracking-widest text-[10px]">Loading Premium Plans...</p>
                  </div>
                ) : plans.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Zap className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-bold text-lg">No active plans available</p>
                    <p className="text-gray-400 text-sm">Please contact support for registration</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl mx-auto">
                    {plans.map((plan, index) => {
                      const isSelected = selectedPlan?._id === plan._id;
                      const isPopular = index === 1; // Mark second plan as popular for better UI

                      return (
                        <div
                          key={plan._id}
                          onClick={() => setSelectedPlan(plan)}
                          className={`group relative flex flex-col h-full bg-white rounded-[2.5rem] p-8 cursor-pointer transition-all duration-500 hover:-translate-y-2 ${isSelected
                              ? 'ring-4 ring-[#145be9]/10 border-2 border-[#145be9] shadow-[0_20px_50px_rgba(20,91,233,0.15)]'
                              : 'border-2 border-gray-100 hover:border-gray-200 hover:shadow-xl'
                            }`}
                        >
                          {isPopular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#145be9] to-[#3b82f6] text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-blue-500/30">
                              Most Popular
                            </div>
                          )}

                          <div className="flex-1 flex flex-col items-center text-center">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 ${isSelected ? 'bg-blue-50 text-[#145be9]' : 'bg-gray-50 text-gray-400'}`}>
                              {plan.name.toLowerCase().includes('starter') ? <Zap className="w-7 h-7" /> : <Building2 className="w-7 h-7" />}
                            </div>

                            <h3 className="text-[#1a2b4b] text-2xl font-black mb-1 group-hover:text-[#145be9] transition-colors">{plan.name}</h3>
                            <div className="flex items-center space-x-1.5 text-gray-400 text-sm font-medium mb-8">
                              <Loader2 className="w-3 h-3" />
                              <span>{plan.duration}</span>
                            </div>

                            <div className="relative mb-10">
                              <div className="flex items-baseline justify-center">
                                <span className="text-[#1a2b4b] text-5xl font-black tracking-tight">{plan.price}</span>
                                <span className="text-[#1a2b4b] text-2xl font-bold ml-1">
                                  {plan.currency === 'INR' ? '₹' : plan.currency === 'USD' ? '$' : plan.currency === 'EUR' ? '€' : plan.currency === 'GBP' ? '£' : plan.currency}
                                </span>
                              </div>
                              <div className="w-12 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent absolute -bottom-3 left-1/2 -translate-x-1/2 opacity-20"></div>
                            </div>

                            <div className="w-full space-y-4 py-6 border-t border-gray-50">
                              {plan.features?.map((feature, i) => (
                                <div key={i} className="flex items-center space-x-3 text-left">
                                  <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                    <Check className="w-3 h-3 stroke-[3]" />
                                  </div>
                                  <span className={`text-[14px] font-bold ${isSelected ? 'text-[#1a2b4b]' : 'text-gray-500'}`}>
                                    {feature}
                                  </span>
                                </div>
                              )) || (
                                  <div className="text-gray-400 text-sm italic">Includes standard features</div>
                                )}
                            </div>
                          </div>

                          {isSelected && (
                            <div className="mt-8 bg-[#145be9] text-white py-4 rounded-2xl font-black text-center text-sm uppercase tracking-widest shadow-lg shadow-blue-500/25 animate-in zoom-in-95 duration-300">
                              Plan Selected
                            </div>
                          )}

                          {!isSelected && (
                            <div className="mt-8 bg-gray-50 text-gray-400 py-4 rounded-2xl font-black text-center text-sm uppercase tracking-widest transition-colors group-hover:bg-gray-100 group-hover:text-gray-600">
                              Choose Plan
                            </div>
                          )}

                          {isSelected && (
                            <div className="absolute top-6 right-6 text-[#145be9]">
                              <CheckCircle2 className="w-6 h-6 fill-blue-50" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-center justify-center space-x-6 pt-12">
                  <button onClick={prevStep} className="group flex items-center justify-center space-x-3 text-gray-400 font-bold hover:text-[#145be9] transition-all py-2">
                    <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                    <span>Go Back</span>
                  </button>
                  <button onClick={nextStep} className="flex items-center justify-center space-x-2 bg-[#1a2b4b] text-white px-14 py-4 rounded-2xl font-black hover:bg-[#145be9] transition-all shadow-xl shadow-blue-900/10 active:scale-95">
                    <span>Continue</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {step === 5 && (
              /* --- STEP 5: DEFAULT TERMS & CONDITIONS --- */
              <div className="w-full space-y-6">
                <div className="rounded-[2rem] border border-gray-200 bg-[#f8fbff] p-8 shadow-sm">
                  <h2 className="text-2xl font-black text-[#1a2b4b] mb-2">Default Terms & Conditions</h2>
                  <p className="text-sm text-slate-500 mb-6">Set your company's standard T&C — this will be used as the default for all quotations. You can update or add versions later.</p>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Version Label</label>
                      <input
                        type="text"
                        name="termsLabel"
                        value={formData.termsLabel}
                        onChange={handleInputChange}
                        placeholder="e.g. Standard Terms v1.0"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#145be9] focus:ring-2 focus:ring-[#145be9]/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Content</label>
                      <textarea
                        name="termsContent"
                        value={formData.termsContent}
                        onChange={handleInputChange}
                        rows={8}
                        placeholder="Enter your company's standard terms and conditions here..."
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#145be9] focus:ring-2 focus:ring-[#145be9]/20 resize-vertical"
                      />
                    </div>

                    <div className="flex items-center justify-center gap-3 py-4">
                      <div className="h-px flex-1 bg-slate-300" />
                      <span className="text-sm font-bold uppercase text-slate-400 tracking-[0.25em]">OR</span>
                      <div className="h-px flex-1 bg-slate-300" />
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-slate-700">Upload T&C as PDF</label>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <label
                          htmlFor="terms-pdf-upload"
                          className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800 cursor-pointer transition"
                        >
                          <span className="mr-2">📎</span>
                          Upload PDF
                        </label>
                        <span className="text-sm text-slate-600 break-words">{termsFileName || 'No file selected yet'}</span>
                      </div>
                      <input
                        id="terms-pdf-upload"
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={handleTermsFileChange}
                      />

                      {termsPdfLoading && (
                        <p className="text-sm text-emerald-600 flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Extracting text...
                        </p>
                      )}
                      {!termsPdfLoading && termsFileName && !termsPdfError && (
                        <p className="text-sm text-emerald-600">{termsFileName} ✓ Text extracted successfully.</p>
                      )}
                      {termsPdfError && (
                        <p className="text-sm text-rose-600">{termsPdfError}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, termsContent: '' }));
                        setStep(6);
                        window.scrollTo(0, 0);
                      }}
                      className="text-sm font-bold text-[#145be9] hover:underline"
                    >
                      Skip for now
                    </button>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="flex items-center justify-center rounded-full border border-[#145be9] px-6 py-3 text-sm font-bold text-[#145be9] hover:bg-blue-50 transition"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Previous</span>
                      </button>
                      <button
                        type="button"
                        onClick={nextStep}
                        className="flex items-center justify-center rounded-full bg-[#145be9] px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 transition"
                      >
                        <span>Continue</span>
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {step === 6 && (
              /* --- STEP 6: REVIEW YOUR DETAILS --- */
              <div className="w-full space-y-6">
                <ReviewSection title="Company Info" icon={Building2}>
                  <ReviewField label="Company Name" value={formData.companyName} />
                  <ReviewField label="Owner Name" value={formData.ownerName} />
                  <ReviewField label="GST Number" value={formData.gstNo} />
                  <ReviewField label="Website URL" value={formData.websiteUrl} />
                </ReviewSection>

                <ReviewSection title="Address Details" icon={MapPin}>
                  <ReviewField label="Full Address" value={formData.fullAddress} />
                  <ReviewField label="City" value={formData.city} />
                  <ReviewField label="State" value={formData.state} />
                  <ReviewField label="Country" value={formData.country} />
                  <ReviewField label="Pincode" value={formData.pincode} />
                </ReviewSection>

                <ReviewSection title="Contact & Security" icon={Phone}>
                  <ReviewField label="Description" value={formData.companyDescription} />
                  <ReviewField label="Phone" value={formData.phoneNumber} />
                  <ReviewField label="Email" value={formData.email} />
                  <ReviewField label="Password" value="********" />
                </ReviewSection>

                <ReviewSection title="Selected Plan" icon={Zap}>
                  <div className="col-span-full flex items-center justify-between bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <div>
                      <span className="text-[#1a2b4b] font-bold text-lg capitalize">{selectedPlan?.name} Plan</span>
                      <p className="text-gray-500 text-sm">
                        Duration: {selectedPlan?.duration}
                      </p>
                    </div>
                    <span className="text-[#145be9] font-black text-xl">
                      {selectedPlan?.price} {selectedPlan?.currency === 'INR' ? '₹' : selectedPlan?.currency === 'USD' ? '$' : selectedPlan?.currency === 'EUR' ? '€' : selectedPlan?.currency === 'GBP' ? '£' : selectedPlan?.currency}
                    </span>
                  </div>
                </ReviewSection>

                <div className="flex items-center justify-center space-x-4 pt-6">
                  <button
                    onClick={prevStep}
                    disabled={isPending}
                    className="flex items-center justify-center space-x-2 border-2 border-[#145be9] text-[#145be9] px-10 py-3.5 rounded-xl font-bold hover:bg-blue-50 transition-colors cursor-pointer text-base active:scale-95 transition-transform disabled:opacity-60"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Previous</span>
                  </button>
                  <button
                    onClick={handleRegister}
                    disabled={isPending}
                    className="flex items-center justify-center space-x-2 bg-[#145be9] text-white px-12 py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-colors cursor-pointer shadow-lg shadow-blue-500/25 text-base active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isPending ? (
                      // Loading state with spinner
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm & Submit</span>
                        <Check className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
// now let me explain whats the issue in this website (the quotation management project) !  
export default Register;
