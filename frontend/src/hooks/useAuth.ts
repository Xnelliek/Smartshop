import { useState, useEffect } from 'react';
import axios from 'axios';
import { getToken, removeToken } from '../utils/auth' // Ensure this path is correct

type User = {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
};

const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // Verify token and get user info
        const response = await axios.get('http://localhost:8000/api/auth/user/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (err) {
        // Token is invalid or expired
        removeToken();
        const message = err instanceof Error ? err.message : 'Session expired. Please log in again.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/auth/login/', {
        email,
        password,
      });
      
      localStorage.setItem('smartshop_token', response.data.token);
      const userResponse = await axios.get('http://localhost:8000/api/auth/user/', {
        headers: {
          Authorization: `Bearer ${response.data.token}`,
        },
      });
      
      setUser(userResponse.data);
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      const message = err instanceof Error ? 
        (err as any).response?.data?.message || err.message : 
        'Login failed';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    removeToken();
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
  };
};

export default useAuth;