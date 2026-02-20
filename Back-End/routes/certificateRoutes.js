import express from "express";
import {
  downloadCertificate,
  verifyCertificate,
  generateCertificate,
} from "../controllers/certificateController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate, validateMongoId } from "../middleware/validation.js";

const router = express.Router();

// Public - Verify certificate by ID (must come BEFORE /:courseId)
router.get("/verify/:certificateId", verifyCertificate);

// Protected - Generate (or re-fetch) certificate for a completed course
router.post("/generate/:courseId", protect, validateMongoId('courseId'), validate, generateCertificate);

// Protected - Get certificate data for a course
router.get("/:courseId", protect, validateMongoId('courseId'), validate, downloadCertificate);

export default router;
