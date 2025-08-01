import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  ScrollView,
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
  onShowGoldPromo?: () => void;
  isGoldMember?: boolean; // Nouveau prop pour le statut Gold réel
  goldMembership?: any; // Nouveau prop pour les détails de l'abonnement
}

export default function DiscountSection({
  cartTotal,
  globalDiscountPercentage,
  user,
  selectedPayment,
  pointsToFcfa,
  onApplyDiscount,
  onShowGoldPromo,
  isGoldMember = false, // Utiliser le statut Gold réel passé en props
  goldMembership
}: DiscountSectionProps) {
  const [animatedValues] = useState({
    standard: new Animated.Value(1),
    premium: new Animated.Value(1),
    first: new Animated.Value(1),
  });

  const animatePress = (type: 'standard' | 'premium' | 'first') => {
    try {
      // Délai pour éviter les conflits avec useInsertionEffect
      setTimeout(() => {
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
      }, 10);
    } catch (error) {
      console.warn('Erreur animation press:', error);
    }
  };

  const formatAmount = (amount: number) => {
    return selectedPayment === 'points' 
      ? `${amount.toLocaleString()} pts`
      : `${pointsToFcfa(amount).toLocaleString()} FCFA`;
  };

  const calculateSavings = (discount: number) => {
    // cartTotal est en points, donc on le convertit en FCFA pour le calcul des économies
    const cartTotalInFcfa = pointsToFcfa(cartTotal);
    const savings = Math.round(cartTotalInFcfa * (discount / 100));
    return `${savings.toLocaleString()} FCFA`;
  };

  const calculateDiscountedPrice = (originalPrice: number, discount: number) => {
    const discountedPrice = originalPrice - Math.round(originalPrice * (discount / 100));
    return formatAmount(discountedPrice);
  };

  // isGoldMember est maintenant passé en props depuis le CheckoutModal

  const discounts = [
    // Réductions disponibles pour tous
    {
      id: 'standard',
      type: 'Standard',
      discount: isGoldMember ? 10 : 5,
      condition: 'Toute commande',
      icon: <Ticket size={12} color="#fff" />,
      gradient: ['#4F46E5', '#7C3AED'],
      isActive: globalDiscountPercentage === (isGoldMember ? 10 : 5),
      isAvailable: true,
      isGoldOnly: false,
      onPress: () => {
        animatePress('standard');
        const discountValue = isGoldMember ? 10 : 5;
        onApplyDiscount(discountValue, false);
      }
    },
    {
      id: 'premium',
      type: 'Premium',
      discount: isGoldMember ? 15 : 7,
      condition: isGoldMember ? '> 80 pts' : '> 70 pts',
      icon: <Crown size={12} color="#fff" />,
      gradient: ['#F59E0B', '#EF4444'],
      isActive: globalDiscountPercentage === (isGoldMember ? 15 : 7),
      isAvailable: isGoldMember ? cartTotal > 80 : cartTotal > 70,
      isGoldOnly: false,
      onPress: () => {
        animatePress('premium');
        const minimumRequired = isGoldMember ? 80 : 70;
        const discountValue = isGoldMember ? 15 : 7;
        
        if (cartTotal <= minimumRequired) {
          Alert.alert(
            "Remise non disponible", 
            `Cette remise nécessite un total > ${minimumRequired} points.`
          );
          return;
        }
        onApplyDiscount(discountValue, true);
      }
    },
    // Réductions Gold exclusives 
    {
      id: 'gold-exclusive',
      type: 'Gold Exclusive',
      discount: 20,
      condition: '> 100 pts',
      icon: <Crown size={12} color={isGoldMember ? "#FFD700" : "#9CA3AF"} />,
      gradient: isGoldMember ? ['#FFD700', '#FFA500'] : ['#E5E7EB', '#D1D5DB'],
      isActive: globalDiscountPercentage === 20,
      isAvailable: isGoldMember && cartTotal > 100,
      isGoldOnly: !isGoldMember,
      onPress: () => {
        animatePress('premium');
        if (!isGoldMember) {
          onShowGoldPromo?.();
        } else if (cartTotal <= 100) {
          Alert.alert(
            "Remise non disponible", 
            "Cette remise nécessite un total > 100 points."
          );
        } else {
          onApplyDiscount(20, true);
        }
      }
    },
    {
      id: 'gold-flash',
      type: 'Flash Gold',
      discount: 25,
      condition: 'Membre Gold',
      icon: <Star size={12} color={isGoldMember ? "#FFD700" : "#9CA3AF"} />,
      gradient: isGoldMember ? ['#FF6B6B', '#FF8E53'] : ['#E5E7EB', '#D1D5DB'],
      isActive: globalDiscountPercentage === 25,
      isAvailable: isGoldMember,
      isGoldOnly: !isGoldMember,
      onPress: () => {
        animatePress('first');
        if (!isGoldMember) {
          onShowGoldPromo?.();
        } else {
          onApplyDiscount(25, false);
        }
      }
    }
  ];

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Sparkles size={12} color="#FFD700" />
        <Text style={styles.sectionTitle}>Réductions</Text>
        {isGoldMember && (
          <View style={styles.goldBadge}>
            <Crown size={10} color="#FFD700" />
            <Text style={styles.goldBadgeText}>GOLD</Text>
          </View>
        )}
        <Sparkles size={12} color="#FFD700" />
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.discountScrollView}
        contentContainerStyle={styles.discountGrid}
      >
        {discounts.map((discount, index) => (
          <Animated.View
            key={discount.id}
            style={[
              styles.discountCardContainer,
              {
                transform: [{ scale: animatedValues[discount.id as keyof typeof animatedValues] || new Animated.Value(1) }]
              }
            ]}
          >
            <TouchableOpacity
              style={[
                styles.discountCard,
                discount.isActive && styles.activeCard,
                (!discount.isAvailable || discount.isGoldOnly) && styles.disabledCard
              ]}
              onPress={discount.onPress}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={discount.isAvailable && !discount.isGoldOnly ? discount.gradient as any : ['#E5E7EB', '#D1D5DB'] as any}
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {/* Contenu principal */}
                <View style={styles.cardMainContent}>
                  {/* Header avec icône et status */}
                  <View style={styles.cardHeader}>
                    <View style={styles.iconContainer}>
                      {discount.icon}
                    </View>
                    
                    {/* Status */}
                    <View style={styles.statusContainer}>
                      {discount.isActive ? (
                        <View style={styles.appliedContainer}>
                          <Text style={styles.appliedText}>✓</Text>
                        </View>
                      ) : discount.isGoldOnly ? (
                        <View style={styles.goldOnlyContainer}>
                          <Text style={styles.goldOnlyText}>👑</Text>
                        </View>
                      ) : !discount.isAvailable ? (
                        <View style={styles.upgradeContainer}>
                          <Text style={styles.upgradeText}>Non dispo</Text>
                        </View>
                      ) : (
                        <View style={styles.availableContainer}>
                          <Text style={styles.availableText}>Appliquer</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Informations */}
                  <View style={styles.cardContent}>
                    <View style={styles.titleRow}>
                      <Text style={styles.discountType}>{discount.type}</Text>
                      <Text style={styles.discountPercentage}>-{discount.discount}%</Text>
                    </View>
                    <Text style={styles.discountCondition}>{discount.condition}</Text>
                    
                    {/* Calcul dynamique des économies et prix */}
                    {discount.isAvailable && !discount.isGoldOnly && discount.discount > 0 && (
                      <View style={styles.savingsContainer}>
                        <Text style={styles.savingsText}>
                          -{calculateSavings(discount.discount)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>

      {/* Résumé des économies totales - plus compact */}
      {globalDiscountPercentage > 0 && (
        <View style={styles.totalSavingsContainer}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.totalSavingsCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Star size={12} color="#fff" />
            <Text style={styles.totalSavingsText}>
              Économie: {calculateSavings(globalDiscountPercentage)}
            </Text>
          </LinearGradient>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  discountScrollView: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  discountGrid: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 16,
  },
  discountCardContainer: {
    width: 220,
    marginBottom: 4,
  },
  discountCard: {
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    padding: 12,
    position: 'relative',
  },
  iconContainer: {
    marginBottom: 0,
  },
  cardContent: {
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
    width: '100%',
  },
  discountType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    marginRight: 12,
  },
  discountPercentage: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 40,
    textAlign: 'center',
  },
  discountCondition: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 6,
  },
  savingsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginBottom: 6,
  },
  savingsText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  appliedContainer: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  appliedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  upgradeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  upgradeText: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  availableContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  availableText: {
    fontSize: 10,
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
    flexDirection: 'column',
    alignItems: 'flex-start',
    flex: 1,
    padding: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 6,
  },
  statusContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
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
  goldOnlyContainer: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  goldOnlyText: {
    fontSize: 10,
    textAlign: 'center',
  },
  goldBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  goldBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFD700',
  },
});
