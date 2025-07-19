import { supabase } from './supabase';
import { KolofapUser, PointsTransaction, PointsRequest, Contact } from '@/types/kolofap';
import storage from '@/utils/storage';

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const CACHE_KEYS = {
  KOLOFAP_USER: 'cached_kolofap_user_',
  TRANSACTIONS: 'cached_transactions_',
  CONTACTS: 'cached_contacts_',
  TIMESTAMP: '_timestamp',
};

// Utility functions for caching
const getCachedData = async (key: string): Promise<any | null> => {
  try {
    const [data, timestamp] = await Promise.all([
      storage.getItem(key),
      storage.getItem(key + CACHE_KEYS.TIMESTAMP),
    ]);
    
    if (data && timestamp) {
      const age = Date.now() - parseInt(timestamp);
      if (age < CACHE_DURATION) {
        return JSON.parse(data);
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting cached data:', error);
    return null;
  }
};

const setCachedData = async (key: string, data: any) => {
  try {
    await Promise.all([
      storage.setItem(key, JSON.stringify(data)),
      storage.setItem(key + CACHE_KEYS.TIMESTAMP, Date.now().toString()),
    ]);
  } catch (error) {
    console.error('Error setting cached data:', error);
  }
};

export const getKolofapUser = async (userId: string): Promise<KolofapUser | null> => {
  try {
    const cacheKey = CACHE_KEYS.KOLOFAP_USER + userId;
    const cachedUser = await getCachedData(cacheKey);
    if (cachedUser) return cachedUser;

    const { data, error } = await supabase
      .from('kolofap_users')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching kolofap user:', error);
      return null;
    }

    if (data) {
      await setCachedData(cacheKey, data);
    }

    return data || null;
  } catch (error) {
    console.error('Error in getKolofapUser:', error);
    return null;
  }
};

export const createKolofapUser = async (userData: {
  user_id: string;
  gamertag: string;
  display_name: string;
  avatar_url?: string;
}): Promise<KolofapUser> => {
  try {
    const { data, error } = await supabase
      .from('kolofap_users')
      .insert({
        user_id: userData.user_id,
        gamertag: userData.gamertag,
        display_name: userData.display_name,
        avatar_url: userData.avatar_url || null,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating kolofap user:', error);
      throw new Error('Erreur lors de la création du profil Kolofap');
    }

    // Mettre en cache
    const cacheKey = CACHE_KEYS.KOLOFAP_USER + userData.user_id;
    await setCachedData(cacheKey, data);

    return data;
  } catch (error) {
    console.error('Error in createKolofapUser:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erreur lors de la création du profil');
  }
};

export const searchUserByGamertag = async (gamertag: string): Promise<KolofapUser | null> => {
  try {
    const { data, error } = await supabase
      .from('kolofap_users')
      .select('*')
      .eq('gamertag', gamertag)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error searching user by gamertag:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Error in searchUserByGamertag:', error);
    return null;
  }
};

export const sendPoints = async (transactionData: {
  sender_id: string;
  receiver_gamertag: string;
  amount: number;
  message?: string;
}): Promise<PointsTransaction> => {
  try {
    // Trouver le destinataire
    const receiver = await searchUserByGamertag(transactionData.receiver_gamertag);
    if (!receiver) {
      throw new Error('Utilisateur introuvable');
    }

    // Créer la transaction
    const { data, error } = await supabase
      .from('points_transactions')
      .insert({
        sender_id: transactionData.sender_id,
        receiver_id: receiver.id,
        amount: transactionData.amount,
        type: 'transfer',
        status: 'completed',
        message: transactionData.message || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating transaction:', error);
      throw new Error('Erreur lors du transfert');
    }

    // Mettre à jour les soldes des utilisateurs
    await updateUserPoints(transactionData.sender_id, -transactionData.amount);
    await updateUserPoints(receiver.user_id, transactionData.amount);

    // Invalider les caches
    await invalidateTransactionCache(transactionData.sender_id);
    await invalidateTransactionCache(receiver.id);

    return data;
  } catch (error) {
    console.error('Error in sendPoints:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erreur lors du transfert');
  }
};

// Fonction utilitaire pour mettre à jour les points d'un utilisateur
const updateUserPoints = async (userId: string, pointsChange: number) => {
  try {
    const { error } = await supabase.rpc('update_user_points', {
      user_id: userId,
      points_change: pointsChange,
    });

    if (error) {
      console.error('Error updating user points:', error);
    }
  } catch (error) {
    console.error('Error in updateUserPoints:', error);
  }
};

export const requestPoints = async (requestData: {
  requester_id: string;
  target_gamertag: string;
  amount: number;
  message?: string;
}): Promise<PointsRequest> => {
  try {
    const target = await searchUserByGamertag(requestData.target_gamertag);
    if (!target) {
      throw new Error('Utilisateur introuvable');
    }

    const { data, error } = await supabase
      .from('points_requests')
      .insert({
        requester_id: requestData.requester_id,
        target_id: target.id,
        amount: requestData.amount,
        message: requestData.message || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating points request:', error);
      throw new Error('Erreur lors de la demande');
    }

    return data;
  } catch (error) {
    console.error('Error in requestPoints:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erreur lors de la demande');
  }
};

export const getTransactionHistory = async (userId: string): Promise<PointsTransaction[]> => {
  try {
    const cacheKey = CACHE_KEYS.TRANSACTIONS + userId;
    const cachedTransactions = await getCachedData(cacheKey);
    if (cachedTransactions) return cachedTransactions;

    const { data, error } = await supabase
      .from('points_transactions')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }

    const transactions = data || [];
    await setCachedData(cacheKey, transactions);
    return transactions;
  } catch (error) {
    console.error('Error in getTransactionHistory:', error);
    return [];
  }
};

// Fonction pour invalider le cache des transactions
const invalidateTransactionCache = async (userId: string) => {
  try {
    const cacheKey = CACHE_KEYS.TRANSACTIONS + userId;
    await storage.removeItem(cacheKey);
    await storage.removeItem(cacheKey + CACHE_KEYS.TIMESTAMP);
  } catch (error) {
    console.error('Error invalidating transaction cache:', error);
  }
};

export const getContacts = async (userId: string): Promise<Contact[]> => {
  try {
    const cacheKey = CACHE_KEYS.CONTACTS + userId;
    const cachedContacts = await getCachedData(cacheKey);
    if (cachedContacts) return cachedContacts;

    const { data, error } = await supabase
      .from('kolofap_contacts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching contacts:', error);
      return [];
    }

    const contacts = data || [];
    await setCachedData(cacheKey, contacts);
    return contacts;
  } catch (error) {
    console.error('Error in getContacts:', error);
    return [];
  }
};

export const addContact = async (userId: string, gamertag: string): Promise<Contact> => {
  try {
    const user = await searchUserByGamertag(gamertag);
    if (!user) {
      throw new Error('Utilisateur introuvable');
    }

    const { data, error } = await supabase
      .from('kolofap_contacts')
      .insert({
        user_id: userId,
        contact_user_id: user.id,
        contact_gamertag: user.gamertag,
        contact_display_name: user.display_name,
        is_favorite: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding contact:', error);
      throw new Error('Erreur lors de l\'ajout du contact');
    }

    // Invalider le cache des contacts
    const cacheKey = CACHE_KEYS.CONTACTS + userId;
    await storage.removeItem(cacheKey);
    await storage.removeItem(cacheKey + CACHE_KEYS.TIMESTAMP);

    return data;
  } catch (error) {
    console.error('Error in addContact:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erreur lors de l\'ajout');
  }
};

// Fonction pour écouter les changements en temps réel
export const subscribeToTransactions = (userId: string, callback: (transactions: PointsTransaction[]) => void) => {
  const subscription = supabase
    .channel(`transactions_${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'points_transactions',
        filter: `or(sender_id.eq.${userId},receiver_id.eq.${userId})`,
      },
      async () => {
        await invalidateTransactionCache(userId);
        const transactions = await getTransactionHistory(userId);
        callback(transactions);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};