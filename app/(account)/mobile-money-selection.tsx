import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { X, Smartphone } from 'lucide-react-native';
import { useState, useEffect, useRef } from 'react';

export default function MobileMoneySelectionScreen() {
  const params = useLocalSearchParams();
  const amount = params.amount as string;
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // État pour la sélection
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  
  // Opérateurs Mobile Money disponibles
  const providers = [
    {
      id: 'mtn',
      name: 'MTN Mobile Money',
      shortName: 'MTN',
      color: '#FFCC00',
      backgroundColor: '#FFF8E1',
      fees: 175,
      description: 'Paiement rapide et sécurisé',
    },
    {
      id: 'orange',
      name: 'Orange Money',
      shortName: 'Orange',
      color: '#FF6B00',
      backgroundColor: '#FFF3E0',
      fees: 125,
      description: 'Service fiable et accessible',
    },
    {
      id: 'moov',
      name: 'Moov Money',
      shortName: 'Moov',
      color: '#00BCD4',
      backgroundColor: '#E0F2F1',
      fees: 100,
      description: 'Frais les plus avantageux',
    },
  ];
  
  // Animation d'entrée
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);
  
  // Fonction pour continuer avec l'opérateur sélectionné
  const handleContinue = () => {
    if (!selectedProvider) {
      Alert.alert('Sélection requise', 'Veuillez sélectionner un opérateur Mobile Money');
      return;
    }
    
    const provider = providers.find(p => p.id === selectedProvider);
    
    // Naviguer vers la page de paiement Mobile Money
    router.push({
      pathname: '/(account)/mobile-money-payment',
      params: {
        amount,
        provider: selectedProvider,
        providerName: provider?.name,
        fees: provider?.fees.toString(),
      },
    });
  };
  
  return (
    <>
      <Stack.Screen
        options={{
          title: "Choisir l'opérateur",
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
          {/* Informations sur la recharge */}
          <View style={styles.rechargeInfo}>
            <Text style={styles.rechargeTitle}>Recharge de {parseInt(amount || '0').toLocaleString()} FCFA</Text>
            <Text style={styles.rechargeDescription}>
              Choisissez votre opérateur Mobile Money pour procéder au paiement
            </Text>
          </View>
          
          {/* Liste des opérateurs */}
          <View style={styles.providersContainer}>
            <Text style={styles.sectionTitle}>Opérateurs disponibles</Text>
            
            {providers.map((provider) => (
              <TouchableOpacity
                key={provider.id}
                style={[
                  styles.providerCard,
                  { backgroundColor: provider.backgroundColor },
                  selectedProvider === provider.id && styles.selectedProviderCard,
                ]}
                onPress={() => setSelectedProvider(provider.id)}
              >
                <View style={styles.providerHeader}>
                  <View style={styles.providerIconContainer}>
                    <Smartphone size={24} color={provider.color} />
                  </View>
                  <View style={styles.providerInfo}>
                    <Text style={styles.providerName}>{provider.name}</Text>
                    <Text style={styles.providerDescription}>{provider.description}</Text>
                  </View>
                  <View style={styles.providerFees}>
                    <Text style={styles.feesLabel}>Frais</Text>
                    <Text style={[styles.feesAmount, { color: provider.color }]}>
                      {provider.fees} FCFA
                    </Text>
                  </View>
                </View>
                
                {selectedProvider === provider.id && (
                  <View style={styles.selectedIndicator}>
                    <View style={[styles.selectedDot, { backgroundColor: provider.color }]} />
                    <Text style={[styles.selectedText, { color: provider.color }]}>
                      Sélectionné
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Informations importantes */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>💡 Informations importantes</Text>
            <View style={styles.infoList}>
              <Text style={styles.infoItem}>• Les frais affichés sont appliqués par l'opérateur</Text>
              <Text style={styles.infoItem}>• Le montant total sera débité de votre compte mobile</Text>
              <Text style={styles.infoItem}>• La recharge sera instantanée après confirmation</Text>
              <Text style={styles.infoItem}>• Vous recevrez une confirmation par SMS</Text>
            </View>
          </View>
          
          {/* Bouton de continuation */}
          <TouchableOpacity
            style={[
              styles.continueButton,
              !selectedProvider && styles.disabledButton,
            ]}
            onPress={handleContinue}
            disabled={!selectedProvider}
          >
            <Text style={styles.continueButtonText}>
              Continuer avec {providers.find(p => p.id === selectedProvider)?.shortName || 'l\'opérateur sélectionné'}
            </Text>
          </TouchableOpacity>
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
  rechargeInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  rechargeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00B14F',
    marginBottom: 8,
  },
  rechargeDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  providersContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 15,
  },
  providerCard: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  selectedProviderCard: {
    borderColor: '#00B14F',
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  providerDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  providerFees: {
    alignItems: 'flex-end',
  },
  feesLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  feesAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
  },
  selectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  selectedText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
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
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 15,
  },
  infoList: {
    gap: 8,
  },
  infoItem: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  continueButton: {
    backgroundColor: '#00B14F',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#A7F0C1',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
