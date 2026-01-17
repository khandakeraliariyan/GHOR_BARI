import io from 'socket.io-client';

let socket = null;

export const initializeSocket = (token, userEmail) => {
    if (socket) return socket;

    socket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:5000', {
        auth: {
            token,
            userEmail
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
    });

    socket.on('connect', () => {
        console.log('✅ Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
    });

    socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
    });

    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
