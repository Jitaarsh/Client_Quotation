import React, { useState } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';

const ChatInput = ({ onSendMessage }) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim()) {
      onSendMessage(text);
      setText('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 lg:p-6 bg-white border-t border-gray-100">
      <div className="relative flex items-end gap-3 bg-[#f8fafc] border border-gray-200 rounded-[1.5rem] p-2 focus-within:border-[#145be9] focus-within:ring-4 focus-within:ring-blue-50 transition-all">
        <button className="p-2.5 text-gray-400 hover:text-[#145be9] transition-colors rounded-xl hover:bg-white">
          <Paperclip className="w-5 h-5" />
        </button>
        
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your message..."
          className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-sm font-medium text-[#1a2b4b] py-2.5 resize-none max-h-32 min-h-[44px]"
          rows={1}
          style={{ height: 'auto', border: 'none', outline: 'none' }}
          onInput={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }}
        />

        <div className="flex items-center gap-1 pr-1 pb-1">
          <button className="p-2.5 text-gray-400 hover:text-amber-500 transition-colors rounded-xl hover:bg-white hidden sm:flex">
            <Smile className="w-5 h-5" />
          </button>
          <button 
            onClick={handleSend}
            disabled={!text.trim()}
            className={`p-3 rounded-xl transition-all shadow-lg ${
              text.trim() 
                ? 'bg-[#145be9] text-white shadow-blue-500/20 hover:bg-blue-600 scale-100' 
                : 'bg-gray-100 text-gray-300 scale-95 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
      <p className="mt-3 text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest">
        Press Enter to send • Shift + Enter for new line
      </p>
    </div>
  );
};

export default ChatInput;
