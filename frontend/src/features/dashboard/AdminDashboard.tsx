import React, { useState } from 'react';
import Dashboard from './Dashboard';
import { Tabs, Tab, Box, Paper } from '@mui/material';

import ShopsManagement from '../../components/ShopsManagement';
import UsersManagement from '../../components/UsersManagement';
import SystemAnalytics from '../../components/SystemAnalytics';
import ReportsGenerator from '../../components/ReportsGenerator';

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
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminDashboard: React.FC = () => {
  const [value, setValue] = useState(0);

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
          aria-label="admin tabs"
        >
          <Tab label="Shops Management" />
          <Tab label="Users Management" />
          <Tab label="System Analytics" />
          <Tab label="Reports" />
        </Tabs>
      </Paper>

      <TabPanel value={value} index={0}>
        <ShopsManagement />
      </TabPanel>

      <TabPanel value={value} index={1}>
        <UsersManagement />
      </TabPanel>

      <TabPanel value={value} index={2}>
        <SystemAnalytics />
      </TabPanel>

      <TabPanel value={value} index={3}>
        <ReportsGenerator />
      </TabPanel>
    </Dashboard>
  );
};

export default AdminDashboard;