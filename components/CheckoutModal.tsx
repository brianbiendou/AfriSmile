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
import { X, CreditCard, Smartphone, MapPin, Clock, Ticket, Percent, Plus, Minus, ChevronDown, ChevronUp, Calendar } from 'lucide-react-native';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { pointsToFcfa, fcfaToPoints, formatPointsWithFcfa, formatFcfaAmount, formatPointsAmount } from '@/utils/pointsConversion';
import { getFeeByProvider } from '@/utils/mobileMoneyFees';
import { useResponsiveModalStyles } from '@/hooks/useResponsiveDimensions';
import { getResponsiveTextProps, getResponsivePriceStyles } from '@/utils/responsiveStyles';
import { Coupon } from '@/data/coupons';
import AnimatedCoupon from './AnimatedCoupon';
import GoldMembershipPromo from './GoldMembershipPromo';
import DiscountSection from './DiscountSection';
import { useGold } from '@/contexts/GoldContext';

interface CheckoutModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ visible, onClose }: CheckoutModalProps) {
  const { cartItems, cartTotal, clearCart, applyCoupon, updateQuantity } = useCart();
  const { user, updateUserPoints } = useAuth();
  const { triggerGoldUpgradeModal, checkMembershipStatus, membership } = useGold();
  const responsiveStyles = useResponsiveModalStyles();
  // DEBUG: Log styles dynamiques
  console.log('responsiveStyles.header', responsiveStyles.header);
  console.log('responsiveStyles.closeButton', responsiveStyles.closeButton);
  console.log('responsiveStyles.title', responsiveStyles.title);
  console.log('responsiveStyles.content', responsiveStyles.content);
  // État pour contrôler les animations et la logique de paiement
  const [selectedPayment, setSelectedPayment] = useState<'points' | 'mtn' | 'orange' | 'moov'>('points');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCartItemId, setSelectedCartItemId] = useState<string | null>(null);
  const [showCouponAnimation, setShowCouponAnimation] = useState(false);
  const [animatedCouponData, setAnimatedCouponData] = useState<{ code: string, discount: number } | null>(null);
  const [globalDiscountPercentage, setGlobalDiscountPercentage] = useState(0);
  const [originalTotal, setOriginalTotal] = useState(cartTotal);
  const [discountedTotal, setDiscountedTotal] = useState(cartTotal);
  const [isCartExpanded, setIsCartExpanded] = useState(false);
  
  // État pour les frais Mobile Money (chargés de manière asynchrone)
  const [mobileFees, setMobileFees] = useState({
    mtn: 175, // Valeurs par défaut
    orange: 125,
    moov: 100,
  });

  // Charger les frais Mobile Money depuis la base de données
  useEffect(() => {
    const loadMobileFees = async () => {
      try {
        const [mtnFee, orangeFee, moovFee] = await Promise.all([
          getFeeByProvider('mtn'),
          getFeeByProvider('orange'),
          getFeeByProvider('moov')
        ]);
        
        setMobileFees({
          mtn: mtnFee,
          orange: orangeFee,
          moov: moovFee,
        });
      } catch (error) {
        console.error('Erreur lors du chargement des frais Mobile Money:', error);
        // Garder les valeurs par défaut en cas d'erreur
      }
    };

    loadMobileFees();
  }, []);

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

  // Debug: Afficher le statut Gold à chaque ouverture du modal
  useEffect(() => {
    if (visible) {
      const isGold = checkMembershipStatus();
      console.log('🛒 CheckoutModal ouvert - Statut Gold:', isGold ? 'ACTIF ✅' : 'INACTIF ❌');
      console.log('🛒 Détails membership:', membership);
    }
  }, [visible, checkMembershipStatus, membership]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible) {
      // Délai pour éviter les conflits avec useInsertionEffect
      const timeoutId = setTimeout(() => {
        try {
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
        } catch (error) {
          console.warn('Erreur animation CheckoutModal:', error);
          fadeAnim.setValue(1);
          slideAnim.setValue(0);
        }
      }, 50);

      return () => clearTimeout(timeoutId);
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
    }
  }, [visible]);

  const handleClose = () => {
    if (isProcessing) return;
    
    // Délai pour éviter les conflits avec useInsertionEffect
    const timeoutId = setTimeout(() => {
      try {
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
      } catch (error) {
        console.warn('Erreur animation fermeture CheckoutModal:', error);
        onClose();
      }
    }, 10);
  };

  const handlePayment = () => {
    const finalTotal = calculateFinalTotal();
    
    // Vérifier si l'utilisateur a assez de points pour le paiement en points
    if (selectedPayment === 'points' && (!user || user.points < finalTotal)) {
      Alert.alert(
        'Solde insuffisant', 
        `Vous avez ${user?.points?.toLocaleString() || 0} points mais il vous faut ${finalTotal.toLocaleString()} points pour cette commande.`
      );
      return;
    }

    setIsProcessing(true);
    
    // Simulation du paiement
    setTimeout(async () => {
      setIsProcessing(false);
      
      // Si paiement en points, déduire les points
      if (selectedPayment === 'points') {
        await updateUserPoints(-finalTotal);
      }
      
      clearCart();
      
      const feeInfo = selectedPayment !== 'points' ? `\nFrais ${selectedPayment.toUpperCase()}: ${getSelectedMethodFee()} FCFA` : '';
      
      Alert.alert(
        'Commande confirmée !',
        selectedPayment === 'points' 
          ? `Commande payée avec ${finalTotal.toLocaleString()} points !\nVous recevrez une notification quand elle sera prête.`
          : `Votre commande a été passée avec succès.${feeInfo}\nVous recevrez une notification quand elle sera prête.`,
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

  // Fonction pour déterminer si c'est un produit beauté
  const isBeautyProduct = (item: any) => {
    return item.customizations.some((c: any) => 
      c.categoryId === 'booking' || 
      c.categoryName?.toLowerCase().includes('beauté') ||
      c.categoryName?.toLowerCase().includes('service de beauté')
    ) || item.serviceType;
  };

  // Fonction pour formater les détails de réservation
  const formatBookingDetails = (item: any) => {
    if (item.bookingDate && item.bookingTime) {
      const date = new Date(item.bookingDate);
      const formattedDate = date.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long',
        year: 'numeric'
      });
      return {
        date: formattedDate,
        time: item.bookingTime,
        serviceType: item.serviceType
      };
    }
    return null;
  };

  const handleApplyCoupon = (coupon: Coupon) => {
    if (selectedCartItemId) {
      applyCoupon(selectedCartItemId, coupon.code, coupon.discount);
      setSelectedCartItemId(null);
      
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
      `Une remise de ${discountPercentage}% a été appliquée à votre commande.\n\nNouveau total: ${discounted.toLocaleString()} FCFA`,
      [{ text: "Super !", style: "default" }]
    );
  };
  
  const formatAmount = (amount: number) => {
    return selectedPayment === 'points' 
      ? `${amount.toLocaleString()} pts`
      : `${pointsToFcfa(amount).toLocaleString()} FCFA`;
  };

  // Fonction pour calculer le total final avec frais Mobile Money
  const calculateFinalTotal = () => {
    const baseTotal = globalDiscountPercentage > 0 ? discountedTotal : cartTotal;
    
    // Convertir le total FCFA en points
    const baseTotalInPoints = fcfaToPoints(baseTotal);
    
    // Ajouter les frais seulement si ce n'est pas un paiement en points
    if (selectedPayment !== 'points') {
      const selectedFee = mobileFees[selectedPayment as keyof typeof mobileFees] || 0;
      // Convertir les frais FCFA en points pour l'addition
      const feeInPoints = fcfaToPoints(selectedFee);
      return Math.round(baseTotalInPoints + feeInPoints);
    }
    
    return Math.round(baseTotalInPoints);
  };

  // Fonction pour obtenir les frais de la méthode sélectionnée
  const getSelectedMethodFee = () => {
    if (selectedPayment === 'points') return 0;
    return mobileFees[selectedPayment as keyof typeof mobileFees] || 0;
  };
  
  // Gestionnaire pour promouvoir Gold - NOUVEAU SYSTÈME
  const handleApplyGoldDiscount = (discountPercentage: number, checkMinimum = false) => {
    // Si l'utilisateur n'est pas Gold, déclencher le popup Gold
    if (!checkMembershipStatus()) {
      triggerGoldUpgradeModal();
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

                {/* Carte Google Maps */}
                <View style={styles.section}>
                  <View style={styles.mapContainer}>
                    <Image 
                      source={{ uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&h=200&fit=crop' }}
                      style={styles.mapPlaceholder}
                    />
                    <View style={styles.mapOverlay}>
                      <View style={styles.mapMarker}>
                        <View style={styles.markerDot} />
                      </View>
                      <TouchableOpacity style={styles.mapButton}>
                        <Text style={styles.mapButtonText}>Modifier le repère</Text>
                      </TouchableOpacity>
                    </View>
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
                  onShowGoldPromo={triggerGoldUpgradeModal}
                  isGoldMember={checkMembershipStatus()} // Passer le vrai statut Gold
                  goldMembership={membership} // Passer les détails de l'abonnement
                />

                {/* Articles commandés - Liste déroulante */}
                <View style={styles.section}>
                  <TouchableOpacity 
                    style={styles.cartHeaderSection}
                    onPress={() => setIsCartExpanded(!isCartExpanded)}
                  >
                    <View style={styles.cartHeaderContent}>
                      <Text style={styles.cartHeaderTitle}>
                        Articles commandés ({cartItems.length})
                      </Text>
                      <View style={styles.cartHeaderRight}>
                        <View style={styles.cartHeaderTotalContainer}>
                          <Text style={styles.cartHeaderTotal}>
                            {formatPointsAmount(fcfaToPoints(cartTotal))}
                          </Text>
                          <Text style={[styles.cartHeaderTotalFcfa, getResponsiveTextProps('fcfa').style]} 
                                numberOfLines={getResponsiveTextProps('fcfa').numberOfLines}
                                ellipsizeMode={getResponsiveTextProps('fcfa').ellipsizeMode}>
                            {formatFcfaAmount(cartTotal)}
                          </Text>
                        </View>
                        {isCartExpanded ? (
                          <ChevronUp size={20} color="#666" />
                        ) : (
                          <ChevronDown size={20} color="#666" />
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Liste des articles - Visible seulement si déployée */}
                  {isCartExpanded && (
                    <View style={styles.cartItemsContainer}>
                      {cartItems.map((item) => {
                        const bookingDetails = formatBookingDetails(item);
                        const isBeauty = isBeautyProduct(item);
                        
                        return (
                          <View key={item.id} style={styles.orderItem}>
                            <Image source={{ uri: item.productImage }} style={styles.itemImage} />
                            
                            <View style={styles.itemDetails}>
                              <Text style={styles.itemName}>{item.productName}</Text>
                              <Text style={styles.providerName}>{item.providerName}</Text>
                              
                              {/* Affichage spécial pour les réservations beauté */}
                              {isBeauty && bookingDetails ? (
                                <View style={styles.bookingDetailsContainer}>
                                  <View style={styles.bookingRow}>
                                    <Calendar size={14} color="#8B5CF6" />
                                    <Text style={styles.bookingDate}>{bookingDetails.date}</Text>
                                  </View>
                                  <View style={styles.bookingRow}>
                                    <Clock size={14} color="#8B5CF6" />
                                    <Text style={styles.bookingTime}>Rendez-vous à {bookingDetails.time}</Text>
                                  </View>
                                  <View style={styles.bookingServiceBadge}>
                                    <Text style={styles.bookingServiceText}>🏪 Salon de beauté</Text>
                                  </View>
                                </View>
                              ) : (
                                item.customizations && item.customizations.length > 0 && (
                                  <Text style={styles.customizations} numberOfLines={2}>
                                    {formatCustomizations(item.customizations)}
                                  </Text>
                                )
                              )}
                              
                              {item.extras && item.extras.length > 0 && (
                                <Text style={styles.extras} numberOfLines={2}>
                                  Extras: {item.extras.map(extra => extra.name).join(', ')}
                                </Text>
                              )}
                              
                              {item.couponCode && item.couponDiscount && (
                                <Text style={styles.couponApplied}>
                                  Coupon appliqué: -{Math.round((item.basePrice * item.quantity * item.couponDiscount) / 100).toLocaleString()} FCFA ({item.couponDiscount}%)
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
                                <View style={styles.itemPriceContainer}>
                                  <Text style={styles.itemPrice}>
                                    {formatPointsAmount(fcfaToPoints(item.totalPrice))}
                                  </Text>
                                  <Text style={[styles.itemPriceFcfa, getResponsiveTextProps('fcfa').style]}
                                        numberOfLines={getResponsiveTextProps('fcfa').numberOfLines}
                                        ellipsizeMode={getResponsiveTextProps('fcfa').ellipsizeMode}>
                                    {formatFcfaAmount(item.totalPrice)}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  )}
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
                    <View style={[
                      styles.radioOuter,
                      selectedPayment === 'points' && styles.radioSelected
                    ]}>
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
                      <View style={[
                        styles.radioOuter,
                        selectedPayment === method.id && styles.radioSelected
                      ]}>
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
                          ? `${fcfaToPoints(originalTotal).toFixed(2)} pts`
                          : `${originalTotal.toLocaleString()} FCFA`
                        }
                      </Text>
                    )}
                    <Text style={styles.totalAmount}>
                      {formatAmount(calculateFinalTotal())}
                    </Text>
                    {globalDiscountPercentage > 0 && (
                      <View style={styles.discountRow}>
                        <Text style={styles.discountText}>
                          Économie: {(originalTotal - discountedTotal).toLocaleString()} FCFA
                        </Text>
                      </View>
                    )}
                    {selectedPayment !== 'points' && getSelectedMethodFee() > 0 && (
                      <Text style={styles.feeText}>
                        (dont {getSelectedMethodFee()} FCFA de frais)
                      </Text>
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
                      Payer {formatAmount(calculateFinalTotal())}
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

      {/* Modal de sélection de coupon supprimé - remplacé par le système Gold global */}
      
      {/* Le popup Gold est maintenant géré globalement par GoldMembershipHandler */}
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
  itemPriceContainer: {
    alignItems: 'flex-end',
  },
  itemPriceFcfa: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    paddingRight: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedMethod: {
    borderColor: '#00B14F',
    backgroundColor: '#F0FFF4',
  },
  methodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: -10,
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
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 1,
  },
  pointsBalance: {
    fontSize: 12,
    color: '#666',
  },
  methodFee: {
    fontSize: 12,
    color: '#E53E3E',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#00B14F',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
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
  feeText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 2,
  },
  cartHeaderSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  cartHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  cartHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  cartHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cartHeaderTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00B14F',
  },
  cartHeaderTotalContainer: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  cartHeaderTotalFcfa: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginTop: 1,
  },
  cartItemsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 15,
    paddingVertical: 8,
  },
  mapContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    marginBottom: 15,
  },
  mapPlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: '#e0e0e0',
  },
  mapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -10 }, { translateY: -10 }],
  },
  markerDot: {
    width: 20,
    height: 20,
    backgroundColor: '#000',
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#fff',
  },
  mapButton: {
    position: 'absolute',
    bottom: 15,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  // Styles pour les détails de réservation beauté
  bookingDetailsContainer: {
    backgroundColor: '#F8F4FF',
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#8B5CF6',
  },
  bookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  bookingDate: {
    fontSize: 12,
    color: '#4C1D95',
    fontWeight: '600',
    marginLeft: 6,
    textTransform: 'capitalize',
  },
  bookingTime: {
    fontSize: 12,
    color: '#4C1D95',
    fontWeight: '600',
    marginLeft: 6,
  },
  bookingServiceBadge: {
    backgroundColor: '#8B5CF6',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  bookingServiceText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
