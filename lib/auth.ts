import { User, Provider } from '@/types/database';

// Simulation d'une base de données en mémoire pour le développement
const mockUsers: User[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin',
    role: 'admin',
    first_name: 'Admin',
    last_name: 'System',
    phone: '+225 07 12 34 56 78',
    avatar_url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
    points: 15420,
    balance: 7710,
    location: 'Cocody, Abidjan',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }
];

const mockProviders: Provider[] = [
  {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'prest',
    business_name: 'Chez Tante Marie',
    owner_name: 'Marie Kouassi',
    phone: '+225 05 12 34 56 78',
    address: 'Rue des Jardins, Cocody',
    location: 'Cocody',
    category: 'Cuisine Africaine',
    description: 'Restaurant spécialisé dans la cuisine africaine traditionnelle',
    image_url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    rating: 4.8,
    total_reviews: 156,
    discount_percentage: 25,
    estimated_time: '25-35 min',
    is_active: true,
    is_verified: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }
];

export interface AuthResult {
  success: boolean;
  user?: User;
  provider?: Provider;
  error?: string;
}

export const authenticateUser = async (email: string, password: string): Promise<AuthResult> => {
  // Simulation d'un délai d'authentification
  await new Promise(resolve => setTimeout(resolve, 500));

  // Vérification admin
  if (email === 'admin' && password === '0106-YouDja') {
    return {
      success: true,
      user: mockUsers[0]
    };
  }

  // Vérification prestataire
  if (email === 'prest' && password === '2306-YouDj@@') {
    return {
      success: true,
      provider: mockProviders[0]
    };
  }

  // Simulation d'autres utilisateurs
  if (email.includes('@') && password.length >= 6) {
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      role: 'client',
      first_name: 'Nouvel',
      last_name: 'Utilisateur',
      phone: '',
      points: 0,
      balance: 0,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    return {
      success: true,
      user: newUser
    };
  }

  return {
    success: false,
    error: 'Email ou mot de passe incorrect'
  };
};

export const registerUser = async (userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}): Promise<AuthResult> => {
  // Simulation d'un délai d'inscription
  await new Promise(resolve => setTimeout(resolve, 500));

  // Vérification si l'email existe déjà
  if (userData.email === 'admin' || userData.email === 'prest') {
    return {
      success: false,
      error: 'Cet email est déjà utilisé'
    };
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    email: userData.email,
    role: 'client',
    first_name: userData.firstName,
    last_name: userData.lastName,
    phone: userData.phone,
    points: 1000, // Points de bienvenue
    balance: 500,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return {
    success: true,
    user: newUser
  };
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
  // Simulation d'un délai d'inscription
  await new Promise(resolve => setTimeout(resolve, 500));

  // Vérification si l'email existe déjà
  if (providerData.email === 'admin' || providerData.email === 'prest') {
    return {
      success: false,
      error: 'Cet email est déjà utilisé'
    };
  }

  const newProvider: Provider = {
    id: `provider-${Date.now()}`,
    email: providerData.email,
    business_name: providerData.businessName,
    owner_name: providerData.ownerName,
    phone: providerData.phone,
    address: providerData.address,
    location: providerData.location,
    category: providerData.category,
    description: providerData.description,
    rating: 0,
    total_reviews: 0,
    discount_percentage: 10, // Réduction par défaut
    estimated_time: '30-45 min',
    is_active: true,
    is_verified: false, // Nécessite une vérification
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return {
    success: true,
    provider: newProvider
  };
};