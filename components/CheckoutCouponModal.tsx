import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
} from 'react-native';
import { X, Ticket, Star, Sparkles } from 'lucide-react-native';
import { useState, useEffect, useRef } from 'react';
import { useResponsiveModalStyles } from '@/hooks/useResponsiveDimensions';
import { useCoupon } from '@/contexts/CouponContext';
import { useCart } from '@/contexts/CartContext';
import { Coupon, availableCoupons } from '@/data/coupons';
import AnimatedCoupon from './AnimatedCoupon';

interface CheckoutCouponModalProps {
  visible: boolean;
  onClose: () => void;
  onCouponSelected: (coupon: Coupon) => void;
}

export default function CheckoutCouponModal({
  visible,
  onClose,
  onCouponSelected
}: CheckoutCouponModalProps) {
  const { 
    isPremiumMember, 
    subscribeToPremium, 
    userTotalPointsSpent, 
    checkCouponEligibility 
  } = useCoupon();
  const { cartTotal } = useCart();
  const responsiveStyles = useResponsiveModalStyles();
  const [showSubscriptionPrompt, setShowSubscriptionPrompt] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [couponAnimationActive, setCouponAnimationActive] = useState(false);
  const [subscriptionMethod, setSubscriptionMethod] = useState<'points' | 'mobile_money'>('points');
  
  // Catégoriser les coupons disponibles selon les nouvelles règles
  const basicCoupons = availableCoupons.filter(c => c.discount === 5);
  const intermediateCoupons = availableCoupons.filter(c => c.discount === 10 && c.minUserPoints && c.minUserPoints >= 60);
  const premiumCoupons = availableCoupons.filter(c => c.discount > 10 && c.requiresPremium);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  useEffect(() => {
    if (visible) {
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
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
      slideAnim.setValue(50);
    }
  }, [visible]);

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
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleCouponSelect = (coupon: Coupon) => {
    // Ajouter des logs pour déboguer
    console.log('Coupon sélectionné:', coupon);
    console.log('État premium actuel:', isPremiumMember);
    console.log('Le coupon requiert premium:', coupon.requiresPremium);
    
    // IMPORTANT: D'abord vérifier si le coupon nécessite un abonnement premium
    // et montrer le modal de souscription avant toute autre vérification
    if (coupon.requiresPremium && !isPremiumMember) {
      console.log('Affichage du modal d\'abonnement premium');
      setSelectedCoupon(coupon);
      setShowSubscriptionPrompt(true);
      return;
    }
    
    // Ensuite vérifier les autres conditions d'éligibilité
    const { eligible, reason } = checkCouponEligibility(coupon);
    console.log('Éligibilité du coupon:', { eligible, reason });
    
    if (!eligible) {
      Alert.alert('Coupon non disponible', reason || 'Vous ne remplissez pas les conditions pour ce coupon');
      return;
    }
    
    // Application directe du coupon
    console.log('Application du coupon');
    setSelectedCoupon(coupon);
    setCouponAnimationActive(true);
    
    // Afficher animation et ensuite appliquer le coupon
    setTimeout(() => {
      setCouponAnimationActive(false);
      onCouponSelected(coupon);
      handleClose();
    }, 2000);
  };
  
  const handleSubscribe = async () => {
    console.log('Tentative d\'abonnement avec la méthode:', subscriptionMethod);
    const success = await subscribeToPremium(subscriptionMethod);
    console.log('Résultat de l\'abonnement:', success);
    
    if (success && selectedCoupon) {
      Alert.alert('Félicitations !', 'Vous êtes maintenant membre Premium ! Votre coupon a été appliqué.');
      setShowSubscriptionPrompt(false);
      setCouponAnimationActive(true);
      
      // Afficher animation et ensuite appliquer le coupon
      setTimeout(() => {
        setCouponAnimationActive(false);
        onCouponSelected(selectedCoupon);
        handleClose();
      }, 2000);
    } else {
      Alert.alert('Échec', 'L\'abonnement premium n\'a pas pu être complété. Veuillez réessayer.');
    }
  };

  return (
    <>
      {/* Modal pour les coupons */}
      <Modal
        visible={visible && !showSubscriptionPrompt}
        transparent={true}
        animationType="none"
        onRequestClose={handleClose}
      >
        <TouchableOpacity 
          style={responsiveStyles.overlay} 
          activeOpacity={1} 
          onPress={handleClose}
        >
          <Animated.View 
            style={[
              styles.container,
              {
                width: responsiveStyles.container.maxWidth,
                maxHeight: responsiveStyles.container.maxHeight,
                borderRadius: responsiveStyles.container.borderRadius,
                shadowColor: responsiveStyles.container.shadowColor,
                shadowOffset: responsiveStyles.container.shadowOffset,
                shadowOpacity: responsiveStyles.container.shadowOpacity,
                shadowRadius: responsiveStyles.container.shadowRadius,
                elevation: responsiveStyles.container.elevation,
                opacity: fadeAnim,
                transform: [
                  { scale: scaleAnim },
                  { translateY: slideAnim }
                ],
              }
            ]}
            onStartShouldSetResponder={() => true}
            onResponderGrant={(e) => e.stopPropagation()}
          >
            <View style={styles.header}>
              <Text style={styles.title}>Coupons disponibles</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <X size={24} color="#8E8E8E" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.content}>
              <Text style={styles.sectionTitle}>Coupons standards (5%)</Text>
              <View style={styles.couponsGrid}>
                {basicCoupons.map((coupon) => (
                  <TouchableOpacity 
                    key={coupon.code}
                    style={styles.couponCard}
                    onPress={() => handleCouponSelect(coupon)}
                  >
                    <View style={styles.couponDiscount}>
                      <Text style={styles.couponDiscountValue}>-{coupon.discount}%</Text>
                    </View>
                    <Text style={styles.couponCode}>{coupon.code}</Text>
                    <Text style={styles.couponDesc} numberOfLines={2}>{coupon.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {intermediateCoupons.length > 0 && (
                <>
                  <Text style={[styles.sectionTitle, {marginTop: 20}]}>Coupons fidélité (10%)</Text>
                  <View style={styles.couponsGrid}>
                    {intermediateCoupons.map((coupon) => (
                      <TouchableOpacity 
                        key={coupon.code}
                        style={[styles.couponCard, styles.intermediateCouponCard]}
                        onPress={() => handleCouponSelect(coupon)}
                      >
                        <View style={[styles.couponDiscount, styles.intermediateCouponDiscount]}>
                          <Text style={styles.couponDiscountValue}>-{coupon.discount}%</Text>
                        </View>
                        {coupon.minUserPoints && (
                          <View style={styles.pointsRequirementBadge}>
                            <Text style={styles.pointsRequirementText}>{coupon.minUserPoints}+ pts</Text>
                          </View>
                        )}
                        <Text style={styles.couponCode}>{coupon.code}</Text>
                        <Text style={styles.couponDesc} numberOfLines={2}>{coupon.description}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
              
              <Text style={[styles.sectionTitle, {marginTop: 20}]}>Coupons premium (20% et plus)</Text>
              <View style={styles.couponsGrid}>
                {premiumCoupons.map((coupon) => (
                  <TouchableOpacity 
                    key={coupon.code}
                    style={[styles.couponCard, styles.premiumCouponCard]}
                    onPress={() => handleCouponSelect(coupon)}
                  >
                    <View style={[styles.couponDiscount, styles.premiumCouponDiscount]}>
                      <Text style={styles.couponDiscountValue}>-{coupon.discount}%</Text>
                    </View>
                    <View style={styles.premiumBadge}>
                      <Star size={12} color="#FFF" />
                      <Text style={styles.premiumBadgeText}>Premium</Text>
                    </View>
                    <Text style={styles.couponCode}>{coupon.code}</Text>
                    <Text style={styles.couponDesc} numberOfLines={2}>{coupon.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
      
      {/* Modal pour l'abonnement premium */}
      <Modal
        visible={visible && showSubscriptionPrompt}
        transparent={true}
        animationType="none"
        onRequestClose={() => setShowSubscriptionPrompt(false)}
      >
        <TouchableOpacity 
          style={responsiveStyles.overlay} 
          activeOpacity={1} 
          onPress={() => setShowSubscriptionPrompt(false)}
        >
          <Animated.View 
            style={[
              styles.container,
              {
                width: responsiveStyles.container.maxWidth,
                maxHeight: responsiveStyles.container.maxHeight,
                borderRadius: responsiveStyles.container.borderRadius,
                shadowColor: responsiveStyles.container.shadowColor,
                shadowOffset: responsiveStyles.container.shadowOffset,
                shadowOpacity: responsiveStyles.container.shadowOpacity,
                shadowRadius: responsiveStyles.container.shadowRadius,
                elevation: responsiveStyles.container.elevation,
                opacity: fadeAnim,
                transform: [
                  { scale: scaleAnim },
                  { translateY: slideAnim }
                ],
              }
            ]}
            onStartShouldSetResponder={() => true}
            onResponderGrant={(e) => e.stopPropagation()}
          >
            <View style={styles.header}>
              <Text style={styles.title}>Devenir membre Premium</Text>
              <TouchableOpacity onPress={() => setShowSubscriptionPrompt(false)} style={styles.closeButton}>
                <X size={24} color="#8E8E8E" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.subscriptionContent}>
              <View style={styles.premiumIconContainer}>
                <Star size={60} color="#FFD700" />
              </View>
              
              <Text style={styles.premiumTitle}>Débloquez des avantages exclusifs</Text>
              <Text style={styles.premiumDescription}>
                Abonnez-vous à notre programme Premium pour accéder à des coupons exclusifs avec
                des réductions allant jusqu'à 20% sur toutes vos commandes !
              </Text>
              
              <View style={styles.benefitsList}>
                <View style={styles.benefitItem}>
                  <Ticket size={20} color="#00B14F" />
                  <Text style={styles.benefitText}>Coupons exclusifs (10%, 15%, 20%)</Text>
                </View>
                
                <View style={styles.benefitItem}>
                  <Sparkles size={20} color="#00B14F" />
                  <Text style={styles.benefitText}>Points bonus sur vos achats</Text>
                </View>
                
                <View style={styles.benefitItem}>
                  <Star size={20} color="#00B14F" />
                  <Text style={styles.benefitText}>Accès aux offres spéciales</Text>
                </View>
              </View>
              
              <Text style={styles.paymentMethodTitle}>Mode de paiement</Text>
              
              <View style={styles.paymentOptions}>
                <TouchableOpacity
                  style={[
                    styles.paymentOption,
                    subscriptionMethod === 'points' && styles.selectedPaymentOption
                  ]}
                  onPress={() => setSubscriptionMethod('points')}
                >
                  <Text style={styles.paymentOptionText}>Payer avec 500 points</Text>
                  {subscriptionMethod === 'points' && (
                    <View style={styles.paymentSelectedIndicator} />
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.paymentOption,
                    subscriptionMethod === 'mobile_money' && styles.selectedPaymentOption
                  ]}
                  onPress={() => setSubscriptionMethod('mobile_money')}
                >
                  <Text style={styles.paymentOptionText}>Payer avec Mobile Money (500 FCFA)</Text>
                  {subscriptionMethod === 'mobile_money' && (
                    <View style={styles.paymentSelectedIndicator} />
                  )}
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                style={styles.subscribePremiumButton}
                onPress={handleSubscribe}
              >
                <Text style={styles.subscribePremiumButtonText}>S'abonner maintenant</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
      
      {/* Animation de coupon lors de l'application */}
      {couponAnimationActive && selectedCoupon && (
        <View style={styles.couponAnimationContainer}>
          <AnimatedCoupon
            visible={couponAnimationActive}
            couponCode={selectedCoupon.code}
            discount={selectedCoupon.discount}
            onAnimationEnd={() => setCouponAnimationActive(false)}
          />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    width: '90%',
    maxWidth: 450,
    maxHeight: '80%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  closeButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  couponsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  couponCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
    overflow: 'hidden',
  },
  intermediateCouponCard: {
    backgroundColor: '#F0F9FF',
    borderColor: '#2196F3',
  },
  premiumCouponCard: {
    backgroundColor: '#FFF9E6',
    borderColor: '#FFD700',
  },
  couponDiscount: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#00B14F',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderBottomLeftRadius: 12,
  },
  intermediateCouponDiscount: {
    backgroundColor: '#2196F3',
  },
  premiumCouponDiscount: {
    backgroundColor: '#FFD700',
  },
  pointsRequirementBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  pointsRequirementText: {
    fontSize: 10,
    color: '#2196F3',
    fontWeight: '600',
  },
  couponDiscountValue: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  couponCode: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 5,
    color: '#333',
  },
  couponDesc: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#B7791F',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  premiumBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 3,
  },
  
  // Styles pour l'abonnement premium
  subscriptionContent: {
    padding: 20,
    alignItems: 'center',
  },
  premiumIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF9E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  premiumTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  premiumDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  benefitsList: {
    width: '100%',
    marginBottom: 30,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#F0F9F4',
    padding: 12,
    borderRadius: 8,
  },
  benefitText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
  subscribePremiumButton: {
    backgroundColor: '#00B14F', // Couleur verte pour attirer l'attention
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#006F32',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
    marginTop: 10,
    marginBottom: 5,
    width: '100%',
  },
  subscribePremiumButtonText: {
    color: '#FFFFFF', // Texte blanc pour meilleur contraste
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase', // Majuscules pour plus d'impact
    letterSpacing: 1,
  },
  
  // Styles pour les options de paiement
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  paymentOptions: {
    width: '100%',
    marginBottom: 20,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  selectedPaymentOption: {
    borderColor: '#FFD700',
    backgroundColor: '#FFFBEB',
  },
  paymentOptionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  paymentSelectedIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFD700',
  },
  
  // Styles pour l'animation de coupon
  couponAnimationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    pointerEvents: 'none',
  },
});
