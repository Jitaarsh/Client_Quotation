import React, { useState, useRef } from 'react';
import { Send, Paperclip, Smile, Loader2, X, FileText } from 'lucide-react';
import axiosInstance from '../../../../api/axiosInstance';
import { toast } from 'react-hot-toast';

const ChatInput = ({ onSendMessage }) => {
  const [text, setText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB');
      e.target.value = '';
      return;
    }

    await handleFileUpload(file);
    e.target.value = ''; // Reset input
  };

  const handleFileUpload = async (file) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axiosInstance.post('/chat/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        const fileData = response.data.data;
        // Send a special message with the file info
        // We'll format it so the chat component can recognize it
        const messageText = `[FILE:${fileData.name}](${fileData.url})`;
        onSendMessage(messageText);
        toast.success('File uploaded successfully');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 bg-white border-t border-gray-100">
      <div className="relative flex items-end gap-3 bg-[#f8fafc] border border-gray-200 rounded-[1.5rem] p-2 focus-within:border-[#145be9] focus-within:ring-4 focus-within:ring-blue-50 transition-all">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.txt"
        />
        
        <button 
          onClick={handleFileClick}
          disabled={isUploading}
          className="p-2.5 text-gray-400 hover:text-[#145be9] transition-colors rounded-xl hover:bg-white disabled:opacity-50"
        >
          {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
        </button>
        
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={isUploading ? "Uploading file..." : "Type your message..."}
          disabled={isUploading}
          className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-sm font-medium text-[#1a2b4b] py-2.5 resize-none max-h-32 min-h-[44px] disabled:opacity-50"
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
            disabled={!text.trim() || isUploading}
            className={`p-3 rounded-xl transition-all shadow-lg ${
              text.trim() && !isUploading
                ? 'bg-[#145be9] text-white shadow-blue-500/20 hover:bg-blue-600 scale-100' 
                : 'bg-gray-100 text-gray-300 scale-95 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
      <p className="mt-3 text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest">
        {isUploading ? "Sending file..." : "Press Enter to send • Shift + Enter for new line"}
      </p>
    </div>
  );
};

export default ChatInput;
