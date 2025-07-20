import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
} from 'react-native';
import { X, Plus, Minus, ShoppingBag, CreditCard, Ticket } from 'lucide-react-native';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useCoupon } from '@/contexts/CouponContext';
import { useResponsiveModalStyles } from '@/hooks/useResponsiveDimensions';
import { eventService, APP_EVENTS } from '@/utils/eventService';
import CouponDisplayModal from './CouponDisplayModal';

interface CartModalProps {
  visible: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export default function CartModal({ visible: propsVisible, onClose, onCheckout }: CartModalProps) {
  const [visible, setVisible] = useState(propsVisible);
  const { cartItems, cartTotal, updateQuantity, removeFromCart } = useCart();
  const { globalDiscountPercentage } = useCoupon();
  const responsiveStyles = useResponsiveModalStyles();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const [showCouponModal, setShowCouponModal] = useState(false);
  
  // Animation pour le texte promotionnel
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Animation de pulsation pour le texte promotionnel
  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [visible]);

  // Écouter les changements de visible depuis les props
  useEffect(() => {
    setVisible(propsVisible);
  }, [propsVisible]);
  
  // Écouter l'événement d'ouverture du panier
  useEffect(() => {
    const handleOpenCart = () => setVisible(true);
    eventService.on(APP_EVENTS.OPEN_CART, handleOpenCart);
    
    return () => {
      eventService.off(APP_EVENTS.OPEN_CART, handleOpenCart);
    };
  }, []);

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
      setVisible(false);
      onClose();
    });
  };

  const handleCheckout = () => {
    handleClose();
    onCheckout();
  };

  const formatCustomizations = (customizations: any[]) => {
    return customizations.map(cat => 
      cat.selectedOptions.map((opt: any) => opt.name).join(', ')
    ).join(' • ');
  };

  if (cartItems.length === 0) {
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
          onPress={handleClose}
        >
          <Animated.View 
            style={[
              styles.container,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
            onStartShouldSetResponder={() => true}
            onResponderGrant={(e) => e.stopPropagation()}
          >
            <View style={styles.header}>
              <Text style={styles.title}>Mon Panier</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.emptyCart}>
              <ShoppingBag size={64} color="#E5E5E5" />
              <Text style={styles.emptyTitle}>Votre panier est vide</Text>
              <Text style={styles.emptySubtitle}>
                Ajoutez des articles pour commencer votre commande
              </Text>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
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
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              maxWidth: responsiveStyles.container.maxWidth,
              borderRadius: responsiveStyles.container.borderRadius,
            }
          ]}
          onStartShouldSetResponder={() => true}
          onResponderGrant={(e) => e.stopPropagation()}
        >
          <View style={responsiveStyles.header}>
            <Text style={responsiveStyles.title}>Mon Panier ({cartItems.length})</Text>
            <TouchableOpacity onPress={handleClose} style={responsiveStyles.closeButton}>
              <X size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView style={responsiveStyles.content} showsVerticalScrollIndicator={false}>
            {cartItems.map((item) => (
              <View key={item.id} style={styles.cartItem}>
                <Image source={{ uri: item.productImage }} style={styles.itemImage} />
                
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.productName}</Text>
                  <Text style={styles.providerName}>{item.providerName}</Text>
                  
                  {item.customizations.length > 0 && (
                    <Text style={styles.customizations} numberOfLines={2}>
                      {formatCustomizations(item.customizations)}
                    </Text>
                  )}
                  
                  <Text style={styles.itemPrice}>
                    {item.totalPrice.toLocaleString()} pts
                  </Text>
                </View>

                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={[styles.quantityButton]}
                    onPress={() => item.quantity <= 1 ? removeFromCart(item.id) : updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus size={16} color="#000" />
                  </TouchableOpacity>
                  
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus size={16} color="#000" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total</Text>
              {globalDiscountPercentage > 0 ? (
                <>
                  <Text style={styles.originalPrice}>
                    {cartTotal.toLocaleString()} pts
                  </Text>
                  <Text style={styles.totalAmount}>
                    {Math.round(cartTotal * (1 - globalDiscountPercentage / 100)).toLocaleString()} pts
                  </Text>
                  <Text style={styles.discountTag}>-{globalDiscountPercentage}%</Text>
                </>
              ) : (
                <Text style={styles.totalAmount}>
                  {cartTotal.toLocaleString()} pts
                </Text>
              )}
            </View>
            
            <View style={styles.promoContainer}>
              <Animated.Text 
                style={[
                  styles.promoText,
                  {
                    transform: [{ scale: pulseAnim }],
                    opacity: Animated.add(0.7, Animated.multiply(pulseAnim, 0.3))
                  }
                ]}
                numberOfLines={2}
              >
                Passez la commande pour profiter des incroyables réductions!
              </Animated.Text>
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.checkoutButton} 
                onPress={handleCheckout}
              >
                <CreditCard size={18} color="#fff" />
                <Text style={styles.checkoutButtonText}>Passer la commande</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Modal de coupons */}
          <CouponDisplayModal
            visible={showCouponModal}
            onClose={() => setShowCouponModal(false)}
          />
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
    width: '95%',
    maxWidth: 400,
    maxHeight: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
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
    fontSize: 20,
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
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  providerName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  customizations: {
    fontSize: 12,
    color: '#888',
    marginBottom: 6,
    lineHeight: 16,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00B14F',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 4,
    alignSelf: 'flex-start',
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: '#F0F0F0',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginHorizontal: 12,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00B14F',
  },
  originalPrice: {
    fontSize: 16,
    fontWeight: '400',
    color: '#999',
    textDecorationLine: 'line-through',
    marginBottom: 5,
  },
  discountTag: {
    backgroundColor: '#FF6B6B',
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 5,
    overflow: 'hidden',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  couponButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  couponButtonText: {
    color: '#FF6B6B',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 5,
  },
  checkoutButton: {
    backgroundColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  promoContainer: {
    marginBottom: 15,
    alignItems: 'center',
  },
  promoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B6B',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.5,
  },
});