import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Switch,
  Alert,
} from 'react-native';
import { 
  ArrowLeft, 
  User, 
  Bell, 
  Shield, 
  Globe, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Moon,
  Smartphone,
  MapPin,
  CreditCard
} from 'lucide-react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [locationServices, setLocationServices] = useState(true);

  const handleGoBack = () => {
    router.back();
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnecter', 
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/');
          }
        },
      ]
    );
  };

  const settingsData = [
    {
      section: 'Compte',
      items: [
        {
          id: 'profile',
          title: 'Profil utilisateur',
          subtitle: 'Modifier vos informations personnelles',
          icon: User,
          type: 'navigation' as const,
          onPress: () => Alert.alert('Info', 'Fonctionnalité à venir'),
        },
        {
          id: 'payment',
          title: 'Moyens de paiement',
          subtitle: 'Gérer vos cartes et comptes',
          icon: CreditCard,
          type: 'navigation' as const,
          onPress: () => Alert.alert('Info', 'Fonctionnalité à venir'),
        },
        {
          id: 'addresses',
          title: 'Adresses de livraison',
          subtitle: 'Gérer vos adresses',
          icon: MapPin,
          type: 'navigation' as const,
          onPress: () => Alert.alert('Info', 'Fonctionnalité à venir'),
        },
      ]
    },
    {
      section: 'Préférences',
      items: [
        {
          id: 'notifications',
          title: 'Notifications',
          subtitle: 'Recevoir les alertes et promotions',
          icon: Bell,
          type: 'toggle' as const,
          value: notifications,
          onToggle: setNotifications,
        },
        {
          id: 'location',
          title: 'Services de localisation',
          subtitle: 'Permettre la géolocalisation',
          icon: MapPin,
          type: 'toggle' as const,
          value: locationServices,
          onToggle: setLocationServices,
        },
        {
          id: 'darkmode',
          title: 'Mode sombre',
          subtitle: 'Thème sombre pour l\'interface',
          icon: Moon,
          type: 'toggle' as const,
          value: darkMode,
          onToggle: setDarkMode,
        },
      ]
    },
    {
      section: 'Sécurité',
      items: [
        {
          id: 'privacy',
          title: 'Confidentialité',
          subtitle: 'Paramètres de confidentialité',
          icon: Shield,
          type: 'navigation' as const,
          onPress: () => Alert.alert('Info', 'Fonctionnalité à venir'),
        },
        {
          id: 'security',
          title: 'Sécurité du compte',
          subtitle: 'Mot de passe et authentification',
          icon: Shield,
          type: 'navigation' as const,
          onPress: () => Alert.alert('Info', 'Fonctionnalité à venir'),
        },
      ]
    },
    {
      section: 'Support',
      items: [
        {
          id: 'help',
          title: 'Centre d\'aide',
          subtitle: 'FAQ et support technique',
          icon: HelpCircle,
          type: 'navigation' as const,
          onPress: () => Alert.alert('Info', 'Fonctionnalité à venir'),
        },
        {
          id: 'language',
          title: 'Langue',
          subtitle: 'Français',
          icon: Globe,
          type: 'navigation' as const,
          onPress: () => Alert.alert('Info', 'Fonctionnalité à venir'),
        },
        {
          id: 'about',
          title: 'À propos',
          subtitle: 'Version 1.0.0',
          icon: Smartphone,
          type: 'navigation' as const,
          onPress: () => Alert.alert('À propos', 'AfriSmile & Kolofap v1.0.0\nDéveloppé avec ❤️'),
        },
      ]
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Paramètres</Text>
          <View style={styles.placeholder} />
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user?.email || 'Utilisateur'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>
            <View style={styles.membershipBadge}>
              <Text style={styles.membershipText}>
                {user?.membershipType === 'gold' ? '👑 Membre Gold' : '🎯 Membre Classic'}
              </Text>
            </View>
          </View>
        </View>

        {/* Settings Content */}
        {settingsData.map((section) => (
          <View key={section.section} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.section}</Text>
            
            {section.items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.settingItem}
                onPress={item.type === 'navigation' ? item.onPress : undefined}
                disabled={item.type === 'toggle'}
              >
                <View style={styles.settingLeft}>
                  <View style={styles.settingIcon}>
                    <item.icon size={20} color="#666" />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>{item.title}</Text>
                    <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
                
                {item.type === 'toggle' ? (
                  <Switch
                    value={item.value}
                    onValueChange={item.onToggle}
                    trackColor={{ false: '#E5E5E5', true: '#00B14F' }}
                    thumbColor="#fff"
                  />
                ) : (
                  <ChevronRight size={20} color="#CCC" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Logout Section */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#DC3545" />
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>AfriSmile & Kolofap</Text>
          <Text style={styles.versionNumber}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50, // Augmenté pour éviter le chevauchement avec la zone de notification
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  placeholder: {
    width: 40,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8F9FA',
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#00B14F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  membershipBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  membershipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#856404',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    marginLeft: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FED7D7',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC3545',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 40,
  },
  versionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  versionNumber: {
    fontSize: 12,
    color: '#999',
  },
});
