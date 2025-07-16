import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { X, TrendingUp, Gift, Wallet } from 'lucide-react-native';
import { useEffect, useRef } from 'react';

interface RewardsModalProps {
  visible: boolean;
  onClose: () => void;
  user: {
    name: string;
    points: number;
    totalSavings: number;
    ordersCount: number;
  };
}

const mockSavings = [
  {
    id: '1',
    providerName: 'Chez Tante Marie',
    date: '2024-01-15',
    originalPrice: 4500,
    finalPrice: 3825,
    discount: 15,
    cashback: 10,
  },
  {
    id: '2',
    providerName: 'Beauty Palace',
    date: '2024-01-14',
    originalPrice: 8000,
    finalPrice: 6400,
    discount: 20,
    cashback: 10,
  },
  {
    id: '3',
    providerName: 'Pizza Express CI',
    date: '2024-01-13',
    originalPrice: 3200,
    finalPrice: 2880,
    discount: 10,
    cashback: 10,
  },
  {
    id: '4',
    providerName: 'Café des Arts',
    date: '2024-01-12',
    originalPrice: 2500,
    finalPrice: 2375,
    discount: 5,
    cashback: 10,
  },
];

export default function RewardsModal({ visible, onClose, user }: RewardsModalProps) {
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

  const totalCashback = mockSavings.length * 10; // 10 points par commande

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
            <Text style={styles.title}>Mes Récompenses</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color="#8E8E8E" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Summary Cards */}
            <View style={styles.summaryContainer}>
              <View style={[styles.summaryCard, { backgroundColor: '#00B14F' }]}>
                <TrendingUp size={24} color="#fff" />
                <Text style={styles.summaryLabel}>Total économisé</Text>
                <Text style={styles.summaryValue}>
                  {user.totalSavings.toLocaleString()} FCFA
                </Text>
              </View>

              <View style={[styles.summaryCard, { backgroundColor: '#4ECDC4' }]}>
                <Gift size={24} color="#fff" />
                <Text style={styles.summaryLabel}>Cashback total</Text>
                <Text style={styles.summaryValue}>
                  {totalCashback} points
                </Text>
              </View>
            </View>

            {/* Savings History */}
            <View style={styles.historySection}>
              <Text style={styles.sectionTitle}>Historique des économies</Text>
              
              {mockSavings.map((saving) => {
                const savedAmount = saving.originalPrice - saving.finalPrice;
                return (
                  <View key={saving.id} style={styles.savingCard}>
                    <View style={styles.savingHeader}>
                      <Text style={styles.providerName}>{saving.providerName}</Text>
                      <Text style={styles.savingDate}>{saving.date}</Text>
                    </View>
                    
                    <View style={styles.savingDetails}>
                      <View style={styles.priceComparison}>
                        <Text style={styles.originalPrice}>
                          Prix normal: {saving.originalPrice.toLocaleString()} FCFA
                        </Text>
                        <Text style={styles.finalPrice}>
                          Prix payé: {saving.finalPrice.toLocaleString()} FCFA
                        </Text>
                      </View>
                      
                      <View style={styles.benefitsContainer}>
                        <View style={styles.discountBadge}>
                          <Text style={styles.discountText}>-{saving.discount}%</Text>
                        </View>
                        <View style={styles.savingAmount}>
                          <Text style={styles.savingText}>
                            Économisé: {savedAmount.toLocaleString()} FCFA
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.cashbackContainer}>
                        <Wallet size={16} color="#00B14F" />
                        <Text style={styles.cashbackText}>
                          Cashback: +{saving.cashback} points
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Loyalty Program Info */}
            <View style={styles.loyaltySection}>
              <Text style={styles.sectionTitle}>Programme de fidélité</Text>
              <View style={styles.loyaltyCard}>
                <View style={styles.loyaltyHeader}>
                  <Gift size={24} color="#00B14F" />
                  <Text style={styles.loyaltyTitle}>Cashback automatique</Text>
                </View>
                <Text style={styles.loyaltyDescription}>
                  Recevez 10 points de cashback à chaque commande validée !
                </Text>
                <View style={styles.loyaltyStats}>
                  <Text style={styles.loyaltyStatsText}>
                    Commandes effectuées: {user.ordersCount}
                  </Text>
                  <Text style={styles.loyaltyStatsText}>
                    Points gagnés: {totalCashback} pts
                  </Text>
                </View>
              </View>
            </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 25,
  },
  summaryCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  summaryLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 5,
    textAlign: 'center',
  },
  summaryValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  historySection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  savingCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  savingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  providerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  savingDate: {
    fontSize: 12,
    color: '#8E8E8E',
  },
  savingDetails: {
    gap: 8,
  },
  priceComparison: {
    gap: 2,
  },
  originalPrice: {
    fontSize: 12,
    color: '#8E8E8E',
    textDecorationLine: 'line-through',
  },
  finalPrice: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  benefitsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  discountBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  savingAmount: {
    flex: 1,
    alignItems: 'flex-end',
  },
  savingText: {
    fontSize: 14,
    color: '#00B14F',
    fontWeight: 'bold',
  },
  cashbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cashbackText: {
    fontSize: 12,
    color: '#00B14F',
    fontWeight: '600',
  },
  loyaltySection: {
    marginBottom: 20,
  },
  loyaltyCard: {
    backgroundColor: '#F0F9F4',
    borderRadius: 12,
    padding: 20,
  },
  loyaltyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  loyaltyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 10,
  },
  loyaltyDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  loyaltyStats: {
    gap: 5,
  },
  loyaltyStatsText: {
    fontSize: 14,
    color: '#00B14F',
    fontWeight: '600',
  },
});