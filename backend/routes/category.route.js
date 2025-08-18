import express from 'express';
import { body, param } from 'express-validator';
import categoryController from '../controllers/category.controller.js';
import { auth } from '../middleware/auth.middleware.js';

const router = express.Router();

// Validation rules
const categoryValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category name must be between 1 and 50 characters'),
  body('icon')
    .optional()
    .isString()
    .withMessage('Icon must be a string'),
  body('color')
    .optional()
    .matches(/^#([0-9A-F]{3}){1,2}$/i)
    .withMessage('Color must be a valid hex color'),
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Description cannot exceed 200 characters')
];

const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid category ID')
];

// Apply authentication to all routes
router.use(auth);

// Routes
router.get('/', categoryController.getCategories);
router.post('/', categoryValidation, categoryController.createCategory);
router.put('/:id', idValidation, categoryValidation, categoryController.updateCategory);
router.delete('/:id', idValidation, categoryController.deleteCategory);

export default router;
