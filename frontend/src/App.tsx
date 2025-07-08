// src/App.tsx
//import React, { useEffect } from 'react';
import { useEffect } from 'react';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { loadUserFromToken } from './features/auth/authAPI';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import Dashboard from './pages/Dashboard'; // You can make this simple
import ProtectedRoute from './routes/ProtectedRoute';
import type { AppDispatch } from './store/store';

function App() {
  //const dispatch = useDispatch();
    const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(loadUserFromToken());
  }, [dispatch]);

  return (
    <Router>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Add fallback route */}
        <Route path="*" element={<div className="p-8 text-center text-lg">404 Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
