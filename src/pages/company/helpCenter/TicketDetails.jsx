import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  MessageSquare,
  MoreVertical
} from 'lucide-react';
import helpCenterApi from '../../../services/helpCenterApi';
import TicketChat from './components/TicketChat';
import ChatInput from './components/ChatInput';
import { useTicketChat } from '../../../hooks/useTicketChat';
import useAuthStore from '../../../store/authStore';

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Determine currentRole based on logged-in user's role
  const currentRole = ['admin', 'superadmin'].includes(user?.role) ? 'admin' : 'user';
  
  const { data, isLoading, isError } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => helpCenterApi.getTicketById(id),
  });

  const ticket = data?.data;
  
  // Real-time Chat Hook
  const { messages, sendMessage } = useTicketChat(id, ticket?.messages || []);

  const getFileUrl = (path) => {
    if (!path) return '#';
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${baseUrl}${path}`;
  };

  const handleSendMessage = (text) => {
    sendMessage(text);
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

  if (isError || !ticket) {
    return (
      <div className="p-8 text-center bg-[#f8fafc] min-h-screen">
        <div className="max-w-md mx-auto bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <h2 className="text-xl font-black text-[#1a2b4b] mb-2">Ticket not found</h2>
            <p className="text-sm text-gray-500 mb-6 font-medium">The ticket you are looking for might have been removed or you don't have permission to view it.</p>
            <button 
                onClick={() => navigate('/dashboard/help-center')} 
                className="w-full py-3.5 bg-[#145be9] text-white font-bold rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20"
            >
                Back to Help Center
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 bg-[#f8fafc] min-h-full flex flex-col gap-6">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard/help-center')}
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
              <span>Created on {new Date(ticket.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3 bg-white px-5 py-3 rounded-[1.5rem] border border-gray-100 shadow-sm">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Priority Level</span>
            <span className={`text-[12px] font-black uppercase tracking-wider ${getPriorityColor(ticket.priority).split(' ')[1]}`}>
                {ticket.priority}
            </span>
          </div>
          <div className="w-px h-8 bg-gray-100 mx-2"></div>
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Category</span>
            <span className="text-[12px] font-black text-[#1a2b4b] uppercase tracking-wider">
                {ticket.category}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        
        {/* Left Column: Chat Hub (8 Columns) */}
        <div className="lg:col-span-8 flex flex-col h-full">
          <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col h-[700px]">
             {/* Chat Header */}
             <div className="p-6 lg:p-8 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-blue-50 rounded-[1.25rem] flex items-center justify-center text-[#145be9]">
                   <MessageSquare className="w-6 h-6" />
                 </div>
                 <div>
                   <h3 className="text-lg font-bold text-[#1a2b4b]">Chat Support</h3>
                   <div className="flex items-center gap-2 mt-0.5">
                     <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                     <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Support Team Online</span>
                   </div>
                 </div>
               </div>
               <button className="p-3 hover:bg-gray-50 rounded-xl transition-colors text-gray-400">
                 <MoreVertical className="w-5 h-5" />
               </button>
             </div>
             
             <TicketChat messages={messages} currentRole={currentRole} />
             <ChatInput onSendMessage={handleSendMessage} />
          </div>
        </div>

        {/* Right Column: Sidebar (4 Columns) */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Ticket Information */}
          <div className="bg-white rounded-[2.5rem] p-6 lg:p-8 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-[#1a2b4b] mb-6 flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg text-[#145be9]">
                <FileText className="w-4 h-4" />
              </div>
              Issue Description
            </h3>

            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-bold text-[#1a2b4b] leading-tight mb-4">{ticket.subject}</h4>
                <div className="bg-[#fcfdfe] rounded-2xl p-5 border border-gray-50">
                  <p className="text-sm font-medium text-gray-500 leading-relaxed">
                    {ticket.description}
                  </p>
                </div>
              </div>

              {/* Attachments */}
              {ticket.attachments && ticket.attachments.length > 0 && (
                <div className="pt-6 border-t border-gray-50">
                  <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">Attachments ({ticket.attachments.length})</h4>
                  <div className="space-y-2">
                    {ticket.attachments.map((file, idx) => (
                      <a 
                        key={idx} 
                        href={getFileUrl(file)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        download
                        className="flex items-center justify-between p-3.5 bg-[#f8fafc] border border-gray-100 rounded-2xl hover:bg-gray-100 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center border border-gray-100 text-[#145be9]">
                            <FileText className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-[#1a2b4b]">Doc {idx + 1}</span>
                        </div>
                        <Download className="w-4 h-4 text-gray-400 group-hover:text-[#145be9]" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Support Team Card */}
          <div className="bg-[#1a2b4b] rounded-[2.5rem] p-8 shadow-xl text-white relative overflow-hidden">
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
             <div className="relative z-10">
                <h3 className="text-xl font-bold mb-4">Direct Assistance</h3>
                <p className="text-white/60 text-sm mb-6 leading-relaxed">Need urgent help? Our technical specialists are available for direct consultation.</p>
                
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                            <Mail className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Support Email</p>
                            <p className="text-sm font-bold">support@unicrop.com</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                            <Phone className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Contact Number</p>
                            <p className="text-sm font-bold">+91 98765 43210</p>
                        </div>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;
