import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { ShoppingCart } from 'lucide-react-native';
import { useCart } from '@/contexts/CartContext';
import { useEffect, useRef } from 'react';

interface CartIconProps {
  onPress: () => void;
}

export default function CartIcon({ onPress }: CartIconProps) {
  const { cartCount } = useCart();
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const prevCartCount = useRef(cartCount);

  useEffect(() => {
    if (cartCount > prevCartCount.current) {
      // Animation de rebond quand un item est ajouté
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.3,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
    prevCartCount.current = cartCount;
  }, [cartCount]);

  if (cartCount === 0) return null;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Animated.View style={[styles.cartContainer, { transform: [{ scale: bounceAnim }] }]}>
        <ShoppingCart size={18} color="#00B14F" />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{cartCount}</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  cartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9F4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});