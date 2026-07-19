import React, { useEffect, useRef } from 'react';
import { Clock, CheckCheck, FileText, Download } from 'lucide-react';

const TicketChat = ({ messages, currentRole }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getFileUrl = (path) => {
    if (!path) return '#';
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${baseUrl}${path}`;
  };

  const renderMessageContent = (text, isOwnMessage) => {
    const fileRegex = /\[FILE:(.+?)\]\((.+?)\)/;
    const match = text.match(fileRegex);

    if (match) {
      const [_, fileName, fileUrl] = match;
      const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);

      if (isImage) {
        return (
          <div className="flex flex-col gap-2">
            <div className="rounded-xl overflow-hidden border border-white/20 shadow-sm max-w-full">
              <img 
                src={getFileUrl(fileUrl)} 
                alt={fileName} 
                className="max-h-60 w-auto object-cover hover:opacity-90 transition-opacity cursor-pointer"
                onClick={() => window.open(getFileUrl(fileUrl), '_blank')}
              />
            </div>
            <a 
              href={getFileUrl(fileUrl)} 
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 text-[10px] font-bold opacity-70 hover:opacity-100 transition-opacity ${isOwnMessage ? 'text-white' : 'text-[#145be9]'}`}
            >
              <Download className="w-3 h-3" />
              {fileName}
            </a>
          </div>
        );
      }

      return (
        <a 
          href={getFileUrl(fileUrl)} 
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-3 p-3 rounded-2xl border transition-all group
            ${isOwnMessage 
              ? 'bg-white/10 border-white/20 hover:bg-white/20 text-white' 
              : 'bg-gray-50 border-gray-100 hover:bg-gray-100 text-[#1a2b4b]'
            }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm
            ${isOwnMessage ? 'bg-white/20 text-white' : 'bg-white text-[#145be9] border border-gray-100'}`}
          >
            <FileText className="w-5 h-5" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className={`text-xs font-bold truncate ${isOwnMessage ? 'text-white' : 'text-[#1a2b4b]'}`}>
              {fileName}
            </p>
            <p className={`text-[10px] font-medium opacity-60 ${isOwnMessage ? 'text-white' : 'text-gray-400'}`}>
              Click to preview
            </p>
          </div>
          <Download className={`w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity ${isOwnMessage ? 'text-white' : 'text-[#145be9]'}`} />
        </a>
      );
    }

    return text;
  };

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 scroll-smooth bg-[#fcfdfe] flex flex-col custom-scrollbar"
    >
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center p-8">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-10 h-10 text-blue-200" />
          </div>
          <h4 className="text-lg font-bold text-[#1a2b4b] mb-2">No messages yet</h4>
          <p className="text-sm text-gray-400 max-w-[250px]">Start the conversation to get help.</p>
        </div>
      ) : (
        messages.map((msg, idx) => {
          const isOwnMessage = msg.role === currentRole;
          return (
            <div 
              key={msg._id || msg.id || idx}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div className={`flex flex-col max-w-[85%] lg:max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                {/* Meta Info */}
                <div className="flex items-center gap-2 mb-1.5 px-1">
                  {!isOwnMessage && <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{msg.senderName}</span>}
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {isOwnMessage && <span className="text-[10px] font-black text-[#145be9] uppercase tracking-widest">You</span>}
                </div>

                {/* Bubble */}
                <div 
                  className={`relative p-4 rounded-[1.5rem] text-sm font-medium leading-relaxed shadow-sm
                    ${isOwnMessage 
                      ? 'bg-[#145be9] text-white rounded-tr-none' 
                      : 'bg-white border border-gray-100 text-[#1a2b4b] rounded-tl-none'
                    }`}
                >
                  {renderMessageContent(msg.text, isOwnMessage)}
                  
                  {isOwnMessage && (
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
