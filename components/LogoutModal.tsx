import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { X, LogOut, Zap, Heart, Star } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';

interface LogoutModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
}

export default function LogoutModal({ visible, onClose, onConfirm, userName }: LogoutModalProps) {
  const [showAnimation, setShowAnimation] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  // Animations pour les éléments flottants
  const floatingAnim1 = useRef(new Animated.Value(0)).current;
  const floatingAnim2 = useRef(new Animated.Value(0)).current;
  const floatingAnim3 = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible && !showAnimation) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (!visible) {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
      setShowAnimation(false);
    }
  }, [visible, showAnimation]);

  const startLogoutAnimation = () => {
    setShowAnimation(true);
    
    // Animation de rotation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();

    // Animation de pulsation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Animations flottantes
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim1, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnim1, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim2, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnim2, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim3, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnim3, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Terminer après 2 secondes
    setTimeout(() => {
      onConfirm();
    }, 2000);
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleOverlayPress = () => {
    if (!showAnimation) {
      handleClose();
    }
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const floating1Y = floatingAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30],
  });

  const floating2Y = floatingAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -40],
  });

  const floating3Y = floatingAnim3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -35],
  });

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={handleOverlayPress}
      >
        <Animated.View 
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }
          ]}
          onStartShouldSetResponder={() => true}
          onResponderGrant={(e) => e.stopPropagation()}
        >
          {!showAnimation ? (
            // Modal de confirmation
            <>
              <View style={styles.header}>
                <Text style={styles.title}>Déconnexion</Text>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <X size={24} color="#8E8E8E" />
                </TouchableOpacity>
              </View>

              <View style={styles.content}>
                <View style={styles.iconContainer}>
                  <LogOut size={48} color="#FF3B30" />
                </View>
                
                <Text style={styles.message}>
                  Êtes-vous sûr de vouloir vous déconnecter, {userName} ?
                </Text>
                
                <Text style={styles.subtitle}>
                  Vous devrez vous reconnecter pour accéder à votre compte
                </Text>

                <View style={styles.buttons}>
                  <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                    <Text style={styles.cancelButtonText}>Annuler</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.confirmButton} onPress={startLogoutAnimation}>
                    <Text style={styles.confirmButtonText}>Se déconnecter</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          ) : (
            // Animation de déconnexion
            <View style={styles.animationContainer}>
              <Text style={styles.animationTitle}>Déconnexion en cours...</Text>
              
              <View style={styles.animationContent}>
                {/* Icône principale avec rotation et pulsation */}
                <Animated.View 
                  style={[
                    styles.mainIcon,
                    {
                      transform: [
                        { rotate: rotateInterpolate },
                        { scale: pulseAnim }
                      ],
                    }
                  ]}
                >
                  <LogOut size={60} color="#FF3B30" />
                </Animated.View>

                {/* Éléments flottants */}
                <Animated.View 
                  style={[
                    styles.floatingIcon1,
                    {
                      transform: [{ translateY: floating1Y }],
                    }
                  ]}
                >
                  <Zap size={24} color="#FFD700" />
                </Animated.View>

                <Animated.View 
                  style={[
                    styles.floatingIcon2,
                    {
                      transform: [{ translateY: floating2Y }],
                    }
                  ]}
                >
                  <Heart size={20} color="#FF69B4" />
                </Animated.View>

                <Animated.View 
                  style={[
                    styles.floatingIcon3,
                    {
                      transform: [{ translateY: floating3Y }],
                    }
                  ]}
                >
                  <Star size={22} color="#00B14F" />
                </Animated.View>
              </View>
              
              <Text style={styles.animationSubtitle}>
                À bientôt {userName} ! 👋
              </Text>
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    maxWidth: 350,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  closeButton: {
    padding: 5,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  message: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E8E',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  buttons: {
    flexDirection: 'row',
    gap: 15,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Styles pour l'animation
  animationContainer: {
    padding: 40,
    alignItems: 'center',
    minHeight: 250,
    justifyContent: 'center',
  },
  animationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 30,
  },
  animationContent: {
    position: 'relative',
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  mainIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingIcon1: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  floatingIcon2: {
    position: 'absolute',
    bottom: 15,
    left: 15,
  },
  floatingIcon3: {
    position: 'absolute',
    top: 20,
    left: 5,
  },
  animationSubtitle: {
    fontSize: 16,
    color: '#00B14F',
    fontWeight: '600',
    textAlign: 'center',
  },
});