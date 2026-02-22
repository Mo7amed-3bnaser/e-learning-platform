import express from "express";
import {
  markVideoComplete,
  updateWatchDuration,
  getCourseProgress,
  updateLastWatched,
} from "../controllers/progressController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateActiveSession } from "../middleware/deviceProtection.js";
import { validate, validateMongoId } from "../middleware/validation.js";

const router = express.Router();

// All routes are protected (require authentication)
router.post("/mark-complete", protect, validateActiveSession, markVideoComplete);
router.post("/update-watch-duration", protect, validateActiveSession, updateWatchDuration);
router.get("/course/:courseId", protect, validateActiveSession, validateMongoId('courseId'), validate, getCourseProgress);
router.post("/update-last-watched", protect, validateActiveSession, updateLastWatched);

export default router;
