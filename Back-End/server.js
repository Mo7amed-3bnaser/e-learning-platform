import dotenv from "dotenv";

// Load environment variables FIRST (before any other imports)
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import connectDB from "./config/database.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import logger from "./config/logger.js";
import httpLogger from "./middleware/httpLogger.js";

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

// Connect to MongoDB
connectDB();

// Initialize Express
const app = express();

// Security & Middleware
app.use(helmet());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      process.env.CLIENT_URL,
    ].filter(Boolean),
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP Request Logging
app.use(httpLogger);

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

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

// Error Handling
app.use(notFound);
app.use(errorHandler);

// Start Server (only if not in test mode)
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    logger.info(`✅ Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  });
}

// Export app for testing
export default app;
