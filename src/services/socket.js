import { io } from "socket.io-client";
import { API_ROOT } from "../config/api";

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || API_ROOT;

class SocketService {
  socket = null;

  connect() {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      auth: {
        token: token
      },
      transports: ['websocket'], // Prefer websocket for performance
      reconnectionAttempts: 5
    });

    this.socket.on("connect", () => {
      console.log("🔌 Connected to Chat Server");
    });

    this.socket.on("connect_error", (err) => {
      console.error("❌ Socket Connection Error:", err.message);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinTicket(ticketId) {
    if (this.socket) {
      this.socket.emit("join_ticket", ticketId);
    }
  }

  sendMessage(data) {
    if (this.socket) {
      this.socket.emit("send_message", data);
    }
  }

  onReceiveMessage(callback) {
    if (this.socket) {
      this.socket.on("receive_message", callback);
    }
  }

  offReceiveMessage() {
    if (this.socket) {
      this.socket.off("receive_message");
    }
  }
}

export default new SocketService();
