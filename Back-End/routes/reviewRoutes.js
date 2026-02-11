import express from "express";
import {
  addOrUpdateReview,
  getCourseReviews,
  getMyReview,
  deleteReview,
  canReview,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";
import { reviewValidation, validate } from "../middleware/validation.js";

const router = express.Router();

// Protected routes (must come BEFORE /:courseId)
router.post("/", protect, reviewValidation, validate, addOrUpdateReview);
router.get("/my-review/:courseId", protect, getMyReview);
router.get("/can-review/:courseId", protect, canReview);
router.delete("/:reviewId", protect, deleteReview);

// Public routes (dynamic param must come last)
router.get("/:courseId", getCourseReviews);

export default router;
