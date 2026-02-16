import express from 'express';
import { getUserById } from '../controllers/authController.js';

const router = express.Router();

// Public route - Get user by ID (for instructor profiles)
router.get('/:id', getUserById);

export default router;
