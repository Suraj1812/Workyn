import { io } from 'socket.io-client';

let socketInstance;

export const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      autoConnect: false,
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });
  }

  return socketInstance;
};

export const connectSocket = () => {
  const socket = getSocket();
  if (!socket.connected) {
    socket.connect();
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socketInstance?.connected) {
    socketInstance.disconnect();
  }
};
