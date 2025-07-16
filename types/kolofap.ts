export interface KolofapUser {
  id: string;
  user_id: string; // Référence vers users table
  gamertag: string;
  display_name: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PointsTransaction {
  id: string;
  sender_id: string;
  receiver_id: string;
  amount: number;
  type: 'transfer' | 'request' | 'payment';
  status: 'pending' | 'completed' | 'cancelled' | 'rejected';
  message?: string;
  reference?: string;
  created_at: string;
  updated_at: string;
}

export interface PointsRequest {
  id: string;
  requester_id: string;
  target_id: string;
  amount: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  user_id: string;
  contact_user_id: string;
  contact_gamertag: string;
  contact_display_name: string;
  is_favorite: boolean;
  created_at: string;
}