import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { Percent, Star, Gift, Sparkles, Crown, Ticket } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface DiscountSectionProps {
  cartTotal: number;
  globalDiscountPercentage: number;
  user: any;
  selectedPayment: 'points' | 'mtn' | 'orange' | 'moov';
  pointsToFcfa: (points: number) => number;
  onApplyDiscount: (percentage: number, checkMinimum?: boolean) => void;
}

export default function DiscountSection({
  cartTotal,
  globalDiscountPercentage,
  user,
  selectedPayment,
  pointsToFcfa,
  onApplyDiscount
}: DiscountSectionProps) {
  const [animatedValues] = useState({
    standard: new Animated.Value(1),
    premium: new Animated.Value(1),
    first: new Animated.Value(1),
  });

  const animatePress = (type: 'standard' | 'premium' | 'first') => {
    Animated.sequence([
      Animated.timing(animatedValues[type], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValues[type], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const formatAmount = (amount: number) => {
    return selectedPayment === 'points' 
      ? `${amount.toLocaleString()} pts`
      : `${pointsToFcfa(amount).toLocaleString()} FCFA`;
  };

  const calculateSavings = (discount: number) => {
    const savings = Math.round(cartTotal * (discount / 100));
    return formatAmount(savings);
  };

  const calculateDiscountedPrice = (originalPrice: number, discount: number) => {
    const discountedPrice = originalPrice - Math.round(originalPrice * (discount / 100));
    return formatAmount(discountedPrice);
  };

  const discounts = [
    {
      id: 'standard',
      type: 'Standard',
      discount: user?.membershipType === 'gold' ? 10 : 5,
      condition: 'Sur toute commande',
      icon: <Ticket size={16} color="#fff" />,
      gradient: ['#4F46E5', '#7C3AED'],
      isActive: globalDiscountPercentage === (user?.membershipType === 'gold' ? 10 : 5),
      isAvailable: true, // Toujours disponible
      onPress: () => {
        animatePress('standard');
        const discountValue = user?.membershipType === 'gold' ? 10 : 5;
        onApplyDiscount(discountValue, false);
      }
    },
    {
      id: 'premium',
      type: 'Premium',
      discount: user?.membershipType === 'gold' ? 15 : 7,
      condition: user?.membershipType === 'gold' ? 'Commandes > 80 pts' : 'Commandes > 70 pts',
      icon: <Crown size={16} color="#fff" />,
      gradient: ['#F59E0B', '#EF4444'],
      isActive: globalDiscountPercentage === (user?.membershipType === 'gold' ? 15 : 7),
      isAvailable: user?.membershipType === 'gold' ? cartTotal > 80 : cartTotal > 70,
      requiresMinimum: true,
      minimumAmount: user?.membershipType === 'gold' ? 80 : 70,
      onPress: () => {
        animatePress('premium');
        const minimumRequired = user?.membershipType === 'gold' ? 80 : 70;
        const discountValue = user?.membershipType === 'gold' ? 15 : 7;
        
        if (cartTotal <= minimumRequired) {
          Alert.alert(
            "Remise non disponible", 
            `Cette remise nécessite un total de commande supérieur à ${minimumRequired} points.`
          );
          return;
        }
        onApplyDiscount(discountValue, true);
      }
    },
    {
      id: 'first',
      type: 'Première commande',
      discount: 12,
      condition: 'Nouveau client',
      icon: <Gift size={16} color="#fff" />,
      gradient: ['#10B981', '#059669'],
      isActive: globalDiscountPercentage === 12,
      isAvailable: Math.random() > 0.3, // Simulation
      onPress: () => {
        animatePress('first');
        const isFirstOrder = Math.random() > 0.3; // Simulation
        if (isFirstOrder) {
          onApplyDiscount(12, false);
        } else {
          Alert.alert(
            "Remise non disponible",
            "Cette remise est réservée aux nouveaux clients ou premières commandes."
          );
        }
      }
    }
  ];

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Sparkles size={16} color="#FFD700" />
        <Text style={styles.sectionTitle}>Offres de Réduction</Text>
        <Sparkles size={16} color="#FFD700" />
      </View>
      
      <View style={styles.discountGrid}>
        {discounts.map((discount, index) => (
          <Animated.View
            key={discount.id}
            style={[
              styles.discountCardContainer,
              {
                transform: [{ scale: animatedValues[discount.id as keyof typeof animatedValues] }]
              }
            ]}
          >
            <TouchableOpacity
              style={[
                styles.discountCard,
                discount.isActive && styles.activeCard,
                !discount.isAvailable && styles.disabledCard
              ]}
              onPress={discount.onPress}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={discount.isAvailable ? discount.gradient as any : ['#E5E7EB', '#D1D5DB'] as any}
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {/* Badge de réduction */}
                <View style={styles.discountBadge}>
                  <Text style={styles.discountPercentage}>
                    -{discount.discount}%
                  </Text>
                </View>

                {/* Contenu principal */}
                <View style={styles.cardMainContent}>
                  {/* Icône */}
                  <View style={styles.iconContainer}>
                    {discount.icon}
                  </View>

                  {/* Informations */}
                  <View style={styles.cardContent}>
                    <Text style={styles.discountType}>{discount.type}</Text>
                    <Text style={styles.discountCondition}>{discount.condition}</Text>
                    
                    {/* Calcul dynamique des économies et prix */}
                    {discount.isAvailable && discount.discount > 0 && (
                      <View style={styles.savingsContainer}>
                        <View style={styles.priceComparison}>
                          <Text style={styles.originalPrice}>
                            {formatAmount(cartTotal)}
                          </Text>
                          <Text style={styles.arrowText}>→</Text>
                          <Text style={styles.discountedPrice}>
                            {calculateDiscountedPrice(cartTotal, discount.discount)}
                          </Text>
                        </View>
                        <Text style={styles.savingsText}>
                          Économie: {calculateSavings(discount.discount)}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Status */}
                  <View style={styles.statusContainer}>
                    {discount.isActive ? (
                      <View style={styles.appliedContainer}>
                        <Text style={styles.appliedText}>✓</Text>
                      </View>
                    ) : !discount.isAvailable && discount.requiresMinimum ? (
                      <View style={styles.upgradeContainer}>
                        <Text style={styles.upgradeText}>
                          +{((discount.minimumAmount || 0) - cartTotal).toLocaleString()}
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.availableContainer}>
                        <Text style={styles.availableText}>Appliquer</Text>
                      </View>
                    )}
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      {/* Résumé des économies totales */}
      {globalDiscountPercentage > 0 && (
        <View style={styles.totalSavingsContainer}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.totalSavingsCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Star size={14} color="#fff" />
            <Text style={styles.totalSavingsText}>
              Vous économisez {calculateSavings(globalDiscountPercentage)} !
            </Text>
          </LinearGradient>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  discountGrid: {
    gap: 12,
  },
  discountCardContainer: {
    marginBottom: 8,
  },
  discountCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  activeCard: {
    elevation: 8,
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  disabledCard: {
    opacity: 0.6,
  },
  cardGradient: {
    padding: 16,
    position: 'relative',
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  discountPercentage: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  iconContainer: {
    marginBottom: 12,
  },
  cardContent: {
    gap: 4,
  },
  discountType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  discountCondition: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  savingsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  appliedContainer: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  appliedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  upgradeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  upgradeText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  availableContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  availableText: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
  },
  totalSavingsContainer: {
    marginTop: 16,
  },
  totalSavingsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  totalSavingsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  cardMainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    padding: 0,
  },
  statusContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  priceComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  originalPrice: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    textDecorationLine: 'line-through',
  },
  arrowText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  discountedPrice: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
});
