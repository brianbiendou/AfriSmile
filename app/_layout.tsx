import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { AppProvider } from '@/contexts/AppContext';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AppProvider>
      <AuthProvider>
        <CartProvider>
          <Stack 
            screenOptions={{ 
              headerShown: false,
              animation: 'default'
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </CartProvider>
      </AuthProvider>
    </AppProvider>
  );
}
