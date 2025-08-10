import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Alert,
  CircularProgress,
  MenuItem
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { Scheme, CreateSchemeData, StatusOptions } from '../types';
import { schemesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface SchemeFormData extends CreateSchemeData {}

const SchemesPage: React.FC = () => {
  const { user } = useAuth();
  const isViewer = user?.role === 'viewer';
  
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingScheme, setEditingScheme] = useState<Scheme | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [schemeToDelete, setSchemeToDelete] = useState<Scheme | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SchemeFormData>({
    defaultValues: {
      name: '',
      description: '',
      budget: 0,
      startDate: '',
      endDate: '',
      status: 'Planning',
    },
  });

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      const data = await schemesAPI.getAll();
      setSchemes(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch schemes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  const handleOpenDialog = (scheme?: Scheme) => {
    if (scheme) {
      setEditingScheme(scheme);
      reset({
        name: scheme.name,
        description: scheme.description,
        budget: scheme.budget,
        startDate: scheme.startDate.split('T')[0],
        endDate: scheme.endDate.split('T')[0],
        status: scheme.status,
      });
    } else {
      setEditingScheme(null);
      reset({
        name: '',
        description: '',
        budget: 0,
        startDate: '',
        endDate: '',
        status: 'Planning',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingScheme(null);
    reset();
  };

  const onSubmit = async (data: SchemeFormData) => {
    try {
      setSubmitting(true);
      if (editingScheme) {
        await schemesAPI.update(editingScheme._id, data);
      } else {
        await schemesAPI.create(data);
      }
      await fetchSchemes();
      handleCloseDialog();
    } catch (err: any) {
      setError(err.message || 'Failed to save scheme');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (scheme: Scheme) => {
    setSchemeToDelete(scheme);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!schemeToDelete) return;

    try {
      setSubmitting(true);
      await schemesAPI.delete(schemeToDelete._id);
      await fetchSchemes();
      setDeleteConfirmOpen(false);
      setSchemeToDelete(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete scheme');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (status) {
      case 'Active': return 'success';
      case 'Completed': return 'info';
      case 'On Hold': return 'warning';
      case 'Planning': return 'default';
      default: return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Schemes Management</Typography>
        {!isViewer && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add New Scheme
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Budget</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Status</TableCell>
              {!isViewer && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {schemes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isViewer ? 6 : 7} align="center">
                  <Typography color="textSecondary">No schemes found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              schemes.map((scheme) => (
                <TableRow key={scheme._id} hover>
                  <TableCell>
                    <Typography variant="subtitle2">{scheme.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {scheme.description.length > 50
                        ? `${scheme.description.substring(0, 50)}...`
                        : scheme.description}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatCurrency(scheme.budget)}</TableCell>
                  <TableCell>{formatDate(scheme.startDate)}</TableCell>
                  <TableCell>{formatDate(scheme.endDate)}</TableCell>
                  <TableCell>
                    <Chip
                      label={scheme.status}
                      color={getStatusColor(scheme.status)}
                      size="small"
                    />
                  </TableCell>
                  {!isViewer && (
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(scheme)}
                        title="Edit"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(scheme)}
                        title="Delete"
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>
            {editingScheme ? 'Edit Scheme' : 'Add New Scheme'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Box sx={{ width: '100%' }}>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: 'Name is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Scheme Name"
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      disabled={submitting}
                    />
                  )}
                />
              </Box>

              <Box sx={{ width: '100%' }}>
                <Controller
                  name="description"
                  control={control}
                  rules={{ required: 'Description is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Description"
                      multiline
                      rows={3}
                      error={!!errors.description}
                      helperText={errors.description?.message}
                      disabled={submitting}
                    />
                  )}
                />
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
                  <Controller
                    name="budget"
                    control={control}
                    rules={{
                      required: 'Budget is required',
                      min: { value: 1, message: 'Budget must be greater than 0' },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Budget (₹)"
                        type="number"
                        error={!!errors.budget}
                        helperText={errors.budget?.message}
                        disabled={submitting}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    )}
                  />
                </Box>

                <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
                  <Controller
                    name="status"
                    control={control}
                    rules={{ required: 'Status is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        fullWidth
                        label="Status"
                        error={!!errors.status}
                        helperText={errors.status?.message}
                        disabled={submitting}
                      >
                        {StatusOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
                  <Controller
                    name="startDate"
                    control={control}
                    rules={{ required: 'Start date is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Start Date"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.startDate}
                        helperText={errors.startDate?.message}
                        disabled={submitting}
                      />
                    )}
                  />
                </Box>

                <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
                  <Controller
                    name="endDate"
                    control={control}
                    rules={{ required: 'End date is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="End Date"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.endDate}
                        helperText={errors.endDate?.message}
                        disabled={submitting}
                      />
                    )}
                  />
                </Box>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={submitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  {editingScheme ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                editingScheme ? 'Update' : 'Create'
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => !submitting && setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{schemeToDelete?.name}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SchemesPage;