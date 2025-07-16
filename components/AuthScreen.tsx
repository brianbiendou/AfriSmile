import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Mail, Lock, Eye, EyeOff, User, Phone, MapPin, Building, FileText } from 'lucide-react-native';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState<'client' | 'provider'>('client');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Champs communs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Champs client
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  
  // Champs prestataire
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const { login, register } = useAuth();

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFirstName('');
    setLastName('');
    setPhone('');
    setBusinessName('');
    setOwnerName('');
    setAddress('');
    setLocation('');
    setCategory('');
    setDescription('');
    setShowPassword(false);
  };

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const success = await login(email, password);
        if (!success) {
          Alert.alert('Erreur', 'Email ou mot de passe incorrect');
        }
      } else {
        // Validation des champs d'inscription
        if (userType === 'client') {
          if (!firstName || !lastName) {
            Alert.alert('Erreur', 'Veuillez remplir votre nom et prénom');
            setLoading(false);
            return;
          }
        } else {
          if (!businessName || !ownerName || !address || !location || !category) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
            setLoading(false);
            return;
          }
        }

        const userData = userType === 'client' ? {
          email,
          password,
          firstName,
          lastName,
          phone,
          userType: 'client'
        } : {
          email,
          password,
          businessName,
          ownerName,
          phone,
          address,
          location,
          category,
          description,
          userType: 'provider'
        };

        const success = await register(userData);
        if (!success) {
          Alert.alert('Erreur', 'Une erreur est survenue lors de l\'inscription');
        }
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Cuisine Africaine',
    'Fast Food',
    'Salon de Beauté',
    'Café & Pâtisserie',
    'Manucure & Pédicure',
    'Autre'
  ];

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {isLogin ? 'Connexion' : 'Créer un compte'}
          </Text>
          <Text style={styles.subtitle}>
            {isLogin 
              ? 'Connectez-vous pour profiter des réductions' 
              : 'Rejoignez notre communauté'
            }
          </Text>
        </View>

        {!isLogin && (
          <View style={styles.userTypeSelector}>
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === 'client' && styles.userTypeButtonActive
              ]}
              onPress={() => setUserType('client')}
            >
              <User size={20} color={userType === 'client' ? '#fff' : '#00B14F'} />
              <Text style={[
                styles.userTypeText,
                userType === 'client' && styles.userTypeTextActive
              ]}>
                Client
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === 'provider' && styles.userTypeButtonActive
              ]}
              onPress={() => setUserType('provider')}
            >
              <Building size={20} color={userType === 'provider' ? '#fff' : '#00B14F'} />
              <Text style={[
                styles.userTypeText,
                userType === 'provider' && styles.userTypeTextActive
              ]}>
                Prestataire
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.form}>
          {/* Champs communs */}
          <View style={styles.inputContainer}>
            <Mail size={20} color="#8E8E8E" />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#8E8E8E"
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color="#8E8E8E" />
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor="#8E8E8E"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              {showPassword ? (
                <EyeOff size={20} color="#8E8E8E" />
              ) : (
                <Eye size={20} color="#8E8E8E" />
              )}
            </TouchableOpacity>
          </View>

          {!isLogin && (
            <View style={styles.inputContainer}>
              <Lock size={20} color="#8E8E8E" />
              <TextInput
                style={styles.input}
                placeholder="Confirmer le mot de passe"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor="#8E8E8E"
              />
            </View>
          )}

          {/* Champs spécifiques aux clients */}
          {!isLogin && userType === 'client' && (
            <>
              <View style={styles.inputContainer}>
                <User size={20} color="#8E8E8E" />
                <TextInput
                  style={styles.input}
                  placeholder="Prénom *"
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholderTextColor="#8E8E8E"
                />
              </View>

              <View style={styles.inputContainer}>
                <User size={20} color="#8E8E8E" />
                <TextInput
                  style={styles.input}
                  placeholder="Nom *"
                  value={lastName}
                  onChangeText={setLastName}
                  placeholderTextColor="#8E8E8E"
                />
              </View>

              <View style={styles.inputContainer}>
                <Phone size={20} color="#8E8E8E" />
                <TextInput
                  style={styles.input}
                  placeholder="Téléphone (optionnel)"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholderTextColor="#8E8E8E"
                />
              </View>
            </>
          )}

          {/* Champs spécifiques aux prestataires */}
          {!isLogin && userType === 'provider' && (
            <>
              <View style={styles.inputContainer}>
                <Building size={20} color="#8E8E8E" />
                <TextInput
                  style={styles.input}
                  placeholder="Nom de l'établissement *"
                  value={businessName}
                  onChangeText={setBusinessName}
                  placeholderTextColor="#8E8E8E"
                />
              </View>

              <View style={styles.inputContainer}>
                <User size={20} color="#8E8E8E" />
                <TextInput
                  style={styles.input}
                  placeholder="Nom du propriétaire *"
                  value={ownerName}
                  onChangeText={setOwnerName}
                  placeholderTextColor="#8E8E8E"
                />
              </View>

              <View style={styles.inputContainer}>
                <Phone size={20} color="#8E8E8E" />
                <TextInput
                  style={styles.input}
                  placeholder="Téléphone *"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholderTextColor="#8E8E8E"
                />
              </View>

              <View style={styles.inputContainer}>
                <MapPin size={20} color="#8E8E8E" />
                <TextInput
                  style={styles.input}
                  placeholder="Adresse complète *"
                  value={address}
                  onChangeText={setAddress}
                  placeholderTextColor="#8E8E8E"
                />
              </View>

              <View style={styles.inputContainer}>
                <MapPin size={20} color="#8E8E8E" />
                <TextInput
                  style={styles.input}
                  placeholder="Quartier/Zone *"
                  value={location}
                  onChangeText={setLocation}
                  placeholderTextColor="#8E8E8E"
                />
              </View>

              <View style={styles.categoryContainer}>
                <Text style={styles.categoryLabel}>Catégorie d'activité *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryChip,
                        category === cat && styles.categoryChipActive
                      ]}
                      onPress={() => setCategory(cat)}
                    >
                      <Text style={[
                        styles.categoryChipText,
                        category === cat && styles.categoryChipTextActive
                      ]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.inputContainer}>
                <FileText size={20} color="#8E8E8E" />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Description de votre activité (optionnel)"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                  placeholderTextColor="#8E8E8E"
                />
              </View>
            </>
          )}

          <TouchableOpacity 
            style={[styles.authButton, loading && styles.authButtonDisabled]} 
            onPress={handleAuth}
            disabled={loading}
          >
            <Text style={styles.authButtonText}>
              {loading 
                ? 'Chargement...' 
                : isLogin 
                  ? 'Se connecter' 
                  : 'Créer mon compte'
              }
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => {
              setIsLogin(!isLogin);
              resetForm();
            }}
          >
            <Text style={styles.switchButtonText}>
              {isLogin
                ? "Pas de compte ? Créer un compte"
                : "Déjà un compte ? Se connecter"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E8E',
    textAlign: 'center',
  },
  userTypeSelector: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 30,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
  },
  userTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  userTypeButtonActive: {
    backgroundColor: '#00B14F',
  },
  userTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00B14F',
  },
  userTypeTextActive: {
    color: '#fff',
  },
  form: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#000',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  eyeButton: {
    padding: 5,
  },
  categoryContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 10,
  },
  categoryChip: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryChipActive: {
    backgroundColor: '#00B14F',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  authButton: {
    backgroundColor: '#00B14F',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  authButtonDisabled: {
    opacity: 0.6,
  },
  authButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  switchButtonText: {
    color: '#00B14F',
    fontSize: 14,
    fontWeight: '500',
  },
});