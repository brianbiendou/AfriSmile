import { supabase } from './supabase';
import { Order, OrderItem } from '@/types/database';
import storage from '@/utils/storage';

const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes pour les commandes (données plus sensibles)
const CACHE_KEYS = {
  USER_ORDERS: 'cached_user_orders_',
  PROVIDER_ORDERS: 'cached_provider_orders_',
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

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const cacheKey = CACHE_KEYS.USER_ORDERS + userId;
    const cachedOrders = await getCachedData(cacheKey);
    if (cachedOrders) return cachedOrders;

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        providers (
          business_name,
          image_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user orders:', error);
      return [];
    }

    const orders = data || [];
    await setCachedData(cacheKey, orders);
    return orders;
  } catch (error) {
    console.error('Error in getUserOrders:', error);
    return [];
  }
};

export const getProviderOrders = async (providerId: string): Promise<Order[]> => {
  try {
    const cacheKey = CACHE_KEYS.PROVIDER_ORDERS + providerId;
    const cachedOrders = await getCachedData(cacheKey);
    if (cachedOrders) return cachedOrders;

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        users (
          first_name,
          last_name
        )
      `)
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching provider orders:', error);
      return [];
    }

    const orders = data || [];
    await setCachedData(cacheKey, orders);
    return orders;
  } catch (error) {
    console.error('Error in getProviderOrders:', error);
    return [];
  }
};

export const createOrder = async (orderData: {
  user_id: string;
  provider_id: string;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  points_used: number;
  payment_method: 'points' | 'mtn_money' | 'orange_money' | 'moov_money' | 'cash';
  delivery_address?: string;
  notes?: string;
  items: {
    product_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }[];
}): Promise<Order> => {
  try {
    // Créer la commande
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: orderData.user_id,
        provider_id: orderData.provider_id,
        total_amount: orderData.total_amount,
        discount_amount: orderData.discount_amount,
        final_amount: orderData.final_amount,
        points_used: orderData.points_used,
        payment_method: orderData.payment_method,
        delivery_address: orderData.delivery_address || null,
        notes: orderData.notes || null,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      throw new Error('Erreur lors de la création de la commande');
    }

    // Créer les items de la commande
    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      throw new Error('Erreur lors de la création des articles');
    }

    // Mettre à jour les points de l'utilisateur si paiement en points
    if (orderData.payment_method === 'points' && orderData.points_used > 0) {
      const { error: pointsError } = await supabase.rpc('update_user_points', {
        user_id: orderData.user_id,
        points_change: -orderData.points_used,
      });

      if (pointsError) {
        console.error('Error updating user points:', pointsError);
      }
    }

    // Invalider les caches
    await invalidateOrderCaches(orderData.user_id, orderData.provider_id);

    return order;
  } catch (error) {
    console.error('Error in createOrder:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erreur lors de la création de la commande');
  }
};

export const updateOrderStatus = async (
  orderId: string, 
  status: Order['status']
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ 
        status,
        delivered_at: status === 'delivered' ? new Date().toISOString() : null
      })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order status:', error);
      throw new Error('Erreur lors de la mise à jour du statut');
    }

    // Invalider tous les caches d'orders
    await invalidateAllOrderCaches();
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erreur lors de la mise à jour');
  }
};

// Fonction pour invalider les caches
const invalidateOrderCaches = async (userId: string, providerId: string) => {
  try {
    const userCacheKey = CACHE_KEYS.USER_ORDERS + userId;
    const providerCacheKey = CACHE_KEYS.PROVIDER_ORDERS + providerId;
    
    await Promise.all([
      storage.removeItem(userCacheKey),
      storage.removeItem(userCacheKey + CACHE_KEYS.TIMESTAMP),
      storage.removeItem(providerCacheKey),
      storage.removeItem(providerCacheKey + CACHE_KEYS.TIMESTAMP),
    ]);
  } catch (error) {
    console.error('Error invalidating order caches:', error);
  }
};

const invalidateAllOrderCaches = async () => {
  try {
    const keys = await storage.getAllKeys();
    const orderCacheKeys = keys.filter(key => 
      key.startsWith(CACHE_KEYS.USER_ORDERS) || 
      key.startsWith(CACHE_KEYS.PROVIDER_ORDERS)
    );
    
    if (orderCacheKeys.length > 0) {
      await storage.multiRemove(orderCacheKeys);
    }
  } catch (error) {
    console.error('Error invalidating all order caches:', error);
  }
};

// Fonction pour écouter les changements en temps réel
export const subscribeToUserOrders = (userId: string, callback: (orders: Order[]) => void) => {
  const subscription = supabase
    .channel(`user_orders_${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `user_id=eq.${userId}`,
      },
      async () => {
        const cacheKey = CACHE_KEYS.USER_ORDERS + userId;
        await storage.removeItem(cacheKey);
        await storage.removeItem(cacheKey + CACHE_KEYS.TIMESTAMP);
        const orders = await getUserOrders(userId);
        callback(orders);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};

export const subscribeToProviderOrders = (providerId: string, callback: (orders: Order[]) => void) => {
  const subscription = supabase
    .channel(`provider_orders_${providerId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `provider_id=eq.${providerId}`,
      },
      async () => {
        const cacheKey = CACHE_KEYS.PROVIDER_ORDERS + providerId;
        await storage.removeItem(cacheKey);
        await storage.removeItem(cacheKey + CACHE_KEYS.TIMESTAMP);
        const orders = await getProviderOrders(providerId);
        callback(orders);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};