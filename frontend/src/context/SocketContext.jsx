import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    // Only connect if user is authenticated
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const socketInstance = io('http://127.0.0.1:5001');
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Socket.io connected on frontend');
      // Join user specific room or role specific room
      socketInstance.emit('join', user.id);
      if (user.role === 'vendor' || user.role === 'admin') {
        socketInstance.emit('join', 'vendor-room');
      }
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
