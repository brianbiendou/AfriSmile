import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { InteractionManager } from 'react-native';
import { GoldProvider } from '@/contexts/GoldContext';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import GoldMembershipHandler from '@/components/GoldMembershipHandler';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { AppProvider } from '@/contexts/AppContext';
import { CouponProvider } from '@/contexts/CouponContext';
import AuthScreen from '@/components/AuthScreen';
import LoadingScreen from '@/components/LoadingScreen';
import GlobalCouponAnimation from '@/components/GlobalCouponAnimation';
import AppInitHandler from '@/components/AppInitHandler';

// Configuration globale pour éviter les erreurs useInsertionEffect
if (typeof global !== 'undefined') {
  // Optimisation pour les animations React Native
  InteractionManager.setDeadline?.(100);
}

function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingScreen visible={true} onComplete={() => console.log('Loading complete')} />;
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <>
      <Stack 
        screenOptions={{ 
          headerShown: false,
          animation: 'default'
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      {/* L'animation globale de coupon, visible quelle que soit la page active */}
      {isAuthenticated && <GlobalCouponAnimation />}
      {/* Gestionnaire d'initialisation de l'application qui affiche les promos */}
      {isAuthenticated && <AppInitHandler />}
      {/* Gestionnaire du modal d'abonnement Gold */}
      {isAuthenticated && <GoldMembershipHandler />}
    </>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AppProvider>
      <AuthProvider>
        <CartProvider>
          <CouponProvider>
            <GoldProvider>
              <AppContent />
              <StatusBar style="auto" />
            </GoldProvider>
          </CouponProvider>
        </CartProvider>
      </AuthProvider>
    </AppProvider>
  );
}
