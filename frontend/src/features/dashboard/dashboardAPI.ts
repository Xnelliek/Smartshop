import axios from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import type {
  Shop,
  ShopProduct,
  //ShopService,
  Review,
  DashboardStats,
  //Order,
  //Product,
  //ShopCategory,
} from './dashboardTypes';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Helper function for error handling
const handleApiError = (error: any, rejectWithValue: any, defaultMessage: string) => {
  if (axios.isAxiosError(error)) {
    return rejectWithValue(error.response?.data || { detail: defaultMessage });
  }
  return rejectWithValue({ detail: defaultMessage });
};

// Dashboard Stats
export const fetchDashboardStats = createAsyncThunk<DashboardStats, void>(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/stats/`);
      return response.data;
    } catch (error) {
      return handleApiError(error, rejectWithValue, 'Failed to fetch stats');
    }
  }
);

// Shops
export const fetchShops = createAsyncThunk<Shop[], void>(
  'dashboard/fetchShops',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/shops/`);
      return response.data;
    } catch (error) {
      return handleApiError(error, rejectWithValue, 'Failed to fetch shops');
    }
  }
);

export const createShop = createAsyncThunk<Shop, Partial<Shop>>(
  'dashboard/createShop',
  async (shopData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/dashboard/shops/`, shopData);
      return response.data;
    } catch (error) {
      return handleApiError(error, rejectWithValue, 'Failed to create shop');
    }
  }
);

export const updateShop = createAsyncThunk<Shop, { id: string; data: Partial<Shop> }>(
  'dashboard/updateShop',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/dashboard/shops/${id}/`, data);
      return response.data;
    } catch (error) {
      return handleApiError(error, rejectWithValue, 'Failed to update shop');
    }
  }
);

export const deleteShop = createAsyncThunk<void, string>(
  'dashboard/deleteShop',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE_URL}/dashboard/shops/${id}/`);
    } catch (error) {
      return handleApiError(error, rejectWithValue, 'Failed to delete shop');
    }
  }
);

// Products
export const fetchProducts = createAsyncThunk<ShopProduct[], string>(
  'dashboard/fetchProducts',
  async (shopId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/shops/${shopId}/products/`);
      return response.data;
    } catch (error) {
      return handleApiError(error, rejectWithValue, 'Failed to fetch products');
    }
  }
);

export const createProduct = createAsyncThunk<ShopProduct, { shopId: string; data: Partial<ShopProduct> }>(
  'dashboard/createProduct',
  async ({ shopId, data }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/dashboard/shops/${shopId}/products/`, data);
      return response.data;
    } catch (error) {
      return handleApiError(error, rejectWithValue, 'Failed to create product');
    }
  }
);

export const updateProduct = createAsyncThunk<ShopProduct, { shopId: string; productId: string; data: Partial<ShopProduct> }>(
  'dashboard/updateProduct',
  async ({ shopId, productId, data }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/dashboard/shops/${shopId}/products/${productId}/`, data);
      return response.data;
    } catch (error) {
      return handleApiError(error, rejectWithValue, 'Failed to update product');
    }
  }
);

export const deleteProduct = createAsyncThunk<void, { shopId: string; productId: string }>(
  'dashboard/deleteProduct',
  async ({ shopId, productId }, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE_URL}/dashboard/shops/${shopId}/products/${productId}/`);
    } catch (error) {
      return handleApiError(error, rejectWithValue, 'Failed to delete product');
    }
  }
);

// Reviews
export const fetchReviews = createAsyncThunk<Review[], string>(
  'dashboard/fetchReviews',
  async (shopId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/shops/${shopId}/reviews/`);
      return response.data;
    } catch (error) {
      return handleApiError(error, rejectWithValue, 'Failed to fetch reviews');
    }
  }
);

export const createReview = createAsyncThunk<Review, { shopId: string; data: Partial<Review> }>(
  'dashboard/createReview',
  async ({ shopId, data }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/dashboard/shops/${shopId}/reviews/`, data);
      return response.data;
    } catch (error) {
      return handleApiError(error, rejectWithValue, 'Failed to create review');
    }
  }
);

// Analytics
export const fetchShopAnalytics = createAsyncThunk<any, string>(
  'dashboard/fetchShopAnalytics',
  async (shopId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/shops/${shopId}/analytics/`);
      return response.data;
    } catch (error) {
      return handleApiError(error, rejectWithValue, 'Failed to fetch analytics');
    }
  }
);
