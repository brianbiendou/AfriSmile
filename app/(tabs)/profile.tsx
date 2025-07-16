import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { User, Wallet, QrCode, Gift, Settings, CircleHelp as HelpCircle, LogOut, MapPin, TrendingUp } from 'lucide-react-native';
import { useState } from 'react';
import QRCodeModal from '@/components/QRCodeModal';
import WalletModal from '@/components/WalletModal';
import RewardsModal from '@/components/RewardsModal';

export default function ProfileScreen() {
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [walletModalVisible, setWalletModalVisible] = useState(false);
  const [rewardsModalVisible, setRewardsModalVisible] = useState(false);

  // Simulation d'un utilisateur connecté
  const [user] = useState({
    name: 'Marie Kouassi',
    email: 'marie.kouassi@email.com',
    phone: '+225 07 12 34 56 78',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
    points: 15420,
    balance: 7710, // Équivalent en FCFA (points / 2)
    totalSavings: 12750, // Total des économies réalisées en FCFA
    ordersCount: 8,
  });

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnexion', style: 'destructive', onPress: () => {
          Alert.alert('Déconnecté', 'Vous avez été déconnecté avec succès');
        }},
      ]
    );
  };

  const menuItems = [
    {
      icon: QrCode,
      title: 'Mon QR Code',
      subtitle: 'Code pour les réductions',
      onPress: () => setQrModalVisible(true),
      color: '#00B14F',
    },
    {
      icon: Wallet,
      title: 'Mon Portefeuille',
      subtitle: 'Gérer mes points',
      onPress: () => setWalletModalVisible(true),
      color: '#4ECDC4',
    },
    {
      icon: Gift,
      title: 'Mes Récompenses',
      subtitle: 'Économies et cashback',
      onPress: () => setRewardsModalVisible(true),
      color: '#FF6B6B',
    },
    {
      icon: Settings,
      title: 'Paramètres',
      subtitle: 'Notifications et préférences',
      onPress: () => Alert.alert('Paramètres', 'Fonctionnalité bientôt disponible'),
      color: '#45B7D1',
    },
    {
      icon: HelpCircle,
      title: 'Aide & Support',
      subtitle: 'FAQ et contact',
      onPress: () => Alert.alert('Support', 'Contactez-nous à support@app.ci'),
      color: '#96CEB4',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.topRow}>
            <View style={styles.locationContainer}>
              <MapPin size={20} color="#00B14F" />
              <Text style={styles.locationText}>Cocody, Abidjan</Text>
            </View>
            
            <View style={styles.pointsContainer}>
              <Wallet size={18} color="#00B14F" />
              <Text style={styles.pointsText}>{user.points.toLocaleString()} pts</Text>
            </View>
          </View>
          <Text style={styles.title}>Mon Profil</Text>
        </View>

        {/* User Info */}
        <View style={styles.userCard}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <Text style={styles.userPhone}>{user.phone}</Text>
          </View>
        </View>

        {/* Stats Cards - Points uniquement */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: '#00B14F' }]}>
            <View style={styles.statHeader}>
              <Wallet size={24} color="#fff" />
              <Text style={styles.statLabel}>Mes Points</Text>
            </View>
            <Text style={styles.statAmount}>{user.points.toLocaleString()} pts</Text>
            <Text style={styles.statSubtext}>Disponibles pour vos achats</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#FF6B6B' }]}>
            <View style={styles.statHeader}>
              <TrendingUp size={24} color="#fff" />
              <Text style={styles.statLabel}>Économies</Text>
            </View>
            <Text style={styles.statAmount}>{user.totalSavings.toLocaleString()} FCFA</Text>
            <Text style={styles.statSubtext}>Économisées au total</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
                <item.icon size={24} color="#fff" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}

          {/* Logout */}
          <TouchableOpacity style={styles.logoutItem} onPress={handleLogout}>
            <View style={[styles.menuIcon, { backgroundColor: '#FF3B30' }]}>
              <LogOut size={24} color="#fff" />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, { color: '#FF3B30' }]}>
                Déconnexion
              </Text>
              <Text style={styles.menuSubtitle}>
                Se déconnecter de l'application
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <QRCodeModal
        visible={qrModalVisible}
        onClose={() => setQrModalVisible(false)}
        user={user}
      />

      <WalletModal
        visible={walletModalVisible}
        onClose={() => setWalletModalVisible(false)}
        user={user}
      />

      <RewardsModal
        visible={rewardsModalVisible}
        onClose={() => setRewardsModalVisible(false)}
        user={user}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9F4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pointsText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00B14F',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  userCard: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#8E8E8E',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#8E8E8E',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 15,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  statAmount: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statSubtext: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
  },
  menuContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 30,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  menuIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#8E8E8E',
  },
});