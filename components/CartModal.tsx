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
import { X, Plus, Minus, ShoppingBag, CreditCard } from 'lucide-react-native';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/contexts/CartContext';

interface CartModalProps {
  visible: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export default function CartModal({ visible, onClose, onCheckout }: CartModalProps) {
  const { cartItems, cartTotal, updateQuantity, removeFromCart } = useCart();
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
            <Text style={styles.title}>Mon Panier ({cartItems.length})</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
                    style={[styles.quantityButton, item.quantity <= 1 && styles.quantityButtonDisabled]}
                    onPress={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus size={16} color={item.quantity <= 1 ? "#ccc" : "#000"} />
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
              <Text style={styles.totalAmount}>
                {cartTotal.toLocaleString()} pts
              </Text>
            </View>
            
            <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
              <CreditCard size={20} color="#fff" />
              <Text style={styles.checkoutButtonText}>Passer la commande</Text>
            </TouchableOpacity>
          </View>
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
});