import Expense from '../models/expense.model.js';
import Category from '../models/category.model.js';
import { validationResult } from 'express-validator';

class ExpenseController {
  // Get expenses with filtering and pagination
  async getExpenses(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        startDate,
        endDate,
        tags,
        search,
        sortBy = 'date',
        sortOrder = 'desc'
      } = req.query;

      // Build filter object
      const filter = { userId: req.user.userId };

      // Category filter
      if (category) {
        filter.category = category;
      }

      // Date range filter
      if (startDate || endDate) {
        filter.date = {};
        if (startDate) filter.date.$gte = new Date(startDate);
        if (endDate) filter.date.$lte = new Date(endDate);
      }

      // Tags filter
      if (tags) {
        const tagArray = Array.isArray(tags) ? tags : tags.split(',');
        filter.tags = { $in: tagArray };
      }

      // Search filter
      if (search) {
        filter.$or = [
          { description: { $regex: search, $options: 'i' } },
          { notes: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } },
          { tags: { $regex: search, $options: 'i' } }
        ];
      }

      // Pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Sort options
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute query
      const expenses = await Expense.find(filter)
        .populate('category', 'name color icon')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit));

      const totalExpenses = await Expense.countDocuments(filter);
      const totalPages = Math.ceil(totalExpenses / parseInt(limit));

      res.json({
        success: true,
        expenses,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalExpenses,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      });
    } catch (error) {
      console.error('Get expenses error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Create new expense
  async createExpense(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const {
        amount,
        description,
        category,
        date,
        tags,
        notes,
        paymentMethod,
        location
      } = req.body;

      // Verify category belongs to user
      const categoryExists = await Category.findOne({
        _id: category,
        userId: req.user.userId,
        isActive: true
      });

      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category'
        });
      }

      const expense = new Expense({
        userId: req.user.userId,
        amount,
        description,
        category,
        date: date || new Date(),
        tags: tags || [],
        notes,
        paymentMethod,
        location
      });

      await expense.save();
      await expense.populate('category', 'name color icon');

      res.status(201).json({
        success: true,
        message: 'Expense created successfully',
        expense
      });
    } catch (error) {
      console.error('Create expense error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Get single expense
  async getExpenseById(req, res) {
    try {
      const expense = await Expense.findOne({
        _id: req.params.id,
        userId: req.user.userId
      }).populate('category', 'name color icon');

      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found'
        });
      }

      res.json({
        success: true,
        expense
      });
    } catch (error) {
      console.error('Get expense error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Update expense
  async updateExpense(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const expense = await Expense.findOne({
        _id: req.params.id,
        userId: req.user.userId
      });

      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found'
        });
      }

      // If category is being updated, verify it belongs to user
      if (req.body.category) {
        const categoryExists = await Category.findOne({
          _id: req.body.category,
          userId: req.user.userId,
          isActive: true
        });

        if (!categoryExists) {
          return res.status(400).json({
            success: false,
            message: 'Invalid category'
          });
        }
      }

      // Update expense
      Object.keys(req.body).forEach(key => {
        if (req.body[key] !== undefined) {
          expense[key] = req.body[key];
        }
      });

      await expense.save();
      await expense.populate('category', 'name color icon');

      res.json({
        success: true,
        message: 'Expense updated successfully',
        expense
      });
    } catch (error) {
      console.error('Update expense error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Delete expense
  async deleteExpense(req, res) {
    try {
      const expense = await Expense.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.userId
      });

      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found'
        });
      }

      res.json({
        success: true,
        message: 'Expense deleted successfully'
      });
    } catch (error) {
      console.error('Delete expense error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Get expense statistics
  async getExpenseStats(req, res) {
    try {
      const {
        startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        endDate = new Date()
      } = req.query;

      const stats = await Expense.getExpenseStats(
        req.user.userId,
        new Date(startDate),
        new Date(endDate)
      );

      // Calculate total spending
      const totalSpent = stats.reduce((sum, stat) => sum + stat.totalAmount, 0);

      res.json({
        success: true,
        stats: {
          totalSpent,
          categoryBreakdown: stats,
          period: {
            startDate,
            endDate
          }
        }
      });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
}

export default new ExpenseController();
