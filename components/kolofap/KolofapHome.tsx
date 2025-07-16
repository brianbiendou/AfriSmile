import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Send, Download, Users, History, Plus, Zap } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getKolofapUser, getTransactionHistory } from '@/lib/kolofap';
import { KolofapUser, PointsTransaction } from '@/types/kolofap';
import SendPointsModal from './SendPointsModal';
import RequestPointsModal from './RequestPointsModal';
import TransactionHistoryModal from './TransactionHistoryModal';
import ContactsModal from './ContactsModal';

export default function KolofapHome() {
  const { user } = useAuth();
  const [kolofapUser, setKolofapUser] = useState<KolofapUser | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<PointsTransaction[]>([]);
  const [sendModalVisible, setSendModalVisible] = useState(false);
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [contactsModalVisible, setContactsModalVisible] = useState(false);

  useEffect(() => {
    if (user) {
      loadKolofapData();
    }
  }, [user]);

  const loadKolofapData = async () => {
    if (!user) return;
    
    try {
      const kUser = await getKolofapUser(user.id);
      setKolofapUser(kUser);
      
      if (kUser) {
        const transactions = await getTransactionHistory(kUser.id);
        setRecentTransactions(transactions.slice(0, 3));
      }
    } catch (error) {
      console.error('Error loading Kolofap data:', error);
    }
  };

  const quickActions = [
    {
      icon: Send,
      title: 'Envoyer',
      subtitle: 'Transférer des points',
      color: '#8B5CF6',
      onPress: () => setSendModalVisible(true),
    },
    {
      icon: Download,
      title: 'Demander',
      subtitle: 'Demander des points',
      color: '#06B6D4',
      onPress: () => setRequestModalVisible(true),
    },
    {
      icon: Users,
      title: 'Contacts',
      subtitle: 'Gérer mes contacts',
      color: '#10B981',
      onPress: () => setContactsModalVisible(true),
    },
    {
      icon: History,
      title: 'Historique',
      subtitle: 'Voir toutes les transactions',
      color: '#F59E0B',
      onPress: () => setHistoryModalVisible(true),
    },
  ];

  if (!kolofapUser) {
    return (
      <View style={styles.setupContainer}>
        <View style={styles.setupCard}>
          <Zap size={64} color="#8B5CF6" />
          <Text style={styles.setupTitle}>Bienvenue sur Kolofap</Text>
          <Text style={styles.setupSubtitle}>
            Configurez votre profil pour commencer à transférer des points
          </Text>
          <TouchableOpacity style={styles.setupButton}>
            <Text style={styles.setupButtonText}>Configurer mon profil</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <View style={styles.userInfo}>
              <Image 
                source={{ uri: kolofapUser.avatar_url || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg' }} 
                style={styles.avatar} 
              />
              <View>
                <Text style={styles.displayName}>{kolofapUser.display_name}</Text>
                <Text style={styles.gamertag}>@{kolofapUser.gamertag}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.balanceSection}>
            <Text style={styles.balanceLabel}>Solde disponible</Text>
            <Text style={styles.balanceAmount}>
              {user?.points?.toLocaleString() || '0'} <Text style={styles.pointsUnit}>pts</Text>
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionCard}
              onPress={action.onPress}
            >
              <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                <action.icon size={24} color="#fff" />
              </View>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transactions récentes</Text>
            <TouchableOpacity onPress={() => setHistoryModalVisible(true)}>
              <Text style={styles.seeAllText}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionIcon}>
                  {transaction.type === 'transfer' ? (
                    <Send size={20} color="#8B5CF6" />
                  ) : (
                    <Download size={20} color="#06B6D4" />
                  )}
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionTitle}>
                    {transaction.type === 'transfer' ? 'Envoi de points' : 'Demande de points'}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={[
                  styles.transactionAmount,
                  { color: transaction.type === 'transfer' ? '#EF4444' : '#10B981' }
                ]}>
                  {transaction.type === 'transfer' ? '-' : '+'}{transaction.amount.toLocaleString()} pts
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Aucune transaction récente</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <SendPointsModal
        visible={sendModalVisible}
        onClose={() => setSendModalVisible(false)}
        kolofapUser={kolofapUser}
        userPoints={user?.points || 0}
        onSuccess={loadKolofapData}
      />

      <RequestPointsModal
        visible={requestModalVisible}
        onClose={() => setRequestModalVisible(false)}
        kolofapUser={kolofapUser}
        onSuccess={loadKolofapData}
      />

      <TransactionHistoryModal
        visible={historyModalVisible}
        onClose={() => setHistoryModalVisible(false)}
        kolofapUser={kolofapUser}
      />

      <ContactsModal
        visible={contactsModalVisible}
        onClose={() => setContactsModalVisible(false)}
        kolofapUser={kolofapUser}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollView: {
    flex: 1,
  },
  setupContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  setupCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  setupTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 20,
    marginBottom: 10,
  },
  setupSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  setupButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  setupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  balanceCard: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  balanceHeader: {
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  displayName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  gamertag: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  balanceSection: {
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  pointsUnit: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 15,
  },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  section: {
    margin: 20,
    marginTop: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  seeAllText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  transactionItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
  },
});