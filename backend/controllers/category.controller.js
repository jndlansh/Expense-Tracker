import Category from '../models/category.model.js';
import { validationResult } from 'express-validator';

class CategoryController {
  // Get all categories for user
  async getCategories(req, res) {
    try {
      const categories = await Category.find({ 
        userId: req.user.userId, 
        isActive: true 
      }).sort({ name: 1 });

      res.json({
        success: true,
        count: categories.length,
        categories
      });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Create new category
  async createCategory(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { name, icon, color, description } = req.body;

      // Check if category already exists for this user
      const existingCategory = await Category.findOne({
        userId: req.user.userId,
        name: { $regex: new RegExp(`^${name}$`, 'i') }, // case insensitive
        isActive: true
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists'
        });
      }

      const category = new Category({
        userId: req.user.userId,
        name,
        icon,
        color,
        description
      });

      await category.save();

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        category
      });
    } catch (error) {
      console.error('Create category error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Update category
  async updateCategory(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { name, icon, color, description } = req.body;

      const category = await Category.findOne({
        _id: req.params.id,
        userId: req.user.userId,
        isActive: true
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      // Check if updating to a name that already exists
      if (name && name !== category.name) {
        const existingCategory = await Category.findOne({
          userId: req.user.userId,
          name: { $regex: new RegExp(`^${name}$`, 'i') },
          _id: { $ne: req.params.id },
          isActive: true
        });

        if (existingCategory) {
          return res.status(400).json({
            success: false,
            message: 'Category with this name already exists'
          });
        }
      }

      // Update fields
      if (name) category.name = name;
      if (icon) category.icon = icon;
      if (color) category.color = color;
      if (description !== undefined) category.description = description;

      await category.save();

      res.json({
        success: true,
        message: 'Category updated successfully',
        category
      });
    } catch (error) {
      console.error('Update category error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Delete category (soft delete)
  async deleteCategory(req, res) {
    try {
      const category = await Category.findOne({
        _id: req.params.id,
        userId: req.user.userId,
        isActive: true
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      // Soft delete
      category.isActive = false;
      await category.save();

      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      console.error('Delete category error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
}

export default new CategoryController();
