import { useState, useEffect, useCallback } from 'react';
import socketService from '../services/socket.js';
import useAuthStore from '../store/authStore';

export const useTicketChat = (ticketId, initialMessages = []) => {
  const [messages, setMessages] = useState(initialMessages);
  const { user } = useAuthStore();

  // Initialize and update messages when initialMessages change
  useEffect(() => {
    if (initialMessages.length > 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  useEffect(() => {
    if (!ticketId) return;

    // Connect and join room
    socketService.connect();
    socketService.joinTicket(ticketId);

    // Listen for new messages
    socketService.onReceiveMessage((newMessage) => {
        // Prevent duplicate messages if already in state
        setMessages((prev) => {
            const exists = prev.some(msg => msg._id === newMessage._id || (msg.timestamp === newMessage.timestamp && msg.text === newMessage.text));
            if (exists) return prev;
            return [...prev, newMessage];
        });
    });

    return () => {
      socketService.offReceiveMessage();
      // We don't necessarily want to disconnect the whole socket on unmount 
      // if the user is navigating within the app, but we stop listening.
    };
  }, [ticketId]);

  const sendMessage = useCallback((text) => {
    if (!text.trim() || !user) return;

    const messageData = {
      ticketId,
      text,
      senderName: user.ownerName || user.companyName || (['admin', 'superadmin'].includes(user.role) ? 'Admin' : 'User'),
      role: ['admin', 'superadmin'].includes(user.role) ? 'admin' : 'user'
    };

    socketService.sendMessage(messageData);
  }, [ticketId, user]);

  return {
    messages,
    sendMessage,
    isConnected: socketService.socket?.connected || false
  };
};
