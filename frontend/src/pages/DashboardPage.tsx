import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip
} from '@mui/material';
import {
  Work,
  AccountTree,
  Assignment,
  CheckCircle,
  Schedule,
  MonetizationOn,
  TrendingUp,
  Warning
} from '@mui/icons-material';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend,
  LineChart, Line, Area, AreaChart
} from 'recharts';
import { DashboardStats } from '../types';
import { dashboardAPI } from '../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
const STATUS_COLORS = {
  'Active': '#00C49F',
  'Completed': '#0088FE',
  'Planning': '#FFBB28',
  'On Hold': '#FF8042'
};

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await dashboardAPI.getStats();
        setStats(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!stats) {
    return (
      <Alert severity="warning" sx={{ m: 2 }}>
        No data available
      </Alert>
    );
  }

  // Prepare chart data
  const schemeBudgetData = stats.schemeBudgets?.map((scheme: any) => ({
    name: scheme.name.length > 20 ? scheme.name.substring(0, 20) + '...' : scheme.name,
    value: scheme.projectsBudget || scheme.schemeBudget,
    fullName: scheme.name
  })) || [];

  const workStatusData = stats.workStatusDistribution?.map((status: any) => ({
    name: status._id || 'Unknown',
    value: status.count,
    fill: STATUS_COLORS[status._id as keyof typeof STATUS_COLORS] || '#999'
  })) || [];

  const progressData = stats.progressDistribution?.map((bucket: any) => {
    let name = '';
    if (bucket._id === 0) name = '0-25%';
    else if (bucket._id === 25) name = '25-50%';
    else if (bucket._id === 50) name = '50-75%';
    else if (bucket._id === 75) name = '75-100%';
    else name = 'Other';
    
    return {
      name,
      count: bucket.count,
      fill: bucket._id >= 75 ? '#00C49F' : bucket._id >= 50 ? '#FFBB28' : bucket._id >= 25 ? '#FF8042' : '#FF0000'
    };
  }) || [];

  const budgetVsSpent = [
    { name: 'Budget Allocated', value: stats.budgetVsExpenditure?.totalBudget || 0 },
    { name: 'Amount Spent', value: stats.budgetVsExpenditure?.totalSpent || 0 },
    { name: 'Remaining', value: (stats.budgetVsExpenditure?.totalBudget || 0) - (stats.budgetVsExpenditure?.totalSpent || 0) }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getActivityIcon = (type: string, action: string) => {
    if (type === 'scheme') return <AccountTree />;
    if (type === 'project') return <Assignment />;
    if (type === 'work' && action === 'completed') return <CheckCircle />;
    return <Work />;
  };

  const getActionColor = (action: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    if (action === 'completed') return 'success';
    if (action === 'created') return 'primary';
    return 'default';
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload[0]) {
      return (
        <Paper sx={{ p: 1 }}>
          <Typography variant="body2">{payload[0].payload.fullName || label}</Typography>
          <Typography variant="body2" color="primary">
            {formatCurrency(payload[0].value)}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        ITDA Gajapati - Dashboard
      </Typography>

      {/* Stats Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' } }}>
          <Card sx={{ bgcolor: '#e3f2fd' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Schemes
                  </Typography>
                  <Typography variant="h5">
                    {stats.totalSchemes}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    {stats.activeSchemes} Active
                  </Typography>
                </Box>
                <AccountTree sx={{ fontSize: 40, color: '#1976d2' }} />
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' } }}>
          <Card sx={{ bgcolor: '#f3e5f5' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Projects
                  </Typography>
                  <Typography variant="h5">
                    {stats.totalProjects}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    {stats.activeProjects} Active
                  </Typography>
                </Box>
                <Assignment sx={{ fontSize: 40, color: '#9c27b0' }} />
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' } }}>
          <Card sx={{ bgcolor: '#e8f5e9' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Works
                  </Typography>
                  <Typography variant="h5">
                    {stats.totalWorks}
                  </Typography>
                  <Typography variant="body2" color="info.main">
                    {stats.completedWorks} Completed
                  </Typography>
                </Box>
                <Work sx={{ fontSize: 40, color: '#4caf50' }} />
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' } }}>
          <Card sx={{ bgcolor: '#fff3e0' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Budget
                  </Typography>
                  <Typography variant="h5">
                    {formatCurrency(stats.totalBudget)}
                  </Typography>
                  <Typography variant="body2" color="warning.main">
                    All Projects
                  </Typography>
                </Box>
                <MonetizationOn sx={{ fontSize: 40, color: '#ff9800' }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Charts */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {/* Scheme Budget Distribution */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 45%' } }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Scheme-wise Budget Allocation
            </Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={schemeBudgetData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${percent ? (percent * 100).toFixed(0) : 0}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {schemeBudgetData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Box>

        {/* Work Status Distribution */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 45%' } }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Work Status Distribution
            </Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={workStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {workStatusData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Box>

        {/* Budget vs Expenditure */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 45%' } }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Budget vs Expenditure (Works)
            </Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={budgetVsSpent}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `₹${(value/1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  <Bar dataKey="value" fill="#8884d8">
                    <Cell fill="#0088FE" />
                    <Cell fill="#00C49F" />
                    <Cell fill="#FFBB28" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-around' }}>
              <Typography variant="body2" color="textSecondary">
                Spent: {((stats.budgetVsExpenditure?.totalSpent / stats.budgetVsExpenditure?.totalBudget) * 100).toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="primary">
                Remaining: {formatCurrency((stats.budgetVsExpenditure?.totalBudget || 0) - (stats.budgetVsExpenditure?.totalSpent || 0))}
              </Typography>
            </Box>
          </Paper>
        </Box>

        {/* Work Progress Distribution */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 45%' } }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Active Works Progress Distribution
            </Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count">
                    {progressData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
            <Box sx={{ mt: 1, textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                {progressData.find((p: any) => p.name === '75-100%')?.count || 0} works near completion
              </Typography>
            </Box>
          </Paper>
        </Box>

        {/* Top Schemes by Budget */}
        <Box sx={{ flex: '1 1 100%' }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Top 5 Schemes by Budget
            </Typography>
            <Box sx={{ width: '100%', height: 350 }}>
              <ResponsiveContainer>
                <BarChart 
                  data={stats.topSchemesByBudget} 
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-20}
                    textAnchor="end"
                    height={100}
                    tick={{ fontSize: 11 }}
                    interval={0}
                  />
                  <YAxis tickFormatter={(value) => `₹${(value/10000000).toFixed(1)} Cr`} />
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  <Bar dataKey="budget" fill="#8884d8">
                    {stats.topSchemesByBudget?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
            {stats.topSchemesByBudget && stats.topSchemesByBudget.length > 0 && (
              <Box sx={{ mt: 2 }}>
                {stats.topSchemesByBudget.map((scheme: any, index: number) => (
                  <Box key={scheme._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {index + 1}. {scheme.name.length > 40 ? scheme.name.substring(0, 40) + '...' : scheme.name}
                    </Typography>
                    <Chip 
                      label={formatCurrency(scheme.budget)} 
                      size="small" 
                      sx={{ bgcolor: COLORS[index % COLORS.length], color: 'white' }}
                    />
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Box>

        {/* Recent Activity */}
        <Box sx={{ flex: '1 1 100%' }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              <List>
                {stats.recentActivity.slice(0, 10).map((activity: any) => (
                  <ListItem key={activity._id}>
                    <ListItemIcon>
                      {getActivityIcon(activity.type, activity.action)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body1">
                            {activity.name}
                          </Typography>
                          <Chip
                            label={activity.action}
                            size="small"
                            color={getActionColor(activity.action)}
                          />
                          <Chip
                            label={activity.type}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={new Date(activity.date).toLocaleDateString()}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="textSecondary">
                No recent activity
              </Typography>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardPage;