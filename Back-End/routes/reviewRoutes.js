import express from "express";
import {
  addOrUpdateReview,
  getCourseReviews,
  getMyReview,
  deleteReview,
  canReview,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";
import { reviewValidation, validate, validateMongoId } from "../middleware/validation.js";

const router = express.Router();

// Protected routes (must come BEFORE /:courseId)
router.post("/", protect, reviewValidation, validate, addOrUpdateReview);
router.get("/my-review/:courseId", protect, validateMongoId('courseId'), validate, getMyReview);
router.get("/can-review/:courseId", protect, validateMongoId('courseId'), validate, canReview);
router.delete("/:reviewId", protect, validateMongoId('reviewId'), validate, deleteReview);

// Public routes (dynamic param must come last)
router.get("/:courseId", validateMongoId('courseId'), validate, getCourseReviews);

export default router;
