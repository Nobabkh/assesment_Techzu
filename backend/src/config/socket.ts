import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { ExtendedError } from 'socket.io/dist/namespace';

/**
 * Socket.IO event data for typing indicators
 */
interface TypingEventData {
    commentId: string;
}

/**
 * Socket.IO event data for typing indicator broadcast
 */
interface TypingIndicatorData {
    userId: string;
    isTyping: boolean;
}

/**
 * Creates and configures a Socket.IO server
 * @param httpServer - The HTTP server to attach Socket.IO to
 * @returns Configured Socket.IO server instance
 */
export const createSocketServer = (httpServer: HTTPServer): SocketIOServer => {
    console.log('[SocketServer] Creating Socket.IO server...');
    console.log('[SocketServer] FRONTEND_URL:', process.env.FRONTEND_URL || "http://localhost:3000");

    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:3000",
            methods: ["GET", "POST"],
            credentials: true
        },
        transports: ['websocket', 'polling']
    });

    console.log('[SocketServer] Socket.IO server created');

    io.use(async (socket: Socket, next: (err?: ExtendedError) => void) => {
        try {
            console.log('[SocketServer] Authentication middleware - checking token...');
            const token = socket.handshake.auth.token;
            console.log('[SocketServer] Token present:', !!token);

            if (!token) {
                console.error('[SocketServer] Authentication failed: No token provided');
                return next(new Error('Authentication token is required'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
            console.log('[SocketServer] Token verified for user ID:', decoded.id);

            socket.data.userId = decoded.id;

            next();
        } catch (error) {
            console.error('[SocketServer] Socket authentication error:', error);
            next(new Error('Invalid authentication token'));
        }
    });

    io.on('connection', (socket: Socket) => {
        console.log(`[SocketServer] User ${socket.data.userId} connected with socket ID: ${socket.id}`);

        socket.join(`user:${socket.data.userId}`);

        socket.on('join:comment', (commentId: string) => {
            socket.join(`comment:${commentId}`);
            console.log(`[SocketServer] User ${socket.data.userId} joined comment room: comment:${commentId}`);
            console.log(`[SocketServer] Room members for comment:${commentId}:`, io.sockets.adapter.rooms.get(`comment:${commentId}`)?.size || 0);
        });

        socket.on('leave:comment', (commentId: string) => {
            socket.leave(`comment:${commentId}`);
            console.log(`[SocketServer] User ${socket.data.userId} left comment room: comment:${commentId}`);
        });

        socket.on('typing:start', (data: TypingEventData) => {
            socket.to(`comment:${data.commentId}`).emit('typing:indicator', {
                userId: socket.data.userId,
                isTyping: true
            } as TypingIndicatorData);
        });

        socket.on('typing:stop', (data: TypingEventData) => {
            socket.to(`comment:${data.commentId}`).emit('typing:indicator', {
                userId: socket.data.userId,
                isTyping: false
            } as TypingIndicatorData);
        });

        socket.on('disconnect', (reason: string) => {
            console.log(`[SocketServer] User ${socket.data.userId} disconnected. Reason: ${reason}`);
        });

        socket.on('error', (error: Error) => {
            console.error(`[SocketServer] Socket error for user ${socket.data.userId}:`, error);
        });
    });

    return io;
};

/**
 * Emits an event to a specific room
 * @param io - The Socket.IO server instance
 * @param room - The room name to emit to
 * @param event - The event name
 * @param data - The data to emit
 */
export const emitToRoom = (
    io: SocketIOServer,
    room: string,
    event: string,
    data: unknown
): void => {
    const roomMembers = io.sockets.adapter.rooms.get(room);
    console.log(`[SocketServer] emitToRoom - room: ${room}, event: ${event}, members: ${roomMembers?.size || 0}`);
    io.to(room).emit(event, data);
};

/**
 * Emits an event to a specific user's personal room
 * @param io - The Socket.IO server instance
 * @param userId - The user ID to emit to
 * @param event - The event name
 * @param data - The data to emit
 */
export const emitToUser = (
    io: SocketIOServer,
    userId: string,
    event: string,
    data: unknown
): void => {
    io.to(`user:${userId}`).emit(event, data);
};