import dotenv from "dotenv";

// Load environment variables FIRST (before any other imports)
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import cron from "node-cron";
import cookieParser from "cookie-parser";
import connectDB from "./config/database.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import logger from "./config/logger.js";
import httpLogger from "./middleware/httpLogger.js";
import { validateEnv } from "./utils/validateEnv.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import Notification from "./models/Notification.js";

// Validate required env vars before anything else
validateEnv();

// Import Routes
import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import instructorApplicationRoutes from "./routes/instructorApplicationRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";

// Initialize Express
const app = express();

// 5.8 — CORS: build allowed origins dynamically from env
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.CLIENT_URL,
  process.env.CLIENT_URL_PROD,
].filter(Boolean).map(url => url.replace(/\/+$/, ''));  // strip trailing slashes

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    // Normalize origin (lowercase, no trailing slash)
    const normalizedOrigin = origin.toLowerCase().replace(/\/+$/, '');
    const isAllowed = allowedOrigins.some(
      (allowed) => allowed.toLowerCase() === normalizedOrigin
    );
    if (isAllowed) return callback(null, true);
    logger.warn(`CORS blocked origin: ${origin} | Allowed: ${allowedOrigins.join(', ')}`);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-Fingerprint'],
};

// Security & Middleware
app.use(helmet({
  contentSecurityPolicy: false,              // API doesn't serve HTML — CSP not needed
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: 'unsafe-none' },
  crossOriginEmbedderPolicy: false,
}));

// Handle preflight OPTIONS requests explicitly
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());

// HTTP Request Logging
app.use(httpLogger);

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Local uploads are only served in development (production uses Cloudinary)
if (process.env.NODE_ENV !== 'production') {
  app.use("/uploads", express.static("uploads"));
}

// 5.5 — Global Rate Limiting on all /api routes
app.use('/api', apiLimiter);

// 5.3 — Health Check endpoint
app.get('/api/health', async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  const isHealthy = dbState === 1;

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV,
    database: {
      status: dbStatus[dbState] || 'unknown',
      host: mongoose.connection.host || null,
    },
  });
});

// Welcome Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "مرحباً في API منصة التعليم 🚀",
    data: {
      version: "1.0.0",
      endpoints: {
        auth: "/api/auth",
        courses: "/api/courses",
        videos: "/api/videos",
        orders: "/api/orders",
        admin: "/api/admin",
        comments: "/api/comments",
        progress: "/api/progress",
        certificates: "/api/certificates",
        reviews: "/api/reviews",
        instructorApplications: "/api/instructor-applications",
        notifications: "/api/notifications",
        users: "/api/users",
        wishlist: "/api/wishlist",
        coupons: "/api/coupons",
        sessions: "/api/sessions",
      },
    },
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/instructor-applications", instructorApplicationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/sessions", sessionRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

// ── Start Server (await DB connection first) ─────────────────────
if (process.env.NODE_ENV !== 'test') {
  (async () => {
    // Task 4.10: Await DB connection before accepting requests
    await connectDB();

    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      logger.info(`✅ Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    });

    // 5.6 — Cron Job: delete read notifications older than 30 days (runs daily at 2am)
    cron.schedule('0 2 * * *', async () => {
      try {
        const result = await Notification.deleteOldNotifications();
        logger.info(`🗑️  Cron: deleted ${result.deletedCount} old notifications`);
      } catch (err) {
        logger.error('Cron job error (deleteOldNotifications):', err);
      }
    });

    // ── Graceful Shutdown ──────────────────────────────────────────
    const shutdown = async (signal) => {
      logger.info(`\n🛑 ${signal} received — shutting down gracefully…`);

      // 1. Stop accepting new connections
      server.close(() => {
        logger.info('🔒 HTTP server closed');
      });

      // 2. Close MongoDB connection
      try {
        await mongoose.connection.close();
        logger.info('🗄️  MongoDB connection closed');
      } catch (err) {
        logger.error('Error closing MongoDB connection:', err);
      }

      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  })();
}

// Export app for testing
export default app;

