import { supabase } from './supabase';
import { Product } from '@/types/database';
import storage from '@/utils/storage';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const CACHE_KEYS = {
  PRODUCTS: 'cached_products_',
  UNSOLD_PRODUCTS: 'cached_unsold_products_',
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

export const getProviderProducts = async (providerId: string): Promise<Product[]> => {
  try {
    const cacheKey = CACHE_KEYS.PRODUCTS + providerId;
    const cachedProducts = await getCachedData(cacheKey);
    if (cachedProducts) return cachedProducts;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('provider_id', providerId)
      .eq('is_available', true)
      .order('is_popular', { ascending: false });

    if (error) {
      console.error('Error fetching provider products:', error);
      return [];
    }

    const products = data || [];
    await setCachedData(cacheKey, products);
    return products;
  } catch (error) {
    console.error('Error in getProviderProducts:', error);
    return [];
  }
};

export const getUnsoldProducts = async (providerId: string): Promise<any[]> => {
  try {
    // Vérifier si l'ID est un UUID valide
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(providerId)) {
      console.warn('Invalid UUID format for providerId:', providerId, '- returning mock data');
      return getMockUnsoldProducts();
    }

    const cacheKey = CACHE_KEYS.UNSOLD_PRODUCTS + providerId;
    const cachedProducts = await getCachedData(cacheKey);
    if (cachedProducts) return cachedProducts;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('provider_id', providerId)
      .eq('is_available', true)
      .eq('is_unsold', true)
      .gt('unsold_until', new Date().toISOString()) // Seulement les non-expirés
      .order('unsold_until', { ascending: true });

    if (error) {
      console.error('Error fetching unsold products:', error);
      // En cas d'erreur, retourner des données mockées
      return getMockUnsoldProducts();
    }

    // Formater les données pour l'interface
    const formattedProducts = (data || []).map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      original_price: product.points_price,
      unsold_price: product.unsold_price,
      image_url: product.image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      unsold_until: product.unsold_until,
      category: 'Invendus',
    }));

    await setCachedData(cacheKey, formattedProducts);
    return formattedProducts.length > 0 ? formattedProducts : getMockUnsoldProducts();
  } catch (error) {
    console.error('Error in getUnsoldProducts:', error);
    return getMockUnsoldProducts();
  }
};

// Fonction pour générer des données mockées d'invendus
const getMockUnsoldProducts = () => {
  const now = new Date();
  return [
    {
      id: 'unsold-1',
      name: 'Thiéboudiènne',
      description: 'Plat traditionnel sénégalais avec riz et poisson',
      original_price: 64, // 5000 FCFA en nouveaux points
      unsold_price: 43,   // 33% de réduction
      image_url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      unsold_until: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(), // 2h
      category: 'Invendus',
      discount_percentage: 33,
      quantity_remaining: 3
    },
    {
      id: 'unsold-2', 
      name: 'Yassa Poulet',
      description: 'Poulet mariné aux oignons et citron',
      original_price: 51, // 4000 FCFA en nouveaux points
      unsold_price: 31,   // 40% de réduction
      image_url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      unsold_until: new Date(now.getTime() + 1.5 * 60 * 60 * 1000).toISOString(), // 1.5h
      category: 'Invendus',
      discount_percentage: 40,
      quantity_remaining: 2
    },
    {
      id: 'unsold-3',
      name: 'Attieké Poisson',
      description: 'Attieké avec poisson grillé',
      original_price: 38,  // 3000 FCFA en nouveaux points
      unsold_price: 27,    // 29% de réduction
      image_url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      unsold_until: new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString(), // 3h
      category: 'Invendus',
      discount_percentage: 29,
      quantity_remaining: 5
    }
  ];
};

export const markProductAsUnsold = async (
  productId: string, 
  hoursUntilExpiry: number = 24
): Promise<void> => {
  try {
    const { error } = await supabase.rpc('mark_product_as_unsold', {
      product_id: productId,
      hours_until_expiry: hoursUntilExpiry,
    });

    if (error) {
      console.error('Error marking product as unsold:', error);
      throw new Error('Erreur lors du marquage du produit comme invendu');
    }

    // Invalider les caches
    await invalidateProductCaches(productId);
  } catch (error) {
    console.error('Error in markProductAsUnsold:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erreur lors du marquage');
  }
};

export const removeUnsoldStatus = async (productId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('products')
      .update({
        is_unsold: false,
        unsold_price: null,
        unsold_until: null,
      })
      .eq('id', productId);

    if (error) {
      console.error('Error removing unsold status:', error);
      throw new Error('Erreur lors de la suppression du statut invendu');
    }

    // Invalider les caches
    await invalidateProductCaches(productId);
  } catch (error) {
    console.error('Error in removeUnsoldStatus:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erreur lors de la suppression');
  }
};

// Fonction pour invalider les caches de produits
const invalidateProductCaches = async (productId: string) => {
  try {
    // Récupérer le provider_id du produit pour invalider le bon cache
    const { data: product } = await supabase
      .from('products')
      .select('provider_id')
      .eq('id', productId)
      .single();

    if (product) {
      const productsCacheKey = CACHE_KEYS.PRODUCTS + product.provider_id;
      const unsoldCacheKey = CACHE_KEYS.UNSOLD_PRODUCTS + product.provider_id;
      
      await Promise.all([
        storage.removeItem(productsCacheKey),
        storage.removeItem(productsCacheKey + CACHE_KEYS.TIMESTAMP),
        storage.removeItem(unsoldCacheKey),
        storage.removeItem(unsoldCacheKey + CACHE_KEYS.TIMESTAMP),
      ]);
    }
  } catch (error) {
    console.error('Error invalidating product caches:', error);
  }
};

// Fonction pour nettoyer automatiquement les produits expirés
export const cleanupExpiredUnsoldProducts = async (): Promise<void> => {
  try {
    const { error } = await supabase.rpc('cleanup_expired_unsold_products');

    if (error) {
      console.error('Error cleaning up expired unsold products:', error);
    }
  } catch (error) {
    console.error('Error in cleanupExpiredUnsoldProducts:', error);
  }
};

// Fonction pour écouter les changements en temps réel
export const subscribeToProviderProducts = (
  providerId: string, 
  callback: (products: Product[]) => void
) => {
  const subscription = supabase
    .channel(`products_${providerId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'products',
        filter: `provider_id=eq.${providerId}`,
      },
      async () => {
        const cacheKey = CACHE_KEYS.PRODUCTS + providerId;
        await storage.removeItem(cacheKey);
        await storage.removeItem(cacheKey + CACHE_KEYS.TIMESTAMP);
        const products = await getProviderProducts(providerId);
        callback(products);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};

export const subscribeToUnsoldProducts = (
  providerId: string, 
  callback: (products: any[]) => void
) => {
  const subscription = supabase
    .channel(`unsold_products_${providerId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'products',
        filter: `provider_id=eq.${providerId}`,
      },
      async () => {
        const cacheKey = CACHE_KEYS.UNSOLD_PRODUCTS + providerId;
        await storage.removeItem(cacheKey);
        storage.removeItem(cacheKey + CACHE_KEYS.TIMESTAMP);
        const products = await getUnsoldProducts(providerId);
        callback(products);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};