/**
 * LiveMail Classifier - Main Server
 * Real-time email categorization with Gmail API and NLP
 */

require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');
const { initializeClassifier, loadClassifier, isTrained } = require('./services/classifier');
const { pollAndProcessEmails } = require('./services/gmailService');
const emailRoutes = require('./routes/emailRoutes');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Socket.io setup with CORS
const io = new Server(server, {
    cors: {
        origin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
    },
    transports: ['websocket', 'polling']
});

// Store io in app for access in routes
app.set('io', io);

// Configuration
const PORT = process.env.PORT || 5000;
const POLL_INTERVAL = parseInt(process.env.GMAIL_POLL_INTERVAL) || 60000; // 60 seconds default

// Middleware
app.use(cors({
    origin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Apply rate limiting to all API routes
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
});

app.use('/api', apiLimiter);

// Routes
app.use('/api/emails', emailRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'LiveMail Classifier',
        version: '1.0.0'
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'LiveMail Classifier API',
        endpoints: {
            health: '/api/health',
            emails: '/api/emails',
            stats: '/api/emails/stats',
            test: '/api/emails/test-broadcast'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });

    socket.on('error', (error) => {
        console.error(`Socket error for ${socket.id}:`, error);
    });
});

// Broadcast new email to all connected clients
const broadcastNewEmail = (email) => {
    io.emit('new-email', {
        id: email._id,
        gmailId: email.gmailId,
        from: email.from,
        subject: email.subject,
        content: email.content,
        snippet: email.snippet,
        category: email.category,
        confidence: email.confidence,
        timestamp: email.receivedAt
    });
    console.log(`Broadcasted email to ${io.engine.clientsCount} clients: ${email.subject}`);
};

// Email polling system
let pollingInterval = null;

const startPolling = () => {
    console.log(`Starting email polling (interval: ${POLL_INTERVAL}ms)`);

    // Initial poll
    performPoll();

    // Set up recurring poll
    pollingInterval = setInterval(performPoll, POLL_INTERVAL);
};

const performPoll = async () => {
    try {
        console.log('Running email poll...');
        const newEmails = await pollAndProcessEmails();

        if (newEmails.length > 0) {
            console.log(`Found ${newEmails.length} new emails`);

            // Broadcast each new email to connected clients
            for (const email of newEmails) {
                broadcastNewEmail(email);
            }
        } else {
            console.log('No new emails found');
        }
    } catch (error) {
        console.error('Error during polling:', error);
    }
};

const stopPolling = () => {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
        console.log('Email polling stopped');
    }
};

// Initialize application
const initializeApp = async () => {
    try {
        // Connect to MongoDB
        await connectDB();
        console.log('Database connected');

        // Initialize classifier
        const loaded = await loadClassifier();
        if (!loaded) {
            console.log('No saved classifier found. Run "npm run seed" to train the classifier.');
            initializeClassifier();
        }

        if (!isTrained()) {
            console.warn('WARNING: Classifier is not trained. Email categorization may be inaccurate.');
            console.warn('Run "npm run seed" to train the classifier with sample data.');
        }

        // Start HTTP server
        server.listen(PORT, () => {
            console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   📧 LiveMail Classifier Server                          ║
║                                                           ║
║   Server running on: http://localhost:${PORT}              ║
║   Socket.io: http://localhost:${PORT}                      ║
║   Environment: ${process.env.NODE_ENV || 'development'}                             ║
║                                                           ║
║   Endpoints:                                              ║
║   - GET /api/health                                       ║
║   - GET /api/emails                                       ║
║   - GET /api/emails/stats                                 ║
║                                                           ║
║   Polling interval: ${POLL_INTERVAL / 1000} seconds                            ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
            `);

            // Start email polling
            startPolling();
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            console.log('SIGTERM received. Shutting down gracefully...');
            stopPolling();
            server.close(() => {
                console.log('Server closed');
                process.exit(0);
            });
        });

        process.on('SIGINT', () => {
            console.log('SIGINT received. Shutting down gracefully...');
            stopPolling();
            server.close(() => {
                console.log('Server closed');
                process.exit(0);
            });
        });

    } catch (error) {
        console.error('Failed to initialize application:', error);
        process.exit(1);
    }
};

// Start the application
initializeApp();

// Export for testing
module.exports = { app, server, io };