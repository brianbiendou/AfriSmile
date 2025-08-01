import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  TextInput,
  Alert,
  Animated,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { ArrowLeft, Bell, Lock, Eye, Globe, Mail, Smartphone } from 'lucide-react-native';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsScreen() {
  // Auth context
  const { user: authUser } = useAuth();
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // État des paramètres
  const [settings, setSettings] = useState({
    notifications: {
      promotions: true,
      orders: true,
      news: false,
      reminders: true,
    },
    privacy: {
      locationSharing: true,
      dataCollection: true,
      profileVisibility: 'public', // 'public', 'friends', 'private'
    },
    language: 'fr', // 'fr', 'en'
  });
  
  // État pour le mode édition du profil
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profile, setProfile] = useState({
    firstName: authUser?.first_name || '',
    lastName: authUser?.last_name || '',
    email: authUser?.email || '',
    phone: authUser?.phone || '',
  });
  
  // Animation d'entrée
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);
  
  // Gestion du toggle des notifications
  const toggleNotification = (key: string) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: !settings.notifications[key as keyof typeof settings.notifications],
      },
    });
  };
  
  // Gestion du toggle des paramètres de confidentialité
  const togglePrivacy = (key: string) => {
    if (key === 'profileVisibility') return; // Géré séparément
    
    setSettings({
      ...settings,
      privacy: {
        ...settings.privacy,
        [key]: !settings.privacy[key as keyof typeof settings.privacy],
      },
    });
  };
  
  // Changement de la visibilité du profil
  const changeProfileVisibility = (value: string) => {
    setSettings({
      ...settings,
      privacy: {
        ...settings.privacy,
        profileVisibility: value as 'public' | 'friends' | 'private',
      },
    });
  };
  
  // Changement de langue
  const changeLanguage = (lang: string) => {
    setSettings({
      ...settings,
      language: lang,
    });
    
    Alert.alert(
      'Changement de langue',
      `L'application va passer en ${lang === 'fr' ? 'français' : 'anglais'}`,
      [{ text: 'OK' }]
    );
  };
  
  // Sauvegarde du profil
  const saveProfile = () => {
    // Simulation de sauvegarde
    setTimeout(() => {
      Alert.alert('Succès', 'Votre profil a été mis à jour avec succès');
      setIsEditingProfile(false);
    }, 1000);
  };
  
  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" translucent />
      <Stack.Screen
        options={{
          headerShown: false, // Désactiver le header par défaut
        }}
      />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header personnalisé qui bouge avec le scroll */}
        <View style={styles.customHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Paramètres</Text>
          <View style={styles.headerSpacer} />
        </View>
        <Animated.View
          style={[styles.content, { opacity: fadeAnim }]}
        >
          {/* Section du profil */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profil</Text>
            
            {isEditingProfile ? (
              <View style={styles.editProfileContainer}>
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Prénom</Text>
                  <TextInput
                    style={styles.input}
                    value={profile.firstName}
                    onChangeText={(text) => setProfile({ ...profile, firstName: text })}
                    placeholder="Votre prénom"
                  />
                </View>
                
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Nom</Text>
                  <TextInput
                    style={styles.input}
                    value={profile.lastName}
                    onChangeText={(text) => setProfile({ ...profile, lastName: text })}
                    placeholder="Votre nom"
                  />
                </View>
                
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    style={styles.input}
                    value={profile.email}
                    onChangeText={(text) => setProfile({ ...profile, email: text })}
                    placeholder="Votre email"
                    keyboardType="email-address"
                  />
                </View>
                
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Téléphone</Text>
                  <TextInput
                    style={styles.input}
                    value={profile.phone}
                    onChangeText={(text) => setProfile({ ...profile, phone: text })}
                    placeholder="Votre numéro de téléphone"
                    keyboardType="phone-pad"
                  />
                </View>
                
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => setIsEditingProfile(false)}
                  >
                    <Text style={styles.cancelButtonText}>Annuler</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.button}
                    onPress={saveProfile}
                  >
                    <Text style={styles.buttonText}>Sauvegarder</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.profileInfoContainer}>
                <View style={styles.profileInfoRow}>
                  <Text style={styles.profileInfoLabel}>Nom</Text>
                  <Text style={styles.profileInfoValue}>
                    {authUser?.first_name} {authUser?.last_name}
                  </Text>
                </View>
                
                <View style={styles.profileInfoRow}>
                  <Text style={styles.profileInfoLabel}>Email</Text>
                  <Text style={styles.profileInfoValue}>{authUser?.email}</Text>
                </View>
                
                <View style={styles.profileInfoRow}>
                  <Text style={styles.profileInfoLabel}>Téléphone</Text>
                  <Text style={styles.profileInfoValue}>{authUser?.phone}</Text>
                </View>
                
                <TouchableOpacity
                  style={styles.editProfileButton}
                  onPress={() => setIsEditingProfile(true)}
                >
                  <Text style={styles.editProfileButtonText}>Modifier le profil</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          {/* Section des notifications */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Bell size={20} color="#00B14F" />
              <Text style={styles.sectionTitle}>Notifications</Text>
            </View>
            
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingTitle}>Promotions et offres</Text>
                <Text style={styles.settingDescription}>
                  Recevez des alertes sur les nouvelles offres et promotions
                </Text>
              </View>
              <Switch
                value={settings.notifications.promotions}
                onValueChange={() => toggleNotification('promotions')}
                trackColor={{ false: '#D1D5DB', true: '#A7F0C1' }}
                thumbColor={settings.notifications.promotions ? '#00B14F' : '#F3F4F6'}
              />
            </View>
            
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingTitle}>Suivi de commandes</Text>
                <Text style={styles.settingDescription}>
                  Notifications concernant l'état de vos commandes
                </Text>
              </View>
              <Switch
                value={settings.notifications.orders}
                onValueChange={() => toggleNotification('orders')}
                trackColor={{ false: '#D1D5DB', true: '#A7F0C1' }}
                thumbColor={settings.notifications.orders ? '#00B14F' : '#F3F4F6'}
              />
            </View>
            
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingTitle}>Actualités</Text>
                <Text style={styles.settingDescription}>
                  Informations sur les nouveautés et les actualités
                </Text>
              </View>
              <Switch
                value={settings.notifications.news}
                onValueChange={() => toggleNotification('news')}
                trackColor={{ false: '#D1D5DB', true: '#A7F0C1' }}
                thumbColor={settings.notifications.news ? '#00B14F' : '#F3F4F6'}
              />
            </View>
            
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingTitle}>Rappels</Text>
                <Text style={styles.settingDescription}>
                  Rappels pour les événements et offres à durée limitée
                </Text>
              </View>
              <Switch
                value={settings.notifications.reminders}
                onValueChange={() => toggleNotification('reminders')}
                trackColor={{ false: '#D1D5DB', true: '#A7F0C1' }}
                thumbColor={settings.notifications.reminders ? '#00B14F' : '#F3F4F6'}
              />
            </View>
          </View>
          
          {/* Section de confidentialité */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Lock size={20} color="#00B14F" />
              <Text style={styles.sectionTitle}>Confidentialité</Text>
            </View>
            
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingTitle}>Partage de localisation</Text>
                <Text style={styles.settingDescription}>
                  Autoriser l'application à utiliser votre localisation
                </Text>
              </View>
              <Switch
                value={settings.privacy.locationSharing}
                onValueChange={() => togglePrivacy('locationSharing')}
                trackColor={{ false: '#D1D5DB', true: '#A7F0C1' }}
                thumbColor={settings.privacy.locationSharing ? '#00B14F' : '#F3F4F6'}
              />
            </View>
            
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingTitle}>Collecte de données</Text>
                <Text style={styles.settingDescription}>
                  Autoriser la collecte de données pour améliorer l'application
                </Text>
              </View>
              <Switch
                value={settings.privacy.dataCollection}
                onValueChange={() => togglePrivacy('dataCollection')}
                trackColor={{ false: '#D1D5DB', true: '#A7F0C1' }}
                thumbColor={settings.privacy.dataCollection ? '#00B14F' : '#F3F4F6'}
              />
            </View>
            
            <View style={styles.visibilityContainer}>
              <Text style={styles.settingTitle}>Visibilité du profil</Text>
              <Text style={styles.settingDescription}>
                Qui peut voir votre profil et vos activités
              </Text>
              
              <View style={styles.visibilityOptions}>
                <TouchableOpacity
                  style={[
                    styles.visibilityOption,
                    settings.privacy.profileVisibility === 'public' && styles.visibilityOptionSelected,
                  ]}
                  onPress={() => changeProfileVisibility('public')}
                >
                  <Text
                    style={[
                      styles.visibilityOptionText,
                      settings.privacy.profileVisibility === 'public' && styles.visibilityOptionTextSelected,
                    ]}
                  >
                    Public
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.visibilityOption,
                    settings.privacy.profileVisibility === 'friends' && styles.visibilityOptionSelected,
                  ]}
                  onPress={() => changeProfileVisibility('friends')}
                >
                  <Text
                    style={[
                      styles.visibilityOptionText,
                      settings.privacy.profileVisibility === 'friends' && styles.visibilityOptionTextSelected,
                    ]}
                  >
                    Amis
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.visibilityOption,
                    settings.privacy.profileVisibility === 'private' && styles.visibilityOptionSelected,
                  ]}
                  onPress={() => changeProfileVisibility('private')}
                >
                  <Text
                    style={[
                      styles.visibilityOptionText,
                      settings.privacy.profileVisibility === 'private' && styles.visibilityOptionTextSelected,
                    ]}
                  >
                    Privé
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          {/* Section de langue */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Globe size={20} color="#00B14F" />
              <Text style={styles.sectionTitle}>Langue</Text>
            </View>
            
            <View style={styles.languageContainer}>
              <TouchableOpacity
                style={[
                  styles.languageOption,
                  settings.language === 'fr' && styles.languageOptionSelected,
                ]}
                onPress={() => changeLanguage('fr')}
              >
                <Text
                  style={[
                    styles.languageOptionText,
                    settings.language === 'fr' && styles.languageOptionTextSelected,
                  ]}
                >
                  Français
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.languageOption,
                  settings.language === 'en' && styles.languageOptionSelected,
                ]}
                onPress={() => changeLanguage('en')}
              >
                <Text
                  style={[
                    styles.languageOptionText,
                    settings.language === 'en' && styles.languageOptionTextSelected,
                  ]}
                >
                  English
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Bouton pour effacer les données */}
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={() => 
              Alert.alert(
                'Effacer les données',
                'Êtes-vous sûr de vouloir effacer toutes vos données ? Cette action est irréversible.',
                [
                  { text: 'Annuler', style: 'cancel' },
                  { text: 'Effacer', style: 'destructive' }
                ]
              )
            }
          >
            <Text style={styles.dangerButtonText}>Effacer mes données</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FAFAFA',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
    maxWidth: '80%',
  },
  visibilityContainer: {
    paddingVertical: 12,
  },
  visibilityOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  visibilityOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  visibilityOptionSelected: {
    backgroundColor: 'rgba(0, 177, 79, 0.1)',
    borderColor: '#00B14F',
  },
  visibilityOptionText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  visibilityOptionTextSelected: {
    color: '#00B14F',
  },
  languageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  languageOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  languageOptionSelected: {
    backgroundColor: 'rgba(0, 177, 79, 0.1)',
    borderColor: '#00B14F',
  },
  languageOptionText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  languageOptionTextSelected: {
    color: '#00B14F',
    fontWeight: 'bold',
  },
  profileInfoContainer: {
    paddingVertical: 5,
  },
  profileInfoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  profileInfoLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    width: 100,
  },
  profileInfoValue: {
    fontSize: 16,
    color: '#111827',
    flex: 1,
  },
  editProfileButton: {
    backgroundColor: '#00B14F',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  editProfileButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  editProfileContainer: {
    marginTop: 10,
  },
  inputRow: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    backgroundColor: '#00B14F',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButtonText: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 16,
  },
  dangerButton: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  dangerButtonText: {
    color: '#DC2626',
    fontWeight: '600',
    fontSize: 16,
  },
});
