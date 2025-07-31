import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useState, useEffect } from 'react';
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
  amount = 0,
  points = 0,
  paymentMethod,
}: PaymentAggregatorModalProps) {
  const [step, setStep] = useState<'initial' | 'processing' | 'success' | 'error'>('initial');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const responsiveStyles = useResponsiveModalStyles();

  const mobileMoneyProviders = [
    { id: 'orange', name: 'Orange Money', color: '#FF6600', icon: '🔶', fee: 125 },
    { id: 'mtn', name: 'MTN Mobile Money', color: '#FFCC00', icon: '💰', fee: 175 },
    { id: 'wave', name: 'Wave', color: '#00D4FF', icon: '🌊', fee: 100 },
  ];

  useEffect(() => {
    if (visible) {
      setStep('initial');
      setSelectedProvider(''); // Reset selection when modal opens
    }
  }, [visible]);

  const handleClose = () => {
    onClose();
  };

  const handlePay = () => {
    if (!selectedProvider) {
      Alert.alert('Erreur', 'Veuillez sélectionner un mode de paiement');
      return;
    }
    
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
    setSelectedProvider(''); // Reset selection on retry
  };

  const getSelectedProvider = () => {
    return mobileMoneyProviders.find(provider => provider.id === selectedProvider);
  };

  const getTotalAmount = () => {
    const provider = getSelectedProvider();
    return amount + (provider?.fee || 0);
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
        <View
          style={[
            styles.container,
            {
              width: responsiveStyles.container.maxWidth,
              borderRadius: responsiveStyles.container.borderRadius,
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
                    <Text style={styles.paymentAmount}>{(amount || 0).toLocaleString()} FCFA</Text>
                  </View>
                  {selectedProvider && (
                    <View style={styles.paymentDetails}>
                      <Text style={styles.paymentLabel}>Frais:</Text>
                      <Text style={styles.paymentFee}>+{getSelectedProvider()?.fee} FCFA</Text>
                    </View>
                  )}
                  <View style={styles.paymentDetails}>
                    <Text style={styles.paymentLabel}>Total:</Text>
                    <Text style={styles.paymentTotal}>{getTotalAmount().toLocaleString()} FCFA</Text>
                  </View>
                  <View style={styles.paymentDetails}>
                    <Text style={styles.paymentLabel}>Points à créditer:</Text>
                    <Text style={styles.paymentPoints}>+{(points || 0).toLocaleString()} pts</Text>
                  </View>
                </View>

                {/* Mobile Money Provider Selection */}
                <View style={styles.providerSection}>
                  <Text style={styles.sectionTitle}>Choisissez votre mode de paiement</Text>
                  <View style={styles.providerGrid}>
                    {mobileMoneyProviders.map((provider) => (
                      <TouchableOpacity
                        key={provider.id}
                        style={[
                          styles.providerCard,
                          selectedProvider === provider.id && styles.selectedProviderCard,
                          { borderColor: selectedProvider === provider.id ? provider.color : '#E0E0E0' }
                        ]}
                        onPress={() => setSelectedProvider(provider.id)}
                      >
                        <Text style={styles.providerIcon}>{provider.icon}</Text>
                        <Text style={styles.providerName}>{provider.name}</Text>
                        <Text style={styles.providerFee}>Frais: {provider.fee} FCFA</Text>
                        {selectedProvider === provider.id && (
                          <View style={[styles.selectedIndicator, { backgroundColor: provider.color }]}>
                            <CheckCircle size={16} color="#fff" />
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <Text style={styles.secureInfo}>
                  🔒 Paiement sécurisé par AfriSmile Pay
                </Text>

                <TouchableOpacity 
                  style={[
                    styles.payButton,
                    !selectedProvider && styles.disabledButton,
                    selectedProvider && { backgroundColor: getSelectedProvider()?.color }
                  ]} 
                  onPress={handlePay}
                  disabled={!selectedProvider}
                >
                  <Text style={styles.payButtonText}>
                    {selectedProvider 
                      ? `Payer ${getTotalAmount().toLocaleString()} FCFA`
                      : 'Sélectionnez un mode de paiement'
                    }
                  </Text>
                </TouchableOpacity>

                <Text style={styles.termsText}>
                  En cliquant sur "Payer", vous acceptez nos conditions générales d'utilisation
                </Text>
              </>
            )}

            {step === 'processing' && (
              <View style={styles.statusContainer}>
                <ActivityIndicator size="large" color={getSelectedProvider()?.color || '#00B14F'} />
                <Text style={styles.processingText}>
                  Traitement du paiement en cours...
                </Text>
                <Text style={styles.subInfoText}>
                  {getSelectedProvider()?.name} - {getTotalAmount().toLocaleString()} FCFA
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
                  {(points || 0).toLocaleString()} points ont été ajoutés à votre compte
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
        </View>
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
  paymentFee: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  paymentTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  paymentMethod: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  providerSection: {
    width: '100%',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  providerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  providerCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    padding: 15,
    alignItems: 'center',
    position: 'relative',
    minHeight: 100,
  },
  selectedProviderCard: {
    backgroundColor: '#F0F8FF',
    borderWidth: 2,
  },
  providerIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  providerName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 3,
  },
  providerFee: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
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
    paddingVertical: 40,
  },
  statusIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  statusText: {
    fontSize: 20,
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
  },
  retryButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 20,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
