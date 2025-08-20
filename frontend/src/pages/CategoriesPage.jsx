import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Avatar,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useExpenses } from '@contexts/ExpenseContext';

const CategoriesPage = () => {
  const { 
    categories, 
    categoriesLoading, 
    createCategory, 
    fetchCategories 
  } = useExpenses();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      description: '',
      color: '#1976d2',
    }
  });

  // Debug: Log categories when they change
  useEffect(() => {
    console.log('Categories in CategoriesPage:', categories);
    console.log('Categories loading:', categoriesLoading);
  }, [categories, categoriesLoading]);

  // Refresh categories when page loads
  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenDialog = () => {
    reset({
      name: '',
      description: '',
      color: '#1976d2',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    reset();
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    console.log('Submitting category data:', data);
    
    try {
      const result = await createCategory(data);
      console.log('Category creation result:', result);
      
      if (result.success) {
        handleCloseDialog();
        // Refresh categories after creation
        await fetchCategories();
      }
    } catch (error) {
      console.error('Error in onSubmit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const predefinedColors = [
    '#1976d2', '#dc004e', '#9c27b0', '#673ab7',
    '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
    '#009688', '#4caf50', '#8bc34a', '#cddc39',
    '#ffeb3b', '#ffc107', '#ff9800', '#ff5722',
  ];

  if (categoriesLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading categories...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Categories</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenDialog}
        >
          Add Category
        </Button>
      </Box>

      {/* Debug information */}
      <Alert severity="info" sx={{ mb: 2 }}>
        Found {categories.length} categories
      </Alert>

      {categories.length === 0 ? (
        <Alert severity="info">
          No categories found. Start by adding your first category!
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {categories.map((category) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={category._id}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar
                      sx={{
                        backgroundColor: category.color || '#1976d2',
                        width: 40,
                        height: 40,
                        mr: 2
                      }}
                    >
                      <CategoryIcon />
                    </Avatar>
                    <Box flexGrow={1}>
                      <Typography variant="h6" component="div">
                        {category.name}
                      </Typography>
                      {category.isDefault && (
                        <Typography variant="caption" color="textSecondary">
                          Default
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  
                  {category.description && (
                    <Typography variant="body2" color="textSecondary" mb={2}>
                      {category.description}
                    </Typography>
                  )}
                  
                  <Box display="flex" justifyContent="flex-end">
                    {!category.isDefault && (
                      <>
                        <IconButton size="small">
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="small">
                          <Delete fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add Category Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>Add New Category</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Controller
                  name="name"
                  control={control}
                  rules={{ 
                    required: 'Category name is required',
                    maxLength: { value: 50, message: 'Name cannot exceed 50 characters' }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Category Name"
                      fullWidth
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Description (Optional)"
                      multiline
                      rows={3}
                      fullWidth
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body2" gutterBottom>
                  Choose a color:
                </Typography>
                <Controller
                  name="color"
                  control={control}
                  render={({ field }) => (
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {predefinedColors.map((color) => (
                        <Box
                          key={color}
                          onClick={() => field.onChange(color)}
                          sx={{
                            width: 30,
                            height: 30,
                            backgroundColor: color,
                            borderRadius: '50%',
                            cursor: 'pointer',
                            border: field.value === color ? '3px solid #000' : '1px solid #ccc',
                          }}
                        />
                      ))}
                    </Box>
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained"
              disabled={isSubmitting}
            >
              {isSubmitting ? <CircularProgress size={24} /> : 'Add Category'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default CategoriesPage;
