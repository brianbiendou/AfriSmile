import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { X, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';
import { type Provider } from '@/data/providers';

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  selectedProvider: Provider | null;
}

export default function AuthModal({ visible, onClose, selectedProvider }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    // Simulation d'authentification réussie
    Alert.alert(
      'Succès !',
      `${isLogin ? 'Connexion' : 'Inscription'} réussie. Vous pouvez maintenant profiter des offres de ${selectedProvider?.name}`,
      [{ text: 'OK', onPress: onClose }]
    );
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {isLogin ? 'Connexion' : 'Créer un compte'}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color="#8E8E8E" />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Connectez-vous pour profiter des réductions et payer en points
          </Text>

          <View style={styles.form}>
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

            <TouchableOpacity style={styles.authButton} onPress={handleAuth}>
              <Text style={styles.authButtonText}>
                {isLogin ? 'Se connecter' : 'Créer mon compte'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.googleButton}>
              <Text style={styles.googleButtonText}>
                Continuer avec Google
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
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  closeButton: {
    padding: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E8E',
    marginBottom: 30,
    textAlign: 'center',
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#000',
  },
  eyeButton: {
    padding: 5,
  },
  authButton: {
    backgroundColor: '#00B14F',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  authButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  googleButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  googleButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '500',
  },
  switchButton: {
    alignItems: 'center',
    marginTop: 10,
  },
  switchButtonText: {
    color: '#00B14F',
    fontSize: 14,
    fontWeight: '500',
  },
});