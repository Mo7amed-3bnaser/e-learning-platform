import express from 'express';
import {
  getDashboardStats,
  getAllStudents,
  toggleBlockStudent,
  deleteStudent,
  searchStudents,
  getInstructors,
  demoteInstructor,
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// كل الـ routes دي محتاجة Admin
router.use(protect, admin);

router.get('/stats', getDashboardStats);
router.get('/students', getAllStudents);
router.get('/students/search', searchStudents);
router.patch('/students/:id/block', toggleBlockStudent);
router.delete('/students/:id', deleteStudent);

// Instructor management
router.get('/instructors', getInstructors);
router.patch('/instructors/:id/demote', demoteInstructor);

export default router;
