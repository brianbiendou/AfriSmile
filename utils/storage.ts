import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface StorageInterface {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  getAllKeys: () => Promise<string[]>;
  multiRemove: (keys: string[]) => Promise<void>;
}

let storage: StorageInterface;
if (Platform.OS === 'web') {
  storage = {
    getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
    setItem: (key: string, value: string) => Promise.resolve(localStorage.setItem(key, value)),
    removeItem: (key: string) => Promise.resolve(localStorage.removeItem(key)),
    getAllKeys: () => Promise.resolve(Object.keys(localStorage)),
    multiRemove: (keys: string[]) => {
      keys.forEach(key => localStorage.removeItem(key));
      return Promise.resolve();
    },
  };
} else {
  storage = AsyncStorage;
}

export default storage;