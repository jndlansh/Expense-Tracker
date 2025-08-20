import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@services/api.service';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const ExpenseContext = createContext();

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within ExpenseProvider');
  }
  return context;
};

export const ExpenseProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  // State
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [stats, setStats] = useState({
    totalSpent: 0,
    categoryBreakdown: [],
  });

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      console.log('Fetching categories...');
      const response = await api.get('/categories');
      console.log('Categories response:', response.data);
      
      if (response.data.success && response.data.categories) {
        setCategories(response.data.categories);
        console.log('Categories set:', response.data.categories);
      } else {
        console.log('No categories in response or unsuccessful');
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      console.error('Error details:', error.response?.data);
      toast.error('Failed to load categories');
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Fetch expenses
  const fetchExpenses = async (filters = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`/expenses?${params}`);
      
      if (response.data.success && response.data.expenses) {
        setExpenses(response.data.expenses);
      } else {
        setExpenses([]);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error('Failed to load expenses');
      return { expenses: [] };
    } finally {
      setLoading(false);
    }
  };

  // Create expense
  const createExpense = async (expenseData) => {
    try {
      console.log('Creating expense with data:', expenseData);
      const response = await api.post('/expenses', expenseData);
      console.log('Create expense response:', response.data);
      
      if (response.data.success && response.data.expense) {
        const newExpense = response.data.expense;
        setExpenses(prev => [newExpense, ...prev]);
        toast.success('Expense added successfully');
        
        // Refresh stats
        fetchStats();
        
        return { success: true, expense: newExpense };
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error creating expense:', error);
      const message = error.response?.data?.message || 'Failed to add expense';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Update expense
  const updateExpense = async (id, expenseData) => {
    try {
      const response = await api.put(`/expenses/${id}`, expenseData);
      
      if (response.data.success && response.data.expense) {
        const updatedExpense = response.data.expense;
        setExpenses(prev => 
          prev.map(expense => 
            expense._id === id ? updatedExpense : expense
          )
        );
        toast.success('Expense updated successfully');
        fetchStats();
        return { success: true, expense: updatedExpense };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update expense';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Delete expense
  const deleteExpense = async (id) => {
    try {
      const response = await api.delete(`/expenses/${id}`);
      
      if (response.data.success) {
        setExpenses(prev => prev.filter(expense => expense._id !== id));
        toast.success('Expense deleted successfully');
        fetchStats();
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete expense';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Fetch expense statistics
  const fetchStats = async () => {
    try {
      const response = await api.get('/expenses/stats');
      if (response.data.success && response.data.stats) {
        setStats(response.data.stats);
      } else {
        setStats({ totalSpent: 0, categoryBreakdown: [] });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({ totalSpent: 0, categoryBreakdown: [] });
    }
  };

  // Create category
  const createCategory = async (categoryData) => {
    try {
      console.log('Creating category with data:', categoryData);
      const response = await api.post('/categories', categoryData);
      console.log('Create category response:', response.data);
      
      if (response.data.success && response.data.category) {
        const newCategory = response.data.category;
        setCategories(prev => [...prev, newCategory]);
        toast.success('Category created successfully');
        return { success: true, category: newCategory };
      } else {
        throw new Error(response.data.message || 'Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      const message = error.response?.data?.message || 'Failed to create category';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Load initial data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User authenticated, loading data...');
      fetchCategories();
      fetchExpenses();
      fetchStats();
    } else {
      console.log('User not authenticated, clearing data');
      setCategories([]);
      setExpenses([]);
      setStats({ totalSpent: 0, categoryBreakdown: [] });
    }
  }, [isAuthenticated]);

  const value = {
    expenses,
    categories,
    loading,
    categoriesLoading,
    stats,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    fetchStats,
    createCategory,
    fetchCategories,
  };

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
};

