import type { ReactNode } from 'react';
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline, Toolbar, useTheme, Snackbar, Alert } from '@mui/material';
import DashboardSidebar from './DashboardSidebar';
import DashboardAppBar from './DashboardAppBar';
import { useAppSelector } from '../../app/hooks';
import { selectNotification } from './dashboardSlice';

interface DashboardLayoutProps {
  children?: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const notification = useAppSelector(selectNotification);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <DashboardAppBar />
      <DashboardSidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          marginLeft: { sm: `${theme.mixins.sidebar.width}px` },
          width: { sm: `calc(100% - ${theme.mixins.sidebar.width}px)` },
        }}
      >
        <Toolbar />
        {children || <Outlet />}
      </Box>

      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={notification?.type || 'info'} sx={{ width: '100%' }}>
          {notification?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DashboardLayout;