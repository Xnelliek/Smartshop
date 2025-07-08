import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { registerUser, loadUserFromToken } from './authAPI';
import type { RootState, AppDispatch } from '@/store/store';

// Base validation schema
const BaseSchema = Yup.object().shape({
  first_name: Yup.string().min(2).max(50).required('First name is required'),
  last_name: Yup.string().min(2).max(50).required('Last name is required'),
  username: Yup.string()
    .min(3)
    .max(20)
    .matches(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers and underscores allowed')
    .required('Username is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string()
    .min(8, 'At least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/, 'Must include upper, lower, number, and symbol')
    .required('Password is required'),
  password2: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Password confirmation is required'),
  user_type: Yup.string().required('Role is required'),
  phone: Yup.string()
    .matches(/^\+?\d{7,15}$/, 'Enter a valid phone number')
    .required('Phone number is required'),
  terms: Yup.boolean().oneOf([true], 'You must accept the terms'),
});

// Shop owner specific fields validation
const ShopOwnerSchema = Yup.object().shape({
  shop_name: Yup.string().required('Shop name is required'),
  business_license: Yup.string().required('Business license is required'),
});

// Combined validation schema
const RegisterSchema = Yup.lazy((values) => {
  let schema = BaseSchema;
  
  if (values.user_type === 'shop_owner') {
    schema = schema.concat(ShopOwnerSchema);
  }
  
  return schema;
});

const Register: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { status, error } = useSelector((state: RootState) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    const { terms, ...payload } = values;
    
    try {
      const result = await dispatch(registerUser(payload)).unwrap();
      
      // For shop owners, navigate to shop setup
      if (payload.user_type === 'shop_owner') {
        navigate('shops/shop-setup');
      } else {
        // For regular users, log them in automatically
        const loadResult = await dispatch(loadUserFromToken());
        
        if (loadUserFromToken.fulfilled.match(loadResult)) {
          const user = loadResult.payload;
          const path = user?.role === 'admin' ? '/admin/dashboard' : '/dashboard';
          navigate(path);
        }
      }
      
      toast.success('Registration successful!');
    } catch (error: any) {
      if (error?.detail) {
        toast.error(error.detail);
      } else if (error?.message) {
        toast.error(error.message);
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Create an account
        </h2>
        <p className="text-center text-sm mb-4 text-gray-500">
          Or{' '}
          <Link to="/login" className="text-indigo-600 hover:underline">
            sign in to your account
          </Link>
        </p>

        <Formik
          initialValues={{
            first_name: '',
            last_name: '',
            username: '',
            email: '',
            password: '',
            password2: '',
            user_type: 'customer',
            phone: '',
            terms: false,
            // Shop owner fields
            shop_name: '',
            business_license: ''
          }}
          validationSchema={RegisterSchema}
          onSubmit={handleSubmit}
        >
          {({ values, isSubmitting }) => (
            <Form className="space-y-4">
              {error && (
                <div className="text-red-600 text-sm bg-red-100 border border-red-400 p-2 rounded">
                  {typeof error === 'string' ? error : 'Registration failed'}
                </div>
              )}

              {/* Personal Information Fields */}
              <div className="flex gap-3">
                <div className="w-1/2">
                  <label className="block text-sm text-gray-700">First Name</label>
                  <Field name="first_name" className="input" />
                  <ErrorMessage name="first_name" component="div" className="text-red-500 text-xs" />
                </div>
                <div className="w-1/2">
                  <label className="block text-sm text-gray-700">Last Name</label>
                  <Field name="last_name" className="input" />
                  <ErrorMessage name="last_name" component="div" className="text-red-500 text-xs" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700">Username</label>
                <Field name="username" className="input" />
                <ErrorMessage name="username" component="div" className="text-red-500 text-xs" />
              </div>

              <div>
                <label className="block text-sm text-gray-700">Email</label>
                <Field name="email" type="email" className="input" />
                <ErrorMessage name="email" component="div" className="text-red-500 text-xs" />
              </div>

              <div>
                <label className="block text-sm text-gray-700">Phone</label>
                <Field name="phone" className="input" />
                <ErrorMessage name="phone" component="div" className="text-red-500 text-xs" />
              </div>

              <div>
                <label className="block text-sm text-gray-700">Role</label>
                <Field as="select" name="user_type" className="input">
                  <option value="customer">Customer</option>
                  <option value="shop_owner">Shop Owner</option>
                  <option value="admin">Admin</option>
                </Field>
                <ErrorMessage name="user_type" component="div" className="text-red-500 text-xs" />
              </div>

              {/* Shop Owner Specific Fields */}
              {values.user_type === 'shop_owner' && (
                <>
                  <div>
                    <label className="block text-sm text-gray-700">Shop Name</label>
                    <Field name="shop_name" className="input" />
                    <ErrorMessage name="shop_name" component="div" className="text-red-500 text-xs" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700">Business License</label>
                    <Field name="business_license" className="input" />
                    <ErrorMessage name="business_license" component="div" className="text-red-500 text-xs" />
                  </div>
                </>
              )}

              {/* Password Fields */}
              <div className="relative">
                <label className="block text-sm text-gray-700">Password</label>
                <Field
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-8 text-gray-500"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
                <ErrorMessage name="password" component="div" className="text-red-500 text-xs" />
              </div>

              <div>
                <label className="block text-sm text-gray-700">Confirm Password</label>
                <Field
                  name="password2"
                  type={showPassword ? 'text' : 'password'}
                  className="input"
                />
                <ErrorMessage name="password2" component="div" className="text-red-500 text-xs" />
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start">
                <Field type="checkbox" name="terms" className="mr-2 mt-1" />
                <label className="text-sm text-gray-700">
                  I agree to the{' '}
                  <Link to="/terms" className="text-indigo-600 hover:underline">Terms</Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>
                </label>
              </div>
              <ErrorMessage name="terms" component="div" className="text-red-500 text-xs" />

              <button
                type="submit"
                disabled={isSubmitting || status === 'loading'}
                className="w-full py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSubmitting || status === 'loading' ? 'Registering...' : 'Register'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Register;