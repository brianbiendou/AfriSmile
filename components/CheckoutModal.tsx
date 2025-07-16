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
import { X, CreditCard, Smartphone, MapPin, Clock } from 'lucide-react-native';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/contexts/CartContext';

interface CheckoutModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ visible, onClose }: CheckoutModalProps) {
  const { cartItems, cartTotal, clearCart } = useCart();
  const [selectedPayment, setSelectedPayment] = useState<'points' | 'mtn' | 'orange' | 'moov'>('points');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Génération de frais aléatoires pour chaque méthode mobile money
  const [mobileFees] = useState({
    mtn: Math.floor(Math.random() * 500) + 500, // 500-999
    orange: Math.floor(Math.random() * 500) + 500, // 500-999
    moov: Math.floor(Math.random() * 500) + 500, // 500-999
  });

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

  const handlePayment = () => {
    setIsProcessing(true);
    
    // Simulation du paiement
    setTimeout(() => {
      setIsProcessing(false);
      clearCart();
      Alert.alert(
        'Commande confirmée !',
        'Votre commande a été passée avec succès. Vous recevrez une notification quand elle sera prête.',
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
    return customizations.map(cat => 
      cat.selectedOptions.map((opt: any) => opt.name).join(', ')
    ).join(' • ');
  };

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
            <Text style={styles.title}>Récapitulatif de commande</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color="#000" />
            </TouchableOpacity>
          </View>

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

            {/* Articles commandés */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Articles commandés</Text>
              {cartItems.map((item) => (
                <View key={item.id} style={styles.orderItem}>
                  <Image source={{ uri: item.productImage }} style={styles.itemImage} />
                  
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>{item.productName}</Text>
                    <Text style={styles.providerName}>{item.providerName}</Text>
                    
                    {item.customizations.length > 0 && (
                      <Text style={styles.customizations} numberOfLines={2}>
                        {formatCustomizations(item.customizations)}
                      </Text>
                    )}
                    
                    <View style={styles.itemFooter}>
                      <Text style={styles.quantity}>Qté: {item.quantity}</Text>
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
              
              {/* Paiement par points */}
              <TouchableOpacity
                style={[
                  styles.paymentMethod,
                  selectedPayment === pointsPayment.id && styles.selectedPaymentMethod,
                ]}
                onPress={() => setSelectedPayment(pointsPayment.id as any)}
              >
                <View style={styles.methodContent}>
                  <View style={[styles.methodIcon, { backgroundColor: pointsPayment.color }]}>
                    <pointsPayment.icon size={20} color="#fff" />
                  </View>
                  <Text style={styles.methodName}>{pointsPayment.name}</Text>
                </View>
                <View style={[
                  styles.radioButton,
                  selectedPayment === pointsPayment.id && styles.radioButtonSelected
                ]}>
                  {selectedPayment === pointsPayment.id && <View style={styles.radioButtonInner} />}
                </View>
              </TouchableOpacity>

              {/* Titre Mobile Money */}
              <Text style={styles.mobileMoneyTitle}>Mobile Money</Text>
              
              {/* Méthodes Mobile Money */}
              {mobileMoneyMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.paymentMethod,
                    selectedPayment === method.id && styles.selectedPaymentMethod,
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
                    styles.radioButton,
                    selectedPayment === method.id && styles.radioButtonSelected
                  ]}>
                    {selectedPayment === method.id && <View style={styles.radioButtonInner} />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total à payer</Text>
              <Text style={styles.totalAmount}>
                {cartTotal.toLocaleString()} pts
              </Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.payButton, isProcessing && styles.payButtonDisabled]} 
              onPress={handlePayment}
              disabled={isProcessing}
            >
              <Text style={styles.payButtonText}>
                {isProcessing ? 'Traitement...' : 'Confirmer et payer'}
              </Text>
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
    maxHeight: '90%',
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
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  deliveryText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  orderItem: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 2,
  },
  providerName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  customizations: {
    fontSize: 11,
    color: '#888',
    marginBottom: 6,
    lineHeight: 14,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 12,
    color: '#666',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00B14F',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  selectedPaymentMethod: {
    backgroundColor: '#F0F9F4',
    borderWidth: 1,
    borderColor: '#00B14F',
  },
  methodIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodName: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  mobileMoneyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  methodInfo: {
    flex: 1,
  },
  methodFee: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '500',
    marginTop: 2,
  },
  radioButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  radioButtonSelected: {
    borderColor: '#00B14F',
    backgroundColor: '#00B14F',
  },
  radioButtonInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00B14F',
  },
  payButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  payButtonDisabled: {
    backgroundColor: '#ccc',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});