/**
 * Modern YouTube Downloader - Backend Server
 * 
 * Production-ready Express.js server with yt-dlp integration
 * for robust YouTube video/audio downloading capabilities.
 * 
 * @author Jayasakthi-07
 * @version 1.0.0
 * @license MIT
 */

// ============================================================================
// DEPENDENCIES
// ============================================================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs').promises;

// Load environment variables
dotenv.config();

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  TEMP_DIR: process.env.TEMP_DIR || path.join(__dirname, '../temp'),
  DOWNLOAD_DIR: process.env.DOWNLOAD_DIR || path.join(__dirname, '../downloads'),
  MAX_CONCURRENT_DOWNLOADS: parseInt(process.env.MAX_CONCURRENT_DOWNLOADS) || 5,
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  RATE_LIMIT: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  }
};

// ============================================================================
// EXPRESS APP INITIALIZATION
// ============================================================================

const app = express();

// ============================================================================
// SECURITY MIDDLEWARE
// ============================================================================

// Helmet: Sets various HTTP headers for security
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS: Enable Cross-Origin Resource Sharing
app.use(cors({
  origin: CONFIG.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiting: Prevent abuse
const limiter = rateLimit({
  windowMs: CONFIG.RATE_LIMIT.windowMs,
  max: CONFIG.RATE_LIMIT.max,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// ============================================================================
// GENERAL MIDDLEWARE
// ============================================================================

// Compression: Gzip response compression
app.use(compression());

// Body Parsing: JSON and URL-encoded data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static Files: Serve downloads directory
app.use('/downloads', express.static(CONFIG.DOWNLOAD_DIR));

// Request Logging Middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// ============================================================================
// ROUTES
// ============================================================================

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: CONFIG.NODE_ENV,
    uptime: process.uptime()
  });
});

// API Routes
const downloaderRoutes = require('./routes/downloader');
app.use('/api', downloaderRoutes);

// Root Endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Modern YouTube Downloader API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      documentation: '/api/docs'
    }
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(CONFIG.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize required directories
 */
async function initializeDirectories() {
  const directories = [CONFIG.TEMP_DIR, CONFIG.DOWNLOAD_DIR];
  
  for (const dir of directories) {
    try {
      await fs.access(dir);
    } catch (error) {
      console.log(`Creating directory: ${dir}`);
      await fs.mkdir(dir, { recursive: true });
    }
  }
}

/**
 * Start the server
 */
async function startServer() {
  try {
    // Initialize directories
    await initializeDirectories();
    
    // Start listening
    app.listen(CONFIG.PORT, () => {
      console.log('\n' + '='.repeat(60));
      console.log('🚀 Modern YouTube Downloader Server');
      console.log('='.repeat(60));
      console.log(`Environment: ${CONFIG.NODE_ENV}`);
      console.log(`Port: ${CONFIG.PORT}`);
      console.log(`Health Check: http://localhost:${CONFIG.PORT}/health`);
      console.log(`API Endpoint: http://localhost:${CONFIG.PORT}/api`);
      console.log('='.repeat(60) + '\n');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

process.on('SIGTERM', () => {
  console.log('\nSIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

// Start the server
startServer();

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = app;
