import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import prisma from './config/database';
import { createSocketServer } from './config/socket';
import { generateSwaggerDocs } from './config/swaggerWatcher';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import commentRoutes from './routes/comment';
import likeRoutes from './routes/like';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server for Socket.IO
const server = createServer(app);

// Create and configure Socket.IO server
export const io = createSocketServer(server);

// Initialize WebSocket service
import { initializeWebSocketService } from './services/websocketService';
initializeWebSocketService(io);

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Generate Swagger documentation automatically
const swaggerOutputPath = path.join(__dirname, 'swagger-output.json');

// Check if auto-generated swagger file exists, if not generate it
if (!fs.existsSync(swaggerOutputPath)) {
    console.log('📄 Generating initial Swagger documentation...');
    generateSwaggerDocs();
}

// Load auto-generated Swagger specification
let swaggerSpec;
try {
    if (fs.existsSync(swaggerOutputPath)) {
        const swaggerContent = fs.readFileSync(swaggerOutputPath, 'utf-8');
        swaggerSpec = JSON.parse(swaggerContent);
        console.log('✅ Swagger documentation loaded successfully');
    }
} catch (error) {
    console.error('❌ Error loading Swagger documentation:', error);
}

// Swagger API Documentation
if (swaggerSpec) {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Comment System API Documentation'
    }));

    // API JSON specification
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Comment System API is running!' });
});

// Health check endpoint to verify database connection
app.get('/health', async (req, res) => {
    try {
        await prisma.$connect();
        res.status(200).json({
            status: 'healthy',
            message: 'Database connection successful'
        });
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({
            status: 'unhealthy',
            message: 'Database connection failed'
        });
    }
});

// Graceful shutdown
process.on('beforeExit', async () => {
    console.log('Closing Prisma connection');
    await prisma.$disconnect();
});

process.on('SIGINT', async () => {
    console.log('Received SIGINT, closing Prisma connection');
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, closing Prisma connection');
    await prisma.$disconnect();
    process.exit(0);
});

const startServer = async () => {
    try {
        // Connect to the database
        await prisma.$connect();
        console.log('Successfully connected to the database');

        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`WebSocket server is ready for connections`);
        });
    } catch (error) {
        console.error('Failed to connect to the database:', error);
        process.exit(1);
    }
};

startServer();

export default app;