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
import { X, Ticket, Star } from 'lucide-react-native';
import { useState, useEffect, useRef } from 'react';
import { useResponsiveModalStyles } from '@/hooks/useResponsiveDimensions';
import { useCoupon } from '@/contexts/CouponContext';
import { availableCoupons, Coupon } from '@/data/coupons';

interface CouponDisplayModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function CouponDisplayModal({ visible, onClose }: CouponDisplayModalProps) {
  const { 
    applyGlobalCoupon, 
    activeCoupon, 
    isPremiumMember, 
    subscribeToPremium,
    globalDiscountPercentage
  } = useCoupon();
  const responsiveStyles = useResponsiveModalStyles();
  const [isProcessing, setIsProcessing] = useState(false);

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
  
  const handleApplyCoupon = (coupon: Coupon) => {
    // Si le coupon nécessite premium et l'utilisateur n'est pas premium
    if (coupon.requiresPremium && !isPremiumMember) {
      Alert.alert(
        'Coupon Premium',
        'Ce coupon nécessite un abonnement Premium. Souhaitez-vous vous abonner pour 500 FCFA ?',
        [
          {
            text: 'Annuler',
            style: 'cancel',
          },
          {
            text: 'S\'abonner',
            onPress: async () => {
              setIsProcessing(true);
              const success = await subscribeToPremium();
              setIsProcessing(false);
              
              if (success) {
                applyGlobalCoupon(coupon);
                Alert.alert('Félicitations', 'Vous êtes maintenant un membre Premium ! Coupon de 10% appliqué.');
                handleClose();
              } else {
                Alert.alert('Erreur', 'Un problème est survenu lors de l\'abonnement. Veuillez réessayer plus tard.');
              }
            },
          },
        ],
      );
      return;
    }
    
    // Sinon, appliquer directement le coupon
    applyGlobalCoupon(coupon);
    Alert.alert('Coupon appliqué', `Réduction de ${coupon.discount}% sur tout le panier !`);
    handleClose();
  };

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
              maxWidth: responsiveStyles.container.maxWidth,
              borderRadius: responsiveStyles.container.borderRadius,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
          onStartShouldSetResponder={() => true}
          onResponderGrant={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Coupons disponibles</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.couponsContainer}>
            {activeCoupon && (
              <View style={styles.activeCouponContainer}>
                <Text style={styles.activeCouponTitle}>Coupon actif</Text>
                <View style={[styles.couponCard, styles.activeCouponCard]}>
                  <View style={styles.couponIcon}>
                    <Ticket size={24} color="#00B14F" />
                  </View>
                  <View style={styles.couponInfo}>
                    <Text style={styles.couponCode}>{activeCoupon.code}</Text>
                    <Text style={styles.couponDescription}>{activeCoupon.description}</Text>
                  </View>
                  <View style={styles.discountContainer}>
                    <Text style={styles.discountPercentage}>{activeCoupon.discount}%</Text>
                  </View>
                </View>
              </View>
            )}
            
            <Text style={styles.sectionTitle}>Coupons disponibles</Text>
            
            {availableCoupons
              .filter(coupon => !activeCoupon || coupon.code !== activeCoupon.code)
              .map((coupon) => (
                <TouchableOpacity 
                  key={coupon.code}
                  style={[
                    styles.couponCard,
                    coupon.requiresPremium && !isPremiumMember && styles.premiumCouponCard
                  ]}
                  onPress={() => handleApplyCoupon(coupon)}
                  disabled={isProcessing}
                >
                  <View style={styles.couponIcon}>
                    {coupon.requiresPremium ? (
                      <Star size={24} color="#FFD700" />
                    ) : (
                      <Ticket size={24} color="#007BFF" />
                    )}
                  </View>
                  <View style={styles.couponInfo}>
                    <Text style={styles.couponCode}>{coupon.code}</Text>
                    <Text style={styles.couponDescription}>{coupon.description}</Text>
                    {coupon.requiresPremium && !isPremiumMember && (
                      <Text style={styles.premiumTag}>Premium - 500 FCFA</Text>
                    )}
                  </View>
                  <View style={styles.discountContainer}>
                    <Text style={styles.discountPercentage}>{coupon.discount}%</Text>
                  </View>
                </TouchableOpacity>
              ))}
          </ScrollView>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  couponsContainer: {
    padding: 20,
  },
  activeCouponContainer: {
    marginBottom: 20,
  },
  activeCouponTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00B14F',
    marginBottom: 10,
  },
  activeCouponCard: {
    backgroundColor: '#E8F5E9',
    borderColor: '#00B14F',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  couponCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 10,
  },
  premiumCouponCard: {
    backgroundColor: '#FFF8E1',
    borderColor: '#FFD700',
  },
  couponIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  couponInfo: {
    flex: 1,
  },
  couponCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  couponDescription: {
    fontSize: 13,
    color: '#666',
  },
  premiumTag: {
    fontSize: 12,
    color: '#F57C00',
    marginTop: 5,
    fontWeight: '600',
  },
  discountContainer: {
    backgroundColor: '#007BFF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  discountPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
