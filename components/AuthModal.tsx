import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
} from 'react-native';
import { X, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useState, useRef, useEffect } from 'react';
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
  
  // Animations de la popup
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  
  // Animations pour l'effet d'étoile filante
  const starPosX = useRef(new Animated.Value(-300)).current;
  const starPosY = useRef(new Animated.Value(-100)).current;
  const starScale = useRef(new Animated.Value(0.2)).current;
  const starOpacity = useRef(new Animated.Value(0)).current;
  const starRotation = useRef(new Animated.Value(0)).current;
  const promoOpacity = useRef(new Animated.Value(0)).current;
  const promoScale = useRef(new Animated.Value(0.5)).current;
  
  // Démarrer l'animation lorsque la modal devient visible
  useEffect(() => {
    if (visible) {
      // Réinitialiser les animations
      scaleAnim.setValue(0.9);
      opacityAnim.setValue(0);
      starPosX.setValue(-300);
      starPosY.setValue(-100);
      starScale.setValue(0.2);
      starOpacity.setValue(0);
      starRotation.setValue(0);
      promoOpacity.setValue(0);
      promoScale.setValue(0.5);
      
      // Animation d'entrée rapide du conteneur principal (0.5 seconde)
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        })
      ]).start();
      
      // Animation de l'étoile filante après un court délai
      setTimeout(() => {
        Animated.sequence([
          // Apparition de l'étoile
          Animated.timing(starOpacity, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
          // Animation de l'étoile filante
          Animated.parallel([
            Animated.timing(starPosX, {
              toValue: 400,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(starPosY, {
              toValue: 200,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(starRotation, {
              toValue: 2,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(starScale, {
                toValue: 1.5,
                duration: 400,
                useNativeDriver: true,
              }),
              Animated.timing(starScale, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
              }),
            ])
          ]),
          // Apparition de la promotion avec effet de rebond
          Animated.parallel([
            Animated.timing(promoOpacity, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.spring(promoScale, {
              toValue: 1,
              friction: 3,
              tension: 40,
              useNativeDriver: true,
            })
          ])
        ]).start();
      }, 300);
    }
  }, [visible]);

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
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.container,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {isLogin ? 'Connexion' : 'Créer un compte'}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color="#8E8E8E" />
            </TouchableOpacity>
          </View>

          {/* Étoile filante */}
          <Animated.View 
            style={[
              styles.star,
              {
                opacity: starOpacity,
                transform: [
                  { translateX: starPosX },
                  { translateY: starPosY },
                  { scale: starScale },
                  { rotate: starRotation.interpolate({
                    inputRange: [0, 1, 2],
                    outputRange: ['0deg', '180deg', '360deg']
                  })}
                ]
              }
            ]}
          >
            <Text style={styles.starText}>★</Text>
          </Animated.View>

          {/* Message promotionnel avec animation */}
          <Animated.View 
            style={[
              styles.promoContainer,
              {
                opacity: promoOpacity,
                transform: [{ scale: promoScale }]
              }
            ]}
          >
            <Text style={styles.promoText}>
              OFFRE SPÉCIALE!
            </Text>
            <Text style={styles.promoSubtext}>
              30% de réduction sur votre première commande!
            </Text>
          </Animated.View>

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
        </Animated.View>
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
  // Styles pour l'étoile filante
  star: {
    position: 'absolute',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  starText: {
    color: '#FFD700',
    fontSize: 40,
    textShadowColor: '#FF6B6B',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  // Styles pour le message promotionnel
  promoContainer: {
    backgroundColor: '#FFE8E8',
    borderWidth: 1,
    borderColor: '#FF6B6B',
    borderRadius: 12,
    padding: 12,
    marginVertical: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  promoText: {
    color: '#FF3333',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    textShadowColor: 'rgba(255, 107, 107, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  promoSubtext: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});