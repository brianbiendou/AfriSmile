import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { ArrowLeft, CreditCard, Smartphone, MapPin, Clock, Plus, Minus } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { pointsToFcfa, fcfaToPoints } from '@/utils/pointsConversion';
import { getFeeByProvider } from '@/utils/mobileMoneyFees';
import { Coupon } from '@/data/coupons';
import AnimatedCoupon from '@/components/AnimatedCoupon';
import DiscountSection from '@/components/DiscountSection';
import { useGold } from '@/contexts/GoldContext';
import { router } from 'expo-router';

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart, applyCoupon, updateQuantity } = useCart();
  const { user, updateUserPoints } = useAuth();
  const { triggerGoldUpgradeModal, checkMembershipStatus, membership } = useGold();
  
  // État pour contrôler la logique de paiement
  const [selectedPayment, setSelectedPayment] = useState<'points' | 'mtn' | 'orange' | 'moov'>('points');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCartItemId, setSelectedCartItemId] = useState<string | null>(null);
  const [showCouponAnimation, setShowCouponAnimation] = useState(false);
  const [animatedCouponData, setAnimatedCouponData] = useState<{ code: string, discount: number } | null>(null);
  const [globalDiscountPercentage, setGlobalDiscountPercentage] = useState(0);
  const [originalTotal, setOriginalTotal] = useState(cartTotal);
  const [discountedTotal, setDiscountedTotal] = useState(cartTotal);
  
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

  const handleGoBack = () => {
    router.back();
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
        [{ text: 'OK', onPress: handleGoBack }]
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
    
    // Ajouter les frais seulement si ce n'est pas un paiement en points
    if (selectedPayment !== 'points') {
      const selectedFee = mobileFees[selectedPayment as keyof typeof mobileFees] || 0;
      // Convertir les frais FCFA en points pour l'addition
      const feeInPoints = Math.round(selectedFee / 78.359);
      return baseTotal + feeInPoints;
    }
    
    return baseTotal;
  };

  // Fonction pour obtenir les frais de la méthode sélectionnée
  const getSelectedMethodFee = () => {
    if (selectedPayment === 'points') return 0;
    return mobileFees[selectedPayment as keyof typeof mobileFees] || 0;
  };

  // Vérifier si le panier est vide
  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Récapitulatif de commande</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Empty Cart */}
        <View style={styles.emptyCart}>
          <Text style={styles.emptyCartIcon}>🛒</Text>
          <Text style={styles.emptyCartTitle}>Votre panier est vide</Text>
          <Text style={styles.emptyCartText}>
            Ajoutez des articles à votre panier pour procéder au paiement
          </Text>
          <TouchableOpacity style={styles.shopButton} onPress={handleGoBack}>
            <Text style={styles.shopButtonText}>Continuer mes achats</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Récapitulatif de commande</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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

        {/* Zone de réductions */}
        <DiscountSection
          cartTotal={cartTotal}
          globalDiscountPercentage={globalDiscountPercentage}
          user={user}
          selectedPayment={selectedPayment}
          pointsToFcfa={pointsToFcfa}
          onApplyDiscount={handleApplyDiscount}
          onShowGoldPromo={triggerGoldUpgradeModal}
          isGoldMember={checkMembershipStatus()}
          goldMembership={membership}
        />

        {/* Articles commandés */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Articles commandés ({cartItems.length})</Text>
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

        {/* Résumé final */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Résumé de la commande</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Sous-total</Text>
            <Text style={styles.summaryValue}>
              {formatAmount(globalDiscountPercentage > 0 ? originalTotal : cartTotal)}
            </Text>
          </View>

          {globalDiscountPercentage > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: '#FF6B6B' }]}>
                Remise ({globalDiscountPercentage}%)
              </Text>
              <Text style={[styles.summaryValue, { color: '#FF6B6B' }]}>
                -{formatAmount(originalTotal - discountedTotal)}
              </Text>
            </View>
          )}

          {selectedPayment !== 'points' && getSelectedMethodFee() > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Frais {selectedPayment.toUpperCase()}
              </Text>
              <Text style={styles.summaryValue}>
                +{getSelectedMethodFee()} FCFA
              </Text>
            </View>
          )}

          <View style={styles.summaryDivider} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total à payer</Text>
            <Text style={styles.totalAmount}>
              {formatAmount(calculateFinalTotal())}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer avec bouton de paiement */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payButton, isProcessing && styles.disabledButton]}
          onPress={handlePayment}
          disabled={isProcessing}
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

      {/* Animation de coupon */}
      <AnimatedCoupon 
        visible={showCouponAnimation}
        couponCode={animatedCouponData?.code}
        discount={animatedCouponData?.discount}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
    padding: 16,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
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
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginBottom: 2,
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
  summaryCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00B14F',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    backgroundColor: '#fff',
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
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyCartIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyCartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyCartText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  shopButton: {
    backgroundColor: '#00B14F',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
