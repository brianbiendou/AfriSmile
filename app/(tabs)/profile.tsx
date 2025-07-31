import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { User, Wallet, QrCode, Gift, Settings, CircleHelp as HelpCircle, LogOut, MapPin } from 'lucide-react-native';
import { Database } from 'lucide-react-native';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useGold } from '@/contexts/GoldContext'; // Importer le context Gold
import QRCodeModal from '@/components/QRCodeModal';
import WalletModal from '@/components/WalletModal';
import RewardsModal from '@/components/RewardsModal';
import SimpleWalletModal from '@/components/SimpleWalletModal';
import LogoutModal from '@/components/LogoutModal';
import CartIcon from '@/components/CartIcon';
import CartModal from '@/components/CartModal';
import CheckoutModal from '@/components/CheckoutModal';
import DatabaseTestTool from '@/components/DatabaseTestTool';
import { pointsToFcfa, formatPointsWithFcfa } from '@/utils/pointsConversion';
import { formatPoints } from '@/utils/pointsConversion';

export default function ProfileScreen() {
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [walletModalVisible, setWalletModalVisible] = useState(false);
  const [rewardsModalVisible, setRewardsModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [simpleWalletModalVisible, setSimpleWalletModalVisible] = useState(false);
  const [databaseTestVisible, setDatabaseTestVisible] = useState(false);

  // Animations pour les points
  const goldTextAnim = useRef(new Animated.Value(1)).current;

  const { logout, user: authUser } = useAuth();
  const { cartCount } = useCart();
  const { checkMembershipStatus, membership } = useGold(); // Utiliser le context Gold

  // Vérifier le vrai statut Gold
  const isGoldMember = checkMembershipStatus();

  // Données utilisateur dynamiques basées sur l'utilisateur connecté
  const user = {
    name: authUser ? `${authUser.first_name} ${authUser.last_name}` : 'Utilisateur',
    email: authUser?.email || 'email@example.com',
    phone: authUser?.phone || '+225 00 00 00 00 00',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
    points: authUser?.points || 0,
    balance: pointsToFcfa(authUser?.points || 0),
    membershipType: isGoldMember ? 'gold' : 'classic', // Utiliser le vrai statut Gold
    totalSavings: Math.floor((authUser?.points || 0) * 0.8), // Estimation des économies
    ordersCount: 8, // À récupérer depuis la base de données
    completionPercentage: 75,
    nextReward: 319, // 25000 FCFA ÷ 78.359 = 319 points
    monthlySpending: 574, // 45000 FCFA ÷ 78.359 = 574 points
  };

  const menuItems = [
    {
      icon: QrCode,
      title: 'Mon QR Code',
      subtitle: 'Code pour les réductions',
      onPress: () => router.push('/(account)/qrcode'),
      color: '#00B14F',
    },
    {
      icon: Wallet,
      title: 'Mon Portefeuille',
      subtitle: 'Gérer mes points et recharges',
      onPress: () => router.push('/(account)/wallet'),
      color: '#4ECDC4',
    },
    {
      icon: Gift,
      title: 'Mes Récompenses',
      subtitle: 'Économies et cashback',
      onPress: () => router.push('/(account)/rewards'),
      color: '#FF6B6B',
    },
    {
      icon: Settings,
      title: 'Paramètres',
      subtitle: 'Notifications et préférences',
      onPress: () => router.push('/(account)/settings'),
      color: '#45B7D1',
    },
    {
      icon: HelpCircle,
      title: 'Aide & Support',
      subtitle: 'FAQ et contact',
      onPress: () => router.push('/(account)/support'),
      color: '#96CEB4',
    },
    {
      icon: Database,
      title: 'Test Base de Données',
      subtitle: 'Vérifier la connexion et les données',
      onPress: () => setDatabaseTestVisible(true),
      color: '#8B5CF6',
    },
  ];

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const handleConfirmLogout = () => {
    setLogoutModalVisible(false);
    logout();
  };

  // Animation des points dorés
  useEffect(() => {
    // Animation de pulsation douce (compatible avec useNativeDriver)
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(goldTextAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(goldTextAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.topRow}>
          <View style={styles.locationContainer}>
            <MapPin size={20} color="#00B14F" />
            <Text style={styles.locationText}>Cocody, Abidjan</Text>
          </View>
          <View style={styles.pointsContainer}>
            <Wallet size={18} color="#00B14F" />
            <Text style={styles.pointsText}>{formatPoints(user.points)}</Text>
          </View>
          
          <CartIcon onPress={() => setCartModalVisible(true)} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.scrollContent}>
          <Text style={styles.title}>Mon Profil</Text>
        </View>
        
        <View style={[
            styles.userCard,
            user.membershipType === 'gold' ? styles.goldMemberCard : {}
          ]}>
          {/* Cartes de fond inclinées pour l'effet de superposition avec gradient doré */}
          {user.membershipType === 'gold' ? (
            <>
              <LinearGradient
                colors={['#FFD700', '#FFA500', '#FFD700', '#FFFF99']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                locations={[0, 0.3, 0.7, 1]}
                style={[styles.cardBackground, styles.goldCardBackground]}
              />
              <LinearGradient
                colors={['rgba(255, 215, 0, 0.3)', 'rgba(255, 255, 255, 0.6)', 'rgba(255, 215, 0, 0.3)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.cardBackground2, styles.goldCardBackground]}
              />
            </>
          ) : (
            <>
              <View style={styles.cardBackground} />
              <View style={styles.cardBackground2} />
            </>
          )}
          <View style={styles.goldOverlay} />
          {user.membershipType === 'gold' && (
            <Image 
              source={{uri: 'https://cdn-icons-png.flaticon.com/512/1021/1021220.png'}} 
              style={styles.goldBadgeIcon}
            />
          )}
          
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <Text style={styles.userPhone}>{user.phone}</Text>
            <View style={[
              styles.loyaltyBadge, 
              user.membershipType === 'gold' ? styles.goldBadge : styles.classicBadge
            ]}>
              <Text style={[
                styles.loyaltyText,
                user.membershipType === 'gold' ? styles.goldText : styles.classicText
              ]}>
                {user.membershipType === 'gold' ? 'Gold Member' : 'Classic Member'}
              </Text>
            </View>
          </View>
        </View>

        {/* Section Points Balance */}
        <View style={styles.pointsBalanceSection}>
          <View style={styles.pointsBalanceContainer}>
            <Text style={styles.pointsBalanceLabel}>Solde disponible</Text>
            <Animated.Text 
              style={[
                styles.pointsBalanceValueGold,
                {
                  transform: [{ scale: goldTextAnim }],
                }
              ]}
            >
              {user.points.toLocaleString()} pts
            </Animated.Text>
            <Text style={styles.pointsBalanceValueSilver}>
              {pointsToFcfa(user.points).toLocaleString()} FCFA
            </Text>
          </View>
        </View>

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
      
      <SimpleWalletModal
        visible={simpleWalletModalVisible}
        onClose={() => setSimpleWalletModalVisible(false)}
      />
      
      <RewardsModal
        visible={rewardsModalVisible}
        onClose={() => setRewardsModalVisible(false)}
        user={user}
      />
      
      <LogoutModal
        visible={logoutModalVisible}
        onClose={() => setLogoutModalVisible(false)}
        onConfirm={handleConfirmLogout}
        userName={user.name}
      />

      <CartModal
        visible={cartModalVisible}
        onClose={() => setCartModalVisible(false)}
        onCheckout={() => {
          setCartModalVisible(false);
          setCheckoutModalVisible(true);
        }}
      />

      <CheckoutModal
        visible={checkoutModalVisible}
        onClose={() => setCheckoutModalVisible(false)}
      />

      <DatabaseTestTool
        visible={databaseTestVisible}
        onClose={() => setDatabaseTestVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  // Styles pour les badges d'adhésion
  goldBadge: {
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#FFD700', // Bordure dorée
  },
  classicBadge: {
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#C0C0C0', // Bordure argentée
  },
  goldText: {
    color: '#FFD700', // Texte doré
  },
  classicText: {
    color: '#C0C0C0', // Texte argenté
  },
  goldBadgeIcon: {
    position: 'absolute',
    top: -15,
    right: -15,
    width: 40,
    height: 40,
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 5, // Réduit de 45 à 5 pour réduire l'espace avec le sélecteur d'application
    paddingHorizontal: 20,
    paddingBottom: 5, // Réduit de 10 à 5 pour réduire l'espace avec le contenu principal
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 5, // Réduit de 10 à 5 pour réduire l'espace avec le contenu principal
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  scrollContent: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 10, // Réduit de 20 à 10 pour réduire l'espace avec le header
    paddingBottom: 5, // Réduit de 10 à 5 pour réduire l'espace
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 0,
  },
  userCard: {
    position: 'relative',
    backgroundColor: '#F4E4BC', // Or clair et lumineux
    margin: 15, // Réduit de 20 à 15 pour réduire l'espace
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
    overflow: 'visible',
  },
  goldMemberCard: {
    backgroundColor: '#F5E5C0', // Plus doré pour les membres Gold
  },
  // Carte de fond inclinée (effet de superposition)
  cardBackground: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    backgroundColor: '#E6D690', // Or moyen clair
    borderRadius: 16,
    transform: [{ rotate: '-2deg' }],
    zIndex: -1,
  },
  // Deuxième carte de fond pour plus d'effet
  cardBackground2: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    backgroundColor: '#F0E68C', // Or très clair
    borderRadius: 16,
    transform: [{ rotate: '1deg' }],
    zIndex: -1,
  },
  goldCardBackground: {
    backgroundColor: '#FFD700', // Or vif pour les membres Gold
  },
  // Overlay doré avec texture
  goldOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    borderRadius: 16,
    // Simulation d'un dégradé doré avec des ombres internes
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 1,
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
    color: '#1A1A1A', // Noir profond pour contraster avec l'or
    textShadowColor: 'rgba(255, 215, 0, 0.5)', // Ombre dorée
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#2C2C2C', // Gris très foncé
    textShadowColor: 'rgba(255, 215, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#2C2C2C', // Gris très foncé
    textShadowColor: 'rgba(255, 215, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  loyaltyBadge: {
    backgroundColor: '#1A1A1A', // Fond noir pour contraster
    borderWidth: 2,
    borderColor: '#FFD700', // Bordure dorée
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  loyaltyText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFD700', // Texte doré sur fond noir
  },
  // Section Points Balance
  pointsBalanceSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  pointsBalanceContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  pointsBalanceLabel: {
    fontSize: 14,
    color: '#8E8E8E',
    marginBottom: 8,
  },
  pointsBalanceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00B14F',
    marginBottom: 4,
  },
  pointsBalanceValueGold: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#DAA520', // Couleur or riche
    textAlign: 'center',
    marginBottom: 4,
    textShadowColor: 'rgba(218, 165, 32, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  pointsBalanceValueSilver: {
    fontSize: 24,
    fontWeight: '600',
    color: '#C0C0C0', // Couleur argent authentique
    textAlign: 'center',
    marginBottom: 4,
  },
  pointsUnit: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00B14F',
  },
  pointsBalanceEquivalent: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  // Nouveaux styles pour la section portefeuille redesignée
  walletSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  mainWalletCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 15,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  walletTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 10,
  },
  walletDetailsButton: {
    backgroundColor: '#F0F9F4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  walletDetailsText: {
    color: '#00B14F',
    fontSize: 14,
    fontWeight: '600',
  },
  balanceContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  balanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  balanceDivider: {
    width: 1,
    backgroundColor: '#E5E5E5',
    marginHorizontal: 20,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#8E8E8E',
    marginBottom: 8,
    textAlign: 'center',
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  balanceSubtext: {
    fontSize: 14,
    color: '#00B14F',
    fontWeight: '600',
  },
  progressContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00B14F',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00B14F',
    borderRadius: 4,
  },
  progressSubtext: {
    fontSize: 12,
    color: '#8E8E8E',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E8E',
    textAlign: 'center',
  },
  // Styles pour la section de completion du profil
  completionSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  completionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 10,
  },
  bonusPointsBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  bonusPointsText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  completionSubtitle: {
    fontSize: 14,
    color: '#8E8E8E',
    marginBottom: 16,
  },
  completionProgress: {
    marginBottom: 20,
  },
  completionProgressBar: {
    height: 6,
    backgroundColor: '#F5F5F5',
    borderRadius: 3,
    marginBottom: 8,
  },
  completionProgressFill: {
    height: '100%',
    backgroundColor: '#FF6B6B',
    borderRadius: 3,
  },
  completionPercentageText: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '600',
    textAlign: 'right',
  },
  taskItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  taskContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    flex: 1,
  },
  taskReward: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  taskPoints: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
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