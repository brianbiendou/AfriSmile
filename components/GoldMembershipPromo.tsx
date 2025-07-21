import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { X, Crown, Percent, Gift, Star, Zap, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GoldPurchaseSimulation from './GoldPurchaseSimulation';

interface GoldMembershipPromoProps {
  visible: boolean;
  onClose: () => void;
  onSubscribe?: () => void;
  onGoldUpgradeSuccess?: () => void;
}

const { height: screenHeight } = Dimensions.get('window');

export default function GoldMembershipPromo({ visible, onClose, onSubscribe, onGoldUpgradeSuccess }: GoldMembershipPromoProps) {
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const [showPurchaseSimulation, setShowPurchaseSimulation] = useState(false);

  useEffect(() => {
    if (visible) {
      // Animation d'entrée depuis le bas
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animation de sortie vers le bas
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const benefits = [
    {
      icon: <Percent size={24} color="#FFD700" />,
      title: "Réductions Exclusives",
      description: "Jusqu'à 15% de réduction sur toutes vos commandes",
      highlight: "15%"
    },
    {
      icon: <Gift size={24} color="#FFD700" />,
      title: "Offres Prioritaires",
      description: "Accès en avant-première aux promotions spéciales",
      highlight: "VIP"
    },
    {
      icon: <Zap size={24} color="#FFD700" />,
      title: "Livraison Gratuite",
      description: "Livraison gratuite sur toutes vos commandes Gold",
      highlight: "0 FCFA"
    },
    {
      icon: <Star size={24} color="#FFD700" />,
      title: "Points Bonus",
      description: "2x plus de points sur chaque achat",
      highlight: "x2"
    }
  ];

  const reductions = [
    { type: "Standard", discount: "10%", condition: "Sur toute commande", active: true },
    { type: "Premium", discount: "15%", condition: "Commandes > 100 pts", active: true },
    { type: "Première commande", discount: "12%", condition: "Nouveau membre Gold", active: true },
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View 
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
          }
        ]}
      >
        <Animated.View 
          style={[
            styles.container,
            {
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ],
              zIndex: 999999999,
              elevation: 999999999,
            }
          ]}
        >
          {/* Bouton de fermeture fixe */}
          <TouchableOpacity style={styles.fixedCloseButton} onPress={handleClose}>
            <X size={24} color="#FFF" />
          </TouchableOpacity>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Header avec gradient qui défile */}
            <LinearGradient
              colors={['#FFD700', '#FFA500', '#FF8C00']}
              style={styles.header}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.headerContent}>
                <View style={styles.crownContainer}>
                  <Crown size={40} color="#000" fill="#FFD700" />
                </View>
                <Text style={styles.title}>Devenez Membre Gold</Text>
                <Text style={styles.subtitle}>Débloquez toutes les réductions premium</Text>
              </View>
            </LinearGradient>

            {/* Contenu principal */}
            <View style={styles.content}>
              {/* Section des réductions disponibles */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🎯 Vos Réductions Gold</Text>
                {reductions.map((reduction, index) => (
                  <View key={index} style={styles.reductionCard}>
                    <View style={styles.reductionLeft}>
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>{reduction.discount}</Text>
                      </View>
                      <View>
                        <Text style={styles.reductionType}>{reduction.type}</Text>
                        <Text style={styles.reductionCondition}>{reduction.condition}</Text>
                      </View>
                    </View>
                    <View style={styles.checkContainer}>
                      <Check size={20} color="#00B14F" />
                    </View>
                  </View>
                ))}
              </View>

              {/* Section des avantages */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>✨ Avantages Exclusifs</Text>
                {benefits.map((benefit, index) => (
                  <View key={index} style={styles.benefitCard}>
                    <View style={styles.benefitIcon}>
                      {benefit.icon}
                    </View>
                    <View style={styles.benefitContent}>
                      <Text style={styles.benefitTitle}>{benefit.title}</Text>
                      <Text style={styles.benefitDescription}>{benefit.description}</Text>
                    </View>
                    <View style={styles.benefitHighlight}>
                      <Text style={styles.highlightText}>{benefit.highlight}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Prix et appel à l'action */}
              <View style={styles.pricingSection}>
                <View style={styles.priceCard}>
                  <Text style={styles.priceLabel}>Abonnement mensuel</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.oldPrice}>2,500 FCFA</Text>
                    <Text style={styles.newPrice}>1,500 FCFA</Text>
                  </View>
                  <Text style={styles.savings}>Économisez 1,000 FCFA</Text>
                </View>
              </View>

              {/* Footer avec bouton d'action */}
              <View style={styles.footer}>
                <TouchableOpacity 
                  style={styles.subscribeButton}
                  onPress={() => {
                    setShowPurchaseSimulation(true);
                  }}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#FFD700', '#FFA500']}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Crown size={20} color="#000" />
                    <Text style={styles.buttonText}>Devenir Membre Gold</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.laterButton} onPress={handleClose}>
                  <Text style={styles.laterText}>Plus tard</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </Animated.View>
      
      {/* Simulation d'achat Gold */}
      <GoldPurchaseSimulation
        visible={showPurchaseSimulation}
        onClose={() => setShowPurchaseSimulation(false)}
        onSuccess={() => {
          setShowPurchaseSimulation(false);
          onGoldUpgradeSuccess?.();
          handleClose();
        }}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-end',
    zIndex: 999999999,
    elevation: 999999999,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  fixedCloseButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 8,
    zIndex: 1000,
  },
  scrollContent: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  closeButton: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    padding: 8,
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 10,
  },
  crownContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 30,
    padding: 15,
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  reductionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  reductionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  discountBadge: {
    backgroundColor: '#FFD700',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 12,
  },
  discountText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  reductionType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  reductionCondition: {
    fontSize: 12,
    color: '#666',
  },
  checkContainer: {
    backgroundColor: '#E8F5E8',
    borderRadius: 15,
    padding: 5,
  },
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  benefitIcon: {
    backgroundColor: '#000',
    borderRadius: 25,
    padding: 10,
    marginRight: 15,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  benefitHighlight: {
    backgroundColor: '#FFD700',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  highlightText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  pricingSection: {
    marginVertical: 20,
  },
  priceCard: {
    backgroundColor: '#F0F9F4',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00B14F',
  },
  priceLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  oldPrice: {
    fontSize: 18,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 10,
  },
  newPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00B14F',
  },
  savings: {
    fontSize: 14,
    color: '#00B14F',
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    paddingBottom: 30,
  },
  subscribeButton: {
    borderRadius: 15,
    marginBottom: 10,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  laterButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  laterText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});
