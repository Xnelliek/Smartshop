import React, { useState } from 'react';
import Dashboard from './Dashboard';
import { Tabs, Tab, Box, Paper, Button, Typography } from '@mui/material';
import { Grid} from '@mui/material';

import ShopPerformanceChart from '../../components/charts/ShopPerformanceChart';
import ProductListTable from '../../components/tables/ProductListTable';
import { ReviewList } from '@/components/ReviewList';
import { OrderAnalytics } from '../../components/OrderAnalytics';
import {InventoryStatus} from '../../components/InventoryStatus';
import ShopFormModal from '../../components/modals/ShopFormModal';
import ProductFormModal from '../../components/modals/ProductFormModal';
import { useAppSelector } from '../../hooks';
import { selectCurrentShop } from './dashboardSlice';


interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`shop-tabpanel-${index}`}
      aria-labelledby={`shop-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ShopOwnerDashboard: React.FC = () => {
  const [value, setValue] = useState(0);
  const [openShopModal, setOpenShopModal] = useState(false);
  const [openProductModal, setOpenProductModal] = useState(false);
  const currentShop = useAppSelector(selectCurrentShop);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Dashboard>
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={value}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="shop owner tabs"
        >
          <Tab label="Overview" />
          <Tab label="Products" />
          <Tab label="Orders" />
          <Tab label="Reviews" />
          <Tab label="Analytics" />
        </Tabs>
      </Paper>

      <TabPanel value={value} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8} >     <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h5">Shop Performance</Typography>
              <Button 
                variant="outlined" 
                onClick={() => setOpenShopModal(true)}
              >
                Edit Shop
              </Button>
            </Box>
            <ShopPerformanceChart shopId={currentShop?.id || ''} />
          </Grid>
          <Grid item xs={12} md={4} >
            <InventoryStatus shopId={currentShop?.id || ''} />
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={value} index={1}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">Product Management</Typography>
          <Button 
            variant="contained" 
            onClick={() => setOpenProductModal(true)}
          >
            Add Product
          </Button>
        </Box>
        <ProductListTable shopId={currentShop?.id || ''} />
      </TabPanel>

      <TabPanel value={value} index={2}>
        <OrderAnalytics shopId={currentShop?.id || ''} />
      </TabPanel>

      <TabPanel value={value} index={3}>
        <ReviewList shopId={currentShop?.id || ''} />
      </TabPanel>

      <TabPanel value={value} index={4}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} >
            <Typography variant="h5" gutterBottom>Sales Analytics</Typography>
            {/* Sales chart component would go here */}
          </Grid>
          <Grid item xs={12} md={6} >
            <Typography variant="h5" gutterBottom>Customer Demographics</Typography>
            {/* Demographics chart component would go here */}
          </Grid>
        </Grid>
      </TabPanel>

      <ShopFormModal 
        open={openShopModal} 
        onClose={() => setOpenShopModal(false)} 
        shop={currentShop} 
      />
      <ProductFormModal 
        open={openProductModal} 
        onClose={() => setOpenProductModal(false)} 
        shopId={currentShop?.id || ''} 
      />
    </Dashboard>
  );
};

export default ShopOwnerDashboard;