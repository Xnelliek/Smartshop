// src/store/store.ts

import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';

// ✅ Create the store first
export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActionPaths: ['payload.error'], // optional tweak
      },
    }),
});

// ✅ Correctly define types after store creation
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
