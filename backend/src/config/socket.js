import { Server } from "socket.io";


// Socket.io instance
let io;

// Track connected users: email -> socketId
let connectedUsers = new Map();

const DEFAULT_CLIENT_ORIGINS = ["http://localhost:5173", "http://localhost:5174"];

const normalizeOrigin = (origin) => origin?.trim().replace(/\/+$/, "");

const getAllowedOrigins = () => {
    const configuredOrigins = process.env.CLIENT_URL
        ?.split(",")
        .map(normalizeOrigin)
        .filter(Boolean);

    if (configuredOrigins?.length) {
        return configuredOrigins;
    }

    return DEFAULT_CLIENT_ORIGINS;
};


/**
 * Initialize Socket.io server
 * @param {Object} httpServer - HTTP server instance
 * @returns {Object} Socket.io instance
 */
export const initializeSocket = (httpServer) => {

    const allowedOrigins = getAllowedOrigins();

    // Create Socket.io server with CORS configuration
    io = new Server(httpServer, {
        cors: {
            origin: allowedOrigins,
            credentials: true,
            methods: ["GET", "POST"]
        }
    });


    // Middleware for socket authentication
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        const userEmail = socket.handshake.auth.userEmail;


        // Validate authentication
        if (!token || !userEmail) {
            return next(new Error("Authentication failed"));
        }


        // Attach user info to socket
        socket.userEmail = userEmail;
        socket.token = token;
        next();
    });


    // Connection event handler
    io.on("connection", (socket) => {
        console.log(`✅ User connected: ${socket.userEmail} (${socket.id})`);


        // Store user connection
        connectedUsers.set(socket.userEmail, socket.id);


        // Notify all clients of online users
        io.emit("users:online", Array.from(connectedUsers.keys()));


        // Disconnect event handler
        socket.on("disconnect", () => {
            console.log(`❌ User disconnected: ${socket.userEmail}`);
            connectedUsers.delete(socket.userEmail);
            io.emit("users:online", Array.from(connectedUsers.keys()));
        });
    });

    return io;

};


/**
 * Get Socket.io instance
 * @returns {Object} Socket.io instance
 */
export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized");
    }

    return io;
};

export const getConnectedUsers = () => {
    return connectedUsers;
};

export const isUserOnline = (userEmail) => {
    return connectedUsers.has(userEmail);
};
