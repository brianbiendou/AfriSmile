import { supabase } from './supabase';
import { Provider } from '@/types/database';
import storage from '@/utils/storage';

const CACHE_KEY = 'cached_providers';
const CACHE_TIMESTAMP_KEY = 'cached_providers_timestamp';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Fonction utilitaire pour le cache
const getCachedProviders = async (): Promise<Provider[] | null> => {
  try {
    const [data, timestamp] = await Promise.all([
      storage.getItem(CACHE_KEY),
      storage.getItem(CACHE_TIMESTAMP_KEY),
    ]);
    
    if (data && timestamp) {
      const age = Date.now() - parseInt(timestamp);
      if (age < CACHE_DURATION) {
        return JSON.parse(data);
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting cached providers:', error);
    return null;
  }
};

const setCachedProviders = async (providers: Provider[]) => {
  try {
    await Promise.all([
      storage.setItem(CACHE_KEY, JSON.stringify(providers)),
      storage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString()),
    ]);
  } catch (error) {
    console.error('Error setting cached providers:', error);
  }
};

export const getProviders = async (): Promise<Provider[]> => {
  try {
    // Vérifier d'abord le cache
    const cachedProviders = await getCachedProviders();
    if (cachedProviders) {
      return cachedProviders;
    }

    // Fetch depuis Supabase
    const { data, error } = await supabase
      .from('providers')
      .select('*')
      .eq('is_active', true)
      .order('rating', { ascending: false });

    if (error) {
      console.error('Error fetching providers:', error);
      return [];
    }

    const providers = data || [];
    
    // Mettre en cache
    await setCachedProviders(providers);
    
    return providers;
  } catch (error) {
    console.error('Error in getProviders:', error);
    return [];
  }
};

export const getProviderById = async (id: string): Promise<Provider | null> => {
  try {
    const { data, error } = await supabase
      .from('providers')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching provider:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getProviderById:', error);
    return null;
  }
};

export const getProvidersByCategory = async (category: string): Promise<Provider[]> => {
  try {
    const { data, error } = await supabase
      .from('providers')
      .select('*')
      .eq('is_active', true)
      .ilike('category', `%${category}%`)
      .order('rating', { ascending: false });

    if (error) {
      console.error('Error fetching providers by category:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getProvidersByCategory:', error);
    return [];
  }
};

export const searchProviders = async (query: string): Promise<Provider[]> => {
  try {
    const { data, error } = await supabase
      .from('providers')
      .select('*')
      .eq('is_active', true)
      .or(`business_name.ilike.%${query}%,category.ilike.%${query}%,location.ilike.%${query}%`)
      .order('rating', { ascending: false });

    if (error) {
      console.error('Error searching providers:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in searchProviders:', error);
    return [];
  }
};

// Fonction pour écouter les changements en temps réel
export const subscribeToProviders = (callback: (providers: Provider[]) => void) => {
  const subscription = supabase
    .channel('providers_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'providers',
      },
      async () => {
        // Invalider le cache et recharger
        await storage.removeItem(CACHE_KEY);
        await storage.removeItem(CACHE_TIMESTAMP_KEY);
        const providers = await getProviders();
        callback(providers);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};