import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Building2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Loader2,
  Mail,
  Pencil,
  Phone,
  RefreshCw,
  Search,
  Trash2,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import adminCompaniesApi from '../../../api/adminCompaniesApi';
import ConfirmModal from '../../../components/ConfirmModal';

const statusFilters = ['All', 'Active', 'Pending', 'Suspended'];
const pageSizeOptions = [5, 10, 20];

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const getCompanyPlan = (company) => company.selectedPlan?.name || company.subscription || 'Basic';

const CompaniesManagement = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [planFilter, setPlanFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyToDelete, setCompanyToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await adminCompaniesApi.getAllCompanies();
      if (response.success) {
        setCompanies(response.data);
        setLastSync(new Date());
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError('Failed to load company data. Please try again later.');
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, planFilter, pageSize]);

  const planFilters = useMemo(() => {
    const plans = companies.map(getCompanyPlan).filter(Boolean);
    return ['All', ...Array.from(new Set(plans))];
  }, [companies]);

  const stats = useMemo(() => {
    const total = companies.length;
    const active = companies.filter((company) => (company.status || 'Active') === 'Active').length;
    const newThisMonth = companies.filter((company) => {
      if (!company.createdAt) return false;
      const createdAt = new Date(company.createdAt);
      const now = new Date();
      return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
    }).length;

    return [
      {
        title: 'TOTAL COMPANIES',
        value: total.toLocaleString(),
        change: `${companies.filter((company) => (company.status || 'Active') === 'Pending').length} pending`,
        changeType: 'stable',
        progress: '100%',
        progressColor: 'bg-[#145be9]',
        onClick: () => setStatusFilter('All')
      },
      {
        title: 'ACTIVE SUBSCRIPTIONS',
        value: total > 0 ? `${((active / total) * 100).toFixed(1)}%` : '0%',
        change: `${active} active`,
        changeType: 'positive',
        progress: total > 0 ? `${(active / total) * 100}%` : '0%',
        progressColor: 'bg-emerald-600',
        onClick: () => setStatusFilter('Active')
      },
      {
        title: 'NEW THIS MONTH',
        value: newThisMonth.toLocaleString(),
        change: 'New',
        changeType: 'positive',
        progress: total > 0 ? `${(newThisMonth / total) * 100}%` : '0%',
        progressColor: 'bg-[#145be9]',  
        onClick: () => {
          setStatusFilter('All');
          toast.success(`${newThisMonth} companies joined this month`);
        }
      }
    ];
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return companies.filter((company) => {
      const status = company.status || 'Active';
      const plan = getCompanyPlan(company);
      const matchesStatus = statusFilter === 'All' || status === statusFilter;
      const matchesPlan = planFilter === 'All' || plan === planFilter;
      const searchable = [
        company.companyName,
        company.ownerName,
        company.email,
        company.phone,
        company.city,
        company.state,
        plan
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return matchesStatus && matchesPlan && (!query || searchable.includes(query));
    });
  }, [companies, planFilter, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCompanies.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedCompanies = filteredCompanies.slice(startIndex, startIndex + pageSize);
  const showingFrom = filteredCompanies.length === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + pageSize, filteredCompanies.length);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setPlanFilter('All');
    setShowFilters(false);
  };

  const handleDeleteCompany = async () => {
    if (!companyToDelete) return;

    try {
      setDeleting(true);
      const response = await adminCompaniesApi.deleteCompany(companyToDelete._id);
      if (response.success) {
        setCompanies((prev) => prev.filter((company) => company._id !== companyToDelete._id));
        toast.success('Company deleted successfully');
        setCompanyToDelete(null);
      }
    } catch (err) {
      console.error('Error deleting company:', err);
      toast.error(err.response?.data?.message || 'Failed to delete company');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-emerald-100/50 text-emerald-700 border-emerald-200';
      case 'suspended':
        return 'bg-red-100/50 text-red-700 border-red-200';
      case 'pending':
        return 'bg-amber-100/50 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-100/50 text-gray-700 border-gray-200';
    }
  };

  const getStatusDot = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-emerald-500';
      case 'suspended':
        return 'bg-red-500';
      case 'pending':
        return 'bg-amber-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="p-4 lg:p-8 bg-[#f8fafc] min-h-full flex flex-col">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-[#1a2b4b] mb-2 tracking-tight">
              Companies Management
          </h1>
          <p className="text-gray-500 font-medium max-w-2xl text-sm lg:text-base leading-relaxed">
            Oversee organizational hierarchy, monitor subscription lifecycles, and manage architectural firm credentials from a centralized ledger.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchCompanies}
          disabled={loading}
          title="Refresh companies"
          className="w-12 h-12 rounded-xl border-2 border-blue-100 bg-blue-50 text-[#145be9] flex items-center justify-center hover:bg-[#145be9] hover:text-white transition-all group disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <button
            key={stat.title}
            type="button"
            onClick={stat.onClick}
            className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 lg:p-10 flex flex-col gap-5 text-left hover:-translate-y-0.5 hover:shadow-md transition-all"
          >
            <h3 className="text-[11px] lg:text-[13px] font-bold text-[#7ca3d2] uppercase tracking-[0.15em]">
              {stat.title}
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-4xl lg:text-[52px] font-bold text-[#1a2b4b] tracking-tight leading-none">
                {loading ? '...' : stat.value}
              </span>
              <span
                className={`text-[13px] lg:text-[15px] font-bold mt-2 ${
                  stat.changeType === 'positive'
                    ? 'text-emerald-600'
                    : stat.changeType === 'negative'
                      ? 'text-rose-500'
                      : 'text-teal-600'
                }`}
              >
                {stat.change}
              </span>
            </div>

            <div className="w-full h-[5px] bg-[#f1f5f9] rounded-full overflow-hidden mt-2">
              <div className={`h-full ${stat.progressColor} rounded-full`} style={{ width: stat.progress }} />
            </div>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex-1 flex flex-col min-h-[400px]">
        <div className="bg-[#eff6ff] p-6 lg:p-8 flex flex-col xl:flex-row xl:items-center justify-between gap-5 border-b border-blue-100">
          <div>
            <h2 className="text-lg lg:text-xl font-bold text-[#145be9]">Registered Firm Registry</h2>
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mt-1">
              {filteredCompanies.length} matching firms
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search firms..."
                className="w-full sm:w-72 pl-11 pr-10 py-3 rounded-xl bg-white border border-blue-100 text-sm font-bold text-[#1a2b4b] focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#145be9]"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowFilters((prev) => !prev)}
                className={`px-4 py-3 rounded-xl border font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                  showFilters || statusFilter !== 'All' || planFilter !== 'All'
                    ? 'bg-[#145be9] text-white border-[#145be9]'
                    : 'bg-white text-gray-500 border-blue-100 hover:text-[#145be9]'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>

              {showFilters && (
                <div className="absolute right-0 top-14 z-30 w-72 rounded-2xl bg-white border border-gray-100 shadow-xl p-4 space-y-5">
                  <FilterGroup label="Status" options={statusFilters} value={statusFilter} onChange={setStatusFilter} />
                  <FilterGroup label="Plan" options={planFilters} value={planFilter} onChange={setPlanFilter} />
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="w-full py-2.5 rounded-xl bg-gray-50 text-gray-500 text-xs font-black uppercase tracking-widest hover:bg-gray-100"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20">
            <Loader2 className="w-12 h-12 text-[#145be9] animate-spin mb-4" />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Firm Registry...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 text-red-500">
              <AlertCircle className="w-8 h-8" />
            </div>
            <p className="text-gray-600 font-bold mb-2">{error}</p>
            <button
              type="button"
              onClick={fetchCompanies}
              className="px-6 py-2 bg-[#145be9] text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition-all"
            >
              Retry Connection
            </button>
          </div>
        ) : companies.length === 0 ? (
          <EmptyState title="No Firms Found" message="Registered companies will appear here." />
        ) : filteredCompanies.length === 0 ? (
          <EmptyState title="No Matching Firms" message="Adjust your search or filters to see more companies." actionLabel="Clear Filters" onAction={clearFilters} />
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Company</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Business Email</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Plan Selected</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginatedCompanies.map((company) => (
                    <CompanyTableRow
                      key={company._id}
                      company={company}
                      getStatusStyle={getStatusStyle}
                      getStatusDot={getStatusDot}
                      onView={setSelectedCompany}
                      onEdit={(id) => navigate(`edit/${id}`)}
                      onDelete={setCompanyToDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-gray-50 overflow-y-auto max-h-[60vh]">
              {paginatedCompanies.map((company) => (
                <CompanyMobileCard
                  key={company._id}
                  company={company}
                  getStatusStyle={getStatusStyle}
                  getStatusDot={getStatusDot}
                  onView={setSelectedCompany}
                  onEdit={(id) => navigate(`edit/${id}`)}
                  onDelete={setCompanyToDelete}
                />
              ))}
            </div>
          </>
        )}

        <div className="p-6 border-t border-gray-100 flex flex-col lg:flex-row items-center justify-between gap-4 mt-auto">
          <p className="text-sm text-gray-500 font-medium">
            Showing {showingFrom}-{showingTo} of {filteredCompanies.length} firms
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <select
              value={pageSize}
              onChange={(event) => setPageSize(Number(event.target.value))}
              className="h-10 rounded-xl border border-gray-100 bg-white px-3 text-sm font-bold text-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-50"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option} / page
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
              disabled={safePage === 1}
              className="p-2 text-gray-400 hover:text-[#1a2b4b] transition-colors disabled:opacity-40 disabled:hover:text-gray-400"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="min-w-24 h-10 px-4 rounded-xl bg-[#145be9] text-white font-bold text-sm flex items-center justify-center shadow-md shadow-blue-500/20">
              {safePage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
              disabled={safePage === totalPages}
              className="p-2 text-gray-400 hover:text-[#1a2b4b] transition-colors disabled:opacity-40 disabled:hover:text-gray-400"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">System Integrity</h4>
          <p className="text-sm text-gray-500 font-medium">All ledgers are encrypted and reconciled in real-time.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-black text-[#145be9] uppercase tracking-widest">Last Sync</p>
            <p className="text-sm font-bold text-[#1a2b4b]">
              {lastSync ? lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Not synced'}
            </p>
          </div>
          <button
            type="button"
            onClick={fetchCompanies}
            disabled={loading}
            className="w-12 h-12 rounded-xl border-2 border-blue-100 bg-blue-50 text-[#145be9] flex items-center justify-center hover:bg-[#145be9] hover:text-white transition-all group disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : 'group-hover:animate-spin'}`} />
          </button>
        </div>
      </div>

      <CompanyDetailsModal company={selectedCompany} onClose={() => setSelectedCompany(null)} />
      <ConfirmModal
        show={Boolean(companyToDelete)}
        title="Delete this company?"
        message={`${companyToDelete?.companyName || 'This company'} and its account access will be permanently removed.`}
        confirmText="Delete"
        onConfirm={handleDeleteCompany}
        onCancel={() => setCompanyToDelete(null)}
        isLoading={deleting}
      />
    </div>
  );
};

const FilterGroup = ({ label, options, value, onChange }) => (
  <div>
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{label}</p>
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`px-3 py-2 rounded-xl text-xs font-black transition-colors ${
            value === option ? 'bg-[#145be9] text-white' : 'bg-gray-50 text-gray-500 hover:bg-blue-50 hover:text-[#145be9]'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  </div>
);

const EmptyState = ({ title, message, actionLabel, onAction }) => (
  <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-[#145be9]">
      <Building2 className="w-8 h-8" />
    </div>
    <p className="text-gray-600 font-bold mb-1 uppercase tracking-widest text-xs">{title}</p>
    <p className="text-gray-400 text-sm">{message}</p>
    {actionLabel && (
      <button
        type="button"
        onClick={onAction}
        className="mt-5 px-5 py-2.5 bg-[#145be9] text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition-all"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

const CompanyTableRow = ({ company, getStatusStyle, getStatusDot, onView, onEdit, onDelete }) => (
  <tr className="hover:bg-gray-50/50 transition-colors group">
    <td className="px-8 py-6">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 bg-[#0f172a]">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <p className="font-bold text-[#1a2b4b] text-[15px]">{company.companyName || 'N/A'}</p>
          <p className="text-xs text-gray-400 font-medium">Owner: {company.ownerName || 'N/A'}</p>
        </div>
      </div>
    </td>
    <td className="px-8 py-6 text-[15px] font-medium text-gray-600">{company.email || 'N/A'}</td>
    <td className="px-8 py-6 text-[15px] font-medium text-gray-600 whitespace-pre-line">
      {company.phone || 'N/A'}
    </td>
    <td className="px-8 py-6">
      <PlanBadge plan={getCompanyPlan(company)} />
    </td>
    <td className="px-8 py-6">
      <StatusBadge status={company.status || 'Active'} getStatusStyle={getStatusStyle} getStatusDot={getStatusDot} />
    </td>
    <td className="px-8 py-6">
      <div className="flex items-center justify-end gap-3">
        <button type="button" onClick={() => onView(company)} title="View company" className="p-2 text-gray-400 hover:text-[#145be9] transition-colors">
          <Eye className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => onEdit(company._id)} title="Edit company" className="p-2 text-gray-400 hover:text-gray-700 transition-colors">
          <Pencil className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => onDelete(company)} title="Delete company" className="p-2 text-gray-400 hover:text-red-500 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </td>
  </tr>
);

const CompanyMobileCard = ({ company, getStatusStyle, getStatusDot, onView, onEdit, onDelete }) => (
  <div className="p-6 space-y-4">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white shrink-0 bg-[#0f172a]">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <p className="font-bold text-[#1a2b4b] text-base">{company.companyName || 'N/A'}</p>
          <p className="text-xs text-gray-400 font-medium">{company.ownerName || 'N/A'}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => onView(company)} className="p-2 text-gray-400 hover:text-[#145be9] transition-colors">
          <Eye className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => onEdit(company._id)} className="p-2 text-gray-400 hover:text-gray-700 transition-colors">
          <Pencil className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => onDelete(company)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 pt-2">
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email</p>
        <p className="text-sm font-medium text-gray-600 truncate">{company.email || 'N/A'}</p>
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Contact</p>
        <p className="text-sm font-medium text-gray-600">{company.phone || 'N/A'}</p>
      </div>
    </div>

    <div className="flex items-center justify-between pt-2">
      <PlanBadge plan={getCompanyPlan(company)} />
      <StatusBadge status={company.status || 'Active'} getStatusStyle={getStatusStyle} getStatusDot={getStatusDot} />
    </div>
  </div>
);

const PlanBadge = ({ plan }) => (
  <span
    className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wide ${
      plan === 'Enterprise' ? 'bg-[#145be9] text-white' : 'bg-[#dbeafe] text-[#145be9]'
    }`}
  >
    {plan}
  </span>
);

const StatusBadge = ({ status, getStatusStyle, getStatusDot }) => (
  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${getStatusStyle(status)}`}>
    <div className={`w-1.5 h-1.5 rounded-full ${getStatusDot(status)}`} />
    <span className="text-xs font-black uppercase tracking-wider">{status}</span>
  </div>
);

const CompanyDetailsModal = ({ company, onClose }) => {
  if (!company) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-[#1a2b4b]">{company.companyName || 'Company Profile'}</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Firm details</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetailItem icon={Building2} label="Company" value={company.companyName || 'N/A'} />
          <DetailItem icon={Building2} label="Owner" value={company.ownerName || 'N/A'} />
          <DetailItem icon={Mail} label="Email" value={company.email || 'N/A'} />
          <DetailItem icon={Phone} label="Phone" value={company.phone || 'N/A'} />
          <DetailItem label="Plan" value={getCompanyPlan(company)} />
          <DetailItem label="Status" value={company.status || 'Active'} />
          <DetailItem label="GST" value={company.gstNo || 'N/A'} />
          <DetailItem label="Joined" value={formatDate(company.createdAt)} />
          <div className="sm:col-span-2">
            <DetailItem label="Address" value={[company.address, company.city, company.state, company.pincode].filter(Boolean).join(', ') || 'N/A'} />
          </div>
        </div>
      </div>
      <button type="button" aria-label="Close details" onClick={onClose} className="fixed inset-0 z-[-1]" />
    </div>
  );
};

const DetailItem = ({ icon: Icon, label, value }) => (
  <div className="rounded-2xl border border-gray-100 bg-[#f8fafc] p-4">
    <div className="flex items-center gap-2 text-gray-400 mb-2">
      {Icon && <Icon className="w-4 h-4" />}
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </div>
    <p className="text-sm font-bold text-[#1a2b4b] break-words">{value}</p>
  </div>
);

export default CompaniesManagement;
