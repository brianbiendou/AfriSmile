import React, { createContext, useContext, useState, useEffect } from 'react';
import storage from '@/utils/storage';
import { supabase } from '@/lib/supabase';
import { 
  canAutoReconnect, 
  performAutoReconnect, 
  saveReconnectionData, 
  clearReconnectionData,
  getReconnectionInfo 
} from '@/utils/autoReconnect';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  points: number;
  balance: number;
  role: string;
  membershipType: 'classic' | 'gold';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  provider: any;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  userType: 'user' | 'provider' | null;
  updateUserPoints: (pointsChange: number) => Promise<void>;
  addUserPoints: (pointsToAdd: number) => Promise<void>;
  updateMembershipType: (newType: 'classic' | 'gold') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [provider, setProvider] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Charger les données utilisateur depuis le stockage
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      // 1. Vérifier s'il y a une session active
      const savedUser = await storage.getItem('current_user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        console.log('🔄 Session utilisateur restaurée:', userData.email);
        setIsLoading(false);
        return;
      }

      // 2. Vérifier si une reconnexion automatique est possible
      const canReconnect = await canAutoReconnect();
      if (canReconnect) {
        console.log('🔄 Tentative de reconnexion automatique...');
        const reconnectResult = await performAutoReconnect();
        
        if (reconnectResult.success) {
          // La reconnexion sera gérée par la fonction login
          console.log('✅ Reconnexion automatique réussie');
          setIsLoading(false);
          return;
        } else {
          console.log('❌ Échec de la reconnexion automatique');
        }
      }

      // 3. Vérifier les informations de reconnexion pour affichage
      const reconnectionInfo = await getReconnectionInfo();
      if (reconnectionInfo) {
        console.log(`📱 Dernière session: ${reconnectionInfo.email} (${reconnectionInfo.lastLoginTime})`);
      }

      // 4. Pas de session - afficher l'écran d'authentification
      console.log('🔑 Aucune session active - affichage de l\'écran d\'authentification');
      setUser(null);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUserData = async (userData: any) => {
    try {
      await storage.setItem('current_user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const updateUserPoints = async (pointsChange: number) => {
    if (!user) return;
    
    try {
      // Mise à jour locale des points (simulation)
      const newPoints = Math.max(0, user.points + pointsChange);
      const updatedUser = {
        ...user,
        points: newPoints,
        updated_at: new Date().toISOString()
      };
      
      console.log(`Points mis à jour: ${user.points} → ${newPoints} (${pointsChange > 0 ? '+' : ''}${pointsChange})`);
      
      setUser(updatedUser);
      await saveUserData(updatedUser);
    } catch (error) {
      console.error('Error in updateUserPoints:', error);
    }
  };

  const addUserPoints = async (pointsToAdd: number) => {
    if (!user || pointsToAdd <= 0) return;
    
    console.log('Adding points:', pointsToAdd, 'to user:', user.first_name);
    
    try {
      // Mise à jour locale des points (simulation)
      const newPoints = user.points + pointsToAdd;
      const updatedUser = {
        ...user,
        points: newPoints,
        updated_at: new Date().toISOString()
      };
      
      console.log(`Points ajoutés: ${user.points} → ${newPoints} (+${pointsToAdd})`);
      
      setUser(updatedUser);
      await saveUserData(updatedUser);
    } catch (error) {
      console.error('Error in addUserPoints:', error);
    }
  };
  
  // Mettre à jour le type d'abonnement de l'utilisateur
  const updateMembershipType = async (newType: 'classic' | 'gold') => {
    if (!user) return;
    
    try {
      console.log(`Mise à jour du type d'abonnement: ${user.membershipType} → ${newType}`);
      
      // Mise à jour locale du type d'abonnement (simulation)
      const updatedUser = {
        ...user,
        membershipType: newType,
        updated_at: new Date().toISOString()
      };
      
      setUser(updatedUser);
      await saveUserData(updatedUser);
      
      // Sauvegarder le statut d'abonnement dans le stockage local
      await storage.setItem('membership_type', newType);
      
      console.log(`✅ Type d'abonnement mis à jour avec succès: ${newType}`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du type d\'abonnement:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('🔑 Tentative de connexion pour:', email);
      
      // Simulation de connexion réussie avec les comptes de test
      const testAccounts = [
        {
          email: 'client@test.ci',
          userData: {
            id: 'client-001',
            email: 'client@test.ci',
            first_name: 'Marie',
            last_name: 'Kouassi',
            phone: '+225 07 12 34 56 78',
            points: 1021, // 80000 FCFA en nouveaux points
            balance: 80000.0, // Balance en FCFA
            role: 'client',
            membershipType: 'classic' as const, // Utilisateur standard par défaut
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        },
        {
          email: 'prestataire@test.ci',
          userData: {
            id: 'provider-001',
            email: 'prestataire@test.ci',
            first_name: 'Tante',
            last_name: 'Marie',
            phone: '+225 07 89 01 23 45',
            points: 1, // 100 FCFA en nouveaux points
            balance: 100.0,
            role: 'provider',
            membershipType: 'classic' as const, // Les prestataires ont aussi un type d'abonnement
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        },
        {
          email: 'admin@test.ci',
          userData: {
            id: 'admin-001',
            email: 'admin@test.ci',
            first_name: 'Admin',
            last_name: 'Système',
            phone: '+225 05 00 00 00 00',
            points: 1915, // 150000 FCFA en nouveaux points
            balance: 150000.0, // Balance en FCFA
            role: 'admin',
            membershipType: 'gold' as const, // L'administrateur a un abonnement gold par défaut
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        }
      ];

      const account = testAccounts.find(acc => acc.email === email);
      if (account && password === 'password123') {
        setUser(account.userData);
        await saveUserData(account.userData);
        
        // Sauvegarder les données de reconnexion avec le bon type
        const userType = account.userData.role === 'provider' ? 'provider' : 'user';
        await saveReconnectionData(email, userType);
        
        console.log(`✅ Connexion réussie pour: ${email} (${account.userData.role})`);
        setIsLoading(false);
        return true;
      }

      console.log('❌ Identifiants incorrects');
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('❌ Erreur lors de la connexion:', error);
      setIsLoading(false);
      return false;
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    // Simulation d'inscription réussie
    return true;
  };

  const logout = async () => {
    try {
      console.log('🚪 Déconnexion en cours...');
      
      // Effacer les données de reconnexion
      await clearReconnectionData();
      
      // Supprimer la session utilisateur
      await storage.removeItem('current_user');
      
      // Réinitialiser le flag de popup après connexion pour s'assurer qu'il s'affiche à la prochaine connexion
      await storage.removeItem('login_popup_shown');
      
      setUser(null);
      
      console.log('✅ Déconnexion réussie');
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
    }
  };

  const isAuthenticated = !!user;
  const userType = user ? (user.role === 'provider' ? 'provider' : 'user') : null;

  return (
    <AuthContext.Provider value={{
      user,
      provider,
      isLoading,
      login,
      register,
      logout,
      isAuthenticated,
      userType,
      updateUserPoints,
      addUserPoints,
      updateMembershipType
    }}>
      {children}
    </AuthContext.Provider>
  );
};