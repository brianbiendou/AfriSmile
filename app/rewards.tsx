import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { ArrowLeft, Gift, Star, Trophy, Crown } from 'lucide-react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function RewardsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'available' | 'claimed'>('available');

  const availableRewards = [
    {
      id: '1',
      title: 'Café gratuit',
      description: 'Un café offert dans nos partenaires',
      points: 50,
      icon: '☕',
      category: 'Boisson',
      validUntil: '31/12/2024',
    },
    {
      id: '2',
      title: 'Réduction 20%',
      description: 'Réduction sur votre prochaine commande',
      points: 100,
      icon: '🎫',
      category: 'Réduction',
      validUntil: '31/12/2024',
    },
    {
      id: '3',
      title: 'Dessert gratuit',
      description: 'Un dessert de votre choix offert',
      points: 75,
      icon: '🍰',
      category: 'Dessert',
      validUntil: '31/12/2024',
    },
    {
      id: '4',
      title: 'Livraison gratuite',
      description: 'Frais de livraison offerts',
      points: 30,
      icon: '🚚',
      category: 'Service',
      validUntil: '31/12/2024',
    },
    {
      id: '5',
      title: 'Menu complet',
      description: 'Un menu complet dans nos restaurants',
      points: 200,
      icon: '🍽️',
      category: 'Repas',
      validUntil: '31/12/2024',
    },
    {
      id: '6',
      title: 'Statut Gold 1 mois',
      description: 'Profitez des avantages Gold pendant 1 mois',
      points: 500,
      icon: '👑',
      category: 'Premium',
      validUntil: '31/12/2024',
    },
  ];

  const claimedRewards = [
    {
      id: '1',
      title: 'Café gratuit',
      description: 'Réclamé le 15/01/2024',
      icon: '☕',
      status: 'Utilisé',
      date: '15/01/2024',
    },
    {
      id: '2',
      title: 'Réduction 10%',
      description: 'Réclamé le 10/01/2024',
      icon: '🎫',
      status: 'Disponible',
      date: '10/01/2024',
    },
  ];

  const handleGoBack = () => {
    router.back();
  };

  const handleClaimReward = (reward: any) => {
    // Vérifier si l'utilisateur a assez de points
    if (!user || user.points < reward.points) {
      alert(`Vous avez besoin de ${reward.points} points pour réclamer cette récompense. Vous avez actuellement ${user?.points || 0} points.`);
      return;
    }

    // Simuler la réclamation de la récompense
    alert(`Récompense "${reward.title}" réclamée avec succès !`);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Boisson': return '#8B4513';
      case 'Réduction': return '#FF6B6B';
      case 'Dessert': return '#FFB6C1';
      case 'Service': return '#4CAF50';
      case 'Repas': return '#FF9800';
      case 'Premium': return '#FFD700';
      default: return '#6C757D';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Mes Récompenses</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Points Info */}
      <View style={styles.pointsInfo}>
        <Gift size={24} color="#00B14F" />
        <Text style={styles.pointsText}>
          Vous avez <Text style={styles.pointsValue}>{user?.points?.toLocaleString() || '0'}</Text> points
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'available' && styles.activeTab]}
          onPress={() => setActiveTab('available')}
        >
          <Text style={[styles.tabText, activeTab === 'available' && styles.activeTabText]}>
            Disponibles
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'claimed' && styles.activeTab]}
          onPress={() => setActiveTab('claimed')}
        >
          <Text style={[styles.tabText, activeTab === 'claimed' && styles.activeTabText]}>
            Réclamées
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'available' ? (
          <View style={styles.rewardsGrid}>
            {availableRewards.map((reward) => (
              <View key={reward.id} style={styles.rewardCard}>
                <View style={styles.rewardHeader}>
                  <Text style={styles.rewardIcon}>{reward.icon}</Text>
                  <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(reward.category) }]}>
                    <Text style={styles.categoryText}>{reward.category}</Text>
                  </View>
                </View>
                
                <Text style={styles.rewardTitle}>{reward.title}</Text>
                <Text style={styles.rewardDescription}>{reward.description}</Text>
                
                <View style={styles.rewardFooter}>
                  <View style={styles.pointsRequired}>
                    <Star size={16} color="#FFD700" />
                    <Text style={styles.pointsRequiredText}>{reward.points} pts</Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.claimButton,
                      (user?.points || 0) < reward.points && styles.disabledButton
                    ]}
                    onPress={() => handleClaimReward(reward)}
                    disabled={(user?.points || 0) < reward.points}
                  >
                    <Text style={[
                      styles.claimButtonText,
                      (user?.points || 0) < reward.points && styles.disabledButtonText
                    ]}>
                      {(user?.points || 0) >= reward.points ? 'Réclamer' : 'Insuffisant'}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.validUntil}>Valide jusqu'au {reward.validUntil}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.claimedList}>
            {claimedRewards.length > 0 ? (
              claimedRewards.map((reward) => (
                <View key={reward.id} style={styles.claimedItem}>
                  <Text style={styles.claimedIcon}>{reward.icon}</Text>
                  <View style={styles.claimedInfo}>
                    <Text style={styles.claimedTitle}>{reward.title}</Text>
                    <Text style={styles.claimedDescription}>{reward.description}</Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: reward.status === 'Utilisé' ? '#DC3545' : '#28A745' }
                  ]}>
                    <Text style={styles.statusText}>{reward.status}</Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Trophy size={48} color="#CCC" />
                <Text style={styles.emptyText}>Aucune récompense réclamée</Text>
                <Text style={styles.emptySubtext}>
                  Réclamez vos premières récompenses dans l'onglet "Disponibles"
                </Text>
              </View>
            )}
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
    width: 40,
  },
  pointsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F9F4',
    paddingVertical: 16,
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 12,
  },
  pointsText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  pointsValue: {
    fontWeight: 'bold',
    color: '#00B14F',
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
  rewardsGrid: {
    paddingBottom: 40,
  },
  rewardCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  rewardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rewardIcon: {
    fontSize: 32,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  rewardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  rewardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  rewardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pointsRequired: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsRequiredText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  claimButton: {
    backgroundColor: '#00B14F',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#CCC',
  },
  claimButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButtonText: {
    color: '#888',
  },
  validUntil: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  claimedList: {
    paddingBottom: 40,
  },
  claimedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  claimedIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  claimedInfo: {
    flex: 1,
  },
  claimedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  claimedDescription: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
