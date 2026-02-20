import express from "express";
import asyncHandler from "express-async-handler";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../config/cloudinary.js";
import cloudinary, { deleteImage } from "../config/cloudinary.js";

const router = express.Router();

/**
 * @desc    رفע صورة واحدة (profile avatars, course thumbnails, instructor avatars)
 * @route   POST /api/upload/image
 * @access  Private
 */
router.post(
  "/image",
  protect,
  (req, res, next) => {
    upload.single("image")(req, res, (err) => {
      if (err) {
        console.error("Multer Error:", err);
        return res.status(500).json({
          success: false,
          message: "خطأ في رفع الصورة",
          error: err.message
        });
      }
      next();
    });
  },
  asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400);
      throw new Error("برجاء اختيار صورة");
    }

    res.json({
      success: true,
      message: "تم رفع الصورة بنجاح",
      data: {
        url: req.file.path, // Cloudinary URL
        publicId: req.file.filename, // Cloudinary public_id
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
      url: file.path, // Cloudinary URL
      publicId: file.filename, // Cloudinary public_id
    }));

    res.json({
      success: true,
      message: "تم رفع الصور بنجاح",
      data: images,
    });
  }),
);

/**
 * @desc    حذف صورة من Cloudinary
 * @route   DELETE /api/upload/:publicId
 * @access  Private
 * @security Only the owner (matching avatar/thumbnail) or admin can delete
 */
router.delete(
  "/:publicId",
  protect,
  asyncHandler(async (req, res) => {
    const publicId = decodeURIComponent(req.params.publicId);
    const userId = req.user._id.toString();
    const userRole = req.user.role;

    // Admin can delete any image
    if (userRole !== 'admin') {
      // Check if the publicId belongs to the requesting user's avatar
      const User = (await import('../models/User.js')).default;
      const Course = (await import('../models/Course.js')).default;

      const userOwnsImage = await User.findOne({
        _id: userId,
        avatar: { $regex: publicId, $options: 'i' },
      });

      const instructorOwnsCourse = await Course.findOne({
        instructor: userId,
        thumbnail: { $regex: publicId, $options: 'i' },
      });

      if (!userOwnsImage && !instructorOwnsCourse) {
        res.status(403);
        throw new Error('غير مصرح لك بحذف هذه الصورة');
      }
    }

    try {
      const result = await deleteImage(publicId);

      if (result.result === 'ok' || result.result === 'not found') {
        res.json({
          success: true,
          message: "تم حذف الصورة بنجاح",
        });
      } else {
        res.status(400);
        throw new Error("فشل حذف الصورة");
      }
    } catch (error) {
      res.status(500);
      throw new Error("خطأ في حذف الصورة من Cloudinary");
    }
  }),
);

export default router;
