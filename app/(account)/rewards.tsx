import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { X, TrendingUp, Gift, Wallet } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { pointsToFcfa, formatPointsWithFcfa } from '@/utils/pointsConversion';

export default function RewardsScreen() {
  const { user: authUser } = useAuth();
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Données utilisateur
  const user = {
    name: authUser ? `${authUser.first_name} ${authUser.last_name}` : 'Utilisateur',
    points: authUser?.points || 0,
    totalSavings: Math.floor((authUser?.points || 0) * 0.8), // Estimation des économies
    ordersCount: 8, // À récupérer depuis la base de données
  };
  
  // Données de simulation pour les économies réalisées
  const mockSavings = [
    {
      id: '1',
      providerName: 'Chez Tante Marie',
      date: '2024-01-15',
      originalPrice: 50,
      finalPrice: 40,
      discount: 15,
      cashback: 1, // 100 FCFA ÷ 78.359 = 1.28 points (arrondi à 1)
    },
    {
      id: '2',
      providerName: 'Beauty Palace',
      date: '2024-01-14',
      originalPrice: 80,
      finalPrice: 60,
      discount: 20,
      cashback: 3, // 200 FCFA ÷ 78.359 = 2.55 points (arrondi à 3)
    },
    {
      id: '3',
      providerName: 'Tech Universe',
      date: '2024-01-10',
      originalPrice: 120,
      finalPrice: 100,
      discount: 10,
      cashback: 4, // 300 FCFA ÷ 78.359 = 3.83 points (arrondi à 4)
    },
    {
      id: '4',
      providerName: 'Fresh Market',
      date: '2024-01-05',
      originalPrice: 30,
      finalPrice: 25,
      discount: 15,
      cashback: 1, // 50 FCFA ÷ 78.359 = 0.64 points (arrondi à 1)
    },
    {
      id: '5',
      providerName: 'Café Élégant',
      date: '2024-01-02',
      originalPrice: 15,
      finalPrice: 12,
      discount: 10,
      cashback: 1, // 30 FCFA ÷ 78.359 = 0.38 points (arrondi à 1)
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
  
  // Calcul des statistiques
  const totalCashback = mockSavings.reduce((sum, item) => sum + item.cashback, 0);
  const totalDiscount = mockSavings.reduce((sum, item) => sum + (item.originalPrice - item.finalPrice), 0);
  
  // Fonction pour formater une date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };
  
  return (
    <>
      <Stack.Screen
        options={{
          title: "Mes Récompenses",
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
          {/* Entête avec statistiques */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: 'rgba(0, 177, 79, 0.1)' }]}>
                <Gift size={24} color="#00B14F" />
              </View>
              <Text style={styles.statTitle}>Points de fidélité</Text>
              <Text style={styles.statValue}>{user.points.toLocaleString()}</Text>
              <Text style={styles.statSubtitle}>≈ {pointsToFcfa(user.points).toLocaleString()} FCFA</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: 'rgba(255, 107, 107, 0.1)' }]}>
                <Wallet size={24} color="#FF6B6B" />
              </View>
              <Text style={styles.statTitle}>Économies totales</Text>
              <Text style={styles.statValue}>{totalDiscount.toLocaleString()} FCFA</Text>
              <Text style={styles.statSubtitle}>Sur {user.ordersCount} commandes</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: 'rgba(78, 205, 196, 0.1)' }]}>
                <TrendingUp size={24} color="#4ECDC4" />
              </View>
              <Text style={styles.statTitle}>Cashback</Text>
              <Text style={styles.statValue}>{totalCashback} points</Text>
              <Text style={styles.statSubtitle}>≈ {pointsToFcfa(totalCashback).toLocaleString()} FCFA</Text>
            </View>
          </View>
          
          {/* Section des économies réalisées */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mes économies récentes</Text>
            
            {mockSavings.map((saving) => (
              <View key={saving.id} style={styles.savingItem}>
                <View style={styles.savingHeader}>
                  <Text style={styles.providerName}>{saving.providerName}</Text>
                  <Text style={styles.savingDate}>{formatDate(saving.date)}</Text>
                </View>
                
                <View style={styles.savingDetails}>
                  <View style={styles.priceInfo}>
                    <Text style={styles.originalPrice}>{saving.originalPrice.toLocaleString()} FCFA</Text>
                    <Text style={styles.finalPrice}>{saving.finalPrice.toLocaleString()} FCFA</Text>
                  </View>
                  
                  <View style={styles.savingInfo}>
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>-{saving.discount}%</Text>
                    </View>
                    
                    <View style={styles.cashbackInfo}>
                      <TrendingUp size={14} color="#4ECDC4" />
                      <Text style={styles.cashbackText}>+{saving.cashback} pts</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
          
          {/* Section des avantages */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vos avantages</Text>
            
            <View style={styles.benefitCard}>
              <View style={styles.benefitIcon}>
                <Gift size={24} color="#FFFFFF" />
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Programme de fidélité</Text>
                <Text style={styles.benefitDescription}>
                  Gagnez des points à chaque achat et convertissez-les en réductions.
                  1 point ≈ 78.35 FCFA.
                </Text>
              </View>
            </View>
            
            <View style={styles.benefitCard}>
              <View style={[styles.benefitIcon, { backgroundColor: '#4ECDC4' }]}>
                <TrendingUp size={24} color="#FFFFFF" />
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Cashback sur achats</Text>
                <Text style={styles.benefitDescription}>
                  Recevez jusqu'à 5% de cashback en points sur tous vos achats
                  chez nos partenaires.
                </Text>
              </View>
            </View>
            
            <View style={styles.benefitCard}>
              <View style={[styles.benefitIcon, { backgroundColor: '#FF6B6B' }]}>
                <Wallet size={24} color="#FFFFFF" />
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Économies exclusives</Text>
                <Text style={styles.benefitDescription}>
                  Accédez à des promotions spéciales et des remises exclusives
                  chez tous nos partenaires.
                </Text>
              </View>
            </View>
          </View>
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  statSubtitle: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 2,
  },
  section: {
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
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 15,
  },
  savingItem: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  savingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  savingDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  savingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceInfo: {
    flexDirection: 'column',
  },
  originalPrice: {
    fontSize: 14,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  finalPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
  },
  savingInfo: {
    alignItems: 'flex-end',
  },
  discountBadge: {
    backgroundColor: '#FECACA',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 5,
  },
  discountText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
  },
  cashbackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cashbackText: {
    color: '#4ECDC4',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 3,
  },
  benefitCard: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  benefitIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#00B14F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 5,
  },
  benefitDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});
