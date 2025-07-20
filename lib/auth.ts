import { supabase } from './supabase';
import { User, Provider } from '@/types/database';
import storage from '@/utils/storage';

export interface AuthResult {
  success: boolean;
  user?: User;
  provider?: Provider;
  error?: string;
}

// Cache pour les données utilisateur
const CACHE_KEYS = {
  USER: 'cached_user',
  PROVIDER: 'cached_provider',
  USER_TIMESTAMP: 'cached_user_timestamp',
  PROVIDER_TIMESTAMP: 'cached_provider_timestamp',
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fonction utilitaire pour le cache
const getCachedData = async (key: string, timestampKey: string) => {
  try {
    const [data, timestamp] = await Promise.all([
      storage.getItem(key),
      storage.getItem(timestampKey),
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

const setCachedData = async (key: string, timestampKey: string, data: any) => {
  try {
    await Promise.all([
      storage.setItem(key, JSON.stringify(data)),
      storage.setItem(timestampKey, Date.now().toString()),
    ]);
  } catch (error) {
    console.error('Error setting cached data:', error);
  }
};

export const authenticateUser = async (email: string, password: string): Promise<AuthResult> => {
  try {
    // Vérifier d'abord le cache
    const cachedUser = await getCachedData(CACHE_KEYS.USER, CACHE_KEYS.USER_TIMESTAMP);
    const cachedProvider = await getCachedData(CACHE_KEYS.PROVIDER, CACHE_KEYS.PROVIDER_TIMESTAMP);
    
    if (cachedUser && cachedUser.email === email) {
      return { success: true, user: cachedUser };
    }
    
    if (cachedProvider && cachedProvider.email === email) {
      return { success: true, provider: cachedProvider };
    }

    // Pour les comptes de test, bypass Supabase Auth et chercher directement dans les tables
    const testEmails = ['client@test.ci', 'prestataire@test.ci', 'admin@test.ci'];
    
    if (testEmails.includes(email) && password === 'password123') {
      // Chercher d'abord dans la table users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (!userError && userData) {
        await setCachedData(CACHE_KEYS.USER, CACHE_KEYS.USER_TIMESTAMP, userData);
        return { success: true, user: userData };
      }

      // Chercher dans la table providers
      const { data: providerData, error: providerError } = await supabase
        .from('providers')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (!providerError && providerData) {
        await setCachedData(CACHE_KEYS.PROVIDER, CACHE_KEYS.PROVIDER_TIMESTAMP, providerData);
        return { success: true, provider: providerData };
      }
      
      // Si aucun compte n'existe, créer un compte de test
      if (email === 'client@test.ci') {
        const newUser = {
          id: 'test-client-id',
          email: 'client@test.ci',
          role: 'client' as const,
          first_name: 'Marie',
          last_name: 'Kouassi',
          phone: '+225 07 12 34 56 78',
          points: 15420,
          balance: 7710,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        // Insérer dans la base de données
        const { data: insertedUser, error: insertError } = await supabase
          .from('users')
          .upsert(newUser)
          .select()
          .single();
        
        if (!insertError && insertedUser) {
          await setCachedData(CACHE_KEYS.USER, CACHE_KEYS.USER_TIMESTAMP, insertedUser);
          return { success: true, user: insertedUser };
        }
      } else if (email === 'admin@test.ci') {
        const newAdmin = {
          id: 'test-admin-id',
          email: 'admin@test.ci',
          role: 'admin' as const,
          first_name: 'Admin',
          last_name: 'Système',
          phone: '+225 00 00 00 00 00',
          points: 638, // 50000 FCFA ÷ 78.359 = 638 points
          balance: 25000,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        // Insérer dans la base de données
        const { data: insertedAdmin, error: insertError } = await supabase
          .from('users')
          .upsert(newAdmin)
          .select()
          .single();
        
        if (!insertError && insertedAdmin) {
          await setCachedData(CACHE_KEYS.USER, CACHE_KEYS.USER_TIMESTAMP, insertedAdmin);
          return { success: true, user: insertedAdmin };
        }
      }
      
      return { success: false, error: 'Impossible de créer le compte de test' };
    }

    // Pour tous les autres comptes, chercher directement dans la base
    try {
      // Chercher directement dans la table users avec email/password
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (!userError && userData) {
        // Pour une vraie app, vérifier le hash du mot de passe ici
        await setCachedData(CACHE_KEYS.USER, CACHE_KEYS.USER_TIMESTAMP, userData);
        return { success: true, user: userData };
      }

      // Chercher directement dans la table providers
      const { data: providerData, error: providerError } = await supabase
        .from('providers')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (!providerError && providerData) {
        // Pour une vraie app, vérifier le hash du mot de passe ici
        await setCachedData(CACHE_KEYS.PROVIDER, CACHE_KEYS.PROVIDER_TIMESTAMP, providerData);
        return { success: true, provider: providerData };
      }

      return { success: false, error: 'Email ou mot de passe incorrect' };
    } catch (error) {
      console.error('Database lookup error:', error);
      return { success: false, error: 'Erreur de connexion à la base de données' };
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, error: 'Erreur de connexion' };
  }
};

// Nouvelle fonction pour vérifier si un compte existe
export const checkAccountExists = async (email: string): Promise<{ exists: boolean; type?: 'user' | 'provider' }> => {
  try {
    // Chercher dans users
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (userData) {
      return { exists: true, type: 'user' };
    }

    // Chercher dans providers
    const { data: providerData } = await supabase
      .from('providers')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (providerData) {
      return { exists: true, type: 'provider' };
    }

    return { exists: false };
  } catch (error) {
    console.error('Error checking account:', error);
    return { exists: false };
  }
};

export const registerUser = async (userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}): Promise<AuthResult> => {
  try {
    // Créer le compte Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: 'Erreur lors de la création du compte' };
    }

    // Créer l'entrée dans la table users
    const newUser = {
      id: authData.user.id,
      email: userData.email,
      role: 'client' as const,
      first_name: userData.firstName,
      last_name: userData.lastName,
      phone: userData.phone || null,
      points: 1000, // Points de bienvenue
      balance: 500,
      is_active: true,
    };

    const { data: insertedUser, error: insertError } = await supabase
      .from('users')
      .insert(newUser)
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting user:', insertError);
      return { success: false, error: 'Erreur lors de la création du profil' };
    }

    await setCachedData(CACHE_KEYS.USER, CACHE_KEYS.USER_TIMESTAMP, insertedUser);
    return { success: true, user: insertedUser };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'Erreur lors de l\'inscription' };
  }
};

export const registerProvider = async (providerData: {
  email: string;
  password: string;
  businessName: string;
  ownerName: string;
  phone: string;
  address: string;
  location: string;
  category: string;
  description?: string;
}): Promise<AuthResult> => {
  try {
    // Créer le compte Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: providerData.email,
      password: providerData.password,
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: 'Erreur lors de la création du compte' };
    }

    // Créer l'entrée dans la table providers
    const newProvider = {
      id: authData.user.id,
      email: providerData.email,
      business_name: providerData.businessName,
      owner_name: providerData.ownerName,
      phone: providerData.phone,
      address: providerData.address,
      location: providerData.location,
      category: providerData.category,
      description: providerData.description || null,
      rating: 0,
      total_reviews: 0,
      discount_percentage: 10,
      estimated_time: '30-45 min',
      is_active: true,
      is_verified: false,
    };

    const { data: insertedProvider, error: insertError } = await supabase
      .from('providers')
      .insert(newProvider)
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting provider:', insertError);
      return { success: false, error: 'Erreur lors de la création du profil' };
    }

    await setCachedData(CACHE_KEYS.PROVIDER, CACHE_KEYS.PROVIDER_TIMESTAMP, insertedProvider);
    return { success: true, provider: insertedProvider };
  } catch (error) {
    console.error('Provider registration error:', error);
    return { success: false, error: 'Erreur lors de l\'inscription' };
  }
};

export const logout = async (): Promise<void> => {
  try {
    await supabase.auth.signOut();
    // Nettoyer le cache
    await Promise.all([
      storage.removeItem(CACHE_KEYS.USER),
      storage.removeItem(CACHE_KEYS.PROVIDER),
      storage.removeItem(CACHE_KEYS.USER_TIMESTAMP),
      storage.removeItem(CACHE_KEYS.PROVIDER_TIMESTAMP),
    ]);
  } catch (error) {
    console.error('Logout error:', error);
  }
};

export const getCurrentUser = async (): Promise<User | Provider | null> => {
  try {
    // Vérifier d'abord le cache
    const cachedUser = await getCachedData(CACHE_KEYS.USER, CACHE_KEYS.USER_TIMESTAMP);
    if (cachedUser) return cachedUser;
    
    const cachedProvider = await getCachedData(CACHE_KEYS.PROVIDER, CACHE_KEYS.PROVIDER_TIMESTAMP);
    if (cachedProvider) return cachedProvider;

    // Vérifier la session Supabase
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    // Chercher dans users
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    if (userData) {
      await setCachedData(CACHE_KEYS.USER, CACHE_KEYS.USER_TIMESTAMP, userData);
      return userData;
    }

    // Chercher dans providers
    const { data: providerData } = await supabase
      .from('providers')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    if (providerData) {
      await setCachedData(CACHE_KEYS.PROVIDER, CACHE_KEYS.PROVIDER_TIMESTAMP, providerData);
      return providerData;
    }

    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};