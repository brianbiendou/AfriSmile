import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import storage from '@/utils/storage';

const PROMO_SHOWN_KEY = 'goldPromoShown';

export const useGoldMembershipPromo = () => {
  const { user, isAuthenticated } = useAuth();
  const [showPromo, setShowPromo] = useState(false);

  useEffect(() => {
    const checkAndShowPromo = async () => {
      // Ne montrer que si l'utilisateur est connecté et Classic
      if (!isAuthenticated || !user || user.membershipType !== 'classic') {
        return;
      }

      try {
        // Vérifier si la promo a déjà été montrée aujourd'hui
        const lastShown = await storage.getItem(PROMO_SHOWN_KEY);
        const today = new Date().toDateString();
        
        if (lastShown !== today) {
          // Délai de 2 secondes après la connexion pour une expérience fluide
          setTimeout(() => {
            setShowPromo(true);
          }, 2000);
        }
      } catch (error) {
        console.log('Erreur lors de la vérification de la promo:', error);
      }
    };

    checkAndShowPromo();
  }, [isAuthenticated, user]);

  const hidePromo = async () => {
    setShowPromo(false);
    try {
      // Marquer la promo comme vue aujourd'hui
      const today = new Date().toDateString();
      await storage.setItem(PROMO_SHOWN_KEY, today);
    } catch (error) {
      console.log('Erreur lors de la sauvegarde de la promo:', error);
    }
  };

  const showPromoManually = () => {
    setShowPromo(true);
  };

  return {
    showPromo,
    hidePromo,
    showPromoManually,
    shouldShowPromo: isAuthenticated && user?.membershipType === 'classic'
  };
};
