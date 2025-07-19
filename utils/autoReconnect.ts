/**
 * Module de reconnexion automatique pour l'application
 * Permet de restaurer automatiquement la session utilisateur précédente
 */

import storage from '@/utils/storage';
import { authenticateUser } from '@/lib/auth';

interface ReconnectionData {
  email: string;
  lastLoginTime: string;
  userType: 'user' | 'provider';
  autoReconnect: boolean;
}

const RECONNECTION_KEY = 'auto_reconnection_data';
const MAX_AUTO_RECONNECT_DAYS = 7; // 7 jours

/**
 * Sauvegarde les données de reconnexion après une connexion réussie
 */
export const saveReconnectionData = async (email: string, userType: 'user' | 'provider') => {
  try {
    const reconnectionData: ReconnectionData = {
      email,
      lastLoginTime: new Date().toISOString(),
      userType,
      autoReconnect: true
    };
    
    await storage.setItem(RECONNECTION_KEY, JSON.stringify(reconnectionData));
    console.log('✅ Données de reconnexion sauvegardées pour:', email);
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde des données de reconnexion:', error);
  }
};

/**
 * Vérifie si une reconnexion automatique est possible
 */
export const canAutoReconnect = async (): Promise<boolean> => {
  try {
    const dataStr = await storage.getItem(RECONNECTION_KEY);
    if (!dataStr) return false;
    
    const data: ReconnectionData = JSON.parse(dataStr);
    
    // Vérifier si la reconnexion automatique est activée
    if (!data.autoReconnect) return false;
    
    // Vérifier si la dernière connexion n'est pas trop ancienne
    const lastLogin = new Date(data.lastLoginTime);
    const now = new Date();
    const daysDiff = (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysDiff > MAX_AUTO_RECONNECT_DAYS) {
      console.log('🕒 Session expirée (plus de 7 jours)');
      return false;
    }
    
    console.log(`✅ Reconnexion automatique possible pour: ${data.email}`);
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la vérification de reconnexion:', error);
    return false;
  }
};

/**
 * Effectue une reconnexion automatique
 */
export const performAutoReconnect = async (): Promise<{ success: boolean; email?: string; userType?: string }> => {
  try {
    const dataStr = await storage.getItem(RECONNECTION_KEY);
    if (!dataStr) {
      return { success: false };
    }
    
    const data: ReconnectionData = JSON.parse(dataStr);
    
    console.log(`🔄 Tentative de reconnexion automatique pour: ${data.email}`);
    
    // Utiliser les comptes de test pour la démonstration
    const testCredentials = getTestCredentials(data.email);
    if (testCredentials) {
      const result = await authenticateUser(testCredentials.email, testCredentials.password);
      
      if (result.success) {
        console.log(`✅ Reconnexion automatique réussie pour: ${data.email}`);
        return { 
          success: true, 
          email: data.email, 
          userType: result.user ? 'user' : 'provider' 
        };
      }
    }
    
    console.log(`❌ Échec de la reconnexion automatique pour: ${data.email}`);
    return { success: false };
  } catch (error) {
    console.error('❌ Erreur lors de la reconnexion automatique:', error);
    return { success: false };
  }
};

/**
 * Récupère les identifiants de test selon l'email
 */
const getTestCredentials = (email: string) => {
  const testAccounts = [
    {
      email: 'client@test.ci',
      password: 'password123',
      type: 'client'
    },
    {
      email: 'marie.kouassi@test.ci',
      password: 'password123',
      type: 'client'
    },
    {
      email: 'prestataire@test.ci',
      password: 'password123',
      type: 'provider'
    },
    {
      email: 'admin@test.ci',
      password: 'password123',
      type: 'admin'
    }
  ];
  
  return testAccounts.find(account => account.email === email);
};

/**
 * Désactive la reconnexion automatique
 */
export const disableAutoReconnect = async () => {
  try {
    const dataStr = await storage.getItem(RECONNECTION_KEY);
    if (dataStr) {
      const data: ReconnectionData = JSON.parse(dataStr);
      data.autoReconnect = false;
      await storage.setItem(RECONNECTION_KEY, JSON.stringify(data));
      console.log('🔒 Reconnexion automatique désactivée');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la désactivation de la reconnexion:', error);
  }
};

/**
 * Supprime les données de reconnexion (lors de la déconnexion)
 */
export const clearReconnectionData = async () => {
  try {
    await storage.removeItem(RECONNECTION_KEY);
    console.log('🗑️ Données de reconnexion supprimées');
  } catch (error) {
    console.error('❌ Erreur lors de la suppression des données de reconnexion:', error);
  }
};

/**
 * Récupère les informations de reconnexion stockées
 */
export const getReconnectionInfo = async (): Promise<ReconnectionData | null> => {
  try {
    const dataStr = await storage.getItem(RECONNECTION_KEY);
    return dataStr ? JSON.parse(dataStr) : null;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des infos de reconnexion:', error);
    return null;
  }
};

/**
 * Met à jour le timestamp de la dernière activité
 */
export const updateLastActivity = async () => {
  try {
    const dataStr = await storage.getItem(RECONNECTION_KEY);
    if (dataStr) {
      const data: ReconnectionData = JSON.parse(dataStr);
      data.lastLoginTime = new Date().toISOString();
      await storage.setItem(RECONNECTION_KEY, JSON.stringify(data));
    }
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour de l\'activité:', error);
  }
};
