import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import type { User } from './authTypes';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
  user_type: 'customer' | 'shop_owner' | 'admin';
  phone: string;
  terms: boolean;
  shop_name?: string;
  business_license?: string;
  admin_code?: string;
}

interface AuthResponse {
  access: string;
  refresh?: string;
  user: {
    id: string;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    role: 'admin' | 'shop_owner' | 'customer';
    phone?: string;
    shop?: {
      id?: string;
      name?: string;
    };
  };
}

interface DecodedToken {
  user_id: string;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  role?: 'admin' | 'shop_owner' | 'customer';
  exp?: number;
}

// Set base axios configuration
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || '/api';
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';

export const loginUser = createAsyncThunk<
  User,
  LoginCredentials,
  { rejectValue: { detail: string; errors?: Record<string, string[]> } }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await axios.post<AuthResponse>('/auth/login/', {
      email: credentials.email,
      password: credentials.password
    });

    if (!response.data.access) {
      throw new Error('No access token received');
    }

    const { user, access } = response.data;
    const userData: User = {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      token: access,
      role: user.role || 'customer',
      phone: user.phone,
      shop: user.shop
    };

    localStorage.setItem('smartshop_token', access);
    axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;

    return userData;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data || {};
      return rejectWithValue({
        detail: errorData.detail || error.message || 'Login failed',
        errors: errorData
      });
    }
    return rejectWithValue({
      detail: error.message || 'Login failed'
    });
  }
});

export const registerUser = createAsyncThunk<
  User,
  RegisterData,
  { rejectValue: { detail: string; errors?: Record<string, string[]> } }
>('auth/register', async (userData, { rejectWithValue }) => {
  try {
    // Client-side validation
    if (userData.password !== userData.password2) {
      return rejectWithValue({
        detail: "Passwords don't match",
        errors: { password2: ["Passwords don't match"] }
      });
    }

    const payload = {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      password2: userData.password2,
      first_name: userData.first_name,
      last_name: userData.last_name,
      user_type: userData.user_type,
      phone: userData.phone,
      ...(userData.user_type === 'shop_owner' && {
        shop_name: userData.shop_name,
        business_license: userData.business_license
      }),
      ...(userData.user_type === 'admin' && {
        admin_code: userData.admin_code
      })
    };

    const response = await axios.post<AuthResponse>('/auth/register/', payload);

    const { user, access } = response.data;
    const registeredUser: User = {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      token: access,
      role: user.role || userData.user_type,
      phone: user.phone,
      shop: user.shop
    };

    localStorage.setItem('smartshop_token', access);
    axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;

    return registeredUser;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data || {};
      return rejectWithValue({
        detail: errorData.detail || 'Registration failed',
        errors: errorData
      });
    }
    return rejectWithValue({
      detail: error.message || 'Registration failed'
    });
  }
});

export const loadUserFromToken = createAsyncThunk<
  User | null,
  void,
  { rejectValue: { detail: string } }
>('auth/loadUserFromToken', async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('smartshop_token');
    if (!token) return null;

    const decoded = jwtDecode<DecodedToken>(token);
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      localStorage.removeItem('smartshop_token');
      return null;
    }

    try {
      const response = await axios.get<{
        id: string;
        email: string;
        username: string;
        first_name: string;
        last_name: string;
        role: string;
        phone?: string;
        shop?: {
          id?: string;
          name?: string;
        };
      }>('/auth/user/', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const userData = response.data;
      return {
        id: userData.id,
        email: userData.email,
        username: userData.username,
        firstName: userData.first_name,
        lastName: userData.last_name,
        token,
        role: userData.role as 'admin' | 'shop_owner' | 'customer',
        phone: userData.phone,
        shop: userData.shop ? {
          id: userData.shop.id,
          name: userData.shop.name
        } : undefined
      };
    } catch (error) {
      // Fallback to decoded token
      return {
        id: decoded.user_id,
        email: decoded.email,
        username: decoded.username,
        firstName: decoded.first_name || '',
        lastName: decoded.last_name || '',
        token,
        role: (decoded.role as 'admin' | 'shop_owner' | 'customer') || 'customer'
      };
    }
  } catch (error) {
    localStorage.removeItem('smartshop_token');
    return rejectWithValue({
      detail: 'Invalid or expired token. Please login again.'
    });
  }
});

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    try {
      await axios.post('/auth/logout/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('smartshop_token');
      delete axios.defaults.headers.common['Authorization'];
    }
  }
);