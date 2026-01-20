import { useEffect, useState } from 'react';
import { getSocket, initializeSocket, disconnectSocket } from '../Utilities/socketClient';
import useAuth from "./useAuth";

export const useSocket = () => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        if (!user?.email) return;

        try {
            const token = localStorage.getItem('authToken');
            const socketInstance = initializeSocket(token, user.email);

            socketInstance.on('connect', () => {
                setIsConnected(true);
                console.log('Socket connected');
            });

            socketInstance.on('disconnect', () => {
                setIsConnected(false);
                console.log('Socket disconnected');
            });

            socketInstance.on('users:online', (users) => {
                setOnlineUsers(users);
            });

            setSocket(socketInstance);

            return () => {
                // Don't disconnect on unmount to keep connection alive
                socketInstance.off('connect');
                socketInstance.off('disconnect');
                socketInstance.off('users:online');
            };
        } catch (error) {
            console.error('Socket initialization error:', error);
        }
    }, [user?.email]);

    return {
        socket,
        isConnected,
        onlineUsers
    };
};
