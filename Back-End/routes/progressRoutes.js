import express from "express";
import {
  markVideoComplete,
  updateWatchDuration,
  getCourseProgress,
  updateLastWatched,
} from "../controllers/progressController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate, validateMongoId } from "../middleware/validation.js";

const router = express.Router();

// All routes are protected (require authentication)
router.post("/mark-complete", protect, markVideoComplete);
router.post("/update-watch-duration", protect, updateWatchDuration);
router.get("/course/:courseId", protect, validateMongoId('courseId'), validate, getCourseProgress);
router.post("/update-last-watched", protect, updateLastWatched);

export default router;
