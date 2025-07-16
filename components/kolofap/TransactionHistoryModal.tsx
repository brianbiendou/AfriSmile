import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { X, Send, Download, ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';
import { useState, useEffect, useRef } from 'react';
import { KolofapUser, PointsTransaction } from '@/types/kolofap';
import { getTransactionHistory } from '@/lib/kolofap';

interface TransactionHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  kolofapUser: KolofapUser;
}

export default function TransactionHistoryModal({ 
  visible, 
  onClose, 
  kolofapUser 
}: TransactionHistoryModalProps) {
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
      loadTransactions();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
    }
  }, [visible]);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const history = await getTransactionHistory(kolofapUser.id);
      setTransactions(history);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTransactionIcon = (transaction: PointsTransaction, isOutgoing: boolean) => {
    if (transaction.type === 'transfer') {
      return isOutgoing ? 
        <ArrowUpRight size={20} color="#EF4444" /> : 
        <ArrowDownLeft size={20} color="#10B981" />;
    } else {
      return transaction.type === 'request' ? 
        <Download size={20} color="#06B6D4" /> : 
        <Send size={20} color="#8B5CF6" />;
    }
  };

  const getTransactionTitle = (transaction: PointsTransaction, isOutgoing: boolean) => {
    if (transaction.type === 'transfer') {
      return isOutgoing ? 'Points envoyés' : 'Points reçus';
    } else if (transaction.type === 'request') {
      return isOutgoing ? 'Demande envoyée' : 'Demande reçue';
    }
    return 'Transaction';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'cancelled': return '#EF4444';
      case 'rejected': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulé';
      case 'rejected': return 'Refusé';
      default: return status;
    }
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
        onPress={handleClose}
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
            <Text style={styles.title}>Historique des transactions</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Chargement...</Text>
              </View>
            ) : transactions.length > 0 ? (
              transactions.map((transaction) => {
                const isOutgoing = transaction.sender_id === kolofapUser.id;
                return (
                  <View key={transaction.id} style={styles.transactionItem}>
                    <View style={styles.transactionIcon}>
                      {getTransactionIcon(transaction, isOutgoing)}
                    </View>
                    
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionTitle}>
                        {getTransactionTitle(transaction, isOutgoing)}
                      </Text>
                      <Text style={styles.transactionDate}>
                        {new Date(transaction.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                      {transaction.message && (
                        <Text style={styles.transactionMessage}>
                          "{transaction.message}"
                        </Text>
                      )}
                      <View style={styles.statusContainer}>
                        <View style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusColor(transaction.status) + '20' }
                        ]}>
                          <Text style={[
                            styles.statusText,
                            { color: getStatusColor(transaction.status) }
                          ]}>
                            {getStatusText(transaction.status)}
                          </Text>
                        </View>
                      </View>
                    </View>
                    
                    <View style={styles.transactionAmount}>
                      <Text style={[
                        styles.amountText,
                        { 
                          color: isOutgoing ? '#EF4444' : '#10B981'
                        }
                      ]}>
                        {isOutgoing ? '-' : '+'}{transaction.amount.toLocaleString()} pts
                      </Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>Aucune transaction</Text>
                <Text style={styles.emptyStateText}>
                  Vos transactions apparaîtront ici
                </Text>
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
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  transactionMessage: {
    fontSize: 14,
    color: '#4B5563',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});