import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { X, Star, Sparkles, ChevronRight, ShoppingBag, Tag } from 'lucide-react-native';
import { useCoupon } from '@/contexts/CouponContext';
import { useAuth } from '@/contexts/AuthContext';

interface PromoPopupProps {
  visible: boolean;
  onClose: () => void;
}

const { width } = Dimensions.get('window');

export default function PromoPopup({ visible, onClose }: PromoPopupProps) {
  const [showSubscriptionPrompt, setShowSubscriptionPrompt] = useState(false);
  const [subscriptionMethod, setSubscriptionMethod] = useState<'points' | 'mobile_money'>('points');
  const { isPremiumMember, subscribeToPremium } = useCoupon();
  const { user } = useAuth();
  
  // Vérifier si l'utilisateur a cliqué sur un bouton Gold depuis CheckoutModal
  useEffect(() => {
    const checkGoldUpgradeRequest = async () => {
      try {
        const storageModule = await import('@/utils/storage');
        const storage = storageModule.default;
        
        const showGoldUpgrade = await storage.getItem('show_gold_upgrade_popup');
        if (showGoldUpgrade && JSON.parse(showGoldUpgrade)) {
          // Afficher directement l'écran d'abonnement
          setShowSubscriptionPrompt(true);
          // Réinitialiser la valeur pour éviter de montrer automatiquement à nouveau
          await storage.setItem('show_gold_upgrade_popup', JSON.stringify(false));
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de la demande d'upgrade Gold:", error);
      }
    };
    
    if (visible) {
      checkGoldUpgradeRequest();
    }
  }, [visible]);
  
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

  const handleSubscriptionClick = () => {
    setShowSubscriptionPrompt(true);
  };
  
  const handleSubscribe = async () => {
    const success = await subscribeToPremium(subscriptionMethod);
    
    if (success) {
      setShowSubscriptionPrompt(false);
      // Afficher une animation ou un message de succès
      alert('Félicitations ! Vous êtes maintenant un membre Gold avec accès à toutes les réductions premium !');
    } else {
      alert('L\'abonnement n\'a pas pu être complété. Veuillez réessayer.');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Sparkles size={20} color="#FFD700" />
              <Text style={styles.title}>Offres Spéciales</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color="#8E8E8E" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Bannière principale */}
            <View style={styles.mainBanner}>
              <View style={styles.bannerContent}>
                <Text style={styles.bannerTitle}>Devenez membre Gold</Text>
                <Text style={styles.bannerText}>Économisez jusqu'à 20% sur toutes vos commandes</Text>
                <TouchableOpacity
                  style={styles.bannerButton}
                  onPress={handleSubscriptionClick}
                >
                  <Text style={styles.bannerButtonText}>S'abonner maintenant</Text>
                  <ChevronRight size={16} color="#FFF" />
                </TouchableOpacity>
              </View>
              <View style={styles.goldBadgeContainer}>
                <Star size={40} color="#FFD700" />
                <Text style={styles.goldBadgeText}>GOLD</Text>
              </View>
            </View>

            {/* Cartes de réductions */}
            <Text style={styles.sectionTitle}>Réductions disponibles</Text>

            <View style={styles.promoCardLarge}>
              <View style={styles.promoCardContent}>
                <View style={styles.promoDiscount}>
                  <Text style={styles.promoDiscountText}>-5%</Text>
                </View>
                <View style={styles.promoInfo}>
                  <Text style={styles.promoTitle}>Réduction basique</Text>
                  <Text style={styles.promoDesc}>Disponible pour tous les clients</Text>
                </View>
                <TouchableOpacity style={styles.promoButton}>
                  <Text style={styles.promoButtonText}>Utiliser</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.promoCardLarge, styles.goldPromoCard]}>
              <View style={styles.goldBadge}>
                <Star size={12} color="#FFF" />
                <Text style={styles.goldBadgeSmallText}>GOLD</Text>
              </View>
              <View style={styles.promoCardContent}>
                <View style={[styles.promoDiscount, styles.goldPromoDiscount]}>
                  <Text style={styles.promoDiscountText}>-10%</Text>
                </View>
                <View style={styles.promoInfo}>
                  <Text style={styles.promoTitle}>Réduction fidélité</Text>
                  <Text style={styles.promoDesc}>Pour les clients ayant dépensé 60+ points</Text>
                </View>
                <TouchableOpacity 
                  style={[styles.promoButton, styles.goldPromoButton]}
                  onPress={handleSubscriptionClick}
                >
                  <Text style={styles.promoButtonText}>{isPremiumMember ? 'Utiliser' : 'Débloquer'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.promoCardLarge, styles.goldPromoCard]}>
              <View style={styles.goldBadge}>
                <Star size={12} color="#FFF" />
                <Text style={styles.goldBadgeSmallText}>GOLD</Text>
              </View>
              <View style={styles.promoCardContent}>
                <View style={[styles.promoDiscount, styles.goldPromoDiscount]}>
                  <Text style={styles.promoDiscountText}>-20%</Text>
                </View>
                <View style={styles.promoInfo}>
                  <Text style={styles.promoTitle}>Réduction premium</Text>
                  <Text style={styles.promoDesc}>Pour les membres Gold avec panier {'>'} 100 points</Text>
                </View>
                <TouchableOpacity 
                  style={[styles.promoButton, styles.goldPromoButton]}
                  onPress={handleSubscriptionClick}
                >
                  <Text style={styles.promoButtonText}>{isPremiumMember ? 'Utiliser' : 'Débloquer'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Section avantages */}
            <Text style={styles.sectionTitle}>Avantages Gold</Text>

            <View style={styles.benefitsContainer}>
              <View style={styles.benefitItem}>
                <Tag size={20} color="#00B14F" />
                <Text style={styles.benefitText}>Accès aux coupons premium (-10%, -20%)</Text>
              </View>
              <View style={styles.benefitItem}>
                <Sparkles size={20} color="#00B14F" />
                <Text style={styles.benefitText}>Points bonus sur chaque achat</Text>
              </View>
              <View style={styles.benefitItem}>
                <ShoppingBag size={20} color="#00B14F" />
                <Text style={styles.benefitText}>Offres exclusives toute l'année</Text>
              </View>
            </View>

            <View style={styles.membershipInfo}>
              <Text style={styles.membershipTitle}>
                Votre statut: {user?.membershipType === 'gold' ? 'Gold Member' : 'Classic Member'}
              </Text>
              {user?.membershipType !== 'gold' && (
                <TouchableOpacity 
                  style={styles.upgradeMembershipButton}
                  onPress={handleSubscriptionClick}
                >
                  <Text style={styles.upgradeMembershipButtonText}>Passer à Gold</Text>
                  <Star size={14} color="#FFF" />
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </Animated.View>
      </View>

      {/* Modal d'abonnement */}
      <Modal
        visible={showSubscriptionPrompt}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSubscriptionPrompt(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.subscriptionContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>Devenir membre Gold</Text>
              <TouchableOpacity onPress={() => setShowSubscriptionPrompt(false)} style={styles.closeButton}>
                <X size={24} color="#8E8E8E" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.subscriptionContent}>
              <View style={styles.goldIconContainer}>
                <Star size={60} color="#FFD700" />
              </View>
              
              <Text style={styles.goldTitle}>Débloquez des avantages exclusifs</Text>
              <Text style={styles.goldDescription}>
                Abonnez-vous à notre programme Gold pour accéder à des coupons exclusifs avec
                des réductions allant jusqu'à 20% sur toutes vos commandes !
              </Text>
              
              <Text style={styles.paymentMethodTitle}>Mode de paiement</Text>
              
              <View style={styles.paymentOptions}>
                <TouchableOpacity
                  style={[
                    styles.paymentOption,
                    subscriptionMethod === 'points' && styles.selectedPaymentOption
                  ]}
                  onPress={() => setSubscriptionMethod('points')}
                >
                  <Text style={styles.paymentOptionText}>Payer avec 500 points</Text>
                  {subscriptionMethod === 'points' && (
                    <View style={styles.paymentSelectedIndicator} />
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.paymentOption,
                    subscriptionMethod === 'mobile_money' && styles.selectedPaymentOption
                  ]}
                  onPress={() => setSubscriptionMethod('mobile_money')}
                >
                  <Text style={styles.paymentOptionText}>Payer avec Mobile Money (500 FCFA)</Text>
                  {subscriptionMethod === 'mobile_money' && (
                    <View style={styles.paymentSelectedIndicator} />
                  )}
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                style={styles.subscribeButton}
                onPress={handleSubscribe}
              >
                <Text style={styles.subscribeButtonText}>S'abonner maintenant</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
    elevation: 99999, // For Android
  },
  container: {
    width: '90%',
    maxWidth: 450,
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  closeButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  mainBanner: {
    backgroundColor: '#121212',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    overflow: 'hidden',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerContent: {
    flex: 1,
    paddingRight: 20,
  },
  bannerTitle: {
    color: '#FFD700',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bannerText: {
    color: '#FFF',
    fontSize: 16,
    marginBottom: 15,
  },
  bannerButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 30,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  bannerButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  goldBadgeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  goldBadgeText: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginTop: 5,
  },
  promoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  promoCard: {
    width: '48%',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#EBEBEB',
  },
  promoCardLarge: {
    width: '100%',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#EBEBEB',
  },
  goldPromoCard: {
    backgroundColor: '#FFF9E6',
    borderColor: '#FFD700',
    position: 'relative',
  },
  goldBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FFD700',
    borderBottomLeftRadius: 8,
    borderTopRightRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 3,
  },
  goldBadgeSmallText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  promoCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  promoDiscount: {
    backgroundColor: '#00B14F',
    width: 45,
    height: 45,
    borderRadius: 22.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  goldPromoDiscount: {
    backgroundColor: '#FFD700',
  },
  promoDiscountText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  promoInfo: {
    flex: 1,
    marginRight: 10,
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  promoDesc: {
    fontSize: 12,
    color: '#666',
  },
  promoButton: {
    backgroundColor: '#00B14F',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  goldPromoButton: {
    backgroundColor: '#FFD700',
  },
  promoButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  benefitsContainer: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 10,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  benefitText: {
    fontSize: 14,
    color: '#333',
  },
  membershipInfo: {
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  membershipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  upgradeMembershipButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  upgradeMembershipButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  subscriptionContainer: {
    backgroundColor: '#fff',
    width: '90%',
    maxWidth: 450,
    maxHeight: '80%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  subscriptionContent: {
    padding: 20,
  },
  goldIconContainer: {
    alignSelf: 'center',
    marginVertical: 20,
    backgroundColor: '#FFF9E6',
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  goldTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  goldDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  paymentMethodTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 15,
    color: '#333',
  },
  paymentOptions: {
    marginBottom: 20,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 10,
    borderRadius: 12,
  },
  selectedPaymentOption: {
    borderColor: '#FFD700',
    backgroundColor: '#FFF9E6',
  },
  paymentOptionText: {
    fontSize: 16,
    color: '#333',
  },
  paymentSelectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFD700',
  },
  subscribeButton: {
    backgroundColor: '#00B14F',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#00B14F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  subscribeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  }
});
