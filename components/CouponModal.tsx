import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  ScrollView,
} from 'react-native';
import { X, Ticket, CheckCircle2, XCircle, ChevronRight } from 'lucide-react-native';
import { useState, useEffect, useRef } from 'react';
import { validateCoupon, availableCoupons, type Coupon } from '@/data/coupons';
import { useResponsiveModalStyles } from '@/hooks/useResponsiveDimensions';
import { useCoupon } from '@/contexts/CouponContext';

interface CouponModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyCoupon: (coupon: Coupon) => void;
  totalPoints: number;
  providerId?: string;
  isGlobalCoupon?: boolean;
}

export default function CouponModal({ 
  visible, 
  onClose, 
  onApplyCoupon,
  totalPoints,
  isGlobalCoupon = false,
  providerId
}: CouponModalProps) {
  console.log('CouponModal rendu avec visible =', visible);
  const { 
    animateCoupon, 
    isPremiumMember,
    userTotalPointsSpent 
  } = useCoupon();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const responsiveStyles = useResponsiveModalStyles();
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
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
      slideAnim.setValue(50);
      
      // Réinitialiser les états quand le modal se ferme
      setCouponCode('');
      setAppliedCoupon(null);
      setValidationError(null);
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

  const handleApplyCoupon = () => {
    // Réinitialiser les états de validation
    setIsValidatingCoupon(true);
    setValidationError(null);
    
    // Valider le coupon
    // On n'utilise plus providerId pour les coupons globaux
    const coupon = validateCoupon(
      couponCode, 
      totalPoints,
      userTotalPointsSpent, 
      isPremiumMember
    );
    
    setTimeout(() => {
      setIsValidatingCoupon(false);
      
      if (coupon) {
        setAppliedCoupon(coupon);
        // Animation de succès
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        // Définir le message d'erreur approprié
        if (!couponCode.trim()) {
          setValidationError('Veuillez entrer un code coupon');
        } else {
          const foundCoupon = availableCoupons.find(c => c.code === couponCode.toUpperCase());
          
          if (!foundCoupon) {
            setValidationError('Ce code coupon n\'existe pas');
          } else if (new Date() > new Date(foundCoupon.expiryDate)) {
            setValidationError('Ce coupon a expiré');
          } else if (foundCoupon.minPurchase && totalPoints < foundCoupon.minPurchase) {
            setValidationError(`Achat minimum de ${foundCoupon.minPurchase} points requis`);
          } else if (foundCoupon.requiresPremium && !isPremiumMember) {
            setValidationError('Ce coupon nécessite un abonnement premium');
          } else if (foundCoupon.minUserPoints && userTotalPointsSpent < foundCoupon.minUserPoints) {
            setValidationError(`Vous devez avoir dépensé au moins ${foundCoupon.minUserPoints} points`);
          } else {
            setValidationError('Ce coupon ne peut pas être appliqué');
          }
        }
        
        // Animation d'erreur
        Animated.sequence([
          Animated.timing(slideAnim, {
            toValue: -10,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 10,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: -5,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 5,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 50,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, 500); // Simuler une vérification
  };

  const handleConfirm = () => {
    if (appliedCoupon) {
      // Déclencher l'animation globale du coupon
      animateCoupon(appliedCoupon);
      
      // Appliquer le coupon aux données de l'app
      onApplyCoupon(appliedCoupon);
      handleClose();
    }
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
            },
          ]}
          onStartShouldSetResponder={() => true}
          onResponderGrant={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Appliquer un coupon</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ticket size={40} color="#00B14F" />
            </View>
            
            <Text style={styles.subtitle}>
              Entrez un code promo pour bénéficier de réductions
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="PROMO10"
                value={couponCode}
                onChangeText={setCouponCode}
                autoCapitalize="characters"
                placeholderTextColor="#999"
              />
              
              <TouchableOpacity 
                style={[
                  styles.applyButton,
                  (!couponCode.trim() || isValidatingCoupon) && styles.applyButtonDisabled,
                  appliedCoupon && styles.applyButtonSuccess
                ]} 
                onPress={handleApplyCoupon}
                disabled={!couponCode.trim() || isValidatingCoupon || !!appliedCoupon}
              >
                {isValidatingCoupon ? (
                  <Text style={styles.applyButtonText}>Vérification...</Text>
                ) : appliedCoupon ? (
                  <CheckCircle2 size={20} color="#fff" />
                ) : (
                  <Text style={styles.applyButtonText}>Appliquer</Text>
                )}
              </TouchableOpacity>
            </View>

            {validationError && (
              <View style={styles.errorContainer}>
                <XCircle size={16} color="#E53E3E" />
                <Text style={styles.errorText}>{validationError}</Text>
              </View>
            )}

            {appliedCoupon && (
              <View style={styles.couponInfoContainer}>
                <Text style={styles.couponCode}>{appliedCoupon.code}</Text>
                <Text style={styles.couponDescription}>{appliedCoupon.description}</Text>
                <Text style={styles.couponDiscount}>
                  Réduction de {appliedCoupon.discount}% sur votre commande
                  {appliedCoupon.maxDiscount ? ` (max ${appliedCoupon.maxDiscount} pts)` : ''}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={[
                styles.confirmButton,
                !appliedCoupon && styles.confirmButtonDisabled
              ]} 
              onPress={handleConfirm}
              disabled={!appliedCoupon}
            >
              <Text style={styles.confirmButtonText}>
                {appliedCoupon ? 'Confirmer' : 'Continuer sans coupon'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  content: {
    padding: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    fontSize: 16,
    color: '#333',
  },
  applyButton: {
    backgroundColor: '#00B14F',
    height: 50,
    paddingHorizontal: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  applyButtonSuccess: {
    backgroundColor: '#00B14F',
  },
  applyButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  errorText: {
    color: '#E53E3E',
    fontSize: 14,
    marginLeft: 8,
  },
  couponInfoContainer: {
    backgroundColor: '#F0F9F4',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#00B14F',
    borderStyle: 'dashed',
  },
  couponCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00B14F',
    marginBottom: 8,
  },
  couponDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  couponDiscount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00B14F',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  confirmButton: {
    backgroundColor: '#000',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
