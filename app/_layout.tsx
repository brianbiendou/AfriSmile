import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { AppProvider } from '@/contexts/AppContext';
import AuthScreen from '@/components/AuthScreen';
import LoadingScreen from '@/components/LoadingScreen';

function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingScreen visible={true} onComplete={() => console.log('Loading complete')} />;
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        animation: 'default'
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AppProvider>
      <AuthProvider>
        <CartProvider>
          <AppContent />
          <StatusBar style="auto" />
        </CartProvider>
      </AuthProvider>
    </AppProvider>
  );
}
