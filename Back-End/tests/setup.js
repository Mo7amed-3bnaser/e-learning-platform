import dotenv from 'dotenv';

// Load test environment
dotenv.config();

// Set defaults for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing';
process.env.CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
