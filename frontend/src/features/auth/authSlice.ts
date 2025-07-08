// src/features/auth/authSlice.ts

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { loginUser, registerUser } from './authAPI';
import type { RootState } from '@/store/store';


export interface User {
  id: string;
  email: string;
  name: string;
  token: string;
  role: 'admin' | 'shop_owner' | 'customer';
}

interface AuthState {
  user: User | null;
  currentShop: Shop | null; 
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

export interface Shop {
  id: string;
  name: string;
  // add more shop fields here later
}

const initialState: AuthState = {
  user: null,
  currentShop: null,
  status: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAuthState: () => initialState,

    logout: (state) => {
      state.user = null;
      state.status = 'idle';
      state.error = null;
      localStorage.removeItem('smartshop_token');
    },

    clearErrors: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    // LOGIN
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = 'succeeded';
        state.user = action.payload;
        localStorage.setItem('smartshop_token', action.payload.token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.detail || action.error.message || 'Login failed';
      });
      

    // REGISTER
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = 'succeeded';
        state.user = action.payload;
        localStorage.setItem('smartshop_token', action.payload.token);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.detail || action.error.message || 'Registration failed';
      });
  },
});

export const { resetAuthState, logout, clearErrors } = authSlice.actions;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectCurrentShop = (state: RootState) => state.auth.currentShop;

export default authSlice.reducer;
