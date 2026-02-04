import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import asyncHandler from "express-async-handler";
import { protect } from "../middleware/authMiddleware.js";
import fs from "fs";

const router = express.Router();

// Get current directory (for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure Multer for local storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `image-${uniqueSuffix}${ext}`);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("يُسمح فقط بالصور (jpg, jpeg, png, webp, gif)"));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: fileFilter,
});

/**
 * @desc    رفع صورة واحدة
 * @route   POST /api/upload/image
 * @access  Private
 */
router.post(
  "/image",
  protect,
  upload.single("image"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400);
      throw new Error("برجاء اختيار صورة");
    }

    // Return URL that frontend can use
    const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;

    res.json({
      success: true,
      message: "تم رفع الصورة بنجاح",
      data: {
        url: imageUrl,
        publicId: req.file.filename,
      },
    });
  }),
);

/**
 * @desc    رفع عدة صور
 * @route   POST /api/upload/images
 * @access  Private
 */
router.post(
  "/images",
  protect,
  upload.array("images", 10),
  asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
      res.status(400);
      throw new Error("برجاء اختيار صور");
    }

    const images = req.files.map((file) => ({
      url: `http://localhost:5000/uploads/${file.filename}`,
      publicId: file.filename,
    }));

    res.json({
      success: true,
      message: "تم رفع الصور بنجاح",
      data: images,
    });
  }),
);

/**
 * @desc    حذف صورة
 * @route   DELETE /api/upload/:filename
 * @access  Private
 */
router.delete(
  "/:filename",
  protect,
  asyncHandler(async (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);

    // Check if file exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({
        success: true,
        message: "تم حذف الصورة بنجاح",
      });
    } else {
      res.status(404);
      throw new Error("الصورة غير موجودة");
    }
  }),
);

export default router;
