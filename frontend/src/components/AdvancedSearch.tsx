import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Chip,
  Typography,
  Autocomplete,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  IconButton,
  Collapse,
  Badge,
  Tooltip,
  LinearProgress
} from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  LocationOn as LocationIcon,
  TrendingUp as TrendingIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface SearchResult {
  id: string;
  title: string;
  type: 'project' | 'scheme' | 'work';
  description: string;
  highlight?: string;
  score: number;
  tags: string[];
  metrics?: {
    progress?: number;
    budget?: number;
    location?: string;
  };
}

interface Facet {
  name: string;
  count: number;
}

const AdvancedSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [facets, setFacets] = useState<{
    status: Facet[];
    districts: Facet[];
    types: Facet[];
  }>({ status: [], districts: [], types: [] });
  const [filters, setFilters] = useState({
    status: '',
    district: '',
    budgetRange: [0, 1000000],
    progressMin: 0,
    type: '',
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchMode, setSearchMode] = useState<'basic' | 'natural'>('basic');

  // Fetch suggestions as user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) return;

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/search/suggestions`,
          {
            params: { q: query },
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        setSuggestions(response.data.suggestions || []);
      } catch (error) {
        // Fallback suggestions
        setSuggestions([
          `${query} in progress`,
          `${query} completed`,
          `${query} budget analysis`,
          `${query} timeline`,
        ]);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const endpoint = searchMode === 'natural' 
        ? '/api/search/natural' 
        : '/api/search/advanced';

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${endpoint}`,
        {
          query,
          filters,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      // Simulate results for demo
      const demoResults: SearchResult[] = [
        {
          id: '1',
          title: 'Road Infrastructure Development',
          type: 'project',
          description: 'Major road development project in tribal areas',
          highlight: `<mark>${query}</mark> found in project description`,
          score: 0.95,
          tags: ['infrastructure', 'road', 'development'],
          metrics: {
            progress: 65,
            budget: 500000,
            location: 'Adilabad District',
          },
        },
        {
          id: '2',
          title: 'Healthcare Facility Upgrade',
          type: 'scheme',
          description: 'Upgrading healthcare facilities in remote areas',
          highlight: `Related to <mark>${query}</mark>`,
          score: 0.87,
          tags: ['healthcare', 'medical', 'facilities'],
          metrics: {
            progress: 40,
            budget: 300000,
            location: 'Khammam District',
          },
        },
        {
          id: '3',
          title: 'Education Enhancement Program',
          type: 'work',
          description: 'Building new schools and training teachers',
          highlight: `Matches <mark>${query}</mark> criteria`,
          score: 0.75,
          tags: ['education', 'schools', 'training'],
          metrics: {
            progress: 80,
            budget: 250000,
            location: 'Warangal District',
          },
        },
      ];

      setResults(response.data.results || demoResults);
      
      // Set facets
      setFacets({
        status: [
          { name: 'Active', count: 15 },
          { name: 'Completed', count: 8 },
          { name: 'Pending', count: 5 },
        ],
        districts: [
          { name: 'Adilabad', count: 10 },
          { name: 'Khammam', count: 8 },
          { name: 'Warangal', count: 6 },
        ],
        types: [
          { name: 'Infrastructure', count: 12 },
          { name: 'Healthcare', count: 9 },
          { name: 'Education', count: 7 },
        ],
      });
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'project':
        return 'primary';
      case 'scheme':
        return 'secondary';
      case 'work':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Search Header */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <Typography variant="h4" gutterBottom>
          AI-Powered Search
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
          Search across projects, schemes, and works using natural language or advanced filters
        </Typography>

        {/* Search Mode Toggle */}
        <Box sx={{ mb: 2 }}>
          <Chip
            label="Basic Search"
            onClick={() => setSearchMode('basic')}
            color={searchMode === 'basic' ? 'primary' : 'default'}
            sx={{ 
              mr: 1, 
              bgcolor: searchMode === 'basic' ? 'white' : 'rgba(255,255,255,0.5)',
              color: searchMode === 'basic' ? 'primary.main' : 'white',
              fontWeight: searchMode === 'basic' ? 'bold' : 'normal',
              '&:hover': {
                bgcolor: searchMode === 'basic' ? 'white' : 'rgba(255,255,255,0.7)'
              }
            }}
          />
          <Chip
            label="Natural Language"
            onClick={() => setSearchMode('natural')}
            color={searchMode === 'natural' ? 'primary' : 'default'}
            sx={{ 
              bgcolor: searchMode === 'natural' ? 'white' : 'rgba(255,255,255,0.5)',
              color: searchMode === 'natural' ? 'primary.main' : 'white',
              fontWeight: searchMode === 'natural' ? 'bold' : 'normal',
              '&:hover': {
                bgcolor: searchMode === 'natural' ? 'white' : 'rgba(255,255,255,0.7)'
              }
            }}
            icon={<TrendingIcon />}
          />
        </Box>

        {/* Search Bar */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Autocomplete
            freeSolo
            options={suggestions}
            sx={{ flex: 1 }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder={
                  searchMode === 'natural'
                    ? "Ask anything: 'Show me all delayed projects in Adilabad'"
                    : "Search projects, schemes, works..."
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                sx={{
                  bgcolor: 'white',
                  borderRadius: 1,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { border: 'none' },
                  },
                }}
              />
            )}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={loading}
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              '&:hover': {
                bgcolor: 'grey.100',
              },
            }}
            startIcon={<SearchIcon />}
          >
            Search
          </Button>
          <IconButton
            onClick={() => setShowFilters(!showFilters)}
            sx={{ color: 'white' }}
          >
            <Badge badgeContent={3} color="error">
              <FilterIcon />
            </Badge>
          </IconButton>
        </Box>
      </Paper>

      {/* Advanced Filters */}
      <Collapse in={showFilters}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Advanced Filters
          </Typography>
          <Grid2 container spacing={3}>
            <Grid2 item xs={12} md={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel shrink={true} sx={{ bgcolor: 'white', px: 0.5 }}>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  displayEmpty
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                </Select>
              </FormControl>
            </Grid2>
            <Grid2 item xs={12} md={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel shrink={true} sx={{ bgcolor: 'white', px: 0.5 }}>District</InputLabel>
                <Select
                  value={filters.district}
                  label="District"
                  displayEmpty
                  onChange={(e) => setFilters({ ...filters, district: e.target.value })}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="adilabad">Adilabad</MenuItem>
                  <MenuItem value="khammam">Khammam</MenuItem>
                  <MenuItem value="warangal">Warangal</MenuItem>
                </Select>
              </FormControl>
            </Grid2>
            <Grid2 item xs={12} md={3}>
              <Typography gutterBottom>Budget Range</Typography>
              <Slider
                value={filters.budgetRange}
                onChange={(e, value) => setFilters({ ...filters, budgetRange: value as number[] })}
                valueLabelDisplay="auto"
                min={0}
                max={1000000}
                step={10000}
              />
            </Grid2>
            <Grid2 item xs={12} md={3}>
              <Typography gutterBottom>Min Progress: {filters.progressMin}%</Typography>
              <Slider
                value={filters.progressMin}
                onChange={(e, value) => setFilters({ ...filters, progressMin: value as number })}
                valueLabelDisplay="auto"
                min={0}
                max={100}
              />
            </Grid2>
          </Grid2>
        </Paper>
      </Collapse>

      {/* Loading */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Results */}
      <Grid2 container spacing={3}>
        {/* Facets */}
        <Grid2 item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Refine Results
            </Typography>
            
            {/* Status Facet */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Status
              </Typography>
              {facets.status.map((facet) => (
                <Chip
                  key={facet.name}
                  label={`${facet.name} (${facet.count})`}
                  size="small"
                  sx={{ m: 0.5 }}
                  onClick={() => setFilters({ ...filters, status: facet.name.toLowerCase() })}
                />
              ))}
            </Box>

            {/* District Facet */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Districts
              </Typography>
              {facets.districts.map((facet) => (
                <Chip
                  key={facet.name}
                  label={`${facet.name} (${facet.count})`}
                  size="small"
                  sx={{ m: 0.5 }}
                  onClick={() => setFilters({ ...filters, district: facet.name.toLowerCase() })}
                />
              ))}
            </Box>

            {/* Type Facet */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Types
              </Typography>
              {facets.types.map((facet) => (
                <Chip
                  key={facet.name}
                  label={`${facet.name} (${facet.count})`}
                  size="small"
                  sx={{ m: 0.5 }}
                />
              ))}
            </Box>
          </Paper>
        </Grid2>

        {/* Search Results */}
        <Grid2 item xs={12} md={9}>
          <Typography variant="h6" gutterBottom>
            {results.length} Results found
          </Typography>
          {results.map((result) => (
            <Card key={result.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {result.title}
                      <Chip
                        label={result.type}
                        size="small"
                        color={getTypeColor(result.type) as any}
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {result.description}
                    </Typography>
                    {result.highlight && (
                      <Typography
                        variant="body2"
                        sx={{ mt: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}
                        dangerouslySetInnerHTML={{ __html: result.highlight }}
                      />
                    )}
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      {result.tags.map((tag) => (
                        <Chip key={tag} label={tag} size="small" variant="outlined" />
                      ))}
                    </Box>
                    {result.metrics && (
                      <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                        {result.metrics.progress !== undefined && (
                          <Chip
                            label={`Progress: ${result.metrics.progress}%`}
                            size="small"
                            color="primary"
                          />
                        )}
                        {result.metrics.location && (
                          <Chip
                            icon={<LocationIcon />}
                            label={result.metrics.location}
                            size="small"
                          />
                        )}
                      </Box>
                    )}
                  </Box>
                  <Tooltip title="Relevance Score">
                    <Chip
                      label={`${(result.score * 100).toFixed(0)}%`}
                      color="success"
                      size="small"
                    />
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Grid2>
      </Grid2>
    </Box>
  );
};

export default AdvancedSearch;