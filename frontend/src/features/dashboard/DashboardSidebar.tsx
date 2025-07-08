import React from 'react';
import { Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, useTheme } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ShoppingCart as OrdersIcon,
  Store as ShopIcon,
  People as CustomersIcon,
  Settings as SettingsIcon,
  BarChart as AnalyticsIcon,
  Inventory as ProductsIcon,
  Person as UserIcon,
  Receipt as ReportsIcon,
  Star as ReviewsIcon,
  Star as StarIcon ,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../hooks';
import { selectCurrentUser, selectCurrentShop } from '../auth/authSlice';
import Toolbar from '@mui/material/Toolbar';


const DashboardSidebar: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector(selectCurrentUser);
  const currentShop = useAppSelector(selectCurrentShop);

  const commonItems = [
    { text: 'Overview', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Products', icon: <ProductsIcon />, path: '/dashboard/products' },
    { text: 'Orders', icon: <OrdersIcon />, path: '/dashboard/orders' },
    { text: 'Reviews', icon: <ReviewsIcon />, path: '/dashboard/reviews' },
  ];

  const adminItems = [
    { text: 'Shops', icon: <ShopIcon />, path: '/dashboard/shops' },
    { text: 'Users', icon: <UserIcon />, path: '/dashboard/users' },
    { text: 'Analytics', icon: <AnalyticsIcon />, path: '/dashboard/analytics' },
    { text: 'Reports', icon: <ReportsIcon />, path: '/dashboard/reports' },
  ];

  const shopOwnerItems = [
    { text: 'My Shop', icon: <ShopIcon />, path: `/dashboard/shops/${currentShop?.id}` },
    { text: 'Sales', icon: <AnalyticsIcon />, path: '/dashboard/sales' },
  ];

  const customerItems = [
    { text: 'My Orders', icon: <OrdersIcon />, path: '/dashboard/my-orders' },
    { text: 'Wishlist', icon: <StarIcon />, path: '/dashboard/wishlist' },
    { text: 'My Reviews', icon: <ReviewsIcon />, path: '/dashboard/my-reviews' },
  ];

  const bottomItems = [
    { text: 'Settings', icon: <SettingsIcon />, path: '/dashboard/settings' },
  ];

  const getRoleSpecificItems = () => {
    if (!user) return [];
    switch (user.role) {
      case 'admin': return adminItems;
      case 'shop_owner': return shopOwnerItems;
      case 'customer': return customerItems;
      default: return [];
    }
  };

  const allItems = [...commonItems, ...getRoleSpecificItems(), ...bottomItems];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: theme.mixins.sidebar.width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: theme.mixins.sidebar.width,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.background.paper,
          borderRight: 'none',
        },
      }}
    >
      <Toolbar />
      <Divider />
      <List>
        {allItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => navigate(item.path)}
              selected={location.pathname.startsWith(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: theme.palette.action.selected,
                  '&:hover': {
                    backgroundColor: theme.palette.action.selected,
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default DashboardSidebar;