import { Link } from 'react-router-dom';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import type { User,  } from './authTypes';


import { loginUser } from './authAPI';
import type { AppDispatch, RootState } from '@/store/store';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().min(6, 'At least 6 characters').required('Password is required'),
});

const Login: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, status, error } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user) {
      //navigate('/dashboard');
      const redirectTo = (user: User) => {
        switch (user.role) {
          case 'admin':
            return '/admin/dashboard';
          case 'shop_owner':
            return '/shop-owner/dashboard';
          default:
            return '/dashboard';
        }
      };
      
      //navigate(redirectTo(result.payload as UserData));
      navigate(redirectTo(user));

    }
  }, [user, navigate]);

  const handleLogin = async (
    values: { email: string; password: string },
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    try {
      const result = await dispatch(loginUser(values));
      
      if (loginUser.fulfilled.match(result)) {
        const user = result.payload;
        const role = user.role || 'customer';
      if (!user || !user.role) {
          throw new Error('Invalid user data received');
        }
  
  
        let path = '/dashboard';
        if (role === 'admin') path = '/admin/dashboard';
        else if (role === 'shop_owner') path = '/shop-owner/dashboard';
  
        toast.success('Login successful!');
        navigate(path);
      } else if (loginUser.rejected.match(result)) {
        const errorMessage = result.payload || 'Login failed';
        toast.error(typeof errorMessage === 'string' ? errorMessage : 'An error occurred');
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
      console.error('Login error:', err);
    } finally {
      setSubmitting(false);
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Sign in to your account
        </h2>

        <p className="text-center text-sm mb-6 text-gray-500">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="text-indigo-600 hover:underline"
          >
            Register here
          </Link>
        </p>

        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={handleLogin}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <label htmlFor="email" className="sr-only">Email</label>
                <Field
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Email address"
                  className="w-full px-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <ErrorMessage name="email" component="div" className="text-sm text-red-600" />
              </div>

              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <Field
                  type="password"
                  name="password"
                  id="password"
                  placeholder="Password"
                  className="w-full px-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <ErrorMessage name="password" component="div" className="text-sm text-red-600" />
              </div>

              {error && (
                <div className="text-sm text-red-600">
                  {typeof error === 'string' ? error : 'An error occurred'}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || status === 'loading'}
                className="w-full py-2 px-4 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isSubmitting || status === 'loading' ? 'Signing in...' : 'Sign In'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Login;