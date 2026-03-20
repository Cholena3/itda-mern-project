import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Container,
  Card,
  CardContent,
  Paper,
  Avatar,
  Divider,
  Chip,
  Stack,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  Login,
  Groups,
  School,
  Home,
  Water,
  Forest,
  Agriculture,
  LocalHospital,
  AccountBalance,
  Engineering,
  LocationOn,
  Phone,
  Email,
  ArrowForward,
  Facebook,
  Twitter,
  Instagram,
  YouTube,
  Menu as MenuIcon,
  Close
} from '@mui/icons-material';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    'Home',
    'About District', 
    'Directory',
    'Documents',
    'Notices',
    'Contact Us'
  ];

  const statsData = [
    { label: 'Tribal Population', value: '1,35,000+', color: '#1976d2' },
    { label: 'Villages Covered', value: '564', color: '#2e7d32' },
    { label: 'Active Projects', value: '47', color: '#ed6c02' },
    { label: 'Beneficiaries', value: '45,000+', color: '#9c27b0' }
  ];

  const schemes = [
    {
      icon: <Groups />,
      title: 'PVTG Development',
      description: 'Special programs for Lanjia Saora community'
    },
    {
      icon: <Home />,
      title: 'Tribal Housing',
      description: 'Pucca houses under Biju Pucca Ghar Yojana'
    },
    {
      icon: <Water />,
      title: 'Jal Jeevan Mission',
      description: 'Piped water supply to tribal habitations'
    },
    {
      icon: <School />,
      title: 'Education',
      description: 'EMRS and skill development centers'
    },
    {
      icon: <Agriculture />,
      title: 'Livelihood',
      description: 'OTELP+ and agricultural programs'
    },
    {
      icon: <Engineering />,
      title: 'Infrastructure',
      description: 'Roads, bridges and connectivity'
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Header with Login Button */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bgcolor: 'white',
          boxShadow: 1,
          zIndex: 1000
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              py: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
              <img
                src="/images/logo-odisha.png"
                alt="ITDA Logo"
                style={{
                  width: isMobile ? 45 : 70,
                  height: isMobile ? 45 : 70,
                  objectFit: 'contain'
                }}
              />
              <Box>
                <Typography variant={isMobile ? 'body1' : 'h6'} sx={{ fontWeight: 600, color: 'primary.main', lineHeight: 1.2 }}>
                  ITDA Paralakhemundi
                </Typography>
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', fontSize: { xs: '0.65rem', md: '0.75rem' } }}>
                  ST&SC Development
                </Typography>
                <Typography variant="caption" color="textSecondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                  Government of Odisha
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Shri Mohan Charan Majhi
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Hon'ble Chief Minister
                </Typography>
              </Box>
              <img
                src="/images/mohan-majhi-cm_2.png"
                alt="Hon'ble Chief Minister"
                style={{
                  width: 80,
                  height: 80,
                  objectFit: 'cover',
                  borderRadius: '50%',
                  border: '2px solid #1976d2'
                }}
              />
            </Box>
          </Box>
        </Container>
        
        {/* Navigation Bar */}
        <Box
          sx={{
            bgcolor: 'primary.main',
            width: '100%',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <Container maxWidth="lg">
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                minHeight: '48px'
              }}
            >
              {/* Desktop Navigation */}
              {!isMobile ? (
                <>
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 0,
                      '& > *': {
                        position: 'relative'
                      }
                    }}
                  >
                    {navItems.map((item, index) => (
                      <Button
                        key={item}
                        onClick={() => {
                          if (item === 'Home') {
                            navigate('/');
                          }
                        }}
                        sx={{
                          color: 'white',
                          px: { md: 2, lg: 3 },
                          py: 1.5,
                          borderRadius: 0,
                          textTransform: 'none',
                          fontSize: { md: '0.85rem', lg: '0.95rem' },
                          fontWeight: 500,
                          position: 'relative',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                            '&::after': {
                              width: '100%'
                            }
                          },
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: 0,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 0,
                            height: '3px',
                            backgroundColor: 'white',
                            transition: 'width 0.3s ease'
                          },
                          borderRight: index < navItems.length - 1 ? '1px solid rgba(255, 255, 255, 0.2)' : 'none'
                        }}
                      >
                        {item}
                      </Button>
                    ))}
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<Login />}
                    onClick={() => navigate('/login')}
                    sx={{
                      bgcolor: 'white',
                      color: 'primary.main',
                      textTransform: 'none',
                      px: 2,
                      py: 0.75,
                      mr: 2,
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.9)'
                      }
                    }}
                  >
                    Login
                  </Button>
                </>
              ) : (
                /* Mobile Navigation */
                <>
                  <IconButton
                    onClick={() => setMobileMenuOpen(true)}
                    sx={{ color: 'white', ml: 1 }}
                  >
                    <MenuIcon />
                  </IconButton>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<Login />}
                    onClick={() => navigate('/login')}
                    sx={{
                      bgcolor: 'white',
                      color: 'primary.main',
                      textTransform: 'none',
                      px: 1.5,
                      py: 0.5,
                      mr: 1,
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.9)'
                      }
                    }}
                  >
                    Login
                  </Button>
                </>
              )}
            </Box>
          </Container>
        </Box>
        
        {/* Mobile Menu Drawer */}
        <Drawer
          anchor="left"
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: 250,
              bgcolor: 'primary.main',
              color: 'white'
            }
          }}
        >
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Menu</Typography>
            <IconButton onClick={() => setMobileMenuOpen(false)} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </Box>
          <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }} />
          <List>
            {navItems.map((item) => (
              <ListItem key={item} disablePadding>
                <ListItemButton
                  onClick={() => {
                    if (item === 'Home') {
                      navigate('/');
                    }
                    setMobileMenuOpen(false);
                  }}
                  sx={{
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  <ListItemText primary={item} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>
      </Box>

      {/* Hero Section */}
      <Box
        sx={{
          background: 'white',
          color: 'primary.main',
          pt: { xs: 18, sm: 20, md: 25 },
          pb: { xs: 4, md: 8 }
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h2" gutterBottom sx={{ fontWeight: 700, color: 'primary.main', fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3.75rem' } }}>
                ITDA Paralakhemundi
              </Typography>
              <Typography variant="h5" gutterBottom sx={{ mb: 3, color: 'text.secondary', fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }}>
                Empowering Tribal Communities Through Integrated Development
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8, color: 'text.primary' }}>
                The Integrated Tribal Development Agency (ITDA), headquartered at Paralakhemundi, 
                is dedicated to the socio-economic development of tribal communities in the district. 
                Covering 5 blocks with a significant tribal population including the PVTG Lanjia Saora community, 
                we implement various welfare schemes and development programs.
              </Typography>
              <Stack direction="row" spacing={2}>
                <Chip
                  icon={<LocationOn />}
                  label="Paralakhemundi"
                  sx={{ bgcolor: 'rgba(25, 118, 210, 0.1)', color: 'primary.main' }}
                />
                <Chip
                  label="Est. 1979"
                  sx={{ bgcolor: 'rgba(25, 118, 210, 0.1)', color: 'primary.main' }}
                />
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Statistics Section */}
      <Container maxWidth="lg" sx={{ mt: { xs: -2, md: -4 }, mb: { xs: 3, md: 6 } }}>
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {statsData.map((stat, index) => (
            <Grid item xs={6} sm={6} md={3} key={index}>
              <Paper
                elevation={3}
                sx={{
                  p: { xs: 2, md: 3 },
                  textAlign: 'center',
                  borderTop: `4px solid ${stat.color}`,
                  height: '100%'
                }}
              >
                <Typography
                  variant="h3"
                  sx={{ fontWeight: 700, color: stat.color, mb: 1, fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' } }}
                >
                  {stat.value}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  {stat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Key Focus Areas */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 4, textAlign: 'center' }}>
          Our Key Focus Areas
        </Typography>
        <Grid container spacing={3}>
          {schemes.map((scheme, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      {scheme.icon}
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {scheme.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    {scheme.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Coverage Area */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 4, textAlign: 'center' }}>
            Our Coverage Area
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Blocks Covered
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {['Mohana', 'R.Udayagiri', 'Nuagada', 'Rayagada', 'Gumma'].map((block) => (
                  <Chip
                    key={block}
                    label={block}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontWeight: 500
                    }}
                  />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Special Focus
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                • PVTG (Particularly Vulnerable Tribal Groups) - Lanjia Saora<br />
                • 564 tribal villages across 5 blocks<br />
                • Focus on health, education, and livelihood<br />
                • Infrastructure development in remote areas
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Contact Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={4}>
              {/* Empty grid item for spacing */}
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 1.5 }}>
                  Office Address
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2, justifyContent: 'center' }}>
                  <LocationOn sx={{ mr: 1, color: 'primary.main', mt: 0.5 }} />
                  <Typography variant="body2" sx={{ textAlign: 'left' }}>
                    ITDA Office<br />
                    Paralakhemundi<br />
                    Gajapati District<br />
                    Odisha - 761200
                  </Typography>
                </Box>
                
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mt: 2, mb: 1.5 }}>
                  Contact Us
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, justifyContent: 'center' }}>
                  <Phone sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body2">+91-6815-253201</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'center' }}>
                  <Email sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body2">itda@odisha.gov.in</Typography>
                </Box>
                
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mt: 2, mb: 1.5 }}>
                  Follow Us
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 1.5 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: '#1877f2',
                      cursor: 'pointer',
                      '&:hover': { transform: 'scale(1.1)' },
                      transition: 'transform 0.2s'
                    }}
                  >
                    <Facebook />
                  </Avatar>
                  <Avatar 
                    sx={{ 
                      bgcolor: '#1da1f2',
                      cursor: 'pointer',
                      '&:hover': { transform: 'scale(1.1)' },
                      transition: 'transform 0.2s'
                    }}
                  >
                    <Twitter />
                  </Avatar>
                  <Avatar 
                    sx={{ 
                      bgcolor: '#e4405f',
                      cursor: 'pointer',
                      '&:hover': { transform: 'scale(1.1)' },
                      transition: 'transform 0.2s'
                    }}
                  >
                    <Instagram />
                  </Avatar>
                  <Avatar 
                    sx={{ 
                      bgcolor: '#ff0000',
                      cursor: 'pointer',
                      '&:hover': { transform: 'scale(1.1)' },
                      transition: 'transform 0.2s'
                    }}
                  >
                    <YouTube />
                  </Avatar>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              {/* Empty grid item for spacing */}
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 3 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="body2" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
              © 2024 ITDA. All rights reserved.
            </Typography>
            <Typography variant="body2" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
              Government of Odisha | ST & SC Development Department
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;