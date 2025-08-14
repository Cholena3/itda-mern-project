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
  Chip,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import {
  Work,
  AccountTree,
  Assignment,
  CheckCircle,
  MonetizationOn,
  PieChartOutline,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { dashboardAPI } from '../services/api';

const COLORS = [
  '#2563eb', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#84cc16', // Lime
  '#f97316', // Orange
  '#6366f1'  // Indigo
];
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
  const [schemeChartType, setSchemeChartType] = useState<'pie' | 'bar'>('pie');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await dashboardAPI.getStats();
        
        if (data) {
          setStats(data);
        }
      } catch (err: any) {
        console.error('Dashboard error:', err);
        setError('Unable to load dashboard data. Please refresh the page.');
        // Set default data to prevent crashes
        setStats({
          totalSchemes: 0,
          totalProjects: 0,
          totalWorks: 0,
          totalBudget: 0,
          activeSchemes: 0,
          activeProjects: 0,
          activeWorks: 0,
          completedWorks: 0,
          recentActivity: [],
          schemeBudgets: [],
          workStatusDistribution: [],
          progressDistribution: [],
          budgetVsExpenditure: { totalBudget: 0, totalSpent: 0 },
          topSchemesByBudget: []
        });
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
  const schemeBudgetData = stats.schemeBudgets?.map((scheme: any, index: number) => ({
    name: scheme.name.length > 25 ? scheme.name.substring(0, 25) + '...' : scheme.name,
    value: scheme.projectsBudget || scheme.schemeBudget,
    fullName: scheme.name,
    percentage: 0 // Will be calculated later
  })) || [];
  
  // Calculate percentages for scheme budget data
  const totalSchemeBudget = schemeBudgetData.reduce((sum: number, item: any) => sum + item.value, 0);
  schemeBudgetData.forEach((item: any) => {
    item.percentage = totalSchemeBudget > 0 ? ((item.value / totalSchemeBudget) * 100).toFixed(1) : 0;
  });

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
        <Paper sx={{ p: 1.5, minWidth: 200 }}>
          <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
            {payload[0].payload.fullName || label}
          </Typography>
          <Typography variant="body2" color="primary">
            {formatCurrency(payload[0].value)}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {payload[0].payload.percentage}% of total
          </Typography>
        </Paper>
      );
    }
    return null;
  };
  
  const renderCustomLabel = (data: any) => {
    // Only show label for segments > 5%
    if (data.percentage > 5) {
      return `${data.percentage}%`;
    }
    return '';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        ITDA Gajapati - Dashboard
      </Typography>

      {/* Stats Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' } }}>
          <Card sx={{ bgcolor: '#fff', border: '2px solid #1976d2' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Schemes
                  </Typography>
                  <Typography variant="h5" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                    {stats.totalSchemes}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#4caf50', fontWeight: 500 }}>
                    {stats.activeSchemes} Active
                  </Typography>
                </Box>
                <AccountTree sx={{ fontSize: 40, color: '#1976d2' }} />
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' } }}>
          <Card sx={{ bgcolor: '#fff', border: '2px solid #9c27b0' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Projects
                  </Typography>
                  <Typography variant="h5" sx={{ color: '#9c27b0', fontWeight: 'bold' }}>
                    {stats.totalProjects}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#4caf50', fontWeight: 500 }}>
                    {stats.activeProjects} Active
                  </Typography>
                </Box>
                <Assignment sx={{ fontSize: 40, color: '#9c27b0' }} />
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' } }}>
          <Card sx={{ bgcolor: '#fff', border: '2px solid #4caf50' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Works
                  </Typography>
                  <Typography variant="h5" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                    {stats.totalWorks}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#2196f3', fontWeight: 500 }}>
                    {stats.completedWorks} Completed
                  </Typography>
                </Box>
                <Work sx={{ fontSize: 40, color: '#4caf50' }} />
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' } }}>
          <Card sx={{ bgcolor: '#fff', border: '2px solid #ff9800' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Budget
                  </Typography>
                  <Typography variant="h5" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
                    {formatCurrency(stats.totalBudget)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#ff9800', fontWeight: 500 }}>
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
        <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 48%' } }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Scheme-wise Budget Allocation
              </Typography>
              <ToggleButtonGroup
                value={schemeChartType}
                exclusive
                onChange={(e, value) => value && setSchemeChartType(value)}
                size="small"
              >
                <ToggleButton value="pie">
                  <PieChartOutline fontSize="small" />
                </ToggleButton>
                <ToggleButton value="bar">
                  <BarChartIcon fontSize="small" />
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <Box sx={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                {schemeChartType === 'pie' ? (
                  <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                    <Pie
                      data={schemeBudgetData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {schemeBudgetData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                ) : (
                  <BarChart 
                    data={schemeBudgetData.slice(0, 8)} 
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      tick={{ fontSize: 10 }}
                      interval={0}
                    />
                    <YAxis 
                      tickFormatter={(value) => `₹${(value/10000000).toFixed(1)}Cr`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="#8884d8">
                      {schemeBudgetData.slice(0, 8).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </Box>
            {/* Custom Legend for Pie Chart */}
            {schemeChartType === 'pie' && (
              <Box sx={{ mt: 2, maxHeight: 100, overflowY: 'auto' }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {schemeBudgetData.map((item: any, index: number) => (
                    <Box 
                      key={index} 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        width: 'calc(50% - 4px)',
                        mb: 0.5
                      }}
                    >
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: COLORS[index % COLORS.length],
                          mr: 1,
                          flexShrink: 0
                        }}
                      />
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontSize: '11px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                        title={item.fullName}
                      >
                        {item.name}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
            {/* Summary Statistics */}
            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="textSecondary">
                  Total Schemes: {schemeBudgetData.length}
                </Typography>
                <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                  Total Budget: {formatCurrency(totalSchemeBudget)}
                </Typography>
              </Box>
              {schemeChartType === 'bar' && schemeBudgetData.length > 10 && (
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                  Showing top 10 schemes by budget
                </Typography>
              )}
            </Box>
          </Paper>
        </Box>

        {/* Work Status Distribution */}
        <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 48%' } }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Work Status Distribution
            </Typography>
            <Box sx={{ width: '100%', height: 350 }}>
              <ResponsiveContainer>
                <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <Pie
                    data={workStatusData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={3}
                    dataKey="value"
                    label={({ value, percent }) => `${value} (${percent ? (percent * 100).toFixed(0) : 0}%)`}
                  >
                    {workStatusData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`${value} works`, 'Count']} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value: string) => (
                      <span style={{ fontSize: '12px' }}>
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            {/* Summary Statistics */}
            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="textSecondary">
                  Total Works: {stats.totalWorks}
                </Typography>
                <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
                  Completed: {stats.completedWorks}
                </Typography>
              </Box>
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