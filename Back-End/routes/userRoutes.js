import express from 'express';
import { getUserById } from '../controllers/authController.js';
import { validate, validateIdParam } from '../middleware/validation.js';

const router = express.Router();

// Public route - Get user by ID (for instructor profiles)
router.get('/:id', validateIdParam, validate, getUserById);

export default router;
