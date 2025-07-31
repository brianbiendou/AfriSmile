import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { X, Smartphone, CheckCircle } from 'lucide-react-native';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fcfaToPoints } from '@/utils/pointsConversion';

export default function MobileMoneyPaymentScreen() {
  const params = useLocalSearchParams();
  const amount = parseInt(params.amount as string || '0');
  const provider = params.provider as string;
  const providerName = params.providerName as string;
  const fees = parseInt(params.fees as string || '0');
  
  const { addUserPoints } = useAuth();
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;
  
  // États
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [step, setStep] = useState<'input' | 'processing' | 'success'>('input');
  
  // Animation d'entrée
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);
  
  // Validation du numéro de téléphone
  const isValidPhoneNumber = (phone: string) => {
    // Format ivoirien : 07/05/01 XX XX XX XX ou +225 XX XX XX XX XX
    const patterns = [
      /^0[157]\d{8}$/, // Format local
      /^\+225[157]\d{8}$/, // Format international
    ];
    return patterns.some(pattern => pattern.test(phone.replace(/\s/g, '')));
  };
  
  // Traitement du paiement
  const handlePayment = () => {
    if (!phoneNumber) {
      Alert.alert('Numéro requis', 'Veuillez saisir votre numéro de téléphone');
      return;
    }
    
    if (!isValidPhoneNumber(phoneNumber)) {
      Alert.alert('Numéro invalide', 'Veuillez saisir un numéro de téléphone valide');
      return;
    }
    
    setStep('processing');
    setIsProcessing(true);
    
    // Simulation du processus de paiement
    setTimeout(() => {
      // Simuler une réussite du paiement
      const pointsToAdd = fcfaToPoints(amount);
      addUserPoints(pointsToAdd);
      
      setStep('success');
      setPaymentSuccess(true);
      setIsProcessing(false);
      
      // Animation de succès
      Animated.timing(successAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
      
      // Retour automatique après succès
      setTimeout(() => {
        router.back();
        router.back(); // Retour à la page wallet
      }, 3000);
    }, 3000);
  };
  
  // Formatage du numéro de téléphone
  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.startsWith('225')) {
      return cleaned.substring(3);
    }
    return cleaned;
  };
  
  const totalAmount = amount + fees;
  
  if (step === 'success') {
    return (
      <>
        <Stack.Screen options={{ title: "Paiement réussi" }} />
        <View style={styles.successContainer}>
          <Animated.View
            style={[
              styles.successContent,
              {
                opacity: successAnim,
                transform: [
                  {
                    scale: successAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.successIconContainer}>
              <CheckCircle size={80} color="#00B14F" />
            </View>
            <Text style={styles.successTitle}>Paiement réussi !</Text>
            <Text style={styles.successMessage}>
              Votre recharge de {amount.toLocaleString()} FCFA a été effectuée avec succès
            </Text>
            <Text style={styles.successPoints}>
              +{fcfaToPoints(amount).toLocaleString()} points ajoutés
            </Text>
          </Animated.View>
        </View>
      </>
    );
  }
  
  return (
    <>
      <Stack.Screen
        options={{
          title: `Paiement ${providerName}`,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginLeft: 16 }}
            >
              <X size={24} color="#00B14F" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <Animated.View
          style={[styles.content, { opacity: fadeAnim }]}
        >
          {step === 'processing' ? (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color="#00B14F" />
              <Text style={styles.processingTitle}>Traitement en cours...</Text>
              <Text style={styles.processingMessage}>
                Veuillez saisir votre code PIN sur votre téléphone pour confirmer le paiement
              </Text>
              <View style={styles.processingDetails}>
                <Text style={styles.processingDetail}>Montant: {amount.toLocaleString()} FCFA</Text>
                <Text style={styles.processingDetail}>Frais: {fees.toLocaleString()} FCFA</Text>
                <Text style={styles.processingDetailTotal}>Total: {totalAmount.toLocaleString()} FCFA</Text>
              </View>
            </View>
          ) : (
            <>
              {/* Récapitulatif */}
              <View style={styles.summaryCard}>
                <View style={styles.summaryHeader}>
                  <Smartphone size={24} color="#00B14F" />
                  <Text style={styles.summaryTitle}>Récapitulatif du paiement</Text>
                </View>
                
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Opérateur:</Text>
                  <Text style={styles.summaryValue}>{providerName}</Text>
                </View>
                
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Montant de recharge:</Text>
                  <Text style={styles.summaryValue}>{amount.toLocaleString()} FCFA</Text>
                </View>
                
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Frais de transaction:</Text>
                  <Text style={styles.summaryValue}>{fees.toLocaleString()} FCFA</Text>
                </View>
                
                <View style={[styles.summaryRow, styles.summaryTotal]}>
                  <Text style={styles.summaryLabelTotal}>Total à payer:</Text>
                  <Text style={styles.summaryValueTotal}>{totalAmount.toLocaleString()} FCFA</Text>
                </View>
                
                <View style={styles.pointsInfo}>
                  <Text style={styles.pointsLabel}>Points à recevoir:</Text>
                  <Text style={styles.pointsValue}>+{fcfaToPoints(amount).toLocaleString()} points</Text>
                </View>
              </View>
              
              {/* Saisie du numéro */}
              <View style={styles.phoneSection}>
                <Text style={styles.sectionTitle}>Numéro de téléphone</Text>
                <Text style={styles.sectionDescription}>
                  Saisissez le numéro associé à votre compte {providerName}
                </Text>
                
                <View style={styles.phoneInputContainer}>
                  <Text style={styles.countryCode}>+225</Text>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="XX XX XX XX XX"
                    value={phoneNumber}
                    onChangeText={(text) => setPhoneNumber(formatPhoneNumber(text))}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>
                
                {phoneNumber && !isValidPhoneNumber(`+225${phoneNumber}`) && (
                  <Text style={styles.errorText}>
                    Format invalide. Utilisez: 07/05/01 XX XX XX XX
                  </Text>
                )}
              </View>
              
              {/* Instructions */}
              <View style={styles.instructionsCard}>
                <Text style={styles.instructionsTitle}>📱 Comment ça marche ?</Text>
                <View style={styles.instructionsList}>
                  <Text style={styles.instructionItem}>1. Saisissez votre numéro {providerName}</Text>
                  <Text style={styles.instructionItem}>2. Appuyez sur "Payer maintenant"</Text>
                  <Text style={styles.instructionItem}>3. Saisissez votre code PIN sur votre téléphone</Text>
                  <Text style={styles.instructionItem}>4. Votre compte sera rechargé instantanément</Text>
                </View>
              </View>
              
              {/* Bouton de paiement */}
              <TouchableOpacity
                style={[
                  styles.payButton,
                  (!phoneNumber || !isValidPhoneNumber(`+225${phoneNumber}`)) && styles.disabledButton,
                ]}
                onPress={handlePayment}
                disabled={!phoneNumber || !isValidPhoneNumber(`+225${phoneNumber}`) || isProcessing}
              >
                <Text style={styles.payButtonText}>
                  Payer {totalAmount.toLocaleString()} FCFA
                </Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  summaryTotal: {
    borderBottomWidth: 0,
    paddingTop: 15,
    marginTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#00B14F',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  summaryLabelTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  summaryValueTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00B14F',
  },
  pointsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    padding: 12,
    backgroundColor: 'rgba(0, 177, 79, 0.1)',
    borderRadius: 8,
  },
  pointsLabel: {
    fontSize: 14,
    color: '#00B14F',
    fontWeight: '500',
  },
  pointsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00B14F',
  },
  phoneSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 15,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: '#111827',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 8,
  },
  instructionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 15,
  },
  instructionsList: {
    gap: 8,
  },
  instructionItem: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  payButton: {
    backgroundColor: '#00B14F',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#A7F0C1',
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  processingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 20,
    marginBottom: 10,
  },
  processingMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
  },
  processingDetails: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    alignItems: 'center',
  },
  processingDetail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 5,
  },
  processingDetailTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00B14F',
    marginTop: 10,
  },
  successContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  successContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00B14F',
    marginBottom: 15,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  successPoints: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00B14F',
  },
});
