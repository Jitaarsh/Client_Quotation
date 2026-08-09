import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  Building2, 
  AlertCircle,
  FileText,
  Download,
  CheckCircle2,
  MessageSquare
} from 'lucide-react';
import { getTicketById } from '../../../api/adminTicketApi';
import { useAdminTickets } from '../../../hooks/useAdminTickets';
import StatusDropdown from '../../../components/StatusDropdown';
import TicketChat from '../../company/helpCenter/components/TicketChat';
import ChatInput from '../../company/helpCenter/components/ChatInput';
import { useTicketChat } from '../../../hooks/useTicketChat';
import { MoreVertical } from 'lucide-react';
import SystemRequestOtpLogin from './components/SystemRequestOtpLogin';

const AdminTicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [otpTicket, setOtpTicket] = useState(location.state?.systemRequestOtpTicket || null);
  const { updateStatus } = useAdminTickets();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-ticket', id],
    queryFn: () => getTicketById(id),
  });

  const ticket = data?.data;

  // Real-time Chat Hook
  const { messages, sendMessage } = useTicketChat(id, ticket?.messages || []);

  const handleSendMessage = (text) => {
    sendMessage(text);
  };

  const getFileUrl = (path) => {
    if (!path) return '#';
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${baseUrl}${path}`;
  };

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
      case 'High': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'Medium': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'Low': return 'bg-gray-50 text-gray-500 border-gray-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#145be9]"></div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-[#1a2b4b]">Ticket not found</h2>
        <button onClick={() => navigate('/admin/dashboard/tickets')} className="mt-4 text-[#145be9] font-bold hover:underline">
          Go back to tickets
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 bg-[#f8fafc] min-h-full flex flex-col gap-6">
      {/* Premium Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/dashboard/tickets')}
            className="p-3 bg-white border border-gray-200 rounded-2xl text-gray-500 hover:bg-gray-50 hover:text-[#145be9] hover:border-[#145be9]/20 transition-all shadow-sm group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl lg:text-3xl font-black text-[#1a2b4b] tracking-tight">
                {ticket.ticketId}
              </h1>
              <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-[0.15em] uppercase border border-current/10 shadow-sm ${getStatusColor(ticket.status)}`}>
                {ticket.status}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
              <Clock className="w-4 h-4" />
              <span>Raised {new Date(ticket.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-[1.5rem] border border-gray-100 shadow-sm">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-3">Update Status</span>
          <StatusDropdown 
            currentStatus={ticket.status}
            onStatusChange={(status) => updateStatus({ id: ticket._id, status })}
            getStatusColor={getStatusColor}
          />
        </div>
      </div>

      {/* Main Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        
        {/* Left Column: Communication Hub (8 Columns) */}
        <div className="lg:col-span-8 flex flex-col h-full">
          <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col h-[700px]">
             {/* Chat Header */}
             <div className="p-6 lg:p-8 border-b border-gray-50 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-blue-50 rounded-[1.25rem] flex items-center justify-center text-[#145be9] shadow-inner">
                   <MessageSquare className="w-6 h-6" />
                 </div>
                 <div>
                   <h3 className="text-lg font-bold text-[#1a2b4b]">Conversation History</h3>
                   <div className="flex items-center gap-2 mt-0.5">
                     <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                     <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Connected with {ticket.createdBy?.ownerName?.split(' ')[0]}</span>
                   </div>
                 </div>
               </div>
               <div className="flex items-center gap-2">
                 <button className="p-3 hover:bg-gray-50 rounded-xl transition-colors text-gray-400">
                   <MoreVertical className="w-5 h-5" />
                 </button>
               </div>
             </div>
             
             {/* Chat Messages & Input */}
             <TicketChat messages={messages} currentRole="admin" />
             <ChatInput onSendMessage={handleSendMessage} />
          </div>
        </div>

        {/* Right Column: Ticket Intelligence & Context (4 Columns) */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Ticket Information Card */}
          <div className="bg-white rounded-[2.5rem] p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-[#1a2b4b] flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                  <FileText className="w-4 h-4" />
                </div>
                Ticket Intelligence
              </h3>
            </div>

            <div className="space-y-8">
              <div>
                <h4 className="text-xl font-bold text-[#1a2b4b] leading-tight mb-3">{ticket.subject}</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-lg text-[9px] font-black text-gray-400 uppercase tracking-[0.1em]">
                    {ticket.category}
                  </span>
                  <span className={`px-3 py-1 border rounded-lg text-[9px] font-black uppercase tracking-[0.1em] ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority} Priority
                  </span>
                </div>
              </div>

              <div className="bg-[#fcfdfe] rounded-2xl p-5 border border-gray-50">
                <p className="text-sm font-medium text-gray-500 leading-relaxed italic">
                  "{ticket.description}"
                </p>
              </div>

              {/* Attachments Section */}
              {ticket.attachments && ticket.attachments.length > 0 && (
                <div className="pt-6 border-t border-gray-50">
                  <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">Supporting Documents</h4>
                  <div className="space-y-2">
                    {ticket.attachments.map((file, idx) => (
                      <a 
                        key={idx} 
                        href={getFileUrl(file)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        download
                        className="flex items-center justify-between p-3.5 bg-white border border-gray-100 rounded-2xl hover:border-[#145be9]/30 hover:bg-blue-50/30 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center border border-gray-100 text-gray-400 group-hover:text-[#145be9] group-hover:border-[#145be9]/20 transition-all">
                            <FileText className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-[#1a2b4b]">Document {idx + 1}</span>
                        </div>
                        <Download className="w-4 h-4 text-gray-300 group-hover:text-[#145be9] transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Company Intelligence Card */}
          <div className="bg-[#1a2b4b] rounded-[2.5rem] p-6 lg:p-8 shadow-xl text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
              <Building2 className="w-32 h-32 rotate-12" />
            </div>
            
            <h3 className="text-lg font-bold mb-8 flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg text-white/80">
                <Building2 className="w-4 h-4" />
              </div>
              Requester Profile
            </h3>
            
            <div className="space-y-6 relative z-10">
              <div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5">Origin Organization</p>
                <p className="text-lg font-bold text-white tracking-tight">{ticket.createdBy?.companyName || "N/A"}</p>
              </div>

              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center text-white/80 border border-white/10">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Account Owner</p>
                  <p className="text-[15px] font-bold text-white leading-tight">{ticket.createdBy?.ownerName || "Unknown"}</p>
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-3 text-white/60 hover:text-white transition-colors cursor-pointer group/item">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover/item:bg-white/10 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">{ticket.createdBy?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-white/60 hover:text-white transition-colors cursor-pointer group/item">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover/item:bg-white/10 transition-colors">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">{ticket.createdBy?.phone || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {otpTicket && (
        <SystemRequestOtpLogin
          ticket={otpTicket}
          defaultMinimized
          onClose={() => setOtpTicket(null)}
        />
      )}
    </div>
  );
};

export default AdminTicketDetails;
