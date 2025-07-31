import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useState, useEffect } from 'react';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { CheckCircle, ArrowLeft, X } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PaymentScreen() {
  const { amount, points, paymentMethodId, paymentMethodName, paymentMethodColor } = useLocalSearchParams();
  const [step, setStep] = useState<'initial' | 'processing' | 'success' | 'error'>('initial');
  const [selectedProvider, setSelectedProvider] = useState<string>('');

  const mobileMoneyProviders = [
    { id: 'orange', name: 'Orange Money', color: '#FF6600', icon: '🔶', fee: 125 },
    { id: 'mtn', name: 'MTN Mobile Money', color: '#FFCC00', icon: '💰', fee: 175 },
    { id: 'wave', name: 'Wave', color: '#00D4FF', icon: '🌊', fee: 100 },
  ];

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId);
  };

  const handleProcessPayment = () => {
    if (!selectedProvider) {
      Alert.alert('Sélection requise', 'Veuillez sélectionner un fournisseur de paiement.');
      return;
    }

    setStep('processing');

    // Simulation du processus de paiement
    setTimeout(() => {
      // Simulation d'un paiement réussi (90% de chance de succès)
      const success = Math.random() > 0.1;
      
      if (success) {
        setStep('success');
        // Ajouter la transaction à l'historique après succès
        addTransactionToHistory();
        setTimeout(() => {
          router.back();
        }, 3000);
      } else {
        setStep('error');
      }
    }, 3000);
  };

  const addTransactionToHistory = async () => {
    // Créer une nouvelle transaction
    const provider = mobileMoneyProviders.find(p => p.id === selectedProvider);
    const totalWithFees = getTotalWithFees();
    
    const newTransaction = {
      id: `${Date.now()}_${Math.random()}`,
      type: 'recharge' as const,
      amount: totalWithFees,
      points: parseInt(points as string, 10),
      date: new Date().toISOString(),
      method: provider?.name || 'Mobile Money',
      provider: provider?.name || '',
    };

    // Sauvegarder dans AsyncStorage pour persister
    try {
      const existingTransactions = await AsyncStorage.getItem('wallet_transactions');
      const transactions = existingTransactions ? JSON.parse(existingTransactions) : [];
      const updatedTransactions = [newTransaction, ...transactions];
      await AsyncStorage.setItem('wallet_transactions', JSON.stringify(updatedTransactions));
    } catch (error) {
      console.warn('Erreur lors de la sauvegarde de la transaction:', error);
    }
  };

  const getTotalWithFees = () => {
    const baseAmount = parseInt(amount as string, 10) || 0;
    const provider = mobileMoneyProviders.find(p => p.id === selectedProvider);
    return baseAmount + (provider?.fee || 0);
  };

  const getSelectedProviderColor = () => {
    const provider = mobileMoneyProviders.find(p => p.id === selectedProvider);
    return provider?.color || '#28a745';
  };

  const renderInitialStep = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Paiement Sécurisé</Text>
        <Text style={styles.subtitle}>Sélectionnez votre mode de paiement</Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Récapitulatif</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Montant:</Text>
          <Text style={styles.summaryValue}>{amount} FCFA</Text>
        </View>
        {selectedProvider && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Frais:</Text>
            <Text style={styles.summaryValue}>
              {mobileMoneyProviders.find(p => p.id === selectedProvider)?.fee || 0} FCFA
            </Text>
          </View>
        )}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total:</Text>
          <Text style={styles.summaryValue}>{getTotalWithFees()} FCFA</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Points à créditer:</Text>
          <Text style={styles.summaryValueHighlight}>+{points} pts</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Choisissez votre mode de paiement</Text>
        
        {mobileMoneyProviders.map((provider) => (
          <TouchableOpacity
            key={provider.id}
            style={[
              styles.providerCard,
              selectedProvider === provider.id && styles.selectedProvider,
            ]}
            onPress={() => handleProviderSelect(provider.id)}
          >
            <View style={styles.providerContent}>
              <View style={styles.providerLeft}>
                <Text style={styles.providerIcon}>{provider.icon}</Text>
                <View>
                  <Text style={styles.providerName}>{provider.name}</Text>
                  <Text style={styles.providerFee}>Frais: {provider.fee} FCFA</Text>
                </View>
              </View>
              <View style={[
                styles.radioButton,
                selectedProvider === provider.id && styles.radioButtonSelected,
              ]} />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.securityNote}>
        <Text style={styles.securityIcon}>🔒</Text>
        <Text style={styles.securityText}>Paiement sécurisé par AfriSmile Pay</Text>
      </View>
    </ScrollView>
  );

  const renderProcessingStep = () => (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color="#4CAF50" />
      <Text style={styles.processingText}>Traitement en cours...</Text>
      <Text style={styles.processingSubtext}>
        Connexion avec {mobileMoneyProviders.find(p => p.id === selectedProvider)?.name}
      </Text>
    </View>
  );

  const renderSuccessStep = () => (
    <View style={styles.centerContainer}>
      <CheckCircle size={80} color="#4CAF50" />
      <Text style={styles.successTitle}>Paiement Réussi!</Text>
      <Text style={styles.successText}>
        {points} points ont été ajoutés à votre compte
      </Text>
      <Text style={styles.redirectText}>
        Redirection automatique...
      </Text>
    </View>
  );

  const renderErrorStep = () => (
    <View style={styles.centerContainer}>
      <X size={80} color="#F44336" />
      <Text style={styles.errorTitle}>Échec du Paiement</Text>
      <Text style={styles.errorText}>
        Une erreur est survenue lors du traitement de votre paiement.
      </Text>
      <TouchableOpacity 
        style={styles.retryButton}
        onPress={() => setStep('initial')}
      >
        <Text style={styles.retryButtonText}>Réessayer</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.cancelButton}
        onPress={() => router.back()}
      >
        <Text style={styles.cancelButtonText}>Annuler</Text>
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    switch (step) {
      case 'initial':
        return renderInitialStep();
      case 'processing':
        return renderProcessingStep();
      case 'success':
        return renderSuccessStep();
      case 'error':
        return renderErrorStep();
      default:
        return renderInitialStep();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Paiement Sécurisé',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color="#000" />
            </TouchableOpacity>
          ),
        }}
      />
      
      {renderContent()}
      
      {step === 'initial' && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.payButton,
              !selectedProvider && styles.payButtonDisabled,
              selectedProvider && { backgroundColor: getSelectedProviderColor() },
            ]}
            onPress={handleProcessPayment}
            disabled={!selectedProvider}
          >
            <Text style={styles.payButtonText}>
              {selectedProvider ? 'Payer' : 'Sélectionnez un mode de paiement'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.termsText}>
            En cliquant sur 'Payer', vous acceptez nos conditions générales
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    padding: 8,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
  },
  summaryCard: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#6c757d',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  summaryValueHighlight: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 16,
  },
  providerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedProvider: {
    borderColor: '#4CAF50',
    backgroundColor: '#f8fff9',
  },
  providerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  providerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  providerIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  providerFee: {
    fontSize: 14,
    color: '#6c757d',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e9ecef',
    backgroundColor: '#fff',
  },
  radioButtonSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#4CAF50',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
  },
  securityIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  securityText: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  payButton: {
    backgroundColor: '#28a745',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  payButtonDisabled: {
    backgroundColor: '#e9ecef',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 16,
  },
  processingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginTop: 20,
    marginBottom: 8,
  },
  processingSubtext: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  successText: {
    fontSize: 16,
    color: '#212529',
    textAlign: 'center',
    marginBottom: 20,
  },
  redirectText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F44336',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#212529',
    textAlign: 'center',
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    minWidth: 200,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 200,
  },
  cancelButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '500',
  },
});
