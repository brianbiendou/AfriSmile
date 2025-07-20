import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Chrome as Home, Grid3x3 as Grid3X3, ShoppingBag, User, Store, Smartphone } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import AppSwitcher from '@/components/AppSwitcher';
import KolofapHome from '@/components/kolofap/KolofapHome';

export default function TabLayout() {
  const { currentApp } = useApp();
  const { user } = useAuth();
  
  // Détecter si l'utilisateur est un prestataire
  const isProvider = user?.role === 'provider' || user?.email?.includes('prestataire');

  // Si on est sur Kolofap, afficher seulement l'interface Kolofap
  if (currentApp === 'kolofap') {
    return (
      <View style={{ flex: 1, backgroundColor: '#F3F4F6' }}>
        <AppSwitcher />
        <KolofapHome />
      </View>
    );
  }

  // Interface spécifique aux prestataires
  if (isProvider) {
    return (
      <View style={{ flex: 1 }}>
        <AppSwitcher />
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: '#fff',
              borderTopWidth: 1,
              borderTopColor: '#E5E5E5',
              height: 80,
              paddingBottom: 20,
              paddingTop: 10,
            },
            tabBarActiveTintColor: '#00B14F',
            tabBarInactiveTintColor: '#8E8E8E',
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '500',
            },
          }}
        >
          <Tabs.Screen
            name="provider"
            options={{
              title: 'Dashboard',
              tabBarIcon: ({ size, color }) => (
                <Store size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="orders"
            options={{
              title: 'Commandes',
              tabBarIcon: ({ size, color }) => (
                <ShoppingBag size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Compte',
              tabBarIcon: ({ size, color }) => (
                <User size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="modal-test"
            options={{
              title: 'Test Modales',
              tabBarIcon: ({ size, color }) => (
                <Smartphone size={size} color={color} />
              ),
            }}
          />
          {/* Masquer les onglets non nécessaires pour les prestataires */}
          <Tabs.Screen
            name="index"
            options={{ href: null }}
          />
          <Tabs.Screen
            name="categories"
            options={{ href: null }}
          />
        </Tabs>
      </View>
    );
  }

  // Interface Afrismile normale avec le switcher en haut (pour clients et admin)
  return (
    <View style={{ flex: 1 }}>
      <AppSwitcher />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#E5E5E5',
            height: 80,
            paddingBottom: 20,
            paddingTop: 10,
          },
          tabBarActiveTintColor: '#00B14F',
          tabBarInactiveTintColor: '#8E8E8E',
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Accueil',
            tabBarIcon: ({ size, color }) => (
              <Home size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="categories"
          options={{
            title: 'Catégories',
            tabBarIcon: ({ size, color }) => (
              <Grid3X3 size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="orders"
          options={{
            title: 'Commandes',
            tabBarIcon: ({ size, color }) => (
              <ShoppingBag size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Compte',
            tabBarIcon: ({ size, color }) => (
              <User size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="modal-test"
          options={{
            title: 'Test Modales',
            tabBarIcon: ({ size, color }) => (
              <Smartphone size={size} color={color} />
            ),
          }}
        />
        {/* Masquer l'onglet provider pour les clients et admin */}
        <Tabs.Screen
          name="provider"
          options={{ href: null }}
        />
      </Tabs>
    </View>
  );
}