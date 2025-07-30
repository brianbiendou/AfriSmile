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
  const [isAnimating, setIsAnimating] = useState(false);
  const { cartItems, cartTotal, updateQuantity, removeFromCart } = useCart();
  const { globalDiscountPercentage } = useCoupon();
  const responsiveStyles = useResponsiveModalStyles();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Animation pour le texte promotionnel
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  
  // Animation de pulsation pour le texte promotionnel - sécurisée et optimisée
  useEffect(() => {
    // Arrêter l'animation précédente si elle existe
    if (pulseAnimationRef.current) {
      pulseAnimationRef.current.stop();
      pulseAnimationRef.current = null;
    }

    // Délai pour éviter les conflits avec useInsertionEffect
    const timeoutId = setTimeout(() => {
      if (visible && !isAnimating) {
        try {
          pulseAnimationRef.current = Animated.loop(
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
          );
          pulseAnimationRef.current.start();
        } catch (error) {
          console.warn('Erreur animation pulse:', error);
          pulseAnim.setValue(1);
        }
      } else {
        pulseAnim.setValue(1);
      }
    }, 100); // Petit délai pour éviter les conflits

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      if (pulseAnimationRef.current) {
        pulseAnimationRef.current.stop();
        pulseAnimationRef.current = null;
      }
    };
  }, [visible, isAnimating]);

  // Écouter les changements de visible depuis les props
  useEffect(() => {
    if (propsVisible !== visible) {
      setVisible(propsVisible);
    }
  }, [propsVisible]);
  
  // Écouter l'événement d'ouverture du panier
  useEffect(() => {
    const handleOpenCart = () => setVisible(true);
    eventService.on(APP_EVENTS.OPEN_CART, handleOpenCart);
    
    return () => {
      eventService.off(APP_EVENTS.OPEN_CART, handleOpenCart);
    };
  }, []);

  // Animation principale du modal - sécurisée avec délai
  useEffect(() => {
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
            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start(() => {
            setIsAnimating(false);
          });
        } catch (error) {
          console.warn('Erreur animation ouverture:', error);
          fadeAnim.setValue(1);
          slideAnim.setValue(0);
          setIsAnimating(false);
        }
      }, 50); // Petit délai pour éviter les conflits

      return () => clearTimeout(timeoutId);
    } else if (!visible) {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      setIsAnimating(false);
    }
  }, [visible]);

  const handleClose = () => {
    if (isAnimating) return; // Éviter les animations concurrentes
    
    setIsAnimating(true);
    
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
          setVisible(false);
          setIsAnimating(false);
          onClose();
        });
      } catch (error) {
        console.warn('Erreur animation fermeture:', error);
        setVisible(false);
        setIsAnimating(false);
        onClose();
      }
    }, 10); // Très petit délai pour éviter les conflits
  };

  const handleCheckout = () => {
    handleClose();
    onCheckout();
  };

  const formatCustomizations = (customizations: any[]) => {
    if (!customizations || !Array.isArray(customizations)) {
      return '';
    }
    
    return customizations.map(cat => {
      // Vérifier si c'est la nouvelle structure avec selectedOptions
      if (cat.selectedOptions && Array.isArray(cat.selectedOptions)) {
        return cat.selectedOptions.map((opt: any) => opt.name).join(', ');
      }
      // Ancienne structure avec options directes
      else if (cat.options && Array.isArray(cat.options)) {
        return cat.options.map((opt: any) => opt.name).join(', ');
      }
      // Structure simple avec juste le nom
      else if (cat.name) {
        return cat.name;
      }
      return '';
    }).filter(str => str.length > 0).join(' • ');
  };

  if (cartItems.length === 0) {
    return (
      <Modal
        visible={visible}
        transparent={false}
        animationType="slide"
        onRequestClose={handleClose}
      >
        <View 
          style={styles.overlay} 
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
        </View>
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
      <View 
        style={responsiveStyles.overlay}
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
          
          {/* Modal de coupons supprimé - remplacé par le système Gold */}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: '100%',
    maxHeight: '100%',
    backgroundColor: '#fff',
    borderRadius: 0,
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