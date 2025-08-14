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
  MenuItem,
  LinearProgress
} from '@mui/material';
import {
  Add,
  Edit,
  Delete
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { Work, CreateWorkData, Scheme, Project, StatusOptions } from '../types';
import { worksAPI, schemesAPI, projectsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { API_URL } from '../config/api.config';

interface WorkFormData extends CreateWorkData {}

const WorksPage: React.FC = () => {
  const { user } = useAuth();
  const isViewer = user?.role === 'viewer';
  
  const [works, setWorks] = useState<Work[]>([]);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWork, setEditingWork] = useState<Work | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [workToDelete, setWorkToDelete] = useState<Work | null>(null);
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>('');
  const [locationData, setLocationData] = useState<any>(null);
  const [selectedBlock, setSelectedBlock] = useState('');
  const [selectedGP, setSelectedGP] = useState('');

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<WorkFormData>({
    defaultValues: {
      name: '',
      description: '',
      projectId: '',
      schemeId: '',
      budget: 0,
      startDate: '',
      endDate: '',
      status: 'Planning',
      progress: 0,
    },
  });

  const watchSchemeId = watch('schemeId');

  const fetchWorks = async () => {
    try {
      setLoading(true);
      const data = await worksAPI.getAll();
      setWorks(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch works');
    } finally {
      setLoading(false);
    }
  };

  const fetchSchemes = async () => {
    try {
      const data = await schemesAPI.getAll();
      setSchemes(data);
    } catch (err: any) {
      console.error('Failed to fetch schemes:', err);
    }
  };

  const fetchProjects = async () => {
    try {
      const data = await projectsAPI.getAll();
      setProjects(data);
    } catch (err: any) {
      console.error('Failed to fetch projects:', err);
    }
  };

  useEffect(() => {
    fetchWorks();
    fetchSchemes();
    fetchProjects();
    fetchLocationHierarchy();
  }, []);

  const fetchLocationHierarchy = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/locations/hierarchy`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setLocationData(response.data);
    } catch (error) {
      console.error('Error fetching location data:', error);
    }
  };

  // Filter projects based on selected scheme
  useEffect(() => {
    if (watchSchemeId) {
      const filtered = projects.filter(project => project.schemeId === watchSchemeId);
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects([]);
    }
  }, [watchSchemeId, projects]);

  const handleOpenDialog = (work?: Work) => {
    if (work) {
      setEditingWork(work);
      setSelectedSchemeId(work.schemeId);
      reset({
        name: work.name,
        description: work.description,
        projectId: work.projectId,
        schemeId: work.schemeId,
        budget: work.budget,
        startDate: work.startDate.split('T')[0],
        endDate: work.endDate.split('T')[0],
        status: work.status,
        progress: work.progress,
      });
    } else {
      setEditingWork(null);
      setSelectedSchemeId('');
      reset({
        name: '',
        description: '',
        projectId: '',
        schemeId: '',
        budget: 0,
        startDate: '',
        endDate: '',
        status: 'Planning',
        progress: 0,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingWork(null);
    setSelectedSchemeId('');
    reset();
  };

  const onSubmit = async (data: WorkFormData) => {
    try {
      setSubmitting(true);
      if (editingWork) {
        await worksAPI.update(editingWork._id, data);
      } else {
        await worksAPI.create(data);
      }
      await fetchWorks();
      handleCloseDialog();
    } catch (err: any) {
      setError(err.message || 'Failed to save work');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (work: Work) => {
    setWorkToDelete(work);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!workToDelete) return;

    try {
      setSubmitting(true);
      await worksAPI.delete(workToDelete._id);
      await fetchWorks();
      setDeleteConfirmOpen(false);
      setWorkToDelete(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete work');
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

  const getSchemeName = (schemeId: string) => {
    const scheme = schemes.find(s => s._id === schemeId);
    return scheme ? scheme.name : 'Unknown Scheme';
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p._id === projectId);
    return project ? project.name : 'Unknown Project';
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'success';
    if (progress >= 70) return 'info';
    if (progress >= 50) return 'warning';
    return 'error';
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
        <Typography variant="h4">Works Management</Typography>
        {!isViewer && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add New Work
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
              <TableCell>Project</TableCell>
              <TableCell>Scheme</TableCell>
              <TableCell>Budget</TableCell>
              <TableCell>Progress</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Status</TableCell>
              {!isViewer && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {works.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isViewer ? 8 : 9} align="center">
                  <Typography color="textSecondary">No works found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              works.map((work) => (
                <TableRow key={work._id} hover>
                  <TableCell>
                    <Typography variant="subtitle2">{work.name}</Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                      {work.description.length > 30
                        ? `${work.description.substring(0, 30)}...`
                        : work.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="secondary">
                      {work.projectName || getProjectName(work.projectId)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="primary">
                      {work.schemeName || getSchemeName(work.schemeId)}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatCurrency(work.budget)}</TableCell>
                  <TableCell>
                    <Box sx={{ width: '100px' }}>
                      <LinearProgress
                        variant="determinate"
                        value={work.progress}
                        color={getProgressColor(work.progress)}
                        sx={{ height: 8, borderRadius: 5 }}
                      />
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', mt: 0.5 }}>
                        {work.progress}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{formatDate(work.startDate)}</TableCell>
                  <TableCell>{formatDate(work.endDate)}</TableCell>
                  <TableCell>
                    <Chip
                      label={work.status}
                      color={getStatusColor(work.status)}
                      size="small"
                    />
                  </TableCell>
                  {!isViewer && (
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(work)}
                        title="Edit"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(work)}
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
            {editingWork ? 'Edit Work' : 'Add New Work'}
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
                      label="Work Name"
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      disabled={submitting}
                    />
                  )}
                />
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
                  <Controller
                    name="schemeId"
                    control={control}
                    rules={{ required: 'Scheme is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        fullWidth
                        label="Scheme"
                        error={!!errors.schemeId}
                        helperText={errors.schemeId?.message}
                        disabled={submitting}
                      >
                        {schemes.map((scheme) => (
                          <MenuItem key={scheme._id} value={scheme._id}>
                            {scheme.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Box>

                <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
                  <Controller
                    name="projectId"
                    control={control}
                    rules={{ required: 'Project is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        fullWidth
                        label="Project"
                        error={!!errors.projectId}
                        helperText={errors.projectId?.message || (!watchSchemeId ? 'Please select a scheme first' : '')}
                        disabled={submitting || !watchSchemeId}
                      >
                        {!watchSchemeId ? (
                          <MenuItem value="" disabled>
                            Select a scheme first
                          </MenuItem>
                        ) : filteredProjects.length > 0 ? (
                          filteredProjects.map((project) => (
                            <MenuItem key={project._id} value={project._id}>
                              {project.name}
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem value="" disabled>
                            No projects available for selected scheme
                          </MenuItem>
                        )}
                      </TextField>
                    )}
                  />
                </Box>
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
                    name="progress"
                    control={control}
                    rules={{
                      required: 'Progress is required',
                      min: { value: 0, message: 'Progress cannot be negative' },
                      max: { value: 100, message: 'Progress cannot exceed 100%' },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Progress (%)"
                        type="number"
                        error={!!errors.progress}
                        helperText={errors.progress?.message}
                        disabled={submitting}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        inputProps={{ min: 0, max: 100 }}
                      />
                    )}
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
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
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
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
                  {editingWork ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                editingWork ? 'Update' : 'Create'
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
            Are you sure you want to delete "{workToDelete?.name}"?
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

export default WorksPage;