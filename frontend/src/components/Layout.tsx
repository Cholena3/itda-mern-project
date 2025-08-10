import React from 'react';
import { Box } from '@mui/material';
import Navigation from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Navigation>
      <Box>
        {children}
      </Box>
    </Navigation>
  );
};

export default Layout;