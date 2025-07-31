import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { ArrowLeft, CreditCard, Smartphone, Plus } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { fcfaToPoints, formatPointsWithFcfa } from '@/utils/pointsConversion';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

export default function WalletPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'recharge' | 'history'>('recharge');
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'mtn' | 'orange' | 'moov' | null>(null);

  const paymentMethods = [
    { id: 'mtn', name: 'MTN Mobile Money', color: '#FFCC00' },
    { id: 'orange', name: 'Orange Money', color: '#FF6600' },
    { id: 'moov', name: 'Moov Money', color: '#007FFF' },
  ];

  const transactions = [
    { id: '1', type: 'recharge', amount: 10000, points: 161, date: '2024-01-15', method: 'MTN' },
    { id: '2', type: 'payment', amount: -2750, points: -44, date: '2024-01-14', provider: 'Chez Tante Marie' },
    { id: '3', type: 'recharge', amount: 5000, points: 81, date: '2024-01-13', method: 'Orange' },
    { id: '4', type: 'payment', amount: -1500, points: -24, date: '2024-01-12', provider: 'Restaurant Le Palmier' },
    { id: '5', type: 'recharge', amount: 15000, points: 241, date: '2024-01-10', method: 'MTN' },
    { id: '6', type: 'payment', amount: -3200, points: -51, date: '2024-01-09', provider: 'Café Central' },
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

    const points = fcfaToPoints(numericAmount);
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
          }
        },
      ]
    );
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Mon Portefeuille</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Balance Info */}
      <View style={styles.balanceInfo}>
        <View style={styles.balanceItem}>
          <Text style={styles.balanceLabel}>Points</Text>
          <Text style={styles.balanceValue}>{user?.points?.toLocaleString() || '0'}</Text>
        </View>
        <View style={styles.balanceItem}>
          <Text style={styles.balanceLabel}>Solde</Text>
          <Text style={styles.balanceValue}>{user?.balance?.toLocaleString() || '0'} FCFA</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50, // Augmenté pour éviter le chevauchement avec la zone de notification
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  placeholder: {
    width: 40, // Pour équilibrer le header
  },
  balanceInfo: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 20,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 20,
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
    paddingBottom: 40,
  },
  historyContent: {
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  amountInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#000',
    marginBottom: 12,
  },
  pointsInfo: {
    fontSize: 16,
    color: '#00B14F',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    marginBottom: 12,
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
    marginRight: 16,
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
    marginTop: 32,
  },
  rechargeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
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
