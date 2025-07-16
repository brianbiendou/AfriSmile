import { Platform } from 'react-native';

interface StorageInterface {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  multiRemove: (keys: string[]) => Promise<void>;
}

// Abstraction de stockage compatible web et mobile
const createStorage = (): StorageInterface => {
  if (Platform.OS === 'web') {
    // Utiliser localStorage pour le web
    return {
      getItem: async (key: string) => {
        try {
          return localStorage.getItem(key);
        } catch {
          return null;
        }
      },
      setItem: async (key: string, value: string) => {
        try {
          localStorage.setItem(key, value);
        } catch (error) {
          console.error('Error saving to localStorage:', error);
        }
      },
      removeItem: async (key: string) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.error('Error removing from localStorage:', error);
        }
      },
      multiRemove: async (keys: string[]) => {
        try {
          keys.forEach(key => localStorage.removeItem(key));
        } catch (error) {
          console.error('Error removing multiple items from localStorage:', error);
        }
      }
    };
  } else {
    // Utiliser AsyncStorage pour mobile
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return {
      getItem: AsyncStorage.getItem,
      setItem: AsyncStorage.setItem,
      removeItem: AsyncStorage.removeItem,
      multiRemove: AsyncStorage.multiRemove
    };
  }
};

export const storage = createStorage();