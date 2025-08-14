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
  Edit
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { Project, CreateProjectData, Scheme, StatusOptions } from '../types';
import { projectsAPI, schemesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { API_URL } from '../config/api.config';

interface ProjectFormData extends CreateProjectData {}

const ProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const isViewer = user?.role === 'viewer';
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [locationData, setLocationData] = useState<any>(null);
  const [selectedBlock, setSelectedBlock] = useState('');
  const [selectedGP, setSelectedGP] = useState('');

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormData>({
    defaultValues: {
      name: '',
      description: '',
      schemeId: '',
      budget: 0,
      startDate: '',
      endDate: '',
      status: 'Planning',
    },
  });

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectsAPI.getAll();
      setProjects(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchemes = async () => {
    try {
      const data = await schemesAPI.getAll();
      setSchemes(data || []);
    } catch (err: any) {
      console.error('Failed to fetch schemes:', err);
      setSchemes([]);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchSchemes();
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

  const handleOpenDialog = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setSelectedBlock(project.block || '');
      setSelectedGP(project.gramPanchayat || '');
      reset({
        name: project.name || '',
        description: project.description || '',
        schemeId: project.schemeId || '',
        budget: project.budget || 0,
        startDate: project.startDate ? project.startDate.split('T')[0] : '',
        endDate: project.endDate ? project.endDate.split('T')[0] : '',
        status: project.status || 'Planning',
        block: project.block || '',
        gramPanchayat: project.gramPanchayat || '',
        village: project.village || '',
      });
    } else {
      setEditingProject(null);
      setSelectedBlock('');
      setSelectedGP('');
      reset({
        name: '',
        description: '',
        schemeId: '',
        budget: 0,
        startDate: '',
        endDate: '',
        status: 'Planning',
        block: '',
        gramPanchayat: '',
        village: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingProject(null);
    setSelectedBlock('');
    setSelectedGP('');
    reset();
  };

  const onSubmit = async (data: ProjectFormData) => {
    try {
      setSubmitting(true);
      if (editingProject) {
        await projectsAPI.update(editingProject._id, data);
      } else {
        await projectsAPI.create(data);
      }
      await fetchProjects();
      handleCloseDialog();
    } catch (err: any) {
      setError(err.message || 'Failed to save project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (project: Project) => {
    setProjectToDelete(project);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;

    try {
      setSubmitting(true);
      await projectsAPI.delete(projectToDelete._id);
      await fetchProjects();
      setDeleteConfirmOpen(false);
      setProjectToDelete(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete project');
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
    if (!schemeId) return 'No Scheme';
    const scheme = schemes.find(s => s._id === schemeId);
    return scheme ? scheme.name : 'Unknown Scheme';
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
        <Typography variant="h4">Projects Management</Typography>
        {!isViewer && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add New Project
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
              <TableCell>Scheme</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Budget</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Status</TableCell>
              {!isViewer && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isViewer ? 7 : 8} align="center">
                  <Typography color="textSecondary">No projects found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project) => (
                <TableRow key={project._id} hover>
                  <TableCell>
                    <Typography variant="subtitle2">{project.name || 'Unnamed Project'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="primary">
                      {project.schemeName || getSchemeName(project.schemeId)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {project.description && project.description.length > 50
                        ? `${project.description.substring(0, 50)}...`
                        : project.description || 'No description'}
                    </Typography>
                  </TableCell>
                  <TableCell>{project.budget ? formatCurrency(project.budget) : 'N/A'}</TableCell>
                  <TableCell>{project.startDate ? formatDate(project.startDate) : 'N/A'}</TableCell>
                  <TableCell>{project.endDate ? formatDate(project.endDate) : 'N/A'}</TableCell>
                  <TableCell>
                    <Chip
                      label={project.status || 'Unknown'}
                      color={getStatusColor(project.status || '')}
                      size="small"
                    />
                  </TableCell>
                  {!isViewer && (
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(project)}
                        title="Edit"
                      >
                        <Edit />
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
            {editingProject ? 'Edit Project' : 'Add New Project'}
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
                      label="Project Name"
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      disabled={submitting}
                    />
                  )}
                />
              </Box>

              <Box sx={{ width: '100%' }}>
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
                      {schemes && schemes.length > 0 ? (
                        schemes.map((scheme) => (
                          <MenuItem key={scheme._id} value={scheme._id}>
                            {scheme.name}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem value="" disabled>
                          No schemes available
                        </MenuItem>
                      )}
                    </TextField>
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

              {/* Location Fields */}
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Location Details</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
                  <Controller
                    name="block"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        fullWidth
                        label="Block"
                        value={field.value || selectedBlock}
                        onChange={(e) => {
                          field.onChange(e);
                          setSelectedBlock(e.target.value);
                          setSelectedGP(''); // Reset GP when block changes
                        }}
                        disabled={submitting || !locationData}
                      >
                        <MenuItem value="">Select Block</MenuItem>
                        {locationData?.districts?.[0]?.blocks?.map((block: any) => (
                          <MenuItem key={block.name} value={block.name}>
                            {block.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Box>

                <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
                  <Controller
                    name="gramPanchayat"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        fullWidth
                        label="Gram Panchayat"
                        value={field.value || selectedGP}
                        onChange={(e) => {
                          field.onChange(e);
                          setSelectedGP(e.target.value);
                        }}
                        disabled={submitting || !selectedBlock}
                      >
                        <MenuItem value="">Select Gram Panchayat</MenuItem>
                        {locationData?.districts?.[0]?.blocks
                          ?.find((b: any) => b.name === selectedBlock)
                          ?.gramPanchayats?.map((gp: any) => (
                            <MenuItem key={gp.name} value={gp.name}>
                              {gp.name}
                            </MenuItem>
                          ))}
                      </TextField>
                    )}
                  />
                </Box>

                <Box sx={{ width: '100%' }}>
                  <Controller
                    name="village"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        fullWidth
                        label="Village"
                        disabled={submitting || !selectedGP}
                      >
                        <MenuItem value="">Select Village</MenuItem>
                        {locationData?.districts?.[0]?.blocks
                          ?.find((b: any) => b.name === selectedBlock)
                          ?.gramPanchayats
                          ?.find((gp: any) => gp.name === selectedGP)
                          ?.villages?.map((village: string) => (
                            <MenuItem key={village} value={village}>
                              {village}
                            </MenuItem>
                          ))}
                      </TextField>
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
                  {editingProject ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                editingProject ? 'Update' : 'Create'
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
            Are you sure you want to delete "{projectToDelete?.name}"?
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

export default ProjectsPage;