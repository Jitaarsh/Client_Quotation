import { createElement, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  AlertCircle,
  Building2,
  DollarSign,
  Eye,
  Filter,
  History,
  ListOrdered,
  Loader2,
  Mail,
  Pencil,
  Plus,
  Trash2,
  X
} from 'lucide-react';
import { getAllTickets, updateTicketStatus } from '../../../api/adminTicketApi';
import adminCompaniesApi from '../../../api/adminCompaniesApi';
import ConfirmModal from '../../../components/ConfirmModal';

const orderStatusStyles = {
  ACTIVE: 'bg-green-100 text-green-600',
  PENDING: 'bg-indigo-50 text-indigo-500',
  SUSPENDED: 'bg-red-50 text-red-500'
};

const companyFilters = ['ALL', 'ACTIVE', 'SUSPENDED', 'PENDING'];

const formatMoney = (amount = 0, currency = 'INR') =>
  new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency
  }).format(amount);

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const getInitials = (name = 'Company') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

const getCompanyPlanName = (company) =>
  company.selectedPlan?.name || company.subscription || 'Basic';

const getCompanyPlanCurrency = (company) => company.selectedPlan?.currency || 'INR';

const getCompanyPlanAmount = (company) => {
  const plan = company.selectedPlan;
  const amount = plan?.discountedPrice ?? plan?.price ?? 0;
  return Number.isFinite(Number(amount)) ? Number(amount) : 0;
};

const getCompanyOrderStatus = (company) => (company.status || 'Active').toUpperCase();

const mapCompanyToOrder = (company) => ({
  id: `#${String(company._id || '').slice(-6).toUpperCase() || 'NEW'}`,
  company: company.companyName || 'N/A',
  date: formatDate(company.createdAt),
  amount: getCompanyPlanAmount(company),
  currency: getCompanyPlanCurrency(company),
  plan: getCompanyPlanName(company),
  status: getCompanyOrderStatus(company),
  companyRecord: company
});

const getStatusColor = (status) => {
  const normalized = status?.toUpperCase();
  if (normalized === 'ACTIVE') return 'text-green-600';
  if (normalized === 'SUSPENDED') return 'text-red-500';
  if (normalized === 'PENDING') return 'text-amber-600';
  return 'text-gray-500';
};

const getStatusDot = (status) => {
  const normalized = status?.toUpperCase();
  if (normalized === 'ACTIVE') return 'bg-green-500 animate-pulse';
  if (normalized === 'SUSPENDED') return 'bg-red-500';
  if (normalized === 'PENDING') return 'bg-amber-500';
  return 'bg-gray-400';
};

const StatCard = ({ icon, title, value, badge, badgeColor, iconBg, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="bg-white p-6 rounded-xl border border-[#145be9] shadow-sm flex flex-col gap-5 text-left hover:-translate-y-0.5 hover:shadow-md transition-all"
  >
    <div className="flex justify-between items-start">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${iconBg}`}>
        {createElement(icon, { className: 'w-6 h-6' })}
      </div>
      <div className={`px-2 py-1.5 rounded-md ${badgeColor}`}>
        <span className="text-[10px] font-black uppercase tracking-wider whitespace-nowrap">
          {badge}
        </span>
      </div>
    </div>
    <div className="space-y-2">
      <p className="text-slate-600 font-semibold text-[17px]">{title}</p>
      <h3 className="text-3xl font-bold text-[#1a2b4b] leading-none">{value}</h3>
    </div>
  </button>
);

const AdminDashboardOverview = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [ticketStats, setTicketStats] = useState({ open: 0, total: 0 });
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [companyFilter, setCompanyFilter] = useState('ALL');
  const [showCompanyFilters, setShowCompanyFilters] = useState(false);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyToToggle, setCompanyToToggle] = useState(null);
  const [companyToDelete, setCompanyToDelete] = useState(null);
  const [updatingCompany, setUpdatingCompany] = useState(false);
  const [deletingCompany, setDeletingCompany] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const fetchTickets = async () => {
    try {
      setLoadingTickets(true);
      const response = await getAllTickets();
      if (response.success) {
        const liveTickets = response.data.filter((ticket) => ticket.status !== 'RESOLVED');
        const openCount = response.data.filter((ticket) => ticket.status === 'OPEN').length;
        setTickets(liveTickets.slice(0, 3));
        setTicketStats({ open: openCount, total: response.data.length });
      }
    } catch (err) {
      console.error('Error fetching dashboard tickets:', err);
      toast.error('Failed to load dashboard tickets');
    } finally {
      setLoadingTickets(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const response = await adminCompaniesApi.getAllCompanies();
      if (response.success) {
        setCompanies(response.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard companies:', err);
      toast.error('Failed to load company overview');
    } finally {
      setLoadingCompanies(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchCompanies();
  }, []);

  const companyStats = useMemo(() => {
    const active = companies.filter((company) => (company.status || 'Active') === 'Active').length;
    const newThisMonth = companies.filter((company) => {
      if (!company.createdAt) return false;
      const createdAt = new Date(company.createdAt);
      const now = new Date();
      return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
    }).length;

    return {
      active,
      total: companies.length,
      newThisMonth
    };
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    if (companyFilter === 'ALL') return companies.slice(0, 5);
    return companies
      .filter((company) => (company.status || 'Active').toUpperCase() === companyFilter)
      .slice(0, 5);
  }, [companies, companyFilter]);

  const orders = useMemo(
    () => companies.map(mapCompanyToOrder),
    [companies]
  );
  const visibleOrders = showAllOrders ? orders : orders.slice(0, 3);
  const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);
  const paidRevenue = orders
    .filter((order) => order.status === 'ACTIVE')
    .reduce((sum, order) => sum + order.amount, 0);

  const handleCloseTicket = async (id) => {
    try {
      const response = await updateTicketStatus(id, 'RESOLVED');
      if (response.success) {
        toast.success('Ticket closed');
        setTickets((prev) => prev.filter((ticket) => ticket._id !== id));
        setTicketStats((prev) => ({ ...prev, open: Math.max(prev.open - 1, 0) }));
      }
    } catch (err) {
      console.error('Error closing ticket:', err);
      toast.error('Failed to close ticket');
    }
  };

  const handleExportOrders = () => {
    const headers = ['Order ID', 'Company', 'Date', 'Plan', 'Amount', 'Status'];
    const rows = orders.map((order) => [
      order.id,
      order.company,
      order.date,
      order.plan,
      order.amount,
      order.status
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'recent-orders.csv';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Orders exported');
  };

  const handleToggleCompanyStatus = async () => {
    if (!companyToToggle) return;

    const nextStatus = companyToToggle.status === 'Suspended' ? 'Active' : 'Suspended';
    const payload = {
      companyName: companyToToggle.companyName,
      ownerName: companyToToggle.ownerName,
      email: companyToToggle.email,
      phone: companyToToggle.phone,
      status: nextStatus,
      address: companyToToggle.address,
      city: companyToToggle.city,
      state: companyToToggle.state,
      pincode: companyToToggle.pincode,
      selectedPlan: companyToToggle.selectedPlan?._id || companyToToggle.selectedPlan || ''
    };

    try {
      setUpdatingCompany(true);
      const response = await adminCompaniesApi.updateCompany(companyToToggle._id, payload);
      if (response.success) {
        setCompanies((prev) =>
          prev.map((company) =>
            company._id === companyToToggle._id ? { ...company, status: nextStatus } : company
          )
        );
        toast.success(`marked ${nextStatus}`);
        setCompanyToToggle(null);
      }
    } catch (err) {
      console.error('Error updating company status:', err);
      toast.error('Failed to update company status');
    } finally {
      setUpdatingCompany(false);
    }
  };

  const handleDeleteCompany = async () => {
    if (!companyToDelete) return;

    try {
      setDeletingCompany(true);
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
      setDeletingCompany(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 bg-[#f8fafc] min-h-full space-y-6 lg:space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 flex justify-between items-center border-b border-gray-50/50">
            <h2 className="text-lg lg:text-xl font-bold text-[#1a2b4b] border-l-4 border-[#145be9] pl-4">
              Recent Orders Ledger
            </h2>
            <button
              type="button"
              onClick={handleExportOrders}
              className="text-[#145be9] text-sm font-bold hover:underline tracking-tight whitespace-nowrap ml-4"
              >
              Export CSV
            </button>
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f1f5f9] text-[#64748b] text-[11px] font-black uppercase tracking-[0.1em]">
                  <th className="px-6 py-5">Order ID</th>
                  <th className="px-6 py-5">Company</th>
                  <th className="px-6 py-5 text-center">Date</th>
                  <th className="px-6 py-5 text-center">Plan</th>
                  <th className="px-6 py-5 text-center">Amount</th>
                  <th className="px-6 py-5 text-center">Status</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visibleOrders.map((order) => (
                  <OrderTableRow
                    key={order.id}
                    order={order}
                    onView={setSelectedOrder}
                    onEdit={(company) => navigate(`/admin/dashboard/companies/edit/${company?._id}`)}
                    onDelete={setCompanyToDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden p-4 space-y-4 bg-gray-50/50">
            {visibleOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onView={setSelectedOrder}
                onEdit={(company) => navigate(`/admin/dashboard/companies/edit/${company?._id}`)}
                onDelete={setCompanyToDelete}
              />
            ))}
          </div>

          {loadingCompanies ? (
            <div className="py-12 flex flex-col items-center justify-center text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-[#145be9]" />
              <p className="text-xs font-black uppercase tracking-widest">Loading order ledger</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
              No company orders found
            </div>
          ) : null}

          <div className="p-4 bg-[#eff6ff] border-t border-blue-50 mt-auto">
            <button
              type="button"
              onClick={() => setShowAllOrders((prev) => !prev)}
              className="w-full py-2.5 text-[#145be9] font-black text-[15px] hover:text-blue-800 transition-colors tracking-tight"
            >
              {showAllOrders ? 'Show Latest Orders' : 'View All Orders'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-4 grid grid-cols-1 gap-6">
          <StatCard
            icon={AlertCircle}
            title="Open Tickets"
            value={loadingTickets ? '...' : ticketStats.open}
            badge={`${ticketStats.total} Total`}
            badgeColor="bg-red-50 text-red-600"
            iconBg="bg-red-50 text-red-600"
          />
          <StatCard
            icon={Building2}
            title="Active Companies"
            value={loadingCompanies ? '...' : companyStats.active}
            badge={`${companyStats.newThisMonth} New`}
            badgeColor="bg-blue-50 text-blue-600"
            iconBg="bg-blue-50 text-blue-600"
          />
          <StatCard
            icon={ListOrdered}
            title="Total Orders"
            value={orders.length}
            badge={`${orders.filter((order) => order.status === 'PENDING').length} Pending`}
            badgeColor="bg-orange-50 text-orange-600"
            iconBg="bg-orange-50 text-orange-600"
          />
          <StatCard
            icon={DollarSign}
            title="Total Revenue"
            value={formatMoney(paidRevenue)}
            badge={formatMoney(totalRevenue)}
            badgeColor="bg-emerald-50 text-emerald-600"
            iconBg="bg-blue-50 text-blue-600"
            
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#1a2b4b]">Live Tickets</h2>
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard/tickets')}
            title="Open ticket history"
            className="p-2 text-gray-400 hover:bg-white hover:text-[#145be9] hover:shadow-sm rounded-lg transition-all"
          >
            <History className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loadingTickets ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-40 rounded-3xl bg-white border border-gray-100 animate-pulse" />
            ))
          ) : tickets.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-dashed border-gray-200">
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No live tickets found</p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <div
                key={ticket._id}
                className={`p-6 rounded-3xl border-l-[6px] shadow-sm space-y-4 bg-white border-gray-100 ${
                  ticket.priority === 'HIGH'
                    ? 'border-red-500 bg-red-50/10'
                    : ticket.priority === 'MEDIUM'
                      ? 'border-orange-400 bg-orange-50/10'
                      : 'border-blue-400 bg-blue-50/10'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span
                    className={`text-[10px] font-black tracking-wider uppercase ${
                      ticket.priority === 'HIGH'
                        ? 'text-red-700'
                        : ticket.priority === 'MEDIUM'
                          ? 'text-orange-700'
                          : 'text-blue-700'
                    }`}
                  >
                    {ticket.priority} PRIORITY
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 italic">
                    {formatDate(ticket.createdAt)}
                  </span>
                </div>
                <div>
                  <h4 className="font-black text-[#1a2b4b] text-[17px] leading-tight line-clamp-1">
                    {ticket.subject}
                  </h4>
                  <p className="text-gray-500 text-[11px] font-bold mt-1.5 uppercase tracking-tight">
                    {ticket.createdBy?.companyName || 'Unknown Company'} - {ticket.category}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/admin/dashboard/tickets/${ticket._id}`)}
                    className="py-2.5 rounded-lg text-[10px] font-black text-[#145be9] bg-white border border-blue-100 hover:bg-blue-50 transition-colors uppercase tracking-widest"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCloseTicket(ticket._id)}
                    className="py-2.5 rounded-lg text-[10px] font-black text-white bg-[#0f172a] hover:bg-slate-800 transition-colors uppercase tracking-widest"
                  >
                    Close
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 lg:p-8 flex flex-col lg:flex-row gap-6 lg:gap-0 lg:justify-between lg:items-center border-b border-gray-50">
          <h2 className="text-xl font-bold text-[#1a2b4b] border-l-4 border-[#145be9] pl-4 max-w-[280px] lg:max-w-none">
            Strategic Partners Ledger
          </h2>
          <div className="flex items-center space-x-3 relative">
            <button
              type="button"
              onClick={() => setShowCompanyFilters((prev) => !prev)}
              className="flex-1 lg:flex-none flex items-center justify-center space-x-2 px-4 lg:px-5 py-2.5 rounded-xl bg-gray-50 text-gray-600 font-bold text-sm hover:bg-gray-100 transition-all border border-gray-100"
            >
              <Filter className="w-4 h-4" />
              <span>{companyFilter === 'ALL' ? 'Filter' : companyFilter}</span>
            </button>
            {showCompanyFilters && (
              <div className="absolute right-0 top-12 z-20 w-44 rounded-2xl bg-white border border-gray-100 shadow-xl p-2">
                {companyFilters.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => {
                      setCompanyFilter(filter);
                      setShowCompanyFilters(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-black tracking-widest hover:bg-blue-50 ${
                      companyFilter === filter ? 'text-[#145be9] bg-blue-50' : 'text-gray-500'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            )}
            <button
              type="button"
              className="flex-1 lg:flex-none flex items-center justify-center space-x-2 px-4 lg:px-5 py-2.5 rounded-xl bg-[#145be9] text-white font-bold text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20"
              onClick={() => 
              {navigate("/register")}}            >
              <Plus className="w-4 h-4" />
              <span className="whitespace-nowrap">Add Company</span>
            </button>
          </div>
        </div>

        {loadingCompanies ? (
          <div className="py-16 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-[#145be9]" />
            <p className="text-xs font-black uppercase tracking-widest">Loading companies</p>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="py-16 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
            No companies match this filter
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#1a2b4b]">
                  <tr className="text-white text-[10px] font-black uppercase tracking-[0.1em]">
                    <th className="px-8 py-5">Company Name</th>
                    <th className="px-8 py-5">Plan Tier</th>
                    <th className="px-8 py-5">Signup Date</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCompanies.map((company) => (
                    <CompanyTableRow
                      key={company._id}
                      company={company}
                      onView={setSelectedCompany}
                      onEdit={(id) => navigate(`/admin/dashboard/companies/edit/${id}`)}
                      onToggleStatus={setCompanyToToggle}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden p-4 space-y-4 bg-gray-50/50">
              {filteredCompanies.map((company) => (
                <CompanyCard
                  key={company._id}
                  company={company}
                  onView={setSelectedCompany}
                  onEdit={(id) => navigate(`/admin/dashboard/companies/edit/${id}`)}
                  onToggleStatus={setCompanyToToggle}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      <CompanyDetailsModal company={selectedCompany} onClose={() => setSelectedCompany(null)} />
      <InviteCompanyModal show={showInviteModal} onClose={() => setShowInviteModal(false)} />

      <ConfirmModal
        show={Boolean(companyToToggle)}
        title={`${companyToToggle?.status === 'Suspended' ? 'Restore' : 'Suspend'} company?`}
        message={`${companyToToggle?.companyName || 'This company'} will be marked ${
          companyToToggle?.status === 'Suspended' ? 'Active' : 'Suspended'
        }.`}
        confirmText={companyToToggle?.status === 'Suspended' ? 'Restore' : 'Suspend'}
        onConfirm={handleToggleCompanyStatus}
        onCancel={() => setCompanyToToggle(null)}
        isLoading={updatingCompany}
      />

      <ConfirmModal
        show={Boolean(companyToDelete)}
        title="Delete company?"
        message={`${companyToDelete?.companyName || 'This company'} will be permanently removed from the system.`}
        confirmText="Delete"
        onConfirm={handleDeleteCompany}
        onCancel={() => setCompanyToDelete(null)}
        isLoading={deletingCompany}
      />
    </div>
  );
};

const OrderTableRow = ({ order, onView, onEdit, onDelete }) => (
  <tr className="group hover:bg-gray-50/50 transition-colors">
    <td className="px-6 py-7 font-black text-[#1a2b4b] text-[15px]">{order.id}</td>
    <td className="px-6 py-7">
      <p className="font-bold text-gray-600 text-[15px] leading-tight">{order.company}</p>
    </td>
    <td className="px-6 py-7 text-center text-gray-500 font-medium text-sm">{order.date}</td>
    <td className="px-6 py-7 text-center">
      <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#145be9]">
        {order.plan}
      </span>
    </td>
    <td className="px-6 py-7 text-center font-black text-[#1a2b4b] text-[16px]">
      {formatMoney(order.amount, order.currency)}
    </td>
    <td className="px-6 py-7 text-center">
      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.05em] ${orderStatusStyles[order.status]}`}>
        {order.status}
      </span>
    </td>
    <td className="px-6 py-7">
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => onView(order)}
          title="View order"
          className="text-gray-400 hover:text-[#145be9] transition-all"
        >
          <Eye className="w-5 h-5 stroke-[2.5]" />
        </button>
        <button
          type="button"
          onClick={() => onEdit(order.companyRecord)}
          title="Edit company"
          className="text-gray-400 hover:text-[#145be9] transition-all"
        >
          <Pencil className="w-5 h-5 stroke-[2.5]" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(order.companyRecord)}
          title="Delete company"
          className="text-gray-400 hover:text-red-500 transition-all"
        >
          <Trash2 className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>
    </td>
  </tr>
);

const OrderCard = ({ order, onView, onEdit, onDelete }) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4 transition-all active:scale-[0.98]">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Order ID</p>
        <p className="font-black text-[#1a2b4b] text-base leading-none">{order.id}</p>
      </div>
      <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${orderStatusStyles[order.status]}`}>
        {order.status}
      </span>
    </div>

    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Company</p>
      <p className="font-bold text-gray-600 text-sm leading-tight">{order.company}</p>
    </div>

    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-50">
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Date</p>
        <p className="text-sm font-bold text-gray-700">{order.date}</p>
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Plan</p>
        <p className="text-sm font-bold text-gray-700">{order.plan}</p>
      </div>
      <div className="col-span-2">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Amount</p>
        <p className="text-sm font-black text-[#1a2b4b]">{formatMoney(order.amount, order.currency)}</p>
      </div>
    </div>

    <div className="flex justify-between items-center pt-4 border-t border-gray-50">
      <button
        type="button"
        onClick={() => onView(order)}
        className="text-[#145be9] font-black text-[11px] uppercase tracking-widest hover:underline"
      >
        View Details
      </button>
      <div className="flex space-x-3">
        <button type="button" onClick={() => onEdit(order.companyRecord)} className="p-2 text-gray-400 hover:text-[#145be9] transition-all">
          <Pencil className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => onDelete(order.companyRecord)} className="p-2 text-gray-400 hover:text-red-500 transition-all">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
);

const CompanyTableRow = ({ company, onView, onEdit, onToggleStatus }) => (
  <tr className="group hover:bg-blue-50/30 transition-all duration-200">
    <td className="px-8 py-6">
      <div className="flex items-center space-x-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm bg-blue-100 text-blue-600">
          {getInitials(company.companyName)}
        </div>
        <div>
          <p className="font-bold text-[#1a2b4b] text-sm">{company.companyName || 'N/A'}</p>
          <p className="text-gray-400 text-[11px] font-medium">{company.ownerName || company.email}</p>
        </div>
      </div>
    </td>
    <td className="px-8 py-6 text-sm font-semibold text-gray-500">
      <div className="flex items-center space-x-2">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
        <span>{company.selectedPlan?.name || company.subscription || 'Basic'}</span>
      </div>
    </td>
    <td className="px-8 py-6 text-sm font-medium text-gray-400">{formatDate(company.createdAt)}</td>
    <td className="px-8 py-6">
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${getStatusDot(company.status)}`} />
        <span className={`text-[11px] font-black tracking-wider ${getStatusColor(company.status)}`}>
          {company.status || 'Active'}
        </span>
      </div>
    </td>
    <td className="px-8 py-6">
      <div className="flex justify-end items-center space-x-6">
        <button type="button" onClick={() => onView(company)} className="text-[#145be9] font-bold text-xs hover:underline decoration-2 underline-offset-4 transition-all">
          View Profile
        </button>
        <button type="button" onClick={() => onEdit(company._id)} className="text-gray-400 font-bold text-xs hover:text-gray-700 transition-all">
          Edit
        </button>
        <button type="button" onClick={() => onToggleStatus(company)} className="text-red-500 font-bold text-xs hover:text-red-700 transition-all">
          {company.status === 'Suspended' ? 'Restore' : 'Suspend'}
        </button>
      </div>
    </td>
  </tr>
);

const CompanyCard = ({ company, onView, onEdit, onToggleStatus }) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-5 transition-all active:scale-[0.98]">
    <div className="flex items-center space-x-4">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base shadow-sm bg-blue-100 text-blue-600">
        {getInitials(company.companyName)}
      </div>
      <div>
        <p className="font-black text-[#1a2b4b] text-base">{company.companyName || 'N/A'}</p>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{company.ownerName || company.email}</p>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-y-4 pt-2 border-t border-gray-50">
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Plan Tier</p>
        <div className="flex items-center space-x-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span className="text-sm font-bold text-gray-700">{company.selectedPlan?.name || company.subscription || 'Basic'}</span>
        </div>
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Signup Date</p>
        <p className="text-sm font-bold text-gray-700">{formatDate(company.createdAt)}</p>
      </div>
      <div className="col-span-2">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${getStatusDot(company.status)}`} />
          <span className={`text-xs font-black tracking-widest uppercase ${getStatusColor(company.status)}`}>
            {company.status || 'Active'}
          </span>
        </div>
      </div>
    </div>

    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
      <button type="button" onClick={() => onView(company)} className="text-[#145be9] font-black text-xs uppercase tracking-widest hover:underline">
        View  
      </button>
      <div className="flex space-x-4">
        <button type="button" onClick={() => onEdit(company._id)} className="text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-gray-700">
          Edit
        </button>
        <button type="button" onClick={() => onToggleStatus(company)} className="text-red-500 font-bold text-xs uppercase tracking-widest hover:text-red-700">
          {company.status === 'Suspended' ? 'Restore' : 'Suspend'}
        </button>
      </div>
    </div>
  </div>
);

const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <ModalShell title="Order Details" onClose={onClose}>
      <InfoRow label="Order ID" value={order.id} />
      <InfoRow label="Company" value={order.company} />
      <InfoRow label="Date" value={order.date} />
      <InfoRow label="Plan" value={order.plan} />
      <InfoRow label="Amount" value={formatMoney(order.amount, order.currency)} />
      <InfoRow label="Status" value={order.status} />
    </ModalShell>
  );
};

const CompanyDetailsModal = ({ company, onClose }) => {
  if (!company) return null;

  return (
    <ModalShell title="Company Profile" onClose={onClose}>
      <InfoRow label="Company" value={company.companyName || 'N/A'} />
      <InfoRow label="Owner" value={company.ownerName || 'N/A'} />
      <InfoRow label="Email" value={company.email || 'N/A'} />
      <InfoRow label="Phone" value={company.phone || 'N/A'} />
      <InfoRow label="Plan" value={company.selectedPlan?.name || company.subscription || 'Basic'} />
      <InfoRow
        label="Plan Amount"
        value={formatMoney(getCompanyPlanAmount(company), getCompanyPlanCurrency(company))}
      />
      <InfoRow label="Status" value={company.status || 'Active'} />
    </ModalShell>
  );
};

const InviteCompanyModal = ({ show, onClose }) => {
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');

  if (!show) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!email.trim()) {
      toast.error('Enter a company email');
      return;
    }

    const subject = encodeURIComponent('Invitation to Quick Quote');
    const body = encodeURIComponent(
      `Hello${companyName ? ` ${companyName}` : ''},\n\nPlease register your company on Quick Quote to continue onboarding.\n\nRegistration link: ${window.location.origin}/register`
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    toast.success('Invitation draft opened');
    onClose();
  };

  return (
    <ModalShell title="Invite Company" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Company Name</span>
          <input
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
            className="mt-2 w-full px-4 py-3 bg-[#f8fafc] border border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-[#145be9] transition-all font-bold text-[#1a2b4b] text-sm"
            placeholder="Company name"
          />
        </label>
        <label className="block">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</span>
          <div className="relative mt-2">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-[#f8fafc] border border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-[#145be9] transition-all font-bold text-[#1a2b4b] text-sm"
              placeholder="owner@company.com"
            />
          </div>
        </label>
        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-[#145be9] text-white font-black hover:bg-blue-700 transition-all"
        >
          Send Invite
        </button>
      </form>
    </ModalShell>
  );
};

const ModalShell = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-lg font-black text-[#1a2b4b]">{title}</h3>
        <button type="button" onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-gray-700">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
    <button type="button" aria-label="Close modal" onClick={onClose} className="fixed inset-0 z-[-1]" />
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4 border-b border-gray-50 pb-3">
    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
    <span className="text-sm font-bold text-[#1a2b4b] text-right">{value}</span>
  </div>
);

export default AdminDashboardOverview;
