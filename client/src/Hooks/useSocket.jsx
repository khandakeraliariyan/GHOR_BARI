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

        let socketInstance = null;

        const connect = async () => {
            try {
                const token = await user.getIdToken();
                if (!token) return;
                disconnectSocket();
                socketInstance = initializeSocket(token, user.email);

                socketInstance.on('connect', () => {
                    setIsConnected(true);
                });
                socketInstance.on('disconnect', () => {
                    setIsConnected(false);
                });
                socketInstance.on('connect_error', () => {
                    setIsConnected(false);
                });
                socketInstance.on('users:online', (users) => {
                    setOnlineUsers(users);
                });

                setSocket(socketInstance);
            } catch (error) {
                console.error('Socket initialization error:', error);
                setIsConnected(false);
            }
        };

        connect();

        return () => {
            if (socketInstance) {
                socketInstance.off('connect');
                socketInstance.off('disconnect');
                socketInstance.off('connect_error');
                socketInstance.off('users:online');
            }
        };
    }, [user?.email, user]);

    return {
        socket,
        isConnected,
        onlineUsers
    };
};
