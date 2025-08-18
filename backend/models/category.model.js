import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  icon: {
    type: String,
    default: 'fas fa-tag'
  },
  color: {
    type: String,
    default: '#3B82F6',
    match: [/^#([0-9A-F]{3}){1,2}$/i, 'Please provide a valid hex color']
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate categories per user
categorySchema.index({ userId: 1, name: 1 }, { unique: true });
categorySchema.index({ userId: 1, isActive: 1 });

// Static method to create default categories for new users
categorySchema.statics.createDefaultCategories = async function(userId) {
  const defaultCategories = [
    { name: 'Food & Dining', icon: 'fas fa-utensils', color: '#EF4444' },
    { name: 'Transportation', icon: 'fas fa-car', color: '#3B82F6' },
    { name: 'Shopping', icon: 'fas fa-shopping-bag', color: '#8B5CF6' },
    { name: 'Entertainment', icon: 'fas fa-film', color: '#F59E0B' },
    { name: 'Bills & Utilities', icon: 'fas fa-file-invoice-dollar', color: '#10B981' },
    { name: 'Healthcare', icon: 'fas fa-heartbeat', color: '#F97316' },
    { name: 'Travel', icon: 'fas fa-plane', color: '#06B6D4' },
    { name: 'Education', icon: 'fas fa-graduation-cap', color: '#6366F1' },
    { name: 'Personal Care', icon: 'fas fa-spa', color: '#EC4899' },
    { name: 'Other', icon: 'fas fa-ellipsis-h', color: '#6B7280' }
  ];

  const categories = defaultCategories.map(cat => ({
    ...cat,
    userId,
    isDefault: true
  }));

  return await this.insertMany(categories);
};

export default mongoose.model('Category', categorySchema);
