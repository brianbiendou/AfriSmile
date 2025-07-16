import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { User, Provider } from '@/types/database';

interface AuthContextType {
  user: User | null;
  provider: Provider | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  userType: 'user' | 'provider' | null;
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
  const [provider, setProvider] = useState<Provider | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier s'il y a une session sauvegardée
    const loadSession = async () => {
      try {
        const savedUser = await storage.getItem('currentUser');
        const savedProvider = await storage.getItem('currentProvider');
        
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        } else if (savedProvider) {
          setProvider(JSON.parse(savedProvider));
        }
      } catch (error) {
        console.error('Error loading session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const { authenticateUser } = await import('@/lib/auth');
      const result = await authenticateUser(email, password);
      
      if (result.success) {
        if (result.user) {
          setUser(result.user);
          await storage.setItem('currentUser', JSON.stringify(result.user));
        } else if (result.provider) {
          setProvider(result.provider);
          await storage.setItem('currentProvider', JSON.stringify(result.provider));
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const { registerUser, registerProvider } = await import('@/lib/auth');
      
      let result;
      if (userData.userType === 'provider') {
        result = await registerProvider(userData);
      } else {
        result = await registerUser(userData);
      }
      
      if (result.success) {
        if (result.user) {
          setUser(result.user);
          await storage.setItem('currentUser', JSON.stringify(result.user));
        } else if (result.provider) {
          setProvider(result.provider);
          await storage.setItem('currentProvider', JSON.stringify(result.provider));
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    setProvider(null);
    try {
      await storage.multiRemove(['currentUser', 'currentProvider']);
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  };

  const isAuthenticated = user !== null || provider !== null;
  const userType = user ? 'user' : provider ? 'provider' : null;

  return (
    <AuthContext.Provider value={{
      user,
      provider,
      isLoading,
      login,
      register,
      logout,
      isAuthenticated,
      userType
    }}>
      {children}
    </AuthContext.Provider>
  );
};