import express from 'express';
import { body, param, query } from 'express-validator';
import expenseController from '../controllers/expense.controller.js';
import { auth } from '../middleware/auth.middleware.js';

const router = express.Router();

// Validation rules
const expenseValidation = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Description must be between 1 and 200 characters'),
  body('category')
    .isMongoId()
    .withMessage('Valid category ID is required'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be in valid ISO format'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each tag must be between 1 and 30 characters'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  body('paymentMethod')
    .optional()
    .isIn(['cash', 'credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'other'])
    .withMessage('Invalid payment method'),
  body('location')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters')
];

const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid expense ID')
];

// Apply authentication to all routes
router.use(auth);

// Routes
router.get('/', expenseController.getExpenses);
router.get('/stats', expenseController.getExpenseStats);
router.get('/:id', idValidation, expenseController.getExpenseById);
router.post('/', expenseValidation, expenseController.createExpense);
router.put('/:id', idValidation, expenseValidation, expenseController.updateExpense);
router.delete('/:id', idValidation, expenseController.deleteExpense);

export default router;
