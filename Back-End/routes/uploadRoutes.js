import express from 'express';
import { upload } from '../config/cloudinary.js';
import asyncHandler from 'express-async-handler';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @desc    رفع صورة واحدة
 * @route   POST /api/upload/image
 * @access  Private
 */
router.post(
  '/image',
  protect,
  upload.single('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400);
      throw new Error('برجاء اختيار صورة');
    }

    res.json({
      success: true,
      message: 'تم رفع الصورة بنجاح',
      data: {
        url: req.file.path,
        publicId: req.file.filename
      }
    });
  })
);

/**
 * @desc    رفع عدة صور
 * @route   POST /api/upload/images
 * @access  Private
 */
router.post(
  '/images',
  protect,
  upload.array('images', 10),
  asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
      res.status(400);
      throw new Error('برجاء اختيار صور');
    }

    const images = req.files.map((file) => ({
      url: file.path,
      publicId: file.filename
    }));

    res.json({
      success: true,
      message: 'تم رفع الصور بنجاح',
      data: images
    });
  })
);

export default router;
