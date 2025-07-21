import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
  Alert,
} from 'react-native';
import { X, CreditCard, Smartphone, MapPin, Clock, Ticket, Percent, Plus, Minus } from 'lucide-react-native';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { pointsToFcfa, fcfaToPoints, generateMobileMoneyFees } from '@/utils/pointsConversion';
import { useResponsiveModalStyles } from '@/hooks/useResponsiveDimensions';
import CouponModal from './CouponModal';
import { Coupon } from '@/data/coupons';
import AnimatedCoupon from './AnimatedCoupon';
import PromoPopup from './PromoPopup';
import GoldMembershipPromo from './GoldMembershipPromo';
import DiscountSection from './DiscountSection';

interface CheckoutModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ visible, onClose }: CheckoutModalProps) {
  const { cartItems, cartTotal, clearCart, applyCoupon, updateQuantity } = useCart();
  const { user, updateUserPoints } = useAuth();
  const responsiveStyles = useResponsiveModalStyles();
  // État pour contrôler la visibilité de la popup Gold (déplacé en haut)
  const [showGoldPopup, setShowGoldPopup] = useState(false);
  const [showGoldMembershipPromo, setShowGoldMembershipPromo] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<'points' | 'mtn' | 'orange' | 'moov'>('points');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [selectedCartItemId, setSelectedCartItemId] = useState<string | null>(null);
  const [showCouponAnimation, setShowCouponAnimation] = useState(false);
  const [animatedCouponData, setAnimatedCouponData] = useState<{ code: string, discount: number } | null>(null);
  const [globalDiscountPercentage, setGlobalDiscountPercentage] = useState(0);
  const [originalTotal, setOriginalTotal] = useState(cartTotal);
  const [discountedTotal, setDiscountedTotal] = useState(cartTotal);
  
  // Génération de frais pour chaque méthode mobile money
  const [mobileFees] = useState({
    mtn: generateMobileMoneyFees(),
    orange: generateMobileMoneyFees(),
    moov: generateMobileMoneyFees(),
  });

  // Mettre à jour les totaux quand cartTotal change (à cause des coupons ou modifications du panier)
  useEffect(() => {
    if (globalDiscountPercentage === 0) {
      setOriginalTotal(cartTotal);
      setDiscountedTotal(cartTotal);
    } else {
      const discounted = Math.round(cartTotal * (1 - globalDiscountPercentage / 100));
      setOriginalTotal(cartTotal);
      setDiscountedTotal(discounted);
    }
  }, [cartTotal, globalDiscountPercentage]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
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
      slideAnim.setValue(50);
    }
  }, [visible]);

  const handleClose = () => {
    if (isProcessing) return;
    
    // Version simplifiée pour éviter les problèmes de référence
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
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

  const handlePayment = () => {
    // Vérifier si l'utilisateur a assez de points pour le paiement en points
    if (selectedPayment === 'points' && (!user || user.points < cartTotal)) {
      Alert.alert(
        'Solde insuffisant', 
        `Vous avez ${user?.points?.toLocaleString() || 0} points mais il vous faut ${cartTotal.toLocaleString()} points pour cette commande.`
      );
      return;
    }

    setIsProcessing(true);
    
    // Simulation du paiement
    setTimeout(async () => {
      setIsProcessing(false);
      
      // Si paiement en points, déduire les points
      if (selectedPayment === 'points') {
        await updateUserPoints(-cartTotal);
      }
      
      clearCart();
      Alert.alert(
        'Commande confirmée !',
        selectedPayment === 'points' 
          ? `Commande payée avec ${cartTotal.toLocaleString()} points !\nVous recevrez une notification quand elle sera prête.`
          : 'Votre commande a été passée avec succès. Vous recevrez une notification quand elle sera prête.',
        [{ text: 'OK', onPress: handleClose }]
      );
    }, 2000);
  };

  const pointsPayment = {
    id: 'points', 
    name: 'Payer avec mes points', 
    icon: CreditCard, 
    color: '#00B14F'
  };

  const mobileMoneyMethods = [
    { id: 'mtn', name: 'MTN Mobile Money', icon: Smartphone, color: '#FFCC00', fee: mobileFees.mtn },
    { id: 'orange', name: 'Orange Money', icon: Smartphone, color: '#FF6600', fee: mobileFees.orange },
    { id: 'moov', name: 'Moov Money', icon: Smartphone, color: '#007FFF', fee: mobileFees.moov },
  ];

  const formatCustomizations = (customizations: any[]) => {
    if (!customizations || !Array.isArray(customizations)) {
      return '';
    }
    
    return customizations.map(cat => {
      // Vérifier si c'est la nouvelle structure avec selectedOptions
      if (cat.selectedOptions && Array.isArray(cat.selectedOptions)) {
        return `${cat.categoryName || cat.name}: ${cat.selectedOptions.map((opt: any) => opt.name).join(', ')}`;
      }
      // Ancienne structure avec options directes
      else if (cat.options && Array.isArray(cat.options)) {
        return `${cat.name}: ${cat.options.map((opt: any) => opt.name).join(', ')}`;
      }
      // Structure simple avec juste le nom
      else if (cat.name) {
        return cat.name;
      }
      return '';
    }).filter(str => str.length > 0).join(' | ');
  };

  const handleApplyCoupon = (coupon: Coupon) => {
    if (selectedCartItemId) {
      applyCoupon(selectedCartItemId, coupon.code, coupon.discount);
      setSelectedCartItemId(null);
      setShowCouponModal(false);
      
      // Déclencher l'animation
      setAnimatedCouponData({
        code: coupon.code,
        discount: coupon.discount
      });
      setShowCouponAnimation(true);
      
      setTimeout(() => {
        setShowCouponAnimation(false);
      }, 2500);
    }
  };
  
  // Gestionnaire pour appliquer une remise (Gold et Classic)
  const handleApplyDiscount = (discountPercentage: number, checkMinimum = false) => {
    // Vérifier les conditions selon le type de membre
    if (checkMinimum) {
      const minimumRequired = user?.membershipType === 'gold' ? 80 : 70;
      if (cartTotal <= minimumRequired) {
        Alert.alert(
          "Remise non disponible", 
          `Cette remise nécessite un total de commande supérieur à ${minimumRequired} points.`
        );
        return;
      }
    }
    
    setGlobalDiscountPercentage(discountPercentage);
    
    // Calculer le total avec réduction
    const discounted = Math.round(cartTotal * (1 - discountPercentage / 100));
    setOriginalTotal(cartTotal);
    setDiscountedTotal(discounted);
    
    // Enregistrer la remise dans la base de données (simulation)
    const membershipType = user?.membershipType || 'classic';
    console.log(`Remise ${membershipType} appliquée: ${discountPercentage}% pour le membre ${user?.id}`);
    
    // Afficher une notification
    Alert.alert(
      "🎉 Remise appliquée !",
      `Une remise de ${discountPercentage}% a été appliquée à votre commande.\n\nNouveau total: ${formatAmount(discounted)}`,
      [{ text: "Super !", style: "default" }]
    );
  };
  
  const formatAmount = (amount: number) => {
    return selectedPayment === 'points' 
      ? `${amount.toLocaleString()} pts`
      : `${pointsToFcfa(amount).toLocaleString()} FCFA`;
  };
  
  // Gestionnaire pour promouvoir Gold (ancienne fonction)
  const handleApplyGoldDiscount = (discountPercentage: number, checkMinimum = false) => {
    // Si l'utilisateur n'est pas Gold, montrer la promo
    if (!user || user.membershipType !== 'gold') {
      setTimeout(() => {
        setShowGoldMembershipPromo(true);
      }, 0);
      return;
    }
    
    // Si Gold, appliquer la remise directement
    handleApplyDiscount(discountPercentage, checkMinimum);
  };

  return (
    <>
      {/* Modal principal de checkout */}
      {visible && (
        <Modal
          visible={visible}
          transparent={true}
          animationType="none"
          onRequestClose={handleClose}
          statusBarTranslucent={true}
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
                    { translateY: slideAnim }
                  ],
                  backgroundColor: '#FFF',
                  borderRadius: 25,
                  width: '95%',
                  height: '92%',
                  alignSelf: 'center',
                  marginTop: '4%',
                }
              ]}
            >
              <View style={responsiveStyles.header}>
                <Text style={responsiveStyles.title}>Récapitulatif de commande</Text>
                <TouchableOpacity onPress={handleClose} style={responsiveStyles.closeButton}>
                  <X size={24} color="#000" />
                </TouchableOpacity>
              </View>

              <ScrollView style={responsiveStyles.content} showsVerticalScrollIndicator={false}>
                {/* Informations de livraison */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Livraison</Text>
                  <View style={styles.deliveryInfo}>
                    <MapPin size={16} color="#666" />
                    <Text style={styles.deliveryText}>Cocody, Abidjan</Text>
                  </View>
                  <View style={styles.deliveryInfo}>
                    <Clock size={16} color="#666" />
                    <Text style={styles.deliveryText}>Livraison estimée: 30-45 min</Text>
                  </View>
                </View>

                {/* Nouvelle zone de réductions stylée */}
                <DiscountSection
                  cartTotal={cartTotal}
                  globalDiscountPercentage={globalDiscountPercentage}
                  user={user}
                  selectedPayment={selectedPayment}
                  pointsToFcfa={pointsToFcfa}
                  onApplyDiscount={handleApplyDiscount}
                  onShowGoldPromo={() => setShowGoldMembershipPromo(true)}
                />

                {/* Articles commandés */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Articles commandés</Text>
                  {cartItems.map((item) => (
                    <View key={item.id} style={styles.orderItem}>
                      <Image source={{ uri: item.productImage }} style={styles.itemImage} />
                      
                      <View style={styles.itemDetails}>
                        <Text style={styles.itemName}>{item.productName}</Text>
                        <Text style={styles.providerName}>{item.providerName}</Text>
                        
                        {item.customizations && item.customizations.length > 0 && (
                          <Text style={styles.customizations} numberOfLines={2}>
                            {formatCustomizations(item.customizations)}
                          </Text>
                        )}
                        
                        {item.extras && item.extras.length > 0 && (
                          <Text style={styles.extras} numberOfLines={2}>
                            Extras: {item.extras.map(extra => extra.name).join(', ')}
                          </Text>
                        )}
                        
                        {item.couponCode && (
                          <Text style={styles.couponApplied}>
                            Coupon appliqué: -{item.couponDiscount}%
                          </Text>
                        )}
                        

                        <View style={styles.itemFooter}>
                          <View style={styles.quantityControls}>
                            <TouchableOpacity 
                              style={styles.quantityControlButton}
                              onPress={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus size={16} color="#333" />
                            </TouchableOpacity>
                            <Text style={styles.quantityText}>{item.quantity}</Text>
                            <TouchableOpacity 
                              style={styles.quantityControlButton}
                              onPress={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus size={16} color="#333" />
                            </TouchableOpacity>
                          </View>
                          <Text style={styles.itemPrice}>
                            {item.totalPrice.toLocaleString()} pts
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Méthode de paiement */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Méthode de paiement</Text>
                  <TouchableOpacity
                    style={[
                      styles.paymentMethod,
                      selectedPayment === 'points' && styles.selectedMethod
                    ]}
                    onPress={() => setSelectedPayment('points')}
                  >
                    <View style={styles.methodContent}>
                      <View style={[styles.methodIcon, { backgroundColor: pointsPayment.color }]}>
                        <pointsPayment.icon size={20} color="#fff" />
                      </View>
                      <View style={styles.methodInfo}>
                        <Text style={styles.methodName}>{pointsPayment.name}</Text>
                        <Text style={styles.pointsBalance}>
                          Solde: {user?.points?.toLocaleString() || 0} pts
                        </Text>
                      </View>
                    </View>
                    <View style={styles.radioOuter}>
                      {selectedPayment === 'points' && (
                        <View style={styles.radioInner} />
                      )}
                    </View>
                  </TouchableOpacity>

                  {mobileMoneyMethods.map(method => (
                    <TouchableOpacity
                      key={method.id}
                      style={[
                        styles.paymentMethod,
                        selectedPayment === method.id && styles.selectedMethod
                      ]}
                      onPress={() => setSelectedPayment(method.id as any)}
                    >
                      <View style={styles.methodContent}>
                        <View style={[styles.methodIcon, { backgroundColor: method.color }]}>
                          <method.icon size={20} color="#fff" />
                        </View>
                        <View style={styles.methodInfo}>
                          <Text style={styles.methodName}>{method.name}</Text>
                          <Text style={styles.methodFee}>
                            +{method.fee} FCFA de frais
                          </Text>
                        </View>
                      </View>
                      <View style={styles.radioOuter}>
                        {selectedPayment === method.id && (
                          <View style={styles.radioInner} />
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <View style={styles.footer}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <View>
                    {globalDiscountPercentage > 0 && (
                      <Text style={styles.originalPrice}>
                        {selectedPayment === 'points' 
                          ? `${originalTotal.toLocaleString()} pts`
                          : `${pointsToFcfa(originalTotal).toLocaleString()} FCFA`
                        }
                      </Text>
                    )}
                    <Text style={styles.totalAmount}>
                      {selectedPayment === 'points' 
                        ? `${(globalDiscountPercentage > 0 ? discountedTotal : cartTotal).toLocaleString()} pts`
                        : `${pointsToFcfa(globalDiscountPercentage > 0 ? discountedTotal : cartTotal).toLocaleString()} FCFA`
                      }
                    </Text>
                    {globalDiscountPercentage > 0 && (
                      <View style={styles.discountRow}>
                        <Text style={styles.discountText}>
                          Économie: {selectedPayment === 'points' 
                            ? `${(originalTotal - discountedTotal).toLocaleString()} pts`
                            : `${pointsToFcfa(originalTotal - discountedTotal).toLocaleString()} FCFA`
                          }
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.payButton, cartItems.length === 0 && styles.disabledButton]}
                  onPress={handlePayment}
                  disabled={cartItems.length === 0 || isProcessing}
                >
                  {isProcessing ? (
                    <Text style={styles.payButtonText}>Traitement en cours...</Text>
                  ) : (
                    <Text style={styles.payButtonText}>
                      Payer {(globalDiscountPercentage > 0 ? discountedTotal : cartTotal).toLocaleString()} pts
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </Animated.View>
          </Animated.View>
        </Modal>
      )}

      {/* Animation de coupon */}
      <AnimatedCoupon 
        visible={showCouponAnimation}
        couponCode={animatedCouponData?.code}
        discount={animatedCouponData?.discount}
      />

      {/* Modal de sélection de coupon */}
      <CouponModal 
        visible={showCouponModal}
        onClose={() => setShowCouponModal(false)}
        onApplyCoupon={handleApplyCoupon}
        totalPoints={cartTotal}
        providerId={selectedCartItemId ? 
          cartItems.find(item => item.id === selectedCartItemId)?.providerId : undefined}
      />
      
      {/* Popup Gold - placée à la fin pour s'afficher au premier plan */}
      <PromoPopup 
        visible={showGoldPopup} 
        onClose={() => setShowGoldPopup(false)}
      />
      
      {/* Nouvelle popup Gold stylée pour les membres Classic */}
      {showGoldMembershipPromo && (
        <GoldMembershipPromo 
          visible={true}
          onClose={() => setShowGoldMembershipPromo(false)}
          onSubscribe={() => {
            // Logique d'abonnement à implémenter
            Alert.alert("Abonnement", "Redirection vers le processus d'abonnement Gold");
          }}
          onGoldUpgradeSuccess={() => {
            // Mise à jour UI après succès
            setShowGoldMembershipPromo(false);
            // Refresh discounts if needed
            if (user?.membershipType === 'gold') {
              handleApplyDiscount(10, false); // Apply default Gold discount
            }
          }}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  deliveryText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  orderItem: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 12,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  providerName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  customizations: {
    fontSize: 12,
    color: '#555',
    marginTop: 2,
  },
  extras: {
    fontSize: 12,
    color: '#555',
    marginTop: 2,
  },
  couponApplied: {
    fontSize: 12,
    color: '#E53E3E',
    fontWeight: '600',
    marginTop: 4,
  },
  addCouponButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF2F2',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
    marginBottom: 6,
  },
  addCouponText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginLeft: 4,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  quantity: {
    fontSize: 14,
    color: '#666',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00B14F',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  selectedMethod: {
    borderColor: '#00B14F',
    backgroundColor: '#F0FFF4',
  },
  methodContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  pointsBalance: {
    fontSize: 14,
    color: '#666',
  },
  methodFee: {
    fontSize: 14,
    color: '#E53E3E',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00B14F',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: '#FFF',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    textAlign: 'right',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00B14F',
    textAlign: 'right',
  },
  payButton: {
    backgroundColor: '#00B14F',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  payButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F2F2F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  discountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  discountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  // Styles pour la zone de coupons
  couponZone: {
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    padding: 12,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#EEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  couponHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  couponTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
    color: '#333',
  },
  couponDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  upgradeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007BFF',
    textAlign: 'right',
  },
  appliedDiscount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#28A745',
    textAlign: 'right',
  },
  selectedCouponZone: {
    borderWidth: 2,
    borderColor: '#28A745',
    backgroundColor: '#F0FFF4',
  },
  disabledCouponZone: {
    opacity: 0.7,
    backgroundColor: '#F0F0F0',
  },
  unavailableText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },
  couponEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  quantityControlButton: {
    backgroundColor: '#F0F0F0',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 12,
  },
});
