import express from 'express'
import {body } from 'express-validator';
import authController from '../controllers/auth.controller.js';
import {auth} from "../middleware/auth.middleware.js"

const router = express.Router();

//validation rules
const registerValidation = [
  body('name')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .trim(),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

//Public routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);

//Protected routes (require authentication)
router.get('./profile', auth, authController.getProfile);
router.put('./profile', auth, authController.updateProfile);

export default router;