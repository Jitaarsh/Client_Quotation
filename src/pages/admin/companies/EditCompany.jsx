import React, { useCallback, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Shield, 
  Info,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import adminCompaniesApi from '../../../api/adminCompaniesApi';
import { getPlans } from '../../../api/planApi';
import { toast } from 'react-hot-toast';

const EditCompany = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [plans, setPlans] = useState([]);
  const [formData, setFormData] = useState({
    companyName: '',
    ownerName: '',
    email: '',
    phone: '',
    website: '',
    gstNo: '',
    status: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    selectedPlan: ''
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [companyRes, plansRes] = await Promise.all([
        adminCompaniesApi.getCompanyById(id),
        getPlans()
      ]);

      if (companyRes.success) {
        const company = companyRes.data;
        setFormData({
          companyName: company.companyName || '',
          ownerName: company.ownerName || '',
          email: company.email || '',
          phone: company.phone || '',
          website: company.website || '',
          gstNo: company.gstNo || '',
          status: company.status || 'Active',
          address: company.address || '',
          city: company.city || '',
          state: company.state || '',
          pincode: company.pincode || '',
          selectedPlan: company.selectedPlan?._id || ''
        });
      }

      if (plansRes.success) {
        setPlans(plansRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load company details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const response = await adminCompaniesApi.updateCompany(id, formData);
      if (response.success) {
        toast.success('Company updated successfully');
        navigate('/admin/dashboard/companies');
      }
    } catch (error) {
      console.error('Error updating company:', error);
      toast.error(error.response?.data?.message || 'Failed to update company');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#f8fafc]">
        <Loader2 className="w-12 h-12 text-[#145be9] animate-spin mb-4" />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs text-center">
          Fetching Organizational Ledger...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 bg-[#f8fafc] min-h-screen flex flex-col">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button 
            onClick={() => navigate('/admin/dashboard/companies')}
            className="flex items-center gap-2 text-gray-500 hover:text-[#145be9] transition-colors mb-4 font-bold text-xs uppercase tracking-widest group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Firms
          </button>
          <h1 className="text-3xl lg:text-4xl font-black text-[#1a2b4b] tracking-tight">Edit Firm Profile</h1>
          <p className="text-gray-500 font-medium mt-1">Modify organizational credentials and subscription parameters.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/admin/dashboard/companies')}
            className="px-6 py-3 rounded-xl border border-gray-200 bg-white text-[#1a2b4b] font-bold text-sm hover:bg-gray-50 transition-all shadow-sm"
          >
            Discard Changes
          </button>
          <button 
            form="edit-company-form"
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-xl bg-[#145be9] text-white font-bold text-sm hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Modifications
          </button>
        </div>
      </div>

      <form id="edit-company-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-8 space-y-8">
          {/* Company Details */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-[#eff6ff] px-8 py-5 border-b border-blue-50">
              <h2 className="text-sm font-black text-[#145be9] uppercase tracking-widest flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Organizational Hierarchy
              </h2>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Firm Name</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-[#f8fafc] border border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-[#145be9] transition-all font-bold text-[#1a2b4b] text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Owner / Principal</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-[#f8fafc] border border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-[#145be9] transition-all font-bold text-[#1a2b4b] text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Tax Identification (GST)</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text"
                    name="gstNo"
                    value={formData.gstNo}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-[#f8fafc] border border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-[#145be9] transition-all font-bold text-[#1a2b4b] text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Official Website</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-[#f8fafc] border border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-[#145be9] transition-all font-bold text-[#1a2b4b] text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Ledger */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-[#eff6ff] px-8 py-5 border-b border-blue-50">
              <h2 className="text-sm font-black text-[#145be9] uppercase tracking-widest flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Communication Ledger
              </h2>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Professional Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-[#f8fafc] border border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-[#145be9] transition-all font-bold text-[#1a2b4b] text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Direct Contact No.</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-[#f8fafc] border border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-[#145be9] transition-all font-bold text-[#1a2b4b] text-sm"
                    required
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Registered Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3 w-4 h-4 text-gray-400" />
                  <textarea 
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    className="w-full pl-11 pr-4 py-3 bg-[#f8fafc] border border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-[#145be9] transition-all font-bold text-[#1a2b4b] text-sm resize-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">City</label>
                <input 
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-[#145be9] transition-all font-bold text-[#1a2b4b] text-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">State / Region</label>
                <input 
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-[#145be9] transition-all font-bold text-[#1a2b4b] text-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Postal Code (PIN)</label>
                <input 
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-[#145be9] transition-all font-bold text-[#1a2b4b] text-sm"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-8">
          {/* Status & Plan */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3" />
                Subscription Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['Active', 'Suspended', 'Pending'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, status }))}
                    className={`px-4 py-3 rounded-xl text-xs font-black transition-all border ${
                      formData.status === status 
                        ? 'bg-[#145be9] text-white border-[#145be9] shadow-md shadow-blue-500/20' 
                        : 'bg-[#f8fafc] text-gray-400 border-gray-100 hover:bg-gray-100'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                <Shield className="w-3 h-3" />
                Plan Entitlement
              </label>
              <select
                name="selectedPlan"
                value={formData.selectedPlan}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-[#145be9] transition-all font-bold text-[#1a2b4b] text-sm appearance-none cursor-pointer"
              >
                <option value="">Select a plan</option>
                {plans.map((plan) => (
                  <option key={plan._id} value={plan._id}>
                    {plan.name} - ₹{plan.price}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 flex gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm text-[#145be9]">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-[#1a2b4b] uppercase tracking-widest mb-1">Audit Note</h4>
                <p className="text-[11px] text-blue-600 font-medium leading-relaxed">
                  Modifying the plan will trigger a subscription recalibration in the next billing cycle.
                </p>
              </div>
            </div>
          </div>

          {/* System Info */}
          <div className="bg-[#1a2b4b] rounded-[2rem] p-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700"></div>
            <div className="relative z-10">
              <h3 className="text-xs font-black text-blue-300 uppercase tracking-widest mb-6">Security Integrity</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-[11px] font-medium text-gray-400">Ledger Entry</span>
                  <span className="text-[11px] font-bold">#{id.slice(-6).toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-[11px] font-medium text-gray-400">Encryption</span>
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    AES-256
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-[11px] font-medium text-gray-400">Access Level</span>
                  <span className="text-[11px] font-bold text-amber-400">Admin Only</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditCompany;
