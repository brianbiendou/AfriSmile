import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  Image,
} from 'react-native';
import { X, Crown, Gift, Zap, Star, Check } from 'lucide-react-native';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { useGold } from '@/contexts/GoldContext';
import PaymentAggregatorModal from './PaymentAggregatorModal';

const { width, height } = Dimensions.get('window');

interface GoldMembershipModalProps {
  visible: boolean;
  onClose: () => void;
}

interface MembershipPlan {
  id: string;
  title: string;
  duration: string;
  originalPrice: number;
  currentPrice: number;
  savings: number;
  isPopular?: boolean;
}

export default function GoldMembershipModal({ visible, onClose }: GoldMembershipModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>('quarterly'); // Plan par défaut
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { user } = useAuth();
  const { activateGoldMembership } = useGold();
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const crownRotateAnim = useRef(new Animated.Value(0)).current;
  const crownAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

  // Plans d'abonnement
  const plans: MembershipPlan[] = [
    {
      id: 'monthly',
      title: 'Mensuel',
      duration: '1 mois',
      originalPrice: 2500,
      currentPrice: 1500,
      savings: 1000,
    },
    {
      id: 'quarterly',
      title: 'Trimestriel',
      duration: '3 mois',
      originalPrice: 7500,
      currentPrice: 4000,
      savings: 3500,
      isPopular: true,
    },
    {
      id: 'yearly',
      title: 'Annuel',
      duration: '12 mois',
      originalPrice: 30000,
      currentPrice: 12000,
      savings: 18000,
    },
  ];

  // Avantages du membership Gold
  const goldBenefits = [
    {
      icon: Gift,
      title: 'Réductions Exclusives',
      description: 'Jusqu\'à 15% de réduction sur toutes vos commandes',
      highlight: '15%',
    },
    {
      icon: Zap,
      title: 'Livraison Gratuite',
      description: 'Livraison gratuite sur toutes vos commandes Gold',
      highlight: '0 FCFA',
    },
    {
      icon: Star,
      title: 'Points Bonus',
      description: '2x plus de points sur chaque achat',
      highlight: 'x2',
    },
    {
      icon: Crown,
      title: 'Accès Prioritaire',
      description: 'Accès en avant-première aux promotions spéciales',
      highlight: 'VIP',
    },
  ];

  // Animations d'entrée - sécurisées avec délai
  useEffect(() => {
    // Arrêter l'animation de couronne précédente
    if (crownAnimationRef.current) {
      crownAnimationRef.current.stop();
      crownAnimationRef.current = null;
    }

    if (visible && !isAnimating) {
      setIsAnimating(true);
      
      // Délai pour éviter les conflits avec useInsertionEffect
      const timeoutId = setTimeout(() => {
        try {
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
              toValue: 1,
              tension: 100,
              friction: 8,
              useNativeDriver: true,
            }),
          ]).start(() => {
            setIsAnimating(false);
          });

          // Animation de rotation de la couronne avec délai supplémentaire
          setTimeout(() => {
            if (crownAnimationRef.current) {
              crownAnimationRef.current = Animated.loop(
                Animated.timing(crownRotateAnim, {
                  toValue: 1,
                  duration: 3000,
                  useNativeDriver: true,
                })
              );
              crownAnimationRef.current.start();
            }
          }, 200);
        } catch (error) {
          console.warn('Erreur animation GoldMembershipModal:', error);
          fadeAnim.setValue(1);
          scaleAnim.setValue(1);
          setIsAnimating(false);
        }
      }, 50);

      return () => clearTimeout(timeoutId);
    } else if (!visible) {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
      crownRotateAnim.setValue(0);
      setIsAnimating(false);
    }

    // Cleanup
    return () => {
      if (crownAnimationRef.current) {
        crownAnimationRef.current.stop();
        crownAnimationRef.current = null;
      }
    };
  }, [visible]);

  const handleClose = useCallback(() => {
    if (isAnimating) return; // Éviter les animations concurrentes
    
    setIsAnimating(true);
    // Arrêter l'animation de couronne
    if (crownAnimationRef.current) {
      crownAnimationRef.current.stop();
      crownAnimationRef.current = null;
    }

    try {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsAnimating(false);
        onClose();
      });
    } catch (error) {
      console.warn('Erreur fermeture Gold modal:', error);
      setIsAnimating(false);
      onClose();
    }
  }, [onClose, isAnimating]);

  const handleSubscribe = useCallback(() => {
    const plan = plans.find(p => p.id === selectedPlan);
    if (plan) {
      // Logique d'abonnement - ouvrir le modal de paiement
      setShowPaymentModal(true);
    }
  }, [selectedPlan, plans]);

  const handlePaymentSuccess = useCallback(async () => {
    const plan = plans.find(p => p.id === selectedPlan);
    if (plan) {
      try {
        await activateGoldMembership(selectedPlan as 'monthly' | 'quarterly' | 'yearly');
        setShowPaymentModal(false);
        onClose();
        
        // Optionnel : afficher une notification de succès
        console.log(`Abonnement Gold ${plan.title} activé avec succès !`);
      } catch (error) {
        console.error('Erreur lors de l\'activation de l\'abonnement:', error);
        // Gérer l'erreur, peut-être afficher un message d'erreur
      }
    }
  }, [selectedPlan, plans, activateGoldMembership, onClose]);

  const crownRotate = crownRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const selectedPlanData = plans.find(p => p.id === selectedPlan);

  return (
    <>
      <Modal
        visible={visible}
        transparent={true}
        animationType="none"
        onRequestClose={handleClose}
      >
        <Animated.View 
          style={[
            styles.overlay,
            { opacity: fadeAnim }
          ]}
        >
          <Animated.View
            style={[
              styles.container,
              {
                transform: [{ scale: scaleAnim }],
              }
            ]}
          >
            {/* Header avec gradient doré */}
            <LinearGradient
              colors={['#FFD700', '#FFA500', '#FF8C00']}
              style={styles.header}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <X size={24} color="#8B4513" />
              </TouchableOpacity>

              <Animated.View 
                style={[
                  styles.crownContainer,
                  { transform: [{ rotate: crownRotate }] }
                ]}
              >
                <Crown size={60} color="#8B4513" fill="#FFD700" />
              </Animated.View>

              <Text style={styles.headerTitle}>Devenez Membre Gold</Text>
              <Text style={styles.headerSubtitle}>
                Débloquez toutes les réductions premium
              </Text>
            </LinearGradient>

            <ScrollView 
              style={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {/* Section des avantages */}
              <View style={styles.benefitsSection}>
                <View style={styles.sectionHeader}>
                  <Crown size={20} color="#FFD700" />
                  <Text style={styles.sectionTitle}>Vos Réductions Gold</Text>
                </View>

                {goldBenefits.map((benefit, index) => (
                  <View key={index} style={styles.benefitItem}>
                    <View style={styles.benefitIconContainer}>
                      <benefit.icon size={20} color="#FFD700" />
                    </View>
                    <View style={styles.benefitContent}>
                      <Text style={styles.benefitTitle}>{benefit.title}</Text>
                      <Text style={styles.benefitDescription}>{benefit.description}</Text>
                    </View>
                    <View style={styles.benefitHighlight}>
                      <Text style={styles.benefitHighlightText}>{benefit.highlight}</Text>
                    </View>
                    <Check size={16} color="#00B14F" />
                  </View>
                ))}
              </View>

              {/* Section avantages exclusifs */}
              <View style={styles.exclusiveBenefits}>
                <View style={styles.sectionHeader}>
                  <Star size={20} color="#FFD700" />
                  <Text style={styles.sectionTitle}>Avantages Exclusifs</Text>
                </View>

                <View style={styles.exclusiveItem}>
                  <Gift size={24} color="#FFD700" />
                  <Text style={styles.exclusiveTitle}>Offres Prioritaires</Text>
                  <Text style={styles.exclusiveDescription}>
                    Accès en avant-première aux promotions spéciales
                  </Text>
                  <View style={styles.exclusiveBadge}>
                    <Text style={styles.exclusiveBadgeText}>VIP</Text>
                  </View>
                </View>

                <View style={styles.exclusiveItem}>
                  <Zap size={24} color="#FFD700" />
                  <Text style={styles.exclusiveTitle}>Livraison Gratuite</Text>
                  <Text style={styles.exclusiveDescription}>
                    Livraison gratuite sur toutes vos commandes Gold
                  </Text>
                  <View style={styles.exclusiveBadge}>
                    <Text style={styles.exclusiveBadgeText}>0 FCFA</Text>
                  </View>
                </View>

                <View style={styles.exclusiveItem}>
                  <Star size={24} color="#FFD700" />
                  <Text style={styles.exclusiveTitle}>Points Bonus</Text>
                  <Text style={styles.exclusiveDescription}>
                    2x plus de points sur chaque achat
                  </Text>
                  <View style={styles.exclusiveBadge}>
                    <Text style={styles.exclusiveBadgeText}>x2</Text>
                  </View>
                </View>
              </View>

              {/* Plans d'abonnement */}
              <View style={styles.plansSection}>
                {plans.map((plan) => (
                  <TouchableOpacity
                    key={plan.id}
                    style={[
                      styles.planCard,
                      selectedPlan === plan.id && styles.selectedPlan,
                      plan.isPopular && styles.popularPlan,
                    ]}
                    onPress={() => setSelectedPlan(plan.id)}
                  >
                    {plan.isPopular && (
                      <View style={styles.popularBadge}>
                        <Text style={styles.popularBadgeText}>Plus populaire</Text>
                      </View>
                    )}

                    <Text style={styles.planTitle}>{plan.title}</Text>
                    <Text style={styles.planDuration}>{plan.duration}</Text>
                    
                    <View style={styles.priceContainer}>
                      <Text style={styles.originalPrice}>
                        {plan.originalPrice.toLocaleString()} FCFA
                      </Text>
                      <Text style={styles.currentPrice}>
                        {plan.currentPrice.toLocaleString()} FCFA
                      </Text>
                    </View>

                    <Text style={styles.savings}>
                      Économisez {plan.savings.toLocaleString()} FCFA
                    </Text>

                    <View style={[
                      styles.radioButton,
                      selectedPlan === plan.id && styles.radioButtonSelected
                    ]}>
                      {selectedPlan === plan.id && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Footer avec bouton d'abonnement */}
            <View style={styles.footer}>
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                style={styles.subscribeButton}
              >
                <TouchableOpacity 
                  style={styles.subscribeButtonInner}
                  onPress={handleSubscribe}
                >
                  <Crown size={20} color="#8B4513" />
                  <Text style={styles.subscribeButtonText}>
                    Devenir Membre Gold
                  </Text>
                </TouchableOpacity>
              </LinearGradient>

              <TouchableOpacity onPress={handleClose} style={styles.laterButton}>
                <Text style={styles.laterButtonText}>Plus tard</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>

      {/* Modal de paiement */}
      {selectedPlanData && (
        <PaymentAggregatorModal
          visible={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
          amount={selectedPlanData.currentPrice}
          points={0}
          paymentMethod={{
            id: 'subscription',
            name: `Abonnement Gold ${selectedPlanData.title}`,
            color: '#FFD700',
          }}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.95,
    maxWidth: 400,
    maxHeight: height * 0.9,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
  },
  crownContainer: {
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
    textAlign: 'center',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8B4513',
    textAlign: 'center',
    opacity: 0.8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  benefitsSection: {
    marginTop: 20,
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 10,
  },
  benefitIconContainer: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#FFF8DC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  benefitDescription: {
    fontSize: 12,
    color: '#666',
  },
  benefitHighlight: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  benefitHighlightText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  exclusiveBenefits: {
    marginBottom: 25,
  },
  exclusiveItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    position: 'relative',
  },
  exclusiveTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  exclusiveDescription: {
    fontSize: 14,
    color: '#666',
  },
  exclusiveBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FFD700',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  exclusiveBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  plansSection: {
    marginBottom: 20,
  },
  planCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  selectedPlan: {
    borderColor: '#FFD700',
    backgroundColor: '#FFF8DC',
  },
  popularPlan: {
    borderColor: '#00B14F',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    left: 15,
    backgroundColor: '#00B14F',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  popularBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  planDuration: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 10,
  },
  currentPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00B14F',
  },
  savings: {
    fontSize: 14,
    color: '#00B14F',
    fontWeight: '600',
    marginBottom: 10,
  },
  radioButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#DDD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#FFD700',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFD700',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  subscribeButton: {
    borderRadius: 15,
    marginBottom: 10,
  },
  subscribeButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B4513',
    marginLeft: 8,
  },
  laterButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  laterButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});
