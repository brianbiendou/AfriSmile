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
import { X, Smartphone, Plus, CreditCard, Wallet } from 'lucide-react-native';
import { useState, useEffect, useRef } from 'react';

interface SimpleWalletModalProps {
  visible: boolean;
  onClose: () => void;
  user: {
    name: string;
    points: number;
    balance: number;
  };
}

export default function SimpleWalletModal({ visible, onClose, user }: SimpleWalletModalProps) {
  const [activeTab, setActiveTab] = useState<'recharge' | 'history'>('recharge');
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

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
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
    }
  }, [visible]);

  const paymentMethods = [
    { id: 'mtn', name: 'MTN Mobile Money', color: '#FFCC00', icon: Smartphone },
    { id: 'orange', name: 'Orange Money', color: '#FF6600', icon: Smartphone },
    { id: 'moov', name: 'Moov Money', color: '#007FFF', icon: Smartphone },
    { id: 'wave', name: 'Wave', color: '#00D4AA', icon: Smartphone },
    { id: 'visa', name: 'Visa Card', color: '#1A1F71', icon: CreditCard },
    { id: 'mastercard', name: 'Mastercard', color: '#EB001B', icon: CreditCard },
    { id: 'paypal', name: 'PayPal', color: '#0070BA', icon: Wallet },
  ];

  const transactions = [
    { id: '1', type: 'recharge', amount: 10000, points: 20000, date: '2024-01-15', method: 'MTN' },
    { id: '2', type: 'payment', amount: -2500, points: -5000, date: '2024-01-14', provider: 'Chez Tante Marie' },
    { id: '3', type: 'recharge', amount: 5000, points: 10000, date: '2024-01-13', method: 'Orange' },
    { id: '4', type: 'payment', amount: -1800, points: -3600, date: '2024-01-12', provider: 'Beauty Palace' },
    { id: '5', type: 'recharge', amount: 15000, points: 30000, date: '2024-01-11', method: 'Wave' },
  ];

  const handleRecharge = () => {
    if (!amount || !selectedMethod) {
      Alert.alert('Erreur', 'Veuillez sélectionner un montant et un moyen de paiement');
      return;
    }

    const numericAmount = parseInt(amount);
    if (numericAmount < 1000) {
      Alert.alert('Erreur', 'Le montant minimum est de 1000 FCFA');
      return;
    }

    const points = numericAmount * 2; // 1 FCFA = 2 points
    const selectedPaymentMethod = paymentMethods.find(m => m.id === selectedMethod);
    
    Alert.alert(
      'Rechargement',
      `Confirmer le rechargement de ${numericAmount.toLocaleString()} FCFA (${points.toLocaleString()} points) via ${selectedPaymentMethod?.name}?`,
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
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setAmount('');
      setSelectedMethod(null);
      onClose();
    });
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
        onPress={() => {}} // Empêche la fermeture sur clic overlay
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
          onResponderGrant={(e) => {
            e.stopPropagation();
            return true;
          }}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Mon Portefeuille</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color="#8E8E8E" />
            </TouchableOpacity>
          </View>

          {/* Balance Info */}
          <View style={styles.balanceSection}>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Points</Text>
              <Text style={styles.balanceValue}>{user.points.toLocaleString()}</Text>
            </View>
            <View style={styles.balanceRow}>
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

          {/* Content */}
          <ScrollView 
            style={styles.content} 
            showsVerticalScrollIndicator={false}
            onStartShouldSetResponder={() => true}
          >
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
                  onStartShouldSetResponder={() => true}
                  onResponderGrant={() => true}
                  onTouchStart={(e) => e.stopPropagation()}
                />
                {amount && (
                  <Text style={styles.pointsInfo}>
                    = {(parseInt(amount) * 2).toLocaleString()} points
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
            ) : (
              <View style={styles.historyContent}>
                <Text style={styles.sectionTitle}>Historique des transactions</Text>
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

          {/* Footer avec bouton Recharger */}
          {activeTab === 'recharge' && (
            <View style={styles.footer}>
              <TouchableOpacity 
                style={[
                  styles.rechargeButton,
                  (!amount || !selectedMethod) && styles.rechargeButtonDisabled
                ]} 
                onPress={handleRecharge}
                disabled={!amount || !selectedMethod}
              >
                <Plus size={20} color="#fff" />
                <Text style={styles.rechargeButtonText}>Recharger</Text>
              </TouchableOpacity>
            </View>
          )}
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
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 25,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
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
  rechargeContent: {
    paddingBottom: 20,
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
});