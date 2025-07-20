import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Coupon } from '@/data/coupons';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import storage from '@/utils/storage';

interface CouponContextType {
  activeCoupon: Coupon | null;
  setActiveCoupon: (coupon: Coupon | null) => void;
  showCouponAnimation: boolean;
  setShowCouponAnimation: (show: boolean) => void;
  animateCoupon: (coupon: Coupon) => void;
  applyGlobalCoupon: (coupon: Coupon) => void;
  removeGlobalCoupon: () => void;
  isPremiumMember: boolean;
  userTotalPointsSpent: number; // Nombre total de points dépensés par l'utilisateur
  subscribeToPremium: (paymentMethod: 'points' | 'mobile_money') => Promise<boolean>;
  checkCouponEligibility: (coupon: Coupon) => { eligible: boolean, reason?: string };
  globalDiscountPercentage: number;
}

// Création du context
const CouponContext = createContext<CouponContextType | undefined>(undefined);

// Provider qui encapsulera l'application
export const CouponProvider = ({ children }: { children: ReactNode }) => {
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);
  const [showCouponAnimation, setShowCouponAnimation] = useState(false);
  const [isPremiumMember, setIsPremiumMember] = useState(false);
  const [globalDiscountPercentage, setGlobalDiscountPercentage] = useState(0);
  const [userTotalPointsSpent, setUserTotalPointsSpent] = useState(0);
  const { cartItems, cartTotal } = useCart();
  const { user, updateUserPoints, updateMembershipType } = useAuth();
  
  // Charger le statut premium et les points dépensés depuis le stockage au démarrage
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Charger le statut premium
        const status = await storage.getItem('premium_status');
        if (status) {
          setIsPremiumMember(JSON.parse(status));
        }
        
        // Charger les points totaux dépensés
        const pointsSpent = await storage.getItem('user_points_spent');
        if (pointsSpent) {
          setUserTotalPointsSpent(JSON.parse(pointsSpent));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    loadUserData();
  }, []);
  
  // Fonction pour déclencher l'animation d'un coupon
  const animateCoupon = (coupon: Coupon) => {
    setActiveCoupon(coupon);
    setShowCouponAnimation(true);
    
    // Masquer l'animation après 2.5 secondes
    setTimeout(() => {
      setShowCouponAnimation(false);
    }, 2500);
  };
  
  // Vérifier l'éligibilité d'un coupon
  const checkCouponEligibility = (coupon: Coupon) => {
    // Vérifier si le panier atteint le minimum requis
    if (coupon.minPurchase && cartTotal < coupon.minPurchase) {
      return { 
        eligible: false, 
        reason: `Le montant minimum du panier doit être de ${coupon.minPurchase} points` 
      };
    }
    
    // Vérifier si l'utilisateur a dépensé suffisamment de points
    if (coupon.minUserPoints && userTotalPointsSpent < coupon.minUserPoints) {
      return { 
        eligible: false, 
        reason: `Vous devez avoir dépensé au moins ${coupon.minUserPoints} points pour accéder à ce coupon` 
      };
    }
    
    // Vérifier si l'utilisateur est premium (si requis)
    if (coupon.requiresPremium && !isPremiumMember) {
      return { 
        eligible: false, 
        reason: `Ce coupon nécessite un abonnement premium` 
      };
    }
    
    return { eligible: true };
  };
  
  // Appliquer un coupon global à tout le panier
  const applyGlobalCoupon = (coupon: Coupon) => {
    const eligibility = checkCouponEligibility(coupon);
    
    if (!eligibility.eligible) {
      return; // Ne pas appliquer le coupon si non éligible
    }
    
    setActiveCoupon(coupon);
    setGlobalDiscountPercentage(coupon.discount);
    
    // Lancer l'animation
    animateCoupon(coupon);
  };
  
  // Supprimer le coupon global
  const removeGlobalCoupon = () => {
    setActiveCoupon(null);
    setGlobalDiscountPercentage(0);
  };
  
  // S'abonner au programme premium (avec choix du moyen de paiement)
  const subscribeToPremium = async (paymentMethod: 'points' | 'mobile_money'): Promise<boolean> => {
    try {
      const premiumCostFCFA = 500; // Coût de l'abonnement premium en FCFA
      const premiumCostPoints = 500; // Équivalent en points (1 point = 1 FCFA)
      
      // Paiement avec points
      if (paymentMethod === 'points') {
        // Vérifier si l'utilisateur a assez de points
        if (!user || user.points < premiumCostPoints) {
          throw new Error(`Vous avez besoin de ${premiumCostPoints} points pour l'abonnement premium`);
        }
        
        // Déduire les points
        await updateUserPoints(-premiumCostPoints);
      }
      
      // Pour mobile_money, normalement il y aurait une intégration avec un service de paiement
      // Simuler un processus de paiement
      console.log(`Abonnement premium en cours via ${paymentMethod}...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Enregistrer le statut premium
      setIsPremiumMember(true);
      await storage.setItem('premium_status', JSON.stringify(true));
      
      // Mettre à jour le statut d'abonnement dans l'AuthContext
      if (updateMembershipType) {
        await updateMembershipType('gold');
      }
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'abonnement premium:', error);
      return false;
    }
  };
  
  return (
    <CouponContext.Provider 
      value={{ 
        activeCoupon, 
        setActiveCoupon, 
        showCouponAnimation,
        setShowCouponAnimation,
        animateCoupon,
        applyGlobalCoupon,
        removeGlobalCoupon,
        isPremiumMember,
        userTotalPointsSpent,
        checkCouponEligibility,
        subscribeToPremium,
        globalDiscountPercentage
      }}
    >
      {children}
    </CouponContext.Provider>
  );
};

// Hook personnalisé pour utiliser le context
export const useCoupon = () => {
  const context = useContext(CouponContext);
  if (context === undefined) {
    throw new Error("useCoupon doit être utilisé à l'intérieur d'un CouponProvider");
  }
  return context;
};
