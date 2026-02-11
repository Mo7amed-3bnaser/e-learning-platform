import dotenv from "dotenv";

// Load environment variables FIRST (before any other imports)
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import connectDB from "./config/database.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

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

// Error Handling
app.use(notFound);
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `✅ Server running on port ${PORT} in ${process.env.NODE_ENV} mode`,
  );
});
