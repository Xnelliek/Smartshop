// useAuth.ts
import { useSelector } from 'react-redux';
import type{ RootState } from '@/store/store';

export const useAuth = () => {
  const { user, status } = useSelector((state: RootState) => state.auth);

  return {
    isAuthenticated: !!user?.token,
    isLoading: status === 'loading',
    user,
  };
};