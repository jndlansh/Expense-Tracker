import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Fab,
} from "@mui/material";
import { Add, Edit, Delete, FilterList } from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { format } from "date-fns";
import { useExpenses } from "@contexts/ExpenseContext";

const ExpensesPage = () => {
  const {
    expenses,
    categories,
    loading,
    createExpense,
    updateExpense,
    deleteExpense,
    fetchExpenses,
  } = useExpenses();

  const [openDialog, setOpenDialog] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      amount: "",
      description: "",
      category: "",
      date: format(new Date(), "yyyy-MM-dd"),
      notes: "",
      paymentMethod: "cash",
    },
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleOpenDialog = (expense = null) => {
    setEditingExpense(expense);
    if (expense) {
      reset({
        amount: expense.amount,
        description: expense.description,
        category: expense.category._id,
        date: format(new Date(expense.date), "yyyy-MM-dd"),
        notes: expense.notes || "",
        paymentMethod: expense.paymentMethod || "cash",
      });
    } else {
      reset({
        amount: "",
        description: "",
        category: "",
        date: format(new Date(), "yyyy-MM-dd"),
        notes: "",
        paymentMethod: "cash",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingExpense(null);
    reset();
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const expenseData = {
        ...data,
        amount: parseFloat(data.amount),
        date: new Date(data.date).toISOString(),
      };

      if (editingExpense) {
        await updateExpense(editingExpense._id, expenseData);
      } else {
        await createExpense(expenseData);
      }

      handleCloseDialog();
    } catch (error) {
      console.error("Error saving expense:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      await deleteExpense(id);
    }
  };

  const paymentMethods = [
    { value: "cash", label: "Cash" },
    { value: "credit_card", label: "Credit Card" },
    { value: "debit_card", label: "Debit Card" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "digital_wallet", label: "Digital Wallet" },
    { value: "other", label: "Other" },
  ];

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">My Expenses</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Expense
        </Button>
      </Box>

      {expenses.length === 0 ? (
        <Alert severity="info">
          No expenses found. Start by adding your first expense!
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {expenses.map((expense) => (
            <Grid item xs={12} sm={6} md={4} key={expense._id}>
              <Card>
                <CardContent>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="start"
                    mb={1}
                  >
                    <Typography variant="h6" component="div" noWrap>
                      {expense.description}
                    </Typography>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(expense)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteExpense(expense._id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Typography variant="h5" color="primary" gutterBottom>
                    ${expense.amount.toFixed(2)}
                  </Typography>

                  <Chip
                    label={expense.category?.name}
                    size="small"
                    sx={{
                      backgroundColor: expense.category?.color,
                      color: "white",
                      mb: 1,
                    }}
                  />

                  <Typography variant="body2" color="textSecondary">
                    {format(new Date(expense.date), "MMM dd, yyyy")}
                  </Typography>

                  {expense.notes && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {expense.notes}
                    </Typography>
                  )}

                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    {
                      paymentMethods.find(
                        (pm) => pm.value === expense.paymentMethod
                      )?.label
                    }
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add/Edit Expense Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>
            {editingExpense ? "Edit Expense" : "Add New Expense"}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="amount"
                  control={control}
                  rules={{
                    required: "Amount is required",
                    min: {
                      value: 0.01,
                      message: "Amount must be greater than 0",
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Amount"
                      type="number"
                      inputProps={{ step: 0.01 }}
                      fullWidth
                      error={!!errors.amount}
                      helperText={errors.amount?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="date"
                  control={control}
                  rules={{ required: "Date is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Date"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.date}
                      helperText={errors.date?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  rules={{ required: "Description is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Description"
                      fullWidth
                      error={!!errors.description}
                      helperText={errors.description?.message}
                    />
                  )}
                />
              </Grid>
              // ... (keep the existing code, just update the category selection
              part in the dialog)
              <Grid item xs={12} sm={6}>
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: "Category is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Category"
                      select
                      fullWidth
                      error={!!errors.category}
                      helperText={errors.category?.message}
                    >
                      {categories.length === 0 ? (
                        <MenuItem disabled>No categories available</MenuItem>
                      ) : (
                        categories.map((category) => (
                          <MenuItem key={category._id} value={category._id}>
                            <Box display="flex" alignItems="center">
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  backgroundColor: category.color || "#1976d2",
                                  borderRadius: "50%",
                                  mr: 1,
                                }}
                              />
                              {category.name}
                            </Box>
                          </MenuItem>
                        ))
                      )}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="paymentMethod"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Payment Method"
                      select
                      fullWidth
                    >
                      {paymentMethods.map((method) => (
                        <MenuItem key={method.value} value={method.value}>
                          {method.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Notes (Optional)"
                      multiline
                      rows={3}
                      fullWidth
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? (
                <CircularProgress size={24} />
              ) : editingExpense ? (
                "Update"
              ) : (
                "Add"
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default ExpensesPage;
