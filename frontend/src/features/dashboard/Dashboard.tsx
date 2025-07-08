// src/features/dashboard/Dashboard.tsx

import React, { useEffect } from 'react';
import { Grid, Container, Typography, Button, Box } from '@mui/material';


import DashboardCard from './DashboardCard';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { fetchDashboardStats } from './dashboardAPI';
import { selectDashboardStats, selectDashboardStatus } from './dashboardSlice';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorMessage';

import {
  ShoppingCart as OrdersIcon,
  AttachMoney as RevenueIcon,
  Inventory as ProductsIcon,
  Star as ReviewsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface DashboardProps {
  children?: React.ReactNode;
}

const Dashboard: React.FC<DashboardProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const stats = useAppSelector(selectDashboardStats);
  const status = useAppSelector(selectDashboardStatus);
  const error = useAppSelector(state => state.dashboard.error);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  if (status === 'failed') {
    return <ErrorAlert message={error || 'Failed to load dashboard data'} />;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Show default dashboard UI if no children */}
      {!children && (
        <>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
              Dashboard Overview
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/dashboard/shops/new')}
            >
              Add New Shop
            </Button>
          </Box>

          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6} md={4} lg={3} >
              <DashboardCard
                title="Total Revenue"
                value={`$${stats?.totalRevenue?.toLocaleString() || '0'}`}
                icon={<RevenueIcon />}
                color="success"
                trend={{ value: '12%', direction: 'up' }}
                onClick={() => navigate('/dashboard/analytics/revenue')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <DashboardCard
                title="Total Orders"
                value={stats?.totalOrders?.toLocaleString() || '0'}
                icon={<OrdersIcon />}
                color="primary"
                trend={{ value: '5%', direction: 'up' }}
                onClick={() => navigate('/dashboard/orders')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <DashboardCard
                title="Total Products"
                value={stats?.totalProducts?.toLocaleString() || '0'}
                icon={<ProductsIcon />}
                color="info"
                trend={{ value: '8%', direction: 'up' }}
                onClick={() => navigate('/dashboard/products')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <DashboardCard
                title="Total Reviews"
                value={stats?.totalReviews?.toLocaleString() || '0'}
                icon={<ReviewsIcon />}
                color="warning"
                trend={{ value: '15%', direction: 'up' }}
                onClick={() => navigate('/dashboard/reviews')}
              />
            </Grid>
          </Grid>
        </>
      )}

      {/* Render children if provided */}
      {children}
    </Container>
  );
};

export default Dashboard;
