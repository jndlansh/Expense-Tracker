import React, { useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import {
  Receipt,
  Category,
  TrendingUp,
  AccountBalanceWallet,
} from '@mui/icons-material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { useAuth } from '@contexts/AuthContext';
import { useExpenses } from '@contexts/ExpenseContext';
import { format } from 'date-fns';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const DashboardPage = () => {
  const { user } = useAuth();
  const { expenses, categories, stats, loading, fetchExpenses, fetchStats } = useExpenses();

  useEffect(() => {
    fetchExpenses();
    fetchStats();
  }, []);

  // Calculate quick stats
  const thisMonth = new Date();
  const monthlyExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === thisMonth.getMonth() && 
           expenseDate.getFullYear() === thisMonth.getFullYear();
  });
  
  const monthlyTotal = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const todaysExpenses = expenses.filter(expense => 
    new Date(expense.date).toDateString() === new Date().toDateString()
  );

  // Chart data for category breakdown
  const categoryChartData = {
    labels: stats.categoryBreakdown.map(cat => cat.categoryName),
    datasets: [
      {
        data: stats.categoryBreakdown.map(cat => cat.totalAmount),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF6384',
          '#C9CBCF',
        ],
        hoverBackgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF6384',
          '#C9CBCF',
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `$${context.parsed.toFixed(2)}`;
          },
        },
      },
    },
  };

  const StatCard = ({ title, value, icon, color = 'primary' }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h5" component="h2">
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              bgcolor: `${color}.light`,
              borderRadius: '50%',
              p: 1,
              color: `${color}.main`,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.name}! 👋
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        Here's your expense summary for {format(new Date(), 'MMMM yyyy')}
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="This Month"
            value={`$${monthlyTotal.toFixed(2)}`}
            icon={<TrendingUp />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Expenses"
            value={expenses.length}
            icon={<Receipt />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Categories"
            value={categories.length}
            icon={<Category />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Today's Expenses"
            value={todaysExpenses.length}
            icon={<AccountBalanceWallet />}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Spending by Category
            </Typography>
            {stats.categoryBreakdown.length > 0 ? (
              <Box height={300}>
                <Doughnut data={categoryChartData} options={chartOptions} />
              </Box>
            ) : (
              <Box display="flex" alignItems="center" justifyContent="center" height={300}>
                <Typography color="textSecondary">
                  No expense data available
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Recent Expenses
            </Typography>
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {expenses.slice(0, 5).map((expense) => (
                <Box
                  key={expense._id}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  py={1}
                  borderBottom="1px solid #f0f0f0"
                >
                  <Box>
                    <Typography variant="body1">{expense.description}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {expense.category?.name} • {format(new Date(expense.date), 'MMM dd')}
                    </Typography>
                  </Box>
                  <Typography variant="h6" color="primary">
                    ${expense.amount.toFixed(2)}
                  </Typography>
                </Box>
              ))}
              {expenses.length === 0 && (
                <Box display="flex" alignItems="center" justifyContent="center" height={200}>
                  <Typography color="textSecondary">
                    No expenses yet. Start tracking your spending!
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
