import express from "express";
import {
  downloadCertificate,
  verifyCertificate,
  generateCertificate,
} from "../controllers/certificateController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public - Verify certificate by ID (must come BEFORE /:courseId)
router.get("/verify/:certificateId", verifyCertificate);

// Protected - Generate (or re-fetch) certificate for a completed course
router.post("/generate/:courseId", protect, generateCertificate);

// Protected - Get certificate data for a course
router.get("/:courseId", protect, downloadCertificate);

export default router;
