import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Image,
} from 'react-native';
import { X, Smartphone, Plus, CreditCard, Wallet, History, TrendingUp } from 'lucide-react-native';
import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { pointsToFcfa, fcfaToPoints, formatPointsWithFcfa, isValidRechargeAmount } from '@/utils/pointsConversion';
import { useResponsiveModalStyles } from '@/hooks/useResponsiveDimensions';
import PaymentAggregatorModal from './PaymentAggregatorModal';

const { width, height } = Dimensions.get('window');

interface SimpleWalletModalProps {
  visible: boolean;
  onClose: () => void;
}

interface Transaction {
  id: string;
  type: 'recharge' | 'payment';
  amount: number;
  points: number;
  date: string;
  method?: string;
  provider?: string;
}

export default function SimpleWalletModal({ visible, onClose }: SimpleWalletModalProps) {
  const [activeTab, setActiveTab] = useState<'recharge' | 'history'>('recharge');
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [confetti, setConfetti] = useState<Array<{id: number, x: number, y: number, color: string}>>([]);
  const [quickAmounts] = useState<number[]>([1000, 2000, 5000, 10000]); // Montants rapides pour sélection facile

  const responsiveStyles = useResponsiveModalStyles();
  const { user, addUserPoints } = useAuth();

  // Création des animations avec des vérifications supplémentaires
  let fadeAnimVal: Animated.Value;
  try {
    fadeAnimVal = new Animated.Value(0);
  } catch (error) {
    console.error('Erreur lors de la création de fadeAnim:', error);
    // Fournir une valeur de secours
    fadeAnimVal = new Animated.Value(0);
  }
  const fadeAnim = useRef(fadeAnimVal).current;

  let scaleAnimVal: Animated.Value;
  try {
    scaleAnimVal = new Animated.Value(0.9);
  } catch (error) {
    console.error('Erreur lors de la création de scaleAnim:', error);
    scaleAnimVal = new Animated.Value(0.9);
  }
  const scaleAnim = useRef(scaleAnimVal).current;
  
  // Animations pour les effets visuels
  let successAnimVal: Animated.Value;
  try {
    successAnimVal = new Animated.Value(0);
  } catch (error) {
    console.error('Erreur lors de la création de successAnim:', error);
    successAnimVal = new Animated.Value(0);
  }
  const successAnim = useRef(successAnimVal).current;
  
  let pulseAnimVal: Animated.Value;
  try {
    pulseAnimVal = new Animated.Value(1);
  } catch (error) {
    console.error('Erreur lors de la création de pulseAnim:', error);
    pulseAnimVal = new Animated.Value(1);
  }
  const pulseAnim = useRef(pulseAnimVal).current;

  // Tableau d'animations pour les confettis
  const confettiAnims = useRef<Animated.Value[]>([]).current;
  
  let rotateAnimVal: Animated.Value;
  try {
    rotateAnimVal = new Animated.Value(0);
  } catch (error) {
    console.error('Erreur lors de la création de rotateAnim:', error);
    rotateAnimVal = new Animated.Value(0);
  }
  const rotateAnim = useRef(rotateAnimVal).current;

  // Animation optimisée avec useNativeDriver et configurée une seule fois
  const showAnimation = useMemo(() => {
    try {
      return Animated.parallel([
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
      ]);
    } catch (error) {
      console.error('Erreur lors de la configuration de l\'animation:', error);
      return null;
    }
  }, [fadeAnim, scaleAnim]);

  useEffect(() => {
    let animationTimeout: ReturnType<typeof setTimeout>;

    try {
      if (visible) {
        // Utilisation de l'animation pré-configurée
        showAnimation?.start();
      } else {
        // Reset des valeurs avec un délai pour éviter des calculs inutiles quand le modal est fermé
        animationTimeout = setTimeout(() => {
          fadeAnim.setValue(0);
          scaleAnim.setValue(0.9);
        }, 100);
      }
    } catch (error) {
      console.error('Erreur lors de l\'exécution de l\'animation:', error);
    }

    // Nettoyage du timeout pour éviter les fuites de mémoire
    return () => {
      if (animationTimeout) clearTimeout(animationTimeout);
    };
  }, [visible, showAnimation, fadeAnim, scaleAnim]);

  // Variables pour suivre les changements de points
  const [oldPoints, setOldPoints] = useState(0);
  const [addedPoints, setAddedPoints] = useState(0);
  const [showPaymentAggregator, setShowPaymentAggregator] = useState(false);
  const [currentPaymentInfo, setCurrentPaymentInfo] = useState<{
    amount: number;
    points: number;
    method: any;
  } | null>(null);
  
  // Historique des transactions
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', type: 'recharge', amount: 10000, points: 128, date: '2024-01-15', method: 'MTN' },
    { id: '2', type: 'payment', amount: -2500, points: -32, date: '2024-01-14', provider: 'Chez Tante Marie' },
    { id: '3', type: 'recharge', amount: 5000, points: 64, date: '2024-01-13', method: 'Orange' },
    { id: '4', type: 'payment', amount: -1800, points: -23, date: '2024-01-12', provider: 'Beauty Palace' },
    { id: '5', type: 'recharge', amount: 15000, points: 191, date: '2024-01-11', method: 'Wave' },
  ]);
  
  // Animation de succès avec confettis
  const startSuccessAnimation = useCallback((pointsAdded = 0) => {
    console.log('Starting success animation');
    
    try {
      // Enregistrer les points ajoutés pour affichage
      setOldPoints(user?.points ? user.points - pointsAdded : 0);
      setAddedPoints(pointsAdded);
      
      setShowSuccessAnimation(true);
      
      // Générer des confettis
      const newConfetti = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * width,
        y: height / 2,
        color: ['#00B14F', '#FFD700', '#FF6B6B', '#4ECDC4', '#8B5CF6'][Math.floor(Math.random() * 5)]
      }));
      
      setConfetti(newConfetti);
      
      // Créer les animations pour chaque confetti en sécurisant les opérations
      if (Array.isArray(confettiAnims)) {
        confettiAnims.length = 0;
        newConfetti.forEach(() => {
          try {
            confettiAnims.push(new Animated.Value(0));
          } catch (error) {
            console.error('Erreur lors de la création d\'une animation de confetti:', error);
          }
        });
      }
      
      // Animation de pulsation du montant
      try {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.2,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
          { iterations: 3 }
        ).start();
      } catch (error) {
        console.error('Erreur lors de l\'animation de pulsation:', error);
      }
      
      // Animation de rotation de l'icône
      try {
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start();
      } catch (error) {
        console.error('Erreur lors de l\'animation de rotation:', error);
      }
      
      // Animation des confettis
      try {
        if (Array.isArray(confettiAnims) && confettiAnims.length > 0) {
          const validAnims = confettiAnims.filter(anim => anim instanceof Animated.Value);
          
          if (validAnims.length > 0) {
            Animated.parallel(
              validAnims.map((anim) =>
                Animated.timing(anim, {
                  toValue: 1,
                  duration: 2000 + Math.random() * 1000,
                  useNativeDriver: true,
                })
              )
            ).start();
          }
        }
      } catch (error) {
        console.error('Erreur lors de l\'animation des confettis:', error);
      }
      
      // Animation d'apparition du succès
      try {
        Animated.timing(successAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
      } catch (error) {
        console.error('Erreur lors de l\'animation de succès:', error);
      }
      
      // Nettoyer après 3 secondes avec gestion des erreurs
      const cleanupTimeout = setTimeout(() => {
        try {
          setShowSuccessAnimation(false);
          setConfetti([]);
          
          // Réinitialiser les valeurs d'animation de façon sécurisée
          if (successAnim instanceof Animated.Value) successAnim.setValue(0);
          if (pulseAnim instanceof Animated.Value) pulseAnim.setValue(1);
          if (rotateAnim instanceof Animated.Value) rotateAnim.setValue(0);
        } catch (error) {
          console.error('Erreur lors du nettoyage de l\'animation:', error);
          // Essayer au moins de cacher l'animation en cas d'erreur
          setShowSuccessAnimation(false);
        }
      }, 3000);
      
      // Retourner une fonction de nettoyage pour assurer l'annulation du timeout
      // si le composant est démonté avant la fin de l'animation
      return () => clearTimeout(cleanupTimeout);
    } catch (error) {
      console.error('Erreur générale dans startSuccessAnimation:', error);
      // Essayer au moins de cacher l'animation en cas d'erreur majeure
      setShowSuccessAnimation(false);
    }
  }, [confettiAnims, pulseAnim, rotateAnim, successAnim, setShowSuccessAnimation, setConfetti, width, height, user?.points]);

  const paymentMethods = useMemo(() => [
    { id: 'mtn', name: 'MTN Mobile Money', color: '#FFCC00', icon: Smartphone },
    { id: 'orange', name: 'Orange Money', color: '#FF6600', icon: Smartphone },
    { id: 'moov', name: 'Moov Money', color: '#007FFF', icon: Smartphone },
    { id: 'wave', name: 'Wave', color: '#00D4AA', icon: Smartphone },
    { id: 'visa', name: 'Visa Card', color: '#1A1F71', icon: CreditCard },
    { id: 'mastercard', name: 'Mastercard', color: '#EB001B', icon: CreditCard },
    { id: 'paypal', name: 'PayPal', color: '#0070BA', icon: Wallet },
  ], []);

  // Sélectionner un montant rapide
  const handleQuickAmountSelect = useCallback((quickAmount: number) => {
    setAmount(quickAmount.toString());
  }, []);

  // Gérer la demande de recharge
  const handleRecharge = useCallback(() => {
    if (!amount || !selectedMethod) {
      Alert.alert('Erreur', 'Veuillez sélectionner un montant et un moyen de paiement');
      return;
    }

    const numericAmount = parseInt(amount);
    if (numericAmount < 1000) {
      Alert.alert('Erreur', 'Le montant minimum est de 1000 FCFA');
      return;
    }

    const points = fcfaToPoints(numericAmount); // Conversion avec nouveau taux
    const selectedPaymentMethod = paymentMethods.find(m => m.id === selectedMethod);
    
    if (!selectedPaymentMethod) {
      Alert.alert('Erreur', 'Méthode de paiement non valide');
      return;
    }
    
    console.log(`Recharge demandée: ${numericAmount} FCFA (${points} pts) via ${selectedPaymentMethod.name}`);
    
    // Stockage des informations de paiement pour l'agrégateur
    setCurrentPaymentInfo({
      amount: numericAmount,
      points: points,
      method: selectedPaymentMethod
    });
    
    // Ouvrir l'agrégateur de paiement
    setShowPaymentAggregator(true);
  }, [amount, selectedMethod, paymentMethods, setCurrentPaymentInfo, setShowPaymentAggregator]);
  
  // Cette fonction est appelée quand le paiement est complété avec succès dans l'agrégateur
  const handlePaymentSuccess = useCallback(async () => {
    if (!currentPaymentInfo) return;
    
    setIsProcessing(true);
    
    // Capturer le solde actuel avant rechargement
    const oldPointsValue = user?.points || 0;
    setOldPoints(oldPointsValue);
    
    try {
      console.log("Paiement confirmé, ajout de points:", currentPaymentInfo.points);
      
      // Ajouter les points à l'utilisateur
      await addUserPoints(currentPaymentInfo.points);
      
      // Ajouter la transaction à l'historique
      const newTransaction: Transaction = {
        id: `tx-${Date.now()}`,
        type: 'recharge',
        amount: currentPaymentInfo.amount,
        points: currentPaymentInfo.points,
        date: new Date().toISOString().split('T')[0],
        method: currentPaymentInfo.method.name.split(' ')[0], // Prend juste le premier mot (MTN, Orange, etc.)
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      
      // Afficher l'animation après que les points ont été ajoutés
      const newPoints = user?.points || 0;
      
      console.log('Rechargement effectué:', {
        oldPoints: oldPointsValue,
        pointsAdded: currentPaymentInfo.points,
        newPoints: newPoints
      });
      
      // Démarrer l'animation après la mise à jour des points
      startSuccessAnimation(currentPaymentInfo.points);
      
      setAmount('');
      setSelectedMethod(null);
      
      // Passer à l'onglet historique après un court délai
      setTimeout(() => {
        setActiveTab('history');
      }, 2500);
    } catch (error) {
      console.error("Erreur lors de l'ajout des points:", error);
      Alert.alert('Erreur', 'Une erreur est survenue lors du rechargement');
      setShowSuccessAnimation(false);
    } finally {
      setIsProcessing(false);
    }
  }, [currentPaymentInfo, user?.points, addUserPoints, startSuccessAnimation]);

  const handleClose = useCallback(() => {
    try {
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
        try {
          setAmount('');
          setSelectedMethod(null);
          onClose();
        } catch (error) {
          console.error('Erreur lors de la fermeture du modal:', error);
        }
      });
    } catch (error) {
      console.error('Erreur lors de l\'animation de fermeture:', error);
      // Assurer que le modal se ferme même en cas d'erreur d'animation
      setAmount('');
      setSelectedMethod(null);
      onClose();
    }
  }, [fadeAnim, scaleAnim, onClose]);

  // Interpolation sécurisée pour la rotation
  const rotateInterpolate = useMemo(() => {
    try {
      if (rotateAnim instanceof Animated.Value) {
        return rotateAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        });
      }
      return '0deg'; // Valeur par défaut en cas d'erreur
    } catch (error) {
      console.error('Erreur lors de l\'interpolation de rotation:', error);
      return '0deg'; // Valeur par défaut en cas d'erreur
    }
  }, [rotateAnim]);

  return (
    <>
      {/* Modal de l'agrégateur de paiement */}
      {currentPaymentInfo && (
        <PaymentAggregatorModal
          visible={showPaymentAggregator}
          onClose={() => setShowPaymentAggregator(false)}
          onSuccess={handlePaymentSuccess}
          amount={currentPaymentInfo.amount}
          points={currentPaymentInfo.points}
          paymentMethod={currentPaymentInfo.method}
        />
      )}
      
      <Modal
        visible={visible}
        transparent={true}
        animationType="none"
        onRequestClose={handleClose}
      >
        <TouchableOpacity 
          style={responsiveStyles.overlay} 
          activeOpacity={1} 
          onPress={() => {}} // Empêche la fermeture sur clic overlay
        >
          <Animated.View 
            style={[
              styles.container,
              {
                width: '95%',
                maxWidth: responsiveStyles.container.maxWidth,
                // Assurer que le modal est suffisamment grand sur tous les appareils
                maxHeight: Dimensions.get('window').height * 0.9,
                borderRadius: responsiveStyles.container.borderRadius,
                shadowColor: responsiveStyles.container.shadowColor,
                shadowOffset: responsiveStyles.container.shadowOffset,
                shadowOpacity: responsiveStyles.container.shadowOpacity,
                shadowRadius: responsiveStyles.container.shadowRadius,
                elevation: responsiveStyles.container.elevation,
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              }
            ]}
            onStartShouldSetResponder={() => true}
            onResponderGrant={(e) => {
              e.stopPropagation();
              return true;
            }}
          >
            {/* Animation de succès avec confettis */}
            {showSuccessAnimation && (
              <View style={styles.animationOverlay}>
                <Animated.Text
                  style={{
                    position: 'absolute',
                    top: 50,
                    left: 0,
                    right: 0,
                    textAlign: 'center',
                    color: '#00B14F',
                    fontSize: 24,
                    fontWeight: 'bold',
                    zIndex: 9999,
                    transform: [{ scale: pulseAnim }],
                  }}
                >
                  🎉 Rechargement réussi !
                </Animated.Text>
                <Animated.Text
                  style={{
                    position: 'absolute',
                    top: 90,
                    left: 0,
                    right: 0,
                    textAlign: 'center',
                    color: '#333',
                    fontSize: 18,
                    fontWeight: '600',
                    zIndex: 9999,
                    transform: [{ scale: pulseAnim }],
                  }}
                >
                  Ancien solde : {oldPoints?.toLocaleString()} pts
                </Animated.Text>
                
                <Animated.Text
                  style={{
                    position: 'absolute',
                    top: 120,
                    left: 0,
                    right: 0,
                    textAlign: 'center',
                    color: '#00B14F',
                    fontSize: 18,
                    fontWeight: 'bold',
                    zIndex: 9999,
                    transform: [{ scale: pulseAnim }],
                  }}
                >
                  + {addedPoints.toLocaleString()} pts ajoutés
                </Animated.Text>
                
                <Animated.Text
                  style={{
                    position: 'absolute',
                    top: 150,
                    left: 0,
                    right: 0,
                    textAlign: 'center',
                    color: '#007BFF',
                    fontSize: 18,
                    fontWeight: 'bold',
                    zIndex: 9999,
                    transform: [{ scale: pulseAnim }],
                  }}
                >
                  Nouveau solde : {user?.points?.toLocaleString()} pts
                </Animated.Text>
                
                {/* Confettis */}
                {Array.isArray(confetti) && confetti.map((item, index) => {
                  try {
                    // Vérifier que l'élément et son index sont valides
                    if (!item || index < 0 || index >= confettiAnims.length) return null;
                    
                    const animValue = confettiAnims[index];
                    
                    // Vérifier que l'animation est valide
                    if (!animValue || !(animValue instanceof Animated.Value)) return null;
                    
                    // Créer les interpolations de manière sécurisée
                    let translateY, translateX, rotate;
                    
                    try {
                      translateY = animValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -height],
                      });
                      
                      translateX = animValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, (Math.random() - 0.5) * 200],
                      });
                      
                      rotate = animValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '720deg'],
                      });
                    } catch (error) {
                      console.error('Erreur lors de l\'interpolation d\'animation:', error);
                      return null;
                    }
                    
                    // S'assurer que toutes les propriétés nécessaires existent
                    if (!translateY || !translateX || !rotate) return null;
                    
                    return (
                      <Animated.View
                        key={item.id}
                        style={[
                          styles.confetti,
                          {
                            left: item.x,
                            top: item.y,
                            backgroundColor: item.color || '#00B14F', // Couleur par défaut si non définie
                            transform: [
                              { translateY },
                              { translateX },
                              { rotate },
                            ],
                          },
                        ]}
                      />
                    );
                  } catch (error) {
                    console.error('Erreur lors du rendu d\'un confetti:', error);
                    return null;
                  }
                })}
                
                {/* Message de succès */}
                <Animated.View
                  style={[
                    styles.successMessage,
                    {
                      opacity: successAnim,
                      transform: [{ scale: successAnim }],
                    },
                  ]}
                >
                  <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
                    <Plus size={40} color="#00B14F" />
                  </Animated.View>
                  <Animated.Text style={[styles.successText, { transform: [{ scale: pulseAnim }] }]}>
                    +{addedPoints.toLocaleString()} points ajoutés !
                  </Animated.Text>
                </Animated.View>
              </View>
            )}

            {/* En-tête */}
            <View style={responsiveStyles.header}>
              <Text style={responsiveStyles.title}>Mon Portefeuille</Text>
              <TouchableOpacity onPress={handleClose} style={responsiveStyles.closeButton}>
                <X size={24} color="#8E8E8E" />
              </TouchableOpacity>
            </View>

            {/* Informations de solde */}
            <View style={styles.balanceSection}>
              <View style={styles.balanceColumn}>
                <Text style={styles.balanceLabel}>Mon solde</Text>
                <Text style={styles.balanceValueGold}>{user?.points?.toLocaleString() || '0'} pts</Text>
                <Text style={styles.balanceValueSilver}>{pointsToFcfa(user?.points || 0).toLocaleString()} FCFA</Text>
              </View>
              
              {/* Bouton de test pour vérifier l'ajout de points */}
              <TouchableOpacity 
                style={styles.testButton}
                onPress={() => {
                  addUserPoints(10);
                  Alert.alert("Test", "10 points ajoutés manuellement");
                }}
              >
                <Text style={styles.testButtonText}>+ Test (10pts)</Text>
              </TouchableOpacity>
            </View>

            {/* Onglets */}
            <View style={styles.tabs}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'recharge' && styles.activeTab]}
                onPress={() => setActiveTab('recharge')}
              >
                <Text style={[styles.tabText, activeTab === 'recharge' && styles.activeTabText]}>
                  Recharger
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'history' && styles.activeTab]}
                onPress={() => setActiveTab('history')}
              >
                <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
                  Historique
                </Text>
              </TouchableOpacity>
            </View>

            {/* Contenu */}
            <View style={styles.content}>
              {activeTab === 'recharge' ? (
                <FlatList
                  data={[1]} // Un seul élément pour le contenu de recharge
                  keyExtractor={() => 'recharge-content'}
                  showsVerticalScrollIndicator={true}
                  contentContainerStyle={styles.scrollContent}
                  renderItem={() => (
                    <View style={styles.rechargeContent}>
                      <Text style={styles.sectionTitle}>Montant à recharger</Text>
                      
                      {/* Montants rapides */}
                      <View style={styles.quickAmountContainer}>
                        {quickAmounts.map((quickAmount) => (
                          <TouchableOpacity
                            key={quickAmount}
                            style={[
                              styles.quickAmountButton,
                              amount === quickAmount.toString() && styles.selectedQuickAmount
                            ]}
                            onPress={() => handleQuickAmountSelect(quickAmount)}
                          >
                            <Text 
                              style={[
                                styles.quickAmountText,
                                amount === quickAmount.toString() && styles.selectedQuickAmountText
                              ]}
                            >
                              {quickAmount.toLocaleString()} FCFA
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      
                      <TextInput
                        style={styles.amountInput}
                        placeholder="Ou entrez un autre montant en FCFA"
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numeric"
                        placeholderTextColor="#8E8E8E"
                      />
                      
                      {amount && (
                        <Text style={styles.pointsInfo}>
                          = {useMemo(() => formatPointsValue(amount), [amount])} points
                        </Text>
                      )}

                      <Text style={styles.sectionTitle}>Moyen de paiement</Text>
                      {paymentMethods.map((method) => (
                        <TouchableOpacity
                          key={method.id}
                          style={[
                            styles.paymentMethod,
                            selectedMethod === method.id && styles.selectedPaymentMethod,
                          ]}
                          onPress={() => setSelectedMethod(method.id)}
                        >
                          <View style={[styles.methodIcon, { backgroundColor: method.color }]}>
                            <method.icon size={20} color="#fff" />
                          </View>
                          <Text style={styles.methodName}>{method.name}</Text>
                          <View style={[
                            styles.radioButton,
                            selectedMethod === method.id && styles.radioButtonSelected
                          ]}>
                            {selectedMethod === method.id && <View style={styles.radioButtonInner} />}
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                />
              ) : (
                transactions.length > 0 ? (
                  <FlatList
                    data={transactions}
                    keyExtractor={(item) => item.id}
                    ListHeaderComponent={() => (
                      <Text style={styles.sectionTitle}>Historique des transactions</Text>
                    )}
                    renderItem={({ item }) => <TransactionItem transaction={item} />}
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={5}
                    getItemLayout={(data, index) => ({
                      length: 80, // Hauteur approximative de chaque transaction
                      offset: 80 * index,
                      index,
                    })}
                  />
                ) : (
                  <View style={styles.historyContent}>
                    <Text style={styles.sectionTitle}>Historique des transactions</Text>
                    <View style={styles.emptyStateContainer}>
                      <History size={50} color="#CCCCCC" />
                      <Text style={styles.emptyStateText}>Aucune transaction</Text>
                    </View>
                  </View>
                )
              )}
            </View>

            {/* Pied de page avec bouton Recharger */}
            {activeTab === 'recharge' && (
              <View style={styles.footer}>
                <TouchableOpacity 
                  style={[
                    styles.rechargeButton,
                    (!amount || !selectedMethod || isProcessing) && styles.rechargeButtonDisabled
                  ]} 
                  onPress={handleRecharge}
                  disabled={!amount || !selectedMethod || isProcessing}
                >
                  {isProcessing ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Plus size={20} color="#fff" />
                  )}
                  <Text style={styles.rechargeButtonText}>
                    {isProcessing ? 'Traitement...' : 'Recharger'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

// Memoïzer la génération des points pour éviter des calculs répétés
const formatPointsValue = (amount: string) => {
  if (!amount) return "";
  const numAmount = parseInt(amount);
  if (isNaN(numAmount)) return "0";
  return fcfaToPoints(numAmount).toLocaleString();
};

const TransactionItem = memo(({ transaction }: { transaction: Transaction }) => (
  <View style={styles.transactionItem}>
    <View style={[
      styles.transactionIcon,
      { backgroundColor: transaction.type === 'recharge' ? '#E8F5E9' : '#FEF2F2' }
    ]}>
      {transaction.type === 'recharge' ? (
        <Plus size={20} color="#00B14F" />
      ) : (
        <CreditCard size={20} color="#FF6B6B" />
      )}
    </View>
    <View style={styles.transactionInfo}>
      <Text style={styles.transactionTitle}>
        {transaction.type === 'recharge' 
          ? `Rechargement ${transaction.method}`
          : `Paiement chez ${transaction.provider}`
        }
      </Text>
      <Text style={styles.transactionDate}>{transaction.date}</Text>
    </View>
    <View style={styles.transactionAmount}>
      <Text
        style={[
          styles.transactionValue,
          { color: transaction.amount > 0 ? '#00B14F' : '#FF6B6B' },
        ]}
      >
        {transaction.amount > 0 ? '+' : ''}{Math.abs(transaction.amount).toLocaleString()} FCFA
      </Text>
      <Text
        style={[
          styles.transactionPoints,
          { color: transaction.points > 0 ? '#00B14F' : '#FF6B6B' },
        ]}
      >
        {transaction.points > 0 ? '+' : ''}{Math.abs(transaction.points).toLocaleString()} pts
      </Text>
    </View>
  </View>
));

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '85%',
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  closeButton: {
    padding: 5,
  },
  balanceSection: {
    paddingHorizontal: 20,
    paddingVertical: 25,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    alignItems: 'center',
  },
  balanceColumn: {
    alignItems: 'center',
    flex: 1,
  },
  balanceRow: {
    flex: 1,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#8E8E8E',
    marginBottom: 8,
    textAlign: 'center',
  },
  balanceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  balanceValueGold: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#DAA520', // Couleur or plus riche
    textAlign: 'center',
    marginBottom: 4,
    textShadowColor: 'rgba(218, 165, 32, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  balanceValueSilver: {
    fontSize: 18,
    fontWeight: '600',
    color: '#C0C0C0', // Couleur argent authentique
    textAlign: 'center',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    margin: 20,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#fff',
  },
  tabText: {
    fontSize: 14,
    color: '#8E8E8E',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#000',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  rechargeContent: {
    paddingBottom: 20,
    width: '100%',
  },
  historyContent: {
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 15,
    marginTop: 10,
  },
  amountInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 16,
    color: '#000',
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  quickAmountContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
    justifyContent: 'space-between',
  },
  quickAmountButton: {
    width: '48%',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  selectedQuickAmount: {
    borderColor: '#00B14F',
    backgroundColor: '#E8F5E9',
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  selectedQuickAmountText: {
    color: '#00B14F',
  },
  pointsInfo: {
    fontSize: 14,
    color: '#00B14F',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  selectedPaymentMethod: {
    borderColor: '#00B14F',
    backgroundColor: '#F0F9F4',
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  methodName: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#00B14F',
    backgroundColor: '#00B14F',
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 10,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#8E8E8E',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionValue: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  transactionPoints: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyStateText: {
    marginTop: 15,
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    backgroundColor: '#fff',
  },
  rechargeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00B14F',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#00B14F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  rechargeButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  rechargeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  animationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    pointerEvents: 'none',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  confetti: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  successMessage: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -50 }],
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#00B14F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 2,
    borderColor: '#00B14F',
  },
  successText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00B14F',
    marginTop: 15,
    textAlign: 'center',
  },
  testButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    backgroundColor: '#007BFF',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
