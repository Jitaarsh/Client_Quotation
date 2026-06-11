import React, { useEffect, useRef } from 'react';
import { User, Clock, Check, CheckCheck } from 'lucide-react';

const TicketChat = ({ messages, currentUserId }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 scroll-smooth min-h-[400px] max-h-[800px] bg-[#fcfdfe]"
    >
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center p-8">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-10 h-10 text-blue-200" />
          </div>
          <h4 className="text-lg font-bold text-[#1a2b4b] mb-2">No messages yet</h4>
          <p className="text-sm text-gray-400 max-w-[250px]">Start the conversation to help resolve this ticket.</p>
        </div>
      ) : (
        messages.map((msg, idx) => {
          const isAdmin = msg.role === 'admin';
          return (
            <div 
              key={msg.id || idx}
              className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div className={`flex flex-col max-w-[85%] lg:max-w-[70%] ${isAdmin ? 'items-end' : 'items-start'}`}>
                {/* Meta Info */}
                <div className="flex items-center gap-2 mb-1.5 px-1">
                  {!isAdmin && <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{msg.senderName}</span>}
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {isAdmin && <span className="text-[10px] font-black text-[#145be9] uppercase tracking-widest">Admin</span>}
                </div>

                {/* Bubble */}
                <div 
                  className={`relative p-4 rounded-[1.5rem] text-sm font-medium leading-relaxed shadow-sm
                    ${isAdmin 
                      ? 'bg-[#145be9] text-white rounded-tr-none' 
                      : 'bg-white border border-gray-100 text-[#1a2b4b] rounded-tl-none'
                    }`}
                >
                  {msg.text}
                  
                  {isAdmin && (
                    <div className="absolute -bottom-5 right-1 flex items-center gap-1">
                      <CheckCheck className="w-3 h-3 text-blue-400" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default TicketChat;
