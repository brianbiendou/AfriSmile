import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Animated,
  Alert,
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { X, CheckCircle, ArrowLeft } from 'lucide-react-native';
import { useResponsiveModalStyles } from '@/hooks/useResponsiveDimensions';

interface PaymentAggregatorModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
  points: number;
  paymentMethod: {
    id: string;
    name: string;
    color: string;
  };
}

export default function PaymentAggregatorModal({
  visible,
  onClose,
  onSuccess,
  amount,
  points,
  paymentMethod,
}: PaymentAggregatorModalProps) {
  const [step, setStep] = useState<'initial' | 'processing' | 'success' | 'error'>('initial');
  const responsiveStyles = useResponsiveModalStyles();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      setStep('initial');
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
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
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
    ]).start(() => {
      onClose();
    });
  };

  const handlePay = () => {
    setStep('processing');
    
    // Simulation du processus de paiement
    setTimeout(() => {
      // 95% de chances de succès, 5% d'échec (pour simulation)
      if (Math.random() > 0.05) {
        setStep('success');
        // Attente avant de fermer et appeler onSuccess
        setTimeout(() => {
          handleClose();
          onSuccess();
        }, 1500);
      } else {
        setStep('error');
      }
    }, 2000);
  };

  const handleRetry = () => {
    setStep('initial');
  };

  const getPaymentLogo = () => {
    switch (paymentMethod.id) {
      case 'mtn':
        return '💰 MTN MoMo';
      case 'orange':
        return '🔶 Orange Money';
      case 'moov':
        return '🔵 Moov Money';
      case 'wave':
        return '🌊 Wave';
      case 'visa':
        return '💳 Visa';
      case 'mastercard':
        return '💳 Mastercard';
      case 'paypal':
        return '💸 PayPal';
      default:
        return '💵 Paiement';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={responsiveStyles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              width: responsiveStyles.container.maxWidth,
              borderRadius: responsiveStyles.container.borderRadius,
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            {step !== 'initial' && (
              <TouchableOpacity onPress={handleRetry} style={styles.backButton}>
                <ArrowLeft size={24} color="#333" />
              </TouchableOpacity>
            )}
            <Text style={styles.headerTitle}>
              {step === 'initial' && 'Paiement Sécurisé'}
              {step === 'processing' && 'Traitement en cours...'}
              {step === 'success' && 'Paiement réussi'}
              {step === 'error' && 'Erreur de paiement'}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color="#8E8E8E" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {step === 'initial' && (
              <>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentTitle}>Récapitulatif</Text>
                  <View style={styles.paymentDetails}>
                    <Text style={styles.paymentLabel}>Montant:</Text>
                    <Text style={styles.paymentAmount}>{amount.toLocaleString()} FCFA</Text>
                  </View>
                  <View style={styles.paymentDetails}>
                    <Text style={styles.paymentLabel}>Points à créditer:</Text>
                    <Text style={styles.paymentPoints}>+{points.toLocaleString()} pts</Text>
                  </View>
                  <View style={styles.paymentDetails}>
                    <Text style={styles.paymentLabel}>Méthode:</Text>
                    <Text style={styles.paymentMethod}>{paymentMethod.name}</Text>
                  </View>
                </View>

                <View style={styles.paymentLogo}>
                  <Text style={[styles.logoText, { color: paymentMethod.color }]}>
                    {getPaymentLogo()}
                  </Text>
                </View>

                <Text style={styles.secureInfo}>
                  🔒 Paiement sécurisé par AfriSmile Pay
                </Text>

                <TouchableOpacity 
                  style={styles.payButton} 
                  onPress={handlePay}
                >
                  <Text style={styles.payButtonText}>
                    Payer {amount.toLocaleString()} FCFA
                  </Text>
                </TouchableOpacity>

                <Text style={styles.termsText}>
                  En cliquant sur "Payer", vous acceptez nos conditions générales d'utilisation
                </Text>
              </>
            )}

            {step === 'processing' && (
              <View style={styles.statusContainer}>
                <ActivityIndicator size="large" color={paymentMethod.color} />
                <Text style={styles.processingText}>
                  Traitement du paiement en cours...
                </Text>
                <Text style={styles.subInfoText}>
                  Veuillez ne pas fermer cette fenêtre
                </Text>
              </View>
            )}

            {step === 'success' && (
              <View style={styles.statusContainer}>
                <View style={[styles.statusIcon, { backgroundColor: '#E8F5E9' }]}>
                  <CheckCircle size={50} color="#00B14F" />
                </View>
                <Text style={[styles.statusText, { color: '#00B14F' }]}>
                  Paiement réussi !
                </Text>
                <Text style={styles.subInfoText}>
                  {points.toLocaleString()} points ont été ajoutés à votre compte
                </Text>
              </View>
            )}

            {step === 'error' && (
              <View style={styles.statusContainer}>
                <View style={[styles.statusIcon, { backgroundColor: '#FFEBEE' }]}>
                  <X size={50} color="#D32F2F" />
                </View>
                <Text style={[styles.statusText, { color: '#D32F2F' }]}>
                  Échec du paiement
                </Text>
                <Text style={styles.subInfoText}>
                  Une erreur est survenue lors du traitement de votre paiement
                </Text>
                <TouchableOpacity 
                  style={[styles.retryButton]} 
                  onPress={handleRetry}
                >
                  <Text style={styles.retryButtonText}>
                    Réessayer
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FAFAFA',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 5,
  },
  backButton: {
    padding: 5,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  paymentInfo: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  paymentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#666',
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  paymentPoints: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00B14F',
  },
  paymentMethod: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  paymentLogo: {
    width: 120,
    height: 80,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  secureInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  payButton: {
    width: '100%',
    backgroundColor: '#00B14F',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#00B14F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  termsText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  statusContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  statusIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  processingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  subInfoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#666',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
