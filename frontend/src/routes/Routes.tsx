// /src/routes/Routes.tsx
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Dashboard from '@/features/dashboard/Dashboard';
import Login from '@/features/auth/Login';
import Register from '@/features/auth/Register';
import Shops from '@/features/shops/Shops';
import Bookings from '@/features/bookings/ Bookings';
import Reviews from '@/features/reviews/Reviews';
import Media from '@/features/media/Media';
import Users from '@/features/auth/Users';
import NotFound from '@/components/NotFound';
import AdminDashboard from '@/features/dashboard/AdminDashboard';
import ShopOwnerDashboard from '@/features/dashboard/ShopOwnerDashboard';
import ShopSetup from '@/features/shops/ShopSetup';


const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/shop-owner/dashboard" element={<ShopOwnerDashboard />} />
        <Route path="/shops" element={<Shops />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/media" element={<Media />} />
        <Route path="/users" element={<Users />} />
        <Route path="/shop-setup" element={<ShopSetup />} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;