import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import storage from '@/utils/storage';
import { useAuth } from './AuthContext';

interface GoldBenefit {
  standardDiscount: number; // 10%
  premiumDiscount: number; // 15%
  firstOrderDiscount: number; // 12%
  freeDelivery: boolean;
  bonusPoints: number; // 2x multiplier
  priorityAccess: boolean;
}

interface GoldMembership {
  isActive: boolean;
  plan: 'monthly' | 'quarterly' | 'yearly' | null;
  startDate: string | null;
  endDate: string | null;
  autoRenew: boolean;
}

interface GoldContextType {
  membership: GoldMembership;
  benefits: GoldBenefit;
  showMembershipModal: boolean;
  hasSeenMembershipModal: boolean;
  activateGoldMembership: (plan: 'monthly' | 'quarterly' | 'yearly') => Promise<void>;
  cancelGoldMembership: () => Promise<void>;
  checkMembershipStatus: () => boolean;
  getDiscountForOrder: (orderAmount: number, isFirstOrder?: boolean) => number;
  setShowMembershipModal: (show: boolean) => void;
  setHasSeenMembershipModal: (seen: boolean) => void;
  shouldShowMembershipModal: () => boolean;
  triggerGoldUpgradeModal: () => void; // Nouveau pour déclencher depuis les coupons
}

const GoldContext = createContext<GoldContextType | undefined>(undefined);

interface GoldProviderProps {
  children: ReactNode;
}

export function GoldProvider({ children }: GoldProviderProps) {
  const { user } = useAuth();
  
  const [membership, setMembership] = useState<GoldMembership>({
    isActive: false,
    plan: null,
    startDate: null,
    endDate: null,
    autoRenew: true,
  });

  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [hasSeenMembershipModal, setHasSeenMembershipModal] = useState(false);

  const benefits: GoldBenefit = {
    standardDiscount: 10,
    premiumDiscount: 15,
    firstOrderDiscount: 12,
    freeDelivery: true,
    bonusPoints: 2,
    priorityAccess: true,
  };

  // Charger le statut d'abonnement depuis le stockage local
  useEffect(() => {
    if (user) {
      loadMembershipStatus();
      loadModalPreferences();
    }
  }, [user]);

  const loadMembershipStatus = async () => {
    try {
      // Ici, vous pouvez charger depuis votre API ou stockage local
      // Utilisation du storage unifié pour React Native et Web
      const savedMembership = await storage.getItem(`goldMembership_${user?.id}`);
      if (savedMembership) {
        const parsed = JSON.parse(savedMembership);
        
        // Vérifier si l'abonnement n'a pas expiré
        if (parsed.endDate && new Date(parsed.endDate) > new Date()) {
          setMembership(parsed);
        } else {
          // L'abonnement a expiré
          setMembership({
            isActive: false,
            plan: null,
            startDate: null,
            endDate: null,
            autoRenew: false,
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement du statut Gold:', error);
    }
  };

  const loadModalPreferences = async () => {
    try {
      const hasSeenModal = await storage.getItem(`hasSeenGoldModal_${user?.id}`);
      setHasSeenMembershipModal(hasSeenModal === 'true');
    } catch (error) {
      console.error('Erreur lors du chargement des préférences modal:', error);
    }
  };

  const saveMembershipStatus = async (newMembership: GoldMembership) => {
    try {
      await storage.setItem(`goldMembership_${user?.id}`, JSON.stringify(newMembership));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du statut Gold:', error);
    }
  };

  const saveModalPreferences = async (seen: boolean) => {
    try {
      await storage.setItem(`hasSeenGoldModal_${user?.id}`, seen.toString());
      setHasSeenMembershipModal(seen);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des préférences modal:', error);
    }
  };

  const activateGoldMembership = async (plan: 'monthly' | 'quarterly' | 'yearly') => {
    try {
      const now = new Date();
      let endDate = new Date();

      // Calculer la date de fin selon le plan
      switch (plan) {
        case 'monthly':
          endDate.setMonth(endDate.getMonth() + 1);
          break;
        case 'quarterly':
          endDate.setMonth(endDate.getMonth() + 3);
          break;
        case 'yearly':
          endDate.setFullYear(endDate.getFullYear() + 1);
          break;
      }

      const newMembership: GoldMembership = {
        isActive: true,
        plan,
        startDate: now.toISOString(),
        endDate: endDate.toISOString(),
        autoRenew: true,
      };

      // Mettre à jour l'état immédiatement
      setMembership(newMembership);
      await saveMembershipStatus(newMembership);

      // Fermer le modal après activation
      setShowMembershipModal(false);

      // Ici, vous pouvez aussi envoyer à votre API
      // await api.activateGoldMembership(user.id, plan);

      console.log(`✅ Abonnement Gold ${plan} activé pour l'utilisateur ${user?.id}`);
      console.log('✅ Statut Gold mis à jour:', newMembership);
    } catch (error) {
      console.error('Erreur lors de l\'activation de l\'abonnement Gold:', error);
      throw error;
    }
  };

  const cancelGoldMembership = async () => {
    try {
      const canceledMembership: GoldMembership = {
        ...membership,
        autoRenew: false,
      };

      setMembership(canceledMembership);
      await saveMembershipStatus(canceledMembership);

      // Ici, vous pouvez aussi envoyer à votre API
      // await api.cancelGoldMembership(user.id);

      console.log(`Abonnement Gold annulé pour l'utilisateur ${user?.id}`);
    } catch (error) {
      console.error('Erreur lors de l\'annulation de l\'abonnement Gold:', error);
      throw error;
    }
  };

  const checkMembershipStatus = (): boolean => {
    if (!membership.isActive || !membership.endDate) {
      console.log('🔍 Gold Status: Inactif - pas d\'abonnement actif');
      return false;
    }

    const isValid = new Date(membership.endDate) > new Date();
    console.log('🔍 Gold Status:', isValid ? 'ACTIF ✅' : 'EXPIRÉ ❌');
    console.log('🔍 Expiration:', membership.endDate);
    console.log('🔍 Plan:', membership.plan);
    
    return isValid;
  };

  const getDiscountForOrder = (orderAmount: number, isFirstOrder: boolean = false): number => {
    if (!checkMembershipStatus()) {
      return 0;
    }

    let discountPercent = 0;

    if (isFirstOrder) {
      discountPercent = benefits.firstOrderDiscount;
    } else if (orderAmount >= 10000) { // Commandes premium (>= 100 points équivalent)
      discountPercent = benefits.premiumDiscount;
    } else {
      discountPercent = benefits.standardDiscount;
    }

    return Math.floor((orderAmount * discountPercent) / 100);
  };

  const shouldShowMembershipModal = (): boolean => {
    // Afficher le modal si l'utilisateur n'a pas d'abonnement Gold actif
    return !checkMembershipStatus();
  };

  // Auto-affichage du modal à CHAQUE connexion (si pas Gold)
  useEffect(() => {
    if (user && !checkMembershipStatus()) {
      // Délai de 2 secondes après la connexion pour afficher le modal
      const timer = setTimeout(() => {
        console.log('Affichage popup Gold - utilisateur non-Gold connecté');
        setShowMembershipModal(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [user]); // Suppression de hasSeenMembershipModal de la dépendance

  // Fonction pour déclencher le popup depuis l'accès aux coupons Gold
  const triggerGoldUpgradeModal = () => {
    if (!checkMembershipStatus()) {
      console.log('Affichage popup Gold - tentative d\'accès aux coupons Gold');
      setShowMembershipModal(true);
    }
  };

  const contextValue: GoldContextType = {
    membership,
    benefits,
    showMembershipModal,
    hasSeenMembershipModal,
    activateGoldMembership,
    cancelGoldMembership,
    checkMembershipStatus,
    getDiscountForOrder,
    setShowMembershipModal,
    setHasSeenMembershipModal: saveModalPreferences,
    shouldShowMembershipModal,
    triggerGoldUpgradeModal,
  };

  return (
    <GoldContext.Provider value={contextValue}>
      {children}
    </GoldContext.Provider>
  );
}

export function useGold() {
  const context = useContext(GoldContext);
  if (context === undefined) {
    throw new Error('useGold must be used within a GoldProvider');
  }
  return context;
}
