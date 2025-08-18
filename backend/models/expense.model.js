import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0'],
    set: v => Math.round(v * 100) / 100 // Round to 2 decimal places
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Each tag cannot exceed 30 characters']
  }],
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'other'],
    default: 'cash'
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  receipt: {
    url: {
      type: String,
      default: null
    },
    filename: {
      type: String,
      default: null
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, category: 1 });
expenseSchema.index({ userId: 1, tags: 1 });
expenseSchema.index({ userId: 1, createdAt: -1 });

// Virtual for formatted amount with currency
expenseSchema.virtual('formattedAmount').get(function() {
  return `$${this.amount.toFixed(2)}`;
});

// Virtual for month/year grouping
expenseSchema.virtual('monthYear').get(function() {
  const date = new Date(this.date);
  return {
    month: date.getMonth() + 1,
    year: date.getFullYear(),
    monthName: date.toLocaleString('default', { month: 'long' })
  };
});

// Static method for expense statistics
expenseSchema.statics.getExpenseStats = async function(userId, startDate, endDate) {
  return await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$category',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
        avgAmount: { $avg: '$amount' }
      }
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'categoryInfo'
      }
    },
    {
      $unwind: '$categoryInfo'
    },
    {
      $project: {
        _id: 1,
        totalAmount: 1,
        count: 1,
        avgAmount: 1,
        categoryName: '$categoryInfo.name',
        categoryColor: '$categoryInfo.color',
        categoryIcon: '$categoryInfo.icon'
      }
    },
    {
      $sort: { totalAmount: -1 }
    }
  ]);
};

export default mongoose.model('Expense', expenseSchema);
