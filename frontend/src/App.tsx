import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Context
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';

// Components
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import AIAssistant from './components/AIAssistant';
import NotificationCenter from './components/NotificationCenter';
import OnlineUsersIndicator from './components/OnlineUsersIndicator';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import SchemesPage from './pages/SchemesPage';
import ProjectsPage from './pages/ProjectsPage';
import WorksPage from './pages/WorksPage';
import FilteredViewPage from './pages/FilteredViewPage';
import MonitoringPage from './pages/MonitoringPage';
import AdvancedSearch from './components/AdvancedSearch';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <SocketProvider>
            <Router>
              <Toaster position="top-right" />
              <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Private Routes */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Layout>
                      <DashboardPage />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/schemes"
                element={
                  <PrivateRoute>
                    <Layout>
                      <SchemesPage />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/projects"
                element={
                  <PrivateRoute>
                    <Layout>
                      <ProjectsPage />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/works"
                element={
                  <PrivateRoute>
                    <Layout>
                      <WorksPage />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/filter"
                element={
                  <PrivateRoute>
                    <Layout>
                      <FilteredViewPage />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/search"
                element={
                  <PrivateRoute>
                    <Layout>
                      <AdvancedSearch />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/monitoring"
                element={
                  <PrivateRoute>
                    <Layout>
                      <MonitoringPage />
                    </Layout>
                  </PrivateRoute>
                }
              />
              
              {/* Default redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            
            {/* Global Components */}
            <AIAssistant />
          </Router>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
