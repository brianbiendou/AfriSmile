import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Animated,
} from 'react-native';
import { X, CreditCard, Smartphone, Plus } from 'lucide-react-native';
import { useState, useEffect, useRef } from 'react';
import { fcfaToPoints, formatPointsWithFcfa } from '@/utils/pointsConversion';

interface WalletModalProps {
  visible: boolean;
  onClose: () => void;
  user: {
    name: string;
    points: number;
    balance: number;
  };
}

export default function WalletModal({ visible, onClose, user }: WalletModalProps) {
  const [activeTab, setActiveTab] = useState<'recharge' | 'history'>('recharge');
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'mtn' | 'orange' | 'moov' | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
    }
  }, [visible]);

  const paymentMethods = [
    { id: 'mtn', name: 'MTN Mobile Money', color: '#FFCC00' },
    { id: 'orange', name: 'Orange Money', color: '#FF6600' },
    { id: 'moov', name: 'Moov Money', color: '#007FFF' },
  ];

  const transactions = [
    { id: '1', type: 'recharge', amount: 10000, points: 161, date: '2024-01-15', method: 'MTN' },
    { id: '2', type: 'payment', amount: -2750, points: -44, date: '2024-01-14', provider: 'Chez Tante Marie' },
    { id: '3', type: 'recharge', amount: 5000, points: 81, date: '2024-01-13', method: 'Orange' },
  ];

  const handleRecharge = () => {
    if (!amount || !selectedMethod) {
      Alert.alert('Erreur', 'Veuillez sélectionner un montant et un moyen de paiement');
      return;
    }

    const numericAmount = parseInt(amount);
    if (numericAmount < 1) {
      Alert.alert('Erreur', 'Le montant minimum est de 1 FCFA');
      return;
    }

    const points = fcfaToPoints(numericAmount); // Utilisation de la fonction de conversion mise à jour
    const selectedPaymentMethod = paymentMethods.find(m => m.id === selectedMethod);
    Alert.alert(
      'Rechargement',
      `Confirmer le rechargement de ${formatPointsWithFcfa(points)} via ${selectedPaymentMethod?.name}?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Confirmer', 
          onPress: () => {
            Alert.alert('Succès', 'Rechargement effectué avec succès !');
            setAmount('');
            setSelectedMethod(null);
            onClose();
          }
        },
      ]
    );
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setAmount('');
      setSelectedMethod(null);
      onClose();
    });
  };

  const handleOverlayPress = () => {
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
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={handleOverlayPress}
      >
        <Animated.View 
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }
          ]}
          onStartShouldSetResponder={() => true}
          onResponderGrant={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Mon Portefeuille</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color="#8E8E8E" />
            </TouchableOpacity>
          </View>

          {/* Balance Info */}
          <View style={styles.balanceInfo}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>Points</Text>
              <Text style={styles.balanceValue}>{user.points.toLocaleString()}</Text>
            </View>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>Solde</Text>
              <Text style={styles.balanceValue}>{user.balance.toLocaleString()} FCFA</Text>
            </View>
          </View>

          {/* Tabs */}
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

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {activeTab === 'recharge' ? (
              <View style={styles.rechargeContent}>
                <Text style={styles.sectionTitle}>Montant à recharger</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="Entrez le montant en FCFA"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  placeholderTextColor="#8E8E8E"
                />
                {amount && (
                  <Text style={styles.pointsInfo}>
                    = {fcfaToPoints(parseInt(amount)).toLocaleString()} points
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
                    onPress={() => setSelectedMethod(method.id as any)}
                  >
                    <View style={[styles.methodIcon, { backgroundColor: method.color }]}>
                      <Smartphone size={20} color="#fff" />
                    </View>
                    <Text style={styles.methodName}>{method.name}</Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity style={styles.rechargeButton} onPress={handleRecharge}>
                  <Plus size={20} color="#fff" />
                  <Text style={styles.rechargeButtonText}>Recharger</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.historyContent}>
                {transactions.map((transaction) => (
                  <View key={transaction.id} style={styles.transactionItem}>
                    <View style={styles.transactionIcon}>
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
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()} FCFA
                      </Text>
                      <Text
                        style={[
                          styles.transactionPoints,
                          { color: transaction.points > 0 ? '#00B14F' : '#FF6B6B' },
                        ]}
                      >
                        {transaction.points > 0 ? '+' : ''}{transaction.points.toLocaleString()} pts
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
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
    paddingBottom: 15,
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
  balanceInfo: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  balanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#8E8E8E',
    marginBottom: 5,
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
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
  rechargeContent: {
    gap: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 10,
  },
  amountInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 16,
    color: '#000',
  },
  pointsInfo: {
    fontSize: 14,
    color: '#00B14F',
    fontWeight: '600',
    textAlign: 'center',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    marginBottom: 10,
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
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  rechargeButton: {
    backgroundColor: '#00B14F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 20,
  },
  rechargeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyContent: {
    gap: 15,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
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
});