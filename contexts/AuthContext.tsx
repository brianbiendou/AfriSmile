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
      
      // Utiliser la nouvelle fonction d'authentification avec hachage SHA-512
      const { authenticateUser } = await import('@/lib/auth');
      const authResult = await authenticateUser(email, password);
      
      if (authResult.success) {
        console.log('✅ Connexion réussie:', authResult.user ? 'Utilisateur' : 'Prestataire');
        
        if (authResult.user) {
          // Convertir le format de la base vers le format du contexte
          const formattedUser: User = {
            id: authResult.user.id,
            email: authResult.user.email,
            first_name: authResult.user.first_name,
            last_name: authResult.user.last_name,
            phone: authResult.user.phone || '',
            points: authResult.user.points || 0,
            balance: authResult.user.balance || 0,
            role: authResult.user.role,
            membershipType: 'classic', // Par défaut
            is_active: authResult.user.is_active,
            created_at: authResult.user.created_at || new Date().toISOString(),
            updated_at: authResult.user.updated_at || new Date().toISOString(),
          };
          
          setUser(formattedUser);
          setProvider(null);
          
          // Sauvegarder les données de reconnexion
          await saveReconnectionData(email, 'user');
          
        } else if (authResult.provider) {
          setProvider(authResult.provider as any); // Cast temporaire pour le type
          setUser(null);
          
          // Sauvegarder les données de reconnexion
          await saveReconnectionData(email, 'provider');
        }
        
        return true;
      } else {
        console.log('❌ Connexion échouée:', authResult.error);
        return false;
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de la connexion:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('📝 Tentative d\'inscription pour:', userData.email);
      
      // Import dynamique pour éviter les dépendances circulaires
      const { registerUser, registerProvider } = await import('@/lib/auth');
      
      let result;
      if (userData.userType === 'client') {
        result = await registerUser({
          email: userData.email,
          password: userData.password,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone
        });
      } else if (userData.userType === 'provider') {
        result = await registerProvider({
          email: userData.email,
          password: userData.password,
          businessName: userData.businessName,
          ownerName: userData.ownerName,
          phone: userData.phone,
          address: userData.address,
          location: userData.location,
          category: userData.category,
          description: userData.description
        });
      } else {
        console.error('Type d\'utilisateur non reconnu:', userData.userType);
        return false;
      }
      
      if (result.success) {
        console.log('✅ Inscription réussie');
        
        // Connecter automatiquement après inscription
        if (result.user) {
          const formattedUser = {
            ...result.user,
            membershipType: 'classic' as const,
            phone: result.user.phone || '' // Assurer que phone n'est pas undefined
          };
          setUser(formattedUser);
          await saveUserData(formattedUser);
          await saveReconnectionData(userData.email, 'user');
          console.log('✅ Utilisateur connecté automatiquement après inscription');
        } else if (result.provider) {
          // Pour les prestataires, on pourrait les traiter différemment
          console.log('✅ Prestataire créé avec succès');
          // Note: Pour l'instant, on ne connecte pas automatiquement les prestataires
          // car ils pourraient nécessiter une validation manuelle
        }
        
        return true;
      } else {
        console.error('❌ Échec de l\'inscription:', result.error);
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'inscription:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
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