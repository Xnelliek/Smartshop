// src/pages/Dashboard.tsx
import React from 'react';
import { useAuth } from '../features/auth/useAuth';
import ShopOwnerDashboard from '../features/dashboard/ShopOwnerDashboard';
import AdminDashboard from '../features/dashboard/AdminDashboard';
import CustomerDashboard from '../features/dashboard/Dashboard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (user.role === 'shop_owner') return <ShopOwnerDashboard />;
  if (user.role === 'admin') return <AdminDashboard />;
  return <CustomerDashboard />;
};

export default Dashboard;
