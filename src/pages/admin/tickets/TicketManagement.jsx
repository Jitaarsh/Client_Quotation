import React, { useState } from 'react';
import { 
  Filter, 
  Plus, 
  Mail, 
  MessageCircle, 
  CheckCircle2,
  FileText
} from 'lucide-react';
import { useAdminTickets } from '../../../hooks/useAdminTickets';
import { useNavigate } from 'react-router-dom';
import StatusDropdown from '../../../components/StatusDropdown';
import useAuthStore from '../../../store/authStore';
import SystemRequestOtpLogin from './components/SystemRequestOtpLogin';

const TicketManagement = () => {
  const [otpTicket, setOtpTicket] = useState(null);
  const {
    tickets,
    isLoading,
    updateStatus,
    sendSystemRequestOtp,
    isSendingSystemRequestOtp,
    sendingSystemRequestTicketId,
  } = useAdminTickets();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const canUseSystemRequest = user?.role === 'superadmin';

  // Calculate stats from real data
  const stats = [
    {
      label: "Open Tickets",
      value: tickets.filter(t => t.status === "OPEN").length.toString(),
      icon: Mail,
      iconBg: "bg-blue-50 text-blue-600",
    },
    {
      label: "In Progress",
      value: tickets.filter(t => t.status === "IN PROGRESS").length.toString(),
      icon: MessageCircle,
      iconBg: "bg-amber-50 text-amber-600",
    },
    {
      label: "Resolved",
      value: tickets.filter(t => t.status === "RESOLVED").length.toString(),
      icon: CheckCircle2,
      iconBg: "bg-emerald-50 text-emerald-600",
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-50 text-blue-600';
      case 'IN PROGRESS': return 'bg-amber-50 text-amber-700';
      case 'RESOLVED': return 'bg-emerald-50 text-emerald-600';
      default: return 'bg-gray-50 text-gray-500';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-rose-50 text-rose-600';
      case 'Medium': return 'bg-indigo-50 text-indigo-600';
      case 'Low': return 'bg-gray-50 text-gray-500';
      default: return 'bg-gray-50 text-gray-500';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleSystemRequest = (ticket) => {
    sendSystemRequestOtp(ticket._id, {
      onSuccess: () => {
        setOtpTicket(ticket);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#145be9]"></div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 bg-[#f8fafc] min-h-full flex flex-col">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h4 className="text-[11px] font-black text-[#145be9] uppercase tracking-[0.2em] mb-1">
            Management Portal
          </h4>
          <h1 className="text-3xl lg:text-4xl font-black text-[#1a2b4b] tracking-tight">
            Ticket Management
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-[#1a2b4b] font-bold rounded-xl text-sm hover:bg-gray-50 transition-colors shadow-sm">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-[#0b5cd5] text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20">
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Request</span>
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-[1.5rem] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-50 p-6 flex items-center gap-6">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${stat.iconBg}`}>
              <stat.icon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 mb-1">{stat.label}</p>
              <h3 className="text-3xl lg:text-4xl font-black text-[#1a2b4b] tracking-tight leading-none">
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Data Table Container */}
      <div className="bg-white rounded-[2rem] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] border border-gray-50 overflow-hidden flex flex-col mb-6">
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-gray-100">
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Subject</th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Company</th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Date Created</th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Priority</th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Status</th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-8 py-12 text-center text-gray-500 font-bold">
                    No tickets found.
                  </td>
                </tr>
              ) : tickets.map((ticket) => (
                <tr key={ticket._id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-[#1a2b4b] text-[15px] max-w-[250px] leading-snug">
                          {ticket.subject}
                        </p>
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">{ticket.ticketId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-[15px] font-bold text-gray-500 whitespace-nowrap">
                    {ticket.createdBy?.companyName || "N/A"}
                  </td>
                  <td className="px-8 py-6 text-[14px] font-bold text-gray-500 whitespace-nowrap">
                    {formatDate(ticket.createdAt)}
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase whitespace-nowrap ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <StatusDropdown 
                      currentStatus={ticket.status} 
                      onStatusChange={(status) => updateStatus({ id: ticket._id, status })}
                      getStatusColor={getStatusColor}
                    />
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => navigate(`/admin/dashboard/tickets/${ticket._id}`)}
                        className="px-5 py-2 text-[#145be9] font-bold text-xs bg-white border border-blue-100 rounded-xl hover:bg-blue-50 transition-colors tracking-wide"
                      >
                        View
                      </button>
                      {canUseSystemRequest && (
                        <button 
                          onClick={() => handleSystemRequest(ticket)}
                          disabled={isSendingSystemRequestOtp && sendingSystemRequestTicketId === ticket._id}
                          className="px-5 py-2 text-red-600 font-bold text-xs bg-white border border-red-200 rounded-xl hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors tracking-wide"
                        >
                          {isSendingSystemRequestOtp && sendingSystemRequestTicketId === ticket._id ? 'Sending...' : 'SystemRequest'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-50">
          {tickets.map((ticket) => (
            <div key={ticket._id} className="p-5 flex flex-col gap-4 hover:bg-gray-50/50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-[#1a2b4b] text-[15px] leading-snug mb-1">
                    {ticket.subject}
                  </h4>
                  <div className="flex items-center gap-2 text-[13px] font-medium text-gray-500">
                    <span>{ticket.createdBy?.companyName || "N/A"}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span>{formatDate(ticket.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest uppercase ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                  <StatusDropdown 
                    currentStatus={ticket.status} 
                    onStatusChange={(status) => updateStatus({ id: ticket._id, status })}
                    getStatusColor={getStatusColor}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => navigate(`/admin/dashboard/tickets/${ticket._id}`)}
                    className="px-4 py-1.5 text-[#145be9] font-bold text-xs bg-white border border-blue-100 rounded-lg hover:bg-blue-50 transition-colors tracking-wide"
                  >
                    View
                  </button>
                  {canUseSystemRequest && (
                    <button 
                      onClick={() => handleSystemRequest(ticket)}
                      disabled={isSendingSystemRequestOtp && sendingSystemRequestTicketId === ticket._id}
                      className="px-4 py-1.5 text-red-600 font-bold text-xs bg-white border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors tracking-wide"
                    >
                      {isSendingSystemRequestOtp && sendingSystemRequestTicketId === ticket._id ? 'Sending...' : 'SystemRequest'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {otpTicket && (
        <SystemRequestOtpLogin
          ticket={otpTicket}
          onClose={() => setOtpTicket(null)}
          showOpenChat
        />
      )}

      {/* Footer Text */}
      <div className="mt-auto px-4">
        <p className="text-sm font-medium text-gray-500">
          *View Ticket – Admin can reply or change status. Or can see full conversation and messages.
        </p>
      </div>
    </div>
  );
};

export default TicketManagement;
