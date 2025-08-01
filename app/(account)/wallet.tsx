import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Image,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { Stack, router, useFocusEffect } from 'expo-router';
import { ArrowLeft, Smartphone, Plus, CreditCard, Wallet, History, TrendingUp } from 'lucide-react-native';
import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { pointsToFcfa, fcfaToPoints, formatPointsWithFcfa, isValidRechargeAmount, formatFcfaAmount, formatPointsAmount } from '@/utils/pointsConversion';
import { getResponsiveTextProps } from '@/utils/responsiveStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

interface Transaction {
  id: string;
  type: 'recharge' | 'payment';
  amount: number;
  points: number;
  date: string;
  method?: string;
  provider?: string;
}

export default function WalletScreen() {
  const [activeTab, setActiveTab] = useState<'recharge' | 'history'>('recharge');
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [confetti, setConfetti] = useState<Array<{id: number, x: number, y: number, color: string}>>([]);
  const [quickAmounts] = useState<number[]>([1000, 2000, 5000, 10000]); // Montants rapides pour sélection facile
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const { user, addUserPoints } = useAuth();

  // Création des animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const successAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Animations pour les points dorés
  const goldTextAnim = useRef(new Animated.Value(1)).current;
  const confettiAnims = useRef<Animated.Value[]>([]).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Exemple de transactions simulées - initialiser avec les données existantes
  const mockTransactions: Transaction[] = useMemo(() => [
    {
      id: '1',
      type: 'recharge',
      amount: 5000,
      points: fcfaToPoints(5000),
      date: '2023-10-15',
      method: 'Mobile Money',
    },
    {
      id: '2',
      type: 'payment',
      amount: 2500,
      points: fcfaToPoints(2500),
      date: '2023-10-10',
      provider: 'Restaurant Chez Paul',
    },
    {
      id: '3',
      type: 'recharge',
      amount: 10000,
      points: fcfaToPoints(10000),
      date: '2023-09-28',
      method: 'Carte Bancaire',
    },
    {
      id: '4',
      type: 'payment',
      amount: 7500,
      points: fcfaToPoints(7500),
      date: '2023-09-15',
      provider: 'Supermarché Le Bon Prix',
    },
    {
      id: '5',
      type: 'recharge',
      amount: 3000,
      points: fcfaToPoints(3000),
      date: '2023-09-05',
      method: 'Mobile Money',
    },
  ], []);

  // Fonction pour charger les transactions depuis AsyncStorage
  const loadTransactions = async () => {
    try {
      const storedTransactions = await AsyncStorage.getItem('wallet_transactions');
      if (storedTransactions) {
        const parsedTransactions = JSON.parse(storedTransactions);
        setTransactions(parsedTransactions);
      } else {
        // Si aucune transaction stockée, utiliser les données mock
        setTransactions(mockTransactions);
      }
    } catch (error) {
      console.warn('Erreur lors du chargement des transactions:', error);
      // En cas d'erreur, utiliser les données mock
      setTransactions(mockTransactions);
    }
  };

  // Fonction pour recharger les transactions (utile pour actualiser après un paiement)
  const refreshTransactions = useCallback(() => {
    loadTransactions();
  }, []);

  // Initialiser les transactions au premier rendu
  useEffect(() => {
    loadTransactions();
  }, []);

  // Recharger les transactions quand on revient sur cette page
  useFocusEffect(
    useCallback(() => {
      refreshTransactions();
    }, [refreshTransactions])
  );

  // Fonction pour ajouter une nouvelle transaction
  const addTransaction = useCallback((newTransaction: Omit<Transaction, 'id' | 'date'>) => {
    const transaction: Transaction = {
      ...newTransaction,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0], // Format YYYY-MM-DD
    };
    
    setTransactions(prev => [transaction, ...prev]); // Ajouter en tête pour voir les dernières en premier
  }, []);

  // Fonction pour obtenir le nom lisible de la méthode de paiement
  const getMethodName = (methodId: string | null): string => {
    switch (methodId) {
      case 'mobile': return 'Mobile Money';
      case 'card': return 'Carte Bancaire';
      case 'transfer': return 'Virement Bancaire';
      case 'crypto': return 'Cryptomonnaie';
      default: return 'Autre';
    }
  };

  const handleRecharge = () => {
    if (!amount) {
      Alert.alert('Erreur', 'Veuillez saisir un montant');
      return;
    }

    if (!selectedMethod) {
      Alert.alert('Erreur', 'Veuillez sélectionner une méthode de paiement');
      return;
    }

    const numAmount = parseInt(amount, 10);
    
    if (!isValidRechargeAmount(numAmount)) {
      Alert.alert(
        'Montant invalide', 
        'Le montant minimum de recharge est de 1000 FCFA. Veuillez saisir un montant valide.'
      );
      return;
    }

    setIsProcessing(true);

    // Simulation de traitement de paiement
    setTimeout(() => {
      setIsProcessing(false);
      
      // Si c'est mobile money ou carte bancaire, rediriger vers la page de paiement
      if (selectedMethod === 'mobile' || selectedMethod === 'card') {
        const numAmount = parseInt(amount, 10);
        const pointsToAdd = fcfaToPoints(numAmount);
        
        router.push({
          pathname: '/(account)/payment',
          params: {
            amount: numAmount.toString(),
            points: pointsToAdd.toString(),
            paymentMethodId: selectedMethod,
            paymentMethodName: selectedMethod === 'mobile' ? 'Mobile Money' : 'Carte Bancaire',
            paymentMethodColor: selectedMethod === 'mobile' ? '#FF6600' : '#4CAF50',
          },
        });
        return;
      }

      // Si c'est un autre mode de paiement, confirmer directement
      handleConfirmPayment();
    }, 1500);
  };

  const handleConfirmPayment = () => {
    const numAmount = parseInt(amount, 10);
    const pointsToAdd = fcfaToPoints(numAmount);
    
    // Ajouter les points à l'utilisateur
    addUserPoints(pointsToAdd);
    
    // Ajouter la transaction à l'historique
    addTransaction({
      type: 'recharge',
      amount: numAmount,
      points: pointsToAdd,
      method: getMethodName(selectedMethod),
    });
    
    // Afficher l'animation de réussite
    setShowSuccessAnimation(true);
    
    // Animer la réussite
    Animated.parallel([
      Animated.timing(successAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
    
    // Générer des confettis
    generateConfetti();
    
    // Réinitialiser après un délai
    setTimeout(() => {
      setShowSuccessAnimation(false);
      setAmount('');
      setSelectedMethod(null);
      successAnim.setValue(0);
    }, 3000);
  };

  const generateConfetti = () => {
    const newConfetti = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: -20 - Math.random() * 100,
      color: ['#00B14F', '#4ECDC4', '#FF6B6B', '#FFD166', '#45B7D1'][
        Math.floor(Math.random() * 5)
      ],
    }));
    
    setConfetti(newConfetti);
    
    // Créer des animations pour chaque confetti
    while (confettiAnims.length < newConfetti.length) {
      confettiAnims.push(new Animated.Value(0));
    }
    
    // Animer la chute des confettis
    newConfetti.forEach((_, i) => {
      Animated.timing(confettiAnims[i], {
        toValue: 1,
        duration: 2000 + Math.random() * 1000,
        useNativeDriver: true,
      }).start();
    });
  };

  const TransactionItem = memo(({ item }: { item: Transaction }) => {
    const isRecharge = item.type === 'recharge';
    
    return (
      <View style={styles.transactionItem}>
        <View style={styles.transactionIcon}>
          {isRecharge ? (
            <Plus size={20} color="#00B14F" />
          ) : (
            <Wallet size={20} color="#FF6B6B" />
          )}
        </View>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionTitle}>
            {isRecharge ? 'Recharge' : 'Paiement'} 
            {isRecharge && item.method ? ` via ${item.method}` : ''}
            {!isRecharge && item.provider ? ` à ${item.provider}` : ''}
          </Text>
          <Text style={styles.transactionDate}>
            {new Date(item.date).toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>
        <View style={styles.transactionAmount}>
          <Text
            style={[
              styles.transactionAmountText,
              { color: isRecharge ? '#00B14F' : '#FF6B6B' },
            ]}
          >
            {isRecharge ? '+' : '-'} {formatPointsWithFcfa(item.points)}
          </Text>
        </View>
      </View>
    );
  });

  const renderTransaction = useCallback(({ item }: { item: Transaction }) => {
    return <TransactionItem item={item} />;
  }, []);

  useEffect(() => {
    // Animation d'entrée
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
    
    // Animation de rotation pour l'icône d'attente
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();

    // Animation des points dorés
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(goldTextAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(goldTextAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
    };
  }, []);

  const rotateInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Données à afficher dans le FlatList principal
  const listData = useMemo(() => {
    const data = [];
    
    // Toujours ajouter l'en-tête avec le solde et les onglets
    data.push({ type: 'header', id: 'header' });
    
    if (activeTab === 'recharge') {
      data.push({ type: 'recharge', id: 'recharge' });
    } else {
      // Ajouter les transactions
      transactions.forEach(transaction => {
        data.push({ type: 'transaction', id: transaction.id, data: transaction });
      });
    }
    
    return data;
  }, [activeTab, transactions]);

  // Fonction de rendu pour les différents types d'éléments
  const renderListItem = ({ item }: { item: any }) => {
    switch (item.type) {
      case 'header':
        return (
          <View>
            {/* Solde du portefeuille */}
            <View style={styles.balanceSection}>
              <Text style={styles.balanceLabel}>Mon solde</Text>
              <Animated.Text 
                style={[
                  styles.balanceValueGold,
                  {
                    transform: [{ scale: goldTextAnim }],
                  }
                ]}
              >
                {formatPointsAmount(user?.points || 0)}
              </Animated.Text>
              <Text style={[styles.balanceValueSilver, getResponsiveTextProps('fcfa').style]}
                    numberOfLines={getResponsiveTextProps('fcfa').numberOfLines}
                    ellipsizeMode={getResponsiveTextProps('fcfa').ellipsizeMode}>
                {formatFcfaAmount(pointsToFcfa(user?.points || 0))}
              </Text>
              <View style={styles.balanceSubtext}>
                <TrendingUp size={16} color="#00B14F" style={styles.trendingIcon} />
                <Text style={styles.balanceInfo}>
                  1 point = 78.35 FCFA • {formatPointsAmount(user?.points || 0)}
                </Text>
              </View>
            </View>

            {/* Onglets */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'recharge' && styles.activeTab]}
                onPress={() => setActiveTab('recharge')}
              >
                <Plus
                  size={20}
                  color={activeTab === 'recharge' ? '#FFFFFF' : '#8E8E8E'}
                />
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'recharge' && styles.activeTabText,
                  ]}
                >
                  Recharger
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'history' && styles.activeTab]}
                onPress={() => setActiveTab('history')}
              >
                <History
                  size={20}
                  color={activeTab === 'history' ? '#FFFFFF' : '#8E8E8E'}
                />
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'history' && styles.activeTabText,
                  ]}
                >
                  Historique
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
        
      case 'recharge':
        return (
          <View style={styles.rechargeSection}>
            <Text style={styles.sectionTitle}>Montant de la recharge</Text>
            
            {/* Sélection rapide des montants */}
            <View style={styles.quickAmountsContainer}>
              <View style={styles.quickAmountsRow}>
                {quickAmounts.slice(0, 3).map((amt) => (
                  <TouchableOpacity
                    key={amt}
                    style={[
                      styles.quickAmountButton,
                      parseInt(amount, 10) === amt && styles.quickAmountButtonSelected,
                    ]}
                    onPress={() => setAmount(amt.toString())}
                  >
                    <Text
                      style={[
                        styles.quickAmountText,
                        parseInt(amount, 10) === amt && styles.quickAmountTextSelected,
                      ]}
                    >
                      {formatFcfaAmount(amt)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.quickAmountsRow}>
                {quickAmounts.slice(3).map((amt) => (
                  <TouchableOpacity
                    key={amt}
                    style={[
                      styles.quickAmountButton,
                      parseInt(amount, 10) === amt && styles.quickAmountButtonSelected,
                    ]}
                    onPress={() => setAmount(amt.toString())}
                  >
                    <Text
                      style={[
                        styles.quickAmountText,
                        parseInt(amount, 10) === amt && styles.quickAmountTextSelected,
                      ]}
                    >
                      {formatFcfaAmount(amt)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Champ de saisie du montant */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.amountInput}
                placeholder="Montant en FCFA"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
              <View style={styles.inputIconContainer}>
                <Text style={styles.fcfaLabel}>FCFA</Text>
              </View>
            </View>
            
            <Text style={styles.conversionText}>
              ≈ {amount ? fcfaToPoints(parseInt(amount, 10)).toLocaleString() : '0'} points
            </Text>
            
            <Text style={styles.sectionTitle}>Méthode de paiement</Text>
            
            {/* Méthodes de paiement */}
            <View style={styles.paymentMethods}>
              <TouchableOpacity
                style={[
                  styles.paymentMethod,
                  selectedMethod === 'mobile' && styles.selectedPaymentMethod,
                ]}
                onPress={() => setSelectedMethod('mobile')}
              >
                <Smartphone size={24} color={selectedMethod === 'mobile' ? '#00B14F' : '#8E8E8E'} />
                <Text style={styles.paymentMethodText}>Mobile Money</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.paymentMethod,
                  selectedMethod === 'card' && styles.selectedPaymentMethod,
                ]}
                onPress={() => setSelectedMethod('card')}
              >
                <CreditCard size={24} color={selectedMethod === 'card' ? '#00B14F' : '#8E8E8E'} />
                <Text style={styles.paymentMethodText}>Carte Bancaire</Text>
              </TouchableOpacity>
            </View>
            
            {/* Bouton de recharge */}
            <TouchableOpacity
              style={[
                styles.rechargeButton,
                (!amount || !selectedMethod) && styles.disabledButton,
              ]}
              onPress={handleRecharge}
              disabled={!amount || !selectedMethod || isProcessing}
            >
              {isProcessing ? (
                <Animated.View
                  style={{ 
                    transform: [{ rotate: rotateInterpolation }] 
                  }}
                >
                  <ActivityIndicator size="small" color="#FFFFFF" />
                </Animated.View>
              ) : (
                <Text style={styles.rechargeButtonText}>Recharger maintenant</Text>
              )}
            </TouchableOpacity>
          </View>
        );
        
      case 'transaction':
        return renderTransaction({ item: item.data });
        
      default:
        return null;
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <SafeAreaView style={styles.safeContainer}>
        <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
        <View style={styles.container}>
          {/* FlatList principal qui gère tous les contenus avec header inclus */}
          <FlatList
            data={listData}
            renderItem={renderListItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={styles.customHeader}>
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={styles.backButton}
                >
                  <ArrowLeft size={24} color="#00B14F" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Mon Portefeuille</Text>
                <View style={styles.headerSpacer} />
              </View>
            }
          />
        </View>
      </SafeAreaView>
      
      {/* Animation de succès */}
      {showSuccessAnimation && (
        <View style={styles.successOverlay}>
          <Animated.View
            style={[
              styles.successContainer,
              {
                opacity: successAnim,
                transform: [
                  { scale: pulseAnim },
                ],
              },
            ]}
          >
            <View style={styles.successIconContainer}>
              <View style={styles.successIcon}>
                <Plus size={40} color="#FFFFFF" />
              </View>
            </View>
            <Text style={styles.successTitle}>Recharge réussie!</Text>
            <Text style={styles.successText}>
              {amount} FCFA ont été ajoutés à votre portefeuille
            </Text>
            <Text style={styles.successPoints}>
              +{amount ? fcfaToPoints(parseInt(amount, 10)).toLocaleString() : '0'} points
            </Text>
          </Animated.View>
          
          {/* Confetti animation */}
          {confetti.map((item, index) => (
            <Animated.View
              key={item.id}
              style={[
                styles.confetti,
                {
                  left: item.x,
                  top: item.y,
                  backgroundColor: item.color,
                  transform: [
                    {
                      translateY: confettiAnims[index]?.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, height],
                      }) || 0,
                    },
                    { rotate: `${Math.random() * 360}deg` },
                  ],
                },
              ]}
            />
          ))}
        </View>
      )}
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
  balanceSection: {
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
  balanceLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00B14F',
    marginBottom: 8,
  },
  balanceValueGold: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#DAA520', // Couleur or riche
    textAlign: 'center',
    marginBottom: 4,
    textShadowColor: 'rgba(218, 165, 32, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  balanceValueSilver: {
    fontSize: 20,
    fontWeight: '600',
    color: '#C0C0C0', // Couleur argent authentique
    textAlign: 'center',
    marginBottom: 8,
  },
  balanceSubtext: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendingIcon: {
    marginRight: 5,
  },
  balanceInfo: {
    color: '#6B7280',
    fontSize: 14,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  activeTab: {
    backgroundColor: '#00B14F',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E8E',
    marginLeft: 5,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  rechargeSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 15,
  },
  quickAmountsContainer: {
    marginBottom: 20,
  },
  quickAmountsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  quickAmountButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    marginHorizontal: 3,
  },
  quickAmountButtonSelected: {
    borderColor: '#00B14F',
    backgroundColor: 'rgba(0, 177, 79, 0.1)',
  },
  quickAmountText: {
    color: '#6B7280',
    fontWeight: '500',
    fontSize: 12,
    textAlign: 'center',
  },
  quickAmountTextSelected: {
    color: '#00B14F',
  },
  inputContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 10,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  inputIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 15,
  },
  fcfaLabel: {
    color: '#6B7280',
    fontWeight: '500',
  },
  conversionText: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'right',
  },
  paymentMethods: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  paymentMethod: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
  },
  selectedPaymentMethod: {
    borderColor: '#00B14F',
    backgroundColor: 'rgba(0, 177, 79, 0.05)',
  },
  paymentMethodText: {
    marginTop: 8,
    color: '#6B7280',
    fontSize: 14,
  },
  rechargeButton: {
    backgroundColor: '#00B14F',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#A7F0C1',
  },
  rechargeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  historySection: {
    flex: 1,
  },
  transactionList: {
    paddingBottom: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionDetails: {
    flex: 1,
    marginLeft: 15,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  transactionDate: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionAmountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  successContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#00B14F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00B14F',
    marginBottom: 10,
  },
  successText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 10,
  },
  successPoints: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00B14F',
  },
  confetti: {
    position: 'absolute',
    width: 8,
    height: 16,
    borderRadius: 4,
  },
  // Nouveaux styles pour le header personnalisé
  safeContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40, // Même largeur que le bouton de retour pour centrer le titre
  },
});
