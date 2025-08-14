import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  SelectChangeEvent,
  Divider
} from '@mui/material';
import {
  LocationOn,
  AccountTree,
  Assignment,
  Work,
  FilterList,
  Clear
} from '@mui/icons-material';
import axios from 'axios';
import { API_URL } from '../config/api.config';

interface LocationHierarchy {
  district: string;
  blocks: Array<{
    name: string;
    gramPanchayats: Array<{
      name: string;
      villages: string[];
    }>;
  }>;
}

interface FilteredData {
  schemes?: any[];
  projects?: any[];
  works?: any[];
  locationSummary?: any;
}

const FilteredViewPage: React.FC = () => {
  const [locationData, setLocationData] = useState<LocationHierarchy | null>(null);
  const [selectedDistrict] = useState('Gajapati (Parlakhemundi)');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [selectedGP, setSelectedGP] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');
  const [dataType, setDataType] = useState('all');
  const [loading, setLoading] = useState(false);
  const [filteredData, setFilteredData] = useState<FilteredData>({});
  const [tabValue, setTabValue] = useState(0);

  // Load location hierarchy
  useEffect(() => {
    fetchLocationHierarchy();
  }, []);

  const fetchLocationHierarchy = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching location hierarchy from:', `${API_URL}/locations/hierarchy`);
      const response = await axios.get(`${API_URL}/locations/hierarchy`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      console.log('Location data received:', response.data);
      setLocationData(response.data);
    } catch (error) {
      console.error('Error fetching location data:', error);
      // Set complete default data with gram panchayats and villages
      setLocationData({
        district: 'Gajapati (Parlakhemundi)',
        blocks: [
          { 
            name: 'Mohana', 
            gramPanchayats: [
              { name: 'Chandragiri', villages: ['Chandragiri', 'Tumba', 'Kereba', 'Badapada'] },
              { name: 'Gangabada', villages: ['Gangabada', 'Kujasingh', 'Manikpur', 'Raibada'] },
              { name: 'Luhagudi', villages: ['Luhagudi', 'Paniganda', 'Bhaliaguda', 'Kenduguda'] },
              { name: 'Seranga', villages: ['Seranga', 'Katama', 'Jeeranga', 'Dhobaguda'] }
            ] 
          },
          { 
            name: 'R.Udayagiri', 
            gramPanchayats: [
              { name: 'Kinchilingi', villages: ['Kinchilingi', 'Sindhiba', 'Tarangini', 'Jharaguda'] },
              { name: 'Dumbala', villages: ['Dumbala', 'Khadanga', 'Luhangi', 'Pandava'] },
              { name: 'Ramagiri', villages: ['Ramagiri', 'Labanyagada', 'Ambaguda', 'Karadabadi'] },
              { name: 'Padmapur', villages: ['Padmapur', 'Haridapadar', 'Jagannathpur', 'Bhimpur'] }
            ] 
          },
          { 
            name: 'Nuagada', 
            gramPanchayats: [
              { name: 'Alada', villages: ['Alada', 'Badasindhigaon', 'Dumuriguda', 'Kendupadar'] },
              { name: 'Dimiripali', villages: ['Dimiripali', 'Adava', 'Badagada', 'Jharigaon'] },
              { name: 'Loba', villages: ['Loba', 'Siriguda', 'Raibandha', 'Talamunda'] }
            ] 
          },
          { 
            name: 'Rayagada', 
            gramPanchayats: [
              { name: 'Koinpur', villages: ['Koinpur', 'Bhaleri', 'Garabandha', 'Jharigaon'] },
              { name: 'Sindurapur', villages: ['Sindurapur', 'Badakalakote', 'Laxmipur', 'Ratnapur'] },
              { name: 'Dura', villages: ['Dura', 'Jeerango', 'Kasipur', 'Mandimera'] }
            ] 
          },
          { 
            name: 'Gumma', 
            gramPanchayats: [
              { name: 'Gumma', villages: ['Gumma', 'Baghalati', 'Dhepaguda', 'Khandava'] },
              { name: 'Juba', villages: ['Juba', 'Amjhiri', 'Birikote', 'Chitapalli'] }
            ] 
          }
        ]
      });
    }
  };

  const handleBlockChange = (event: SelectChangeEvent) => {
    setSelectedBlock(event.target.value);
    setSelectedGP('');
    setSelectedVillage('');
  };

  const handleGPChange = (event: SelectChangeEvent) => {
    setSelectedGP(event.target.value);
    setSelectedVillage('');
  };

  const handleVillageChange = (event: SelectChangeEvent) => {
    setSelectedVillage(event.target.value);
  };

  const handleDataTypeChange = (event: SelectChangeEvent) => {
    setDataType(event.target.value);
  };

  const handleFilter = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/locations/filter`, {
        district: 'Gajapati (Parlakhemundi)',
        block: selectedBlock || undefined,
        gramPanchayat: selectedGP || undefined,
        village: selectedVillage || undefined,
        dataType
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setFilteredData(response.data);
      
      // Auto-select appropriate tab based on data
      if (response.data.schemes?.length > 0) setTabValue(0);
      else if (response.data.projects?.length > 0) setTabValue(1);
      else if (response.data.works?.length > 0) setTabValue(2);
    } catch (error) {
      console.error('Error filtering data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSelectedBlock('');
    setSelectedGP('');
    setSelectedVillage('');
    setDataType('all');
    setFilteredData({});
  };

  // Get available GPs for selected block
  const availableGPs = selectedBlock
    ? locationData?.blocks.find(b => b.name === selectedBlock)?.gramPanchayats || []
    : [];
    
  console.log('Selected Block:', selectedBlock);
  console.log('Available GPs:', availableGPs);

  // Get available villages for selected GP
  const availableVillages = selectedGP
    ? availableGPs.find(gp => gp.name === selectedGP)?.villages || []
    : [];
    
  console.log('Selected GP:', selectedGP);
  console.log('Available Villages:', availableVillages);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Location-based Data Filter
      </Typography>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        Filter schemes, projects, and works by location hierarchy
      </Typography>

      {/* Filter Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <LocationOn color="primary" />
          <Typography variant="h6">Location Filters</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          {/* District (Fixed for Parlakhemundi ITDA) */}
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>District</InputLabel>
            <Select 
              value="Gajapati (Parlakhemundi)" 
              label="District" 
              disabled
            >
              <MenuItem value="Gajapati (Parlakhemundi)">Gajapati (Parlakhemundi)</MenuItem>
            </Select>
          </FormControl>

          {/* Block */}
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Block</InputLabel>
            <Select
              value={selectedBlock}
              label="Block"
              onChange={handleBlockChange}
            >
              <MenuItem value="">All Blocks</MenuItem>
              {locationData?.blocks.map(block => (
                <MenuItem key={block.name} value={block.name}>
                  {block.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Gram Panchayat */}
          <FormControl sx={{ minWidth: 200 }} disabled={!selectedBlock}>
            <InputLabel>Gram Panchayat</InputLabel>
            <Select
              value={selectedGP}
              label="Gram Panchayat"
              onChange={handleGPChange}
            >
              <MenuItem value="">All GPs</MenuItem>
              {availableGPs.map(gp => (
                <MenuItem key={gp.name} value={gp.name}>
                  {gp.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Village */}
          <FormControl sx={{ minWidth: 200 }} disabled={!selectedGP}>
            <InputLabel>Village</InputLabel>
            <Select
              value={selectedVillage}
              label="Village"
              onChange={handleVillageChange}
            >
              <MenuItem value="">All Villages</MenuItem>
              {availableVillages.map(village => (
                <MenuItem key={village} value={village}>
                  {village}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Data Type */}
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Data Type</InputLabel>
            <Select
              value={dataType}
              label="Data Type"
              onChange={handleDataTypeChange}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="schemes">Schemes Only</MenuItem>
              <MenuItem value="projects">Projects Only</MenuItem>
              <MenuItem value="works">Works Only</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<FilterList />}
            onClick={handleFilter}
            disabled={loading}
          >
            Apply Filter
          </Button>
          <Button
            variant="outlined"
            startIcon={<Clear />}
            onClick={handleClear}
            disabled={loading}
          >
            Clear Filters
          </Button>
        </Box>
      </Paper>

      {/* Location Summary */}
      {filteredData.locationSummary && (
        <Card sx={{ mb: 3, bgcolor: '#f5f5f5' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Filtered Location
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip icon={<LocationOn />} label={`District: ${filteredData.locationSummary.district}`} />
                  {filteredData.locationSummary.block !== 'All' && (
                    <Chip label={`Block: ${filteredData.locationSummary.block}`} />
                  )}
                  {filteredData.locationSummary.gramPanchayat !== 'All' && (
                    <Chip label={`GP: ${filteredData.locationSummary.gramPanchayat}`} />
                  )}
                  {filteredData.locationSummary.village !== 'All' && (
                    <Chip label={`Village: ${filteredData.locationSummary.village}`} />
                  )}
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 3, mt: { xs: 2, sm: 0 } }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" color="primary">
                    {filteredData.locationSummary.totalSchemes}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Schemes
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" color="secondary">
                    {filteredData.locationSummary.totalProjects}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Projects
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" color="success.main">
                    {filteredData.locationSummary.totalWorks}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Works
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress size={60} />
        </Box>
      ) : (
        <>
          {((filteredData.schemes?.length ?? 0) > 0 || 
            (filteredData.projects?.length ?? 0) > 0 || 
            (filteredData.works?.length ?? 0) > 0) ? (
            <Paper>
              <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                {(filteredData.schemes?.length ?? 0) > 0 && (
                  <Tab icon={<AccountTree />} label={`Schemes (${filteredData.schemes?.length ?? 0})`} />
                )}
                {(filteredData.projects?.length ?? 0) > 0 && (
                  <Tab icon={<Assignment />} label={`Projects (${filteredData.projects?.length ?? 0})`} />
                )}
                {(filteredData.works?.length ?? 0) > 0 && (
                  <Tab icon={<Work />} label={`Works (${filteredData.works?.length ?? 0})`} />
                )}
              </Tabs>
              
              <Box sx={{ p: 2 }}>
                {/* Schemes Tab */}
                {tabValue === 0 && filteredData.schemes && (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Scheme Name</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell>Budget</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredData.schemes.map((scheme: any) => (
                          <TableRow key={scheme._id}>
                            <TableCell>
                              <Typography variant="subtitle2">{scheme.name}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="textSecondary">
                                {scheme.description?.substring(0, 100)}...
                              </Typography>
                            </TableCell>
                            <TableCell>{formatCurrency(scheme.budget)}</TableCell>
                            <TableCell>
                              <Chip
                                label={scheme.status}
                                color={getStatusColor(scheme.status)}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {/* Projects Tab */}
                {tabValue === 1 && filteredData.projects && (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Project Name</TableCell>
                          <TableCell>Scheme</TableCell>
                          <TableCell>Location</TableCell>
                          <TableCell>Budget</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredData.projects.map((project: any) => (
                          <TableRow key={project._id}>
                            <TableCell>
                              <Typography variant="subtitle2">{project.name}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="primary">
                                {project.schemeName}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {[project.village, project.gramPanchayat, project.block]
                                  .filter(Boolean)
                                  .join(', ') || 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell>{formatCurrency(project.budget)}</TableCell>
                            <TableCell>
                              <Chip
                                label={project.status}
                                color={getStatusColor(project.status)}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {/* Works Tab */}
                {tabValue === 2 && filteredData.works && (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Work Name</TableCell>
                          <TableCell>Project</TableCell>
                          <TableCell>Location</TableCell>
                          <TableCell>Progress</TableCell>
                          <TableCell>Budget</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredData.works.map((work: any) => (
                          <TableRow key={work._id}>
                            <TableCell>
                              <Typography variant="subtitle2">{work.name}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="primary">
                                {work.projectName}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {[work.village, work.gramPanchayat, work.block]
                                  .filter(Boolean)
                                  .join(', ') || 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 60, bgcolor: '#e0e0e0', height: 8, borderRadius: 1 }}>
                                  <Box
                                    sx={{
                                      width: `${work.progress}%`,
                                      bgcolor: work.progress > 75 ? 'success.main' : 'warning.main',
                                      height: '100%',
                                      borderRadius: 1
                                    }}
                                  />
                                </Box>
                                <Typography variant="body2">{work.progress}%</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>{formatCurrency(work.budget)}</TableCell>
                            <TableCell>
                              <Chip
                                label={work.status}
                                color={getStatusColor(work.status)}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            </Paper>
          ) : (
            filteredData.locationSummary && (
              <Alert severity="info">
                No data found for the selected location filters. Try adjusting your filters.
              </Alert>
            )
          )}
        </>
      )}
    </Box>
  );
};

export default FilteredViewPage;