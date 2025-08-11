import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Button,
  Alert,
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  NetworkCheck as NetworkIcon,
  Error as ErrorIcon,
  CheckCircle as CheckIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import axios from 'axios';

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  uptime: number;
  requestsPerSecond: number;
  avgResponseTime: number;
  errorRate: number;
  activeUsers: number;
  cacheHitRate: number;
}

interface ServiceHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  latency: number;
  uptime: number;
}

const MonitoringPage: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 45,
    memory: 62,
    disk: 38,
    network: 72,
    uptime: 99.98,
    requestsPerSecond: 1250,
    avgResponseTime: 87,
    errorRate: 0.02,
    activeUsers: 342,
    cacheHitRate: 84.5,
  });

  const [services, setServices] = useState<ServiceHealth[]>([
    { name: 'MongoDB', status: 'healthy', latency: 12, uptime: 99.99 },
    { name: 'Redis Cache', status: 'healthy', latency: 2, uptime: 100 },
    { name: 'Elasticsearch', status: 'healthy', latency: 45, uptime: 99.95 },
    { name: 'WebSocket', status: 'healthy', latency: 8, uptime: 99.98 },
    { name: 'AI Service', status: 'degraded', latency: 234, uptime: 98.5 },
    { name: 'Message Queue', status: 'healthy', latency: 15, uptime: 99.97 },
  ]);

  const [performanceData, setPerformanceData] = useState([
    { time: '00:00', requests: 1000, responseTime: 95, errors: 2 },
    { time: '04:00', requests: 800, responseTime: 85, errors: 1 },
    { time: '08:00', requests: 1500, responseTime: 110, errors: 3 },
    { time: '12:00', requests: 2000, responseTime: 120, errors: 5 },
    { time: '16:00', requests: 1800, responseTime: 105, errors: 4 },
    { time: '20:00', requests: 1200, responseTime: 90, errors: 2 },
    { time: '24:00', requests: 900, responseTime: 80, errors: 1 },
  ]);

  const [queueMetrics] = useState([
    { name: 'Email Queue', value: 45 },
    { name: 'Analytics', value: 123 },
    { name: 'AI Processing', value: 67 },
    { name: 'Reports', value: 12 },
    { name: 'Notifications', value: 89 },
  ]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        cpu: Math.min(100, Math.max(0, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.min(100, Math.max(0, prev.memory + (Math.random() - 0.5) * 5)),
        requestsPerSecond: Math.max(0, prev.requestsPerSecond + (Math.random() - 0.5) * 100),
        activeUsers: Math.max(0, prev.activeUsers + Math.floor((Math.random() - 0.5) * 20)),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'success';
      case 'degraded':
        return 'warning';
      case 'down':
        return 'error';
      default:
        return 'default';
    }
  };

  const getMetricStatus = (value: number, threshold: number) => {
    if (value > threshold) return 'error';
    if (value > threshold * 0.8) return 'warning';
    return 'success';
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">System Monitoring Dashboard</Typography>
        <Box>
          <Chip
            icon={<CheckIcon />}
            label="All Systems Operational"
            color="success"
            sx={{ mr: 2 }}
          />
          <IconButton onClick={() => window.location.reload()}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    CPU Usage
                  </Typography>
                  <Typography variant="h4">{metrics.cpu.toFixed(1)}%</Typography>
                </Box>
                <SpeedIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
              <LinearProgress
                variant="determinate"
                value={metrics.cpu}
                color={getMetricStatus(metrics.cpu, 80) as any}
                sx={{ mt: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Memory
                  </Typography>
                  <Typography variant="h4">{metrics.memory.toFixed(1)}%</Typography>
                </Box>
                <MemoryIcon color="secondary" sx={{ fontSize: 40 }} />
              </Box>
              <LinearProgress
                variant="determinate"
                value={metrics.memory}
                color={getMetricStatus(metrics.memory, 85) as any}
                sx={{ mt: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Active Users
                  </Typography>
                  <Typography variant="h4">{metrics.activeUsers}</Typography>
                </Box>
                <NetworkIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUpIcon color="success" fontSize="small" />
                <Typography variant="caption" color="success.main">
                  +12% from last hour
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Cache Hit Rate
                  </Typography>
                  <Typography variant="h4">{metrics.cacheHitRate}%</Typography>
                </Box>
                <StorageIcon color="info" sx={{ fontSize: 40 }} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUpIcon color="success" fontSize="small" />
                <Typography variant="caption" color="success.main">
                  Optimal performance
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Performance Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Request & Response Time
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <ChartTooltip />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="requests"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                  name="Requests/sec"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="responseTime"
                  stroke="#82ca9d"
                  name="Avg Response (ms)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Queue Status
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={queueMetrics}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {queueMetrics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Service Health */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Service Health Status
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Service</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Latency (ms)</TableCell>
                <TableCell>Uptime</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.name}>
                  <TableCell>{service.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={service.status}
                      color={getStatusColor(service.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography
                      color={service.latency > 100 ? 'error' : 'text.primary'}
                    >
                      {service.latency}ms
                    </Typography>
                  </TableCell>
                  <TableCell>{service.uptime}%</TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton size="small">
                        <TrendingUpIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Alerts */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Recent Alerts
        </Typography>
        <Alert severity="warning" sx={{ mb: 1 }}>
          AI Service experiencing higher than normal latency (234ms)
        </Alert>
        <Alert severity="info" sx={{ mb: 1 }}>
          Scheduled maintenance for Elasticsearch at 2:00 AM
        </Alert>
        <Alert severity="success">
          All critical services are operational
        </Alert>
      </Paper>
    </Box>
  );
};

export default MonitoringPage;