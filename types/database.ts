export interface User {
  id: string;
  email: string;
  role: 'client' | 'provider' | 'admin';
  first_name: string;
  last_name: string;
  phone?: string;
  avatar_url?: string;
  points: number;
  balance: number;
  location?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Provider {
  id: string;
  email: string;
  business_name: string;
  owner_name: string;
  phone: string;
  address: string;
  location: string;
  category: string;
  description?: string;
  image_url?: string;
  rating: number;
  total_reviews: number;
  discount_percentage: number;
  estimated_time: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  provider_id: string;
  category_id?: string;
  name: string;
  description?: string;
  price: number;
  points_price: number;
  image_url?: string;
  is_popular: boolean;
  is_available: boolean;
  preparation_time: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  provider_id: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  points_used: number;
  payment_method: 'points' | 'mtn_money' | 'orange_money' | 'moov_money' | 'cash';
  delivery_address?: string;
  notes?: string;
  estimated_delivery?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface Transaction {
  id: string;
  user_id: string;
  order_id?: string;
  type: 'recharge' | 'payment' | 'refund' | 'cashback';
  amount: number;
  points_amount: number;
  payment_method?: 'points' | 'mtn_money' | 'orange_money' | 'moov_money' | 'cash';
  description?: string;
  reference?: string;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  provider_id: string;
  order_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  is_active: boolean;
  created_at: string;
}