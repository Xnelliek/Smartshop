export interface DashboardStats {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalShops: number;
    totalProducts: number;
    totalReviews: number;
    monthlyGrowth: number;
  }
  
  export interface Shop {
    id: string;
    owner: string;
    name: string;
    description: string;
    category: string;
    logo: string;
    cover_image: string;
    phone: string;
    email: string;
    website: string;
    is_verified: boolean;
    rating: number;
    total_reviews: number;
  }
  
  export interface ShopProduct {
    id: string;
    shop: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    is_active: boolean;
  }
  
  export interface ShopService {
    id: string;
    shop: string;
    name: string;
    description: string;
    duration: number;
    price: number;
    is_active: boolean;
  }
  
  export interface Review {
    id: string;
    shop: string;
    user: string;
    rating: number;
    comment: string;
    created_at: string;
  }
  
  export interface Order {
    id: string;
    customer: string;
    date: string;
    amount: number;
    status: 'pending' | 'completed' | 'cancelled';
    products: string[];
  }