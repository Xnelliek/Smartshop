import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../store/store';


// Define DashboardStats
export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalReviews: number;
}

// Define DashboardState — single source of truth
export interface DashboardState {
  currentShop: { id: string } | null;
  stats: DashboardStats | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// ✅ Single initialState
const initialState: DashboardState = {
  currentShop: { id: 'shop-123' }, // or null initially
  stats: null,
  status: 'idle',
  error: null,
};

// Create slice
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setCurrentShop(state, action: PayloadAction<{ id: string } | null>) {
      state.currentShop = action.payload;
    },
    setStats(state, action: PayloadAction<DashboardStats | null>) {
      state.stats = action.payload;
    },
    setStatus(state, action: PayloadAction<DashboardState['status']>) {
      state.status = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const {
  setCurrentShop,
  setStats,
  setStatus,
  setError,
} = dashboardSlice.actions;

// Selectors
export const selectDashboardStats = (state: RootState) =>
  state.dashboard.stats || {
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalReviews: 0,
  };

export const selectDashboardStatus = (state: RootState) =>
  state.dashboard.status;

export const selectDashboardError = (state: RootState) =>
  state.dashboard.error;

export const selectCurrentShop = (state: RootState) =>
  state.dashboard.currentShop;

export default dashboardSlice.reducer;
