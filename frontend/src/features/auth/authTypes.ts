//export interface User {
//    id: string;
//    email: string;
//    name: string;
//    role: 'admin' | 'shop_owner' | 'customer';
//    token?: string;
//  }
  export interface Shop {
    id?: string;
    name?: string;
  }
  
  export interface User {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    token: string;
    role: 'admin' | 'shop_owner' | 'customer';
    phone?: string;
    shop?: Shop;
  }

  export interface UserData {
    id: string;
    email: string;
    name: string;
    token: string;
    role: 'admin' | 'shop_owner' | 'customer';
  }
  
  export interface LoginCredentials {
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
  }
  
  // Example payload for shop owner:
  const samplePayload = {
    username: 'shop owner1',
    email: 'shop@example.com',
    password: 'StrongPass123!',
    password2: 'StrongPass123!',
    first_name: 'John',
    last_name: 'Doe',
    user_type: 'shop_owner',
    phone: '+25434567890',
    terms: true,
    shop_name: 'My Shop',          // Required for shop_owner
    business_license: 'LIC12345'    // Required for shop_owner
  }