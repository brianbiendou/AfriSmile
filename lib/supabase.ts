import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Types pour TypeScript
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: 'client' | 'provider' | 'admin';
          first_name: string;
          last_name: string;
          phone: string | null;
          avatar_url: string | null;
          points: number;
          balance: number;
          location: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          role?: 'client' | 'provider' | 'admin';
          first_name: string;
          last_name: string;
          phone?: string | null;
          avatar_url?: string | null;
          points?: number;
          balance?: number;
          location?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: 'client' | 'provider' | 'admin';
          first_name?: string;
          last_name?: string;
          phone?: string | null;
          avatar_url?: string | null;
          points?: number;
          balance?: number;
          location?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      providers: {
        Row: {
          id: string;
          email: string;
          business_name: string;
          owner_name: string;
          phone: string;
          address: string;
          location: string;
          category: string;
          description: string | null;
          image_url: string | null;
          rating: number;
          total_reviews: number;
          discount_percentage: number;
          estimated_time: string;
          is_active: boolean;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          business_name: string;
          owner_name: string;
          phone: string;
          address: string;
          location: string;
          category: string;
          description?: string | null;
          image_url?: string | null;
          rating?: number;
          total_reviews?: number;
          discount_percentage?: number;
          estimated_time?: string;
          is_active?: boolean;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          business_name?: string;
          owner_name?: string;
          phone?: string;
          address?: string;
          location?: string;
          category?: string;
          description?: string | null;
          image_url?: string | null;
          rating?: number;
          total_reviews?: number;
          discount_percentage?: number;
          estimated_time?: string;
          is_active?: boolean;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          provider_id: string;
          category_id: string | null;
          name: string;
          description: string | null;
          price: number;
          points_price: number;
          image_url: string | null;
          is_popular: boolean;
          is_available: boolean;
          preparation_time: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          category_id?: string | null;
          name: string;
          description?: string | null;
          price: number;
          points_price: number;
          image_url?: string | null;
          is_popular?: boolean;
          is_available?: boolean;
          preparation_time?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          provider_id?: string;
          category_id?: string | null;
          name?: string;
          description?: string | null;
          price?: number;
          points_price?: number;
          image_url?: string | null;
          is_popular?: boolean;
          is_available?: boolean;
          preparation_time?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          provider_id: string;
          status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
          total_amount: number;
          discount_amount: number;
          final_amount: number;
          points_used: number;
          payment_method: 'points' | 'mtn_money' | 'orange_money' | 'moov_money' | 'cash';
          delivery_address: string | null;
          notes: string | null;
          estimated_delivery: string | null;
          delivered_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          provider_id: string;
          status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
          total_amount: number;
          discount_amount?: number;
          final_amount: number;
          points_used?: number;
          payment_method: 'points' | 'mtn_money' | 'orange_money' | 'moov_money' | 'cash';
          delivery_address?: string | null;
          notes?: string | null;
          estimated_delivery?: string | null;
          delivered_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          provider_id?: string;
          status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
          total_amount?: number;
          discount_amount?: number;
          final_amount?: number;
          points_used?: number;
          payment_method?: 'points' | 'mtn_money' | 'orange_money' | 'moov_money' | 'cash';
          delivery_address?: string | null;
          notes?: string | null;
          estimated_delivery?: string | null;
          delivered_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      kolofap_users: {
        Row: {
          id: string;
          user_id: string;
          gamertag: string;
          display_name: string;
          avatar_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          gamertag: string;
          display_name: string;
          avatar_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          gamertag?: string;
          display_name?: string;
          avatar_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      points_transactions: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          amount: number;
          type: 'transfer' | 'request' | 'payment';
          status: 'pending' | 'completed' | 'cancelled' | 'rejected';
          message: string | null;
          reference: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          receiver_id: string;
          amount: number;
          type: 'transfer' | 'request' | 'payment';
          status?: 'pending' | 'completed' | 'cancelled' | 'rejected';
          message?: string | null;
          reference?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          sender_id?: string;
          receiver_id?: string;
          amount?: number;
          type?: 'transfer' | 'request' | 'payment';
          status?: 'pending' | 'completed' | 'cancelled' | 'rejected';
          message?: string | null;
          reference?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};