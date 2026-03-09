import express from "express";
import {
  createOrder,
  getMyOrders,
  getPendingOrders,
  getAllOrders,
  approveOrder,
  rejectOrder,
  deleteOrder,
  getInstructorRevenue,
} from "../controllers/orderController.js";
import {
  sandboxPayment,
  checkEnrollment,
} from "../controllers/sandboxController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { instructorOrAdmin } from "../middleware/instructorAuth.js";
import {
  createOrderValidation,
  validate,
  validateIdParam,
  validateMongoId,
} from "../middleware/validation.js";

const router = express.Router();

// 🎮 Sandbox/Simulation routes (للتجربة فقط)
router.post("/sandbox/pay", protect, sandboxPayment);
router.get(
  "/enrollment/:courseId",
  protect,
  validateMongoId("courseId"),
  validate,
  checkEnrollment,
);

// Student routes
router.post("/", protect, createOrderValidation, validate, createOrder);
router.get("/my-orders", protect, getMyOrders);

// Instructor routes
router.get(
  "/instructor/revenue",
  protect,
  instructorOrAdmin,
  getInstructorRevenue,
);

// Admin routes
router.get("/", protect, admin, getAllOrders);
router.get("/pending", protect, admin, getPendingOrders);
router.patch(
  "/:id/approve",
  protect,
  admin,
  validateIdParam,
  validate,
  approveOrder,
);
router.patch(
  "/:id/reject",
  protect,
  admin,
  validateIdParam,
  validate,
  rejectOrder,
);
router.delete("/:id", protect, admin, validateIdParam, validate, deleteOrder);

export default router;
