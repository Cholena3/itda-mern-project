import React from 'react';
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
  Grid
} from '@mui/material';
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
  ArrowForward
} from '@mui/icons-material';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  width: 50,
                  height: 50,
                  bgcolor: 'primary.main'
                }}
              >
                <AccountBalance />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  ITDA Parlakhemundi
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Integrated Tribal Development Agency
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<Login />}
              onClick={() => navigate('/login')}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                px: 3
              }}
            >
              Login
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          pt: 15,
          pb: 8
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 8 }}>
              <Typography variant="h2" gutterBottom sx={{ fontWeight: 700 }}>
                ITDA Parlakhemundi
              </Typography>
              <Typography variant="h5" gutterBottom sx={{ mb: 3, opacity: 0.95 }}>
                Empowering Tribal Communities Through Integrated Development
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
                The Integrated Tribal Development Agency (ITDA) Gajapati, headquartered at Mohana, 
                is dedicated to the socio-economic development of tribal communities in Gajapati district. 
                Covering 7 blocks with a significant tribal population including the PVTG Lanjia Saora community, 
                we implement various welfare schemes and development programs.
              </Typography>
              <Stack direction="row" spacing={2}>
                <Chip
                  icon={<LocationOn />}
                  label="Mohana, Parlakhemundi"
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
                <Chip
                  label="Est. 1979"
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Statistics Section */}
      <Container maxWidth="lg" sx={{ mt: -4, mb: 6 }}>
        <Grid container spacing={3}>
          {statsData.map((stat, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  borderTop: `4px solid ${stat.color}`,
                  height: '100%'
                }}
              >
                <Typography
                  variant="h3"
                  sx={{ fontWeight: 700, color: stat.color, mb: 1 }}
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
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
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
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Blocks Covered
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {['Mohana', 'R.Udayagiri', 'Nuagada', 'Rayagada', 'Gumma', 'Kashinagar', 'Gosani'].map((block) => (
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
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Special Focus
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                • PVTG (Particularly Vulnerable Tribal Groups) - Lanjia Saora<br />
                • 564 tribal villages across 7 blocks<br />
                • Focus on health, education, and livelihood<br />
                • Infrastructure development in remote areas
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Contact Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Head Office
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <LocationOn sx={{ mr: 1, color: 'primary.main', mt: 0.5 }} />
                <Typography variant="body2">
                  ITDA Office, Mohana<br />
                  Parlakhemundi, District: Gajapati<br />
                  Odisha - 761015
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Contact Us
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Phone sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="body2">+91-6815-253201</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Email sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="body2">itda.parlakhemundi@odisha.gov.in</Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Working Hours
              </Typography>
              <Typography variant="body2">
                Monday - Friday: 10:00 AM - 5:30 PM<br />
                Saturday: 10:00 AM - 1:30 PM<br />
                Sunday & Holidays: Closed
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 3 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="body2">
              © 2024 ITDA Parlakhemundi. All rights reserved.
            </Typography>
            <Typography variant="body2">
              Government of Odisha | ST & SC Development Department
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;