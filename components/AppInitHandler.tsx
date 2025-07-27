import { useState, useEffect } from 'react';
import storage from '@/utils/storage';
import GoldMembershipPromo from './GoldMembershipPromo';
import { useAuth } from '@/contexts/AuthContext';
import { Alert } from 'react-native';

export default function AppInitHandler() {
  const [showPromoPopup, setShowPromoPopup] = useState(false);
  const [initialShowComplete, setInitialShowComplete] = useState(false);
  const { user, isAuthenticated } = useAuth();
  
  // Vérifier si le popup doit être affiché (au démarrage normal ou après 7 jours)
  useEffect(() => {
    const checkPromoPopupStatus = async () => {
      try {
        // Vérifier d'abord si une demande d'upgrade Gold est en attente
        const showGoldUpgrade = await storage.getItem('show_gold_upgrade_popup');
        if (showGoldUpgrade && JSON.parse(showGoldUpgrade)) {
          setShowPromoPopup(true);
          // Effacer le flag après l'avoir traité
          await storage.setItem('show_gold_upgrade_popup', JSON.stringify(false));
          return;
        }
        
        // Vérifier si le popup a déjà été montré récemment
        const lastShown = await storage.getItem('promo_popup_last_shown');
        
        if (!lastShown) {
          // Première utilisation de l'app, montrer le popup
          setShowPromoPopup(true);
        } else {
          const lastShownDate = new Date(JSON.parse(lastShown));
          const now = new Date();
          const daysDifference = Math.floor((now.getTime() - lastShownDate.getTime()) / (1000 * 3600 * 24));
          
          // Montrer le popup tous les 7 jours
          if (daysDifference >= 7) {
            setShowPromoPopup(true);
          }
        }
      } catch (error) {
        console.error('Error checking promo popup status:', error);
        // En cas d'erreur, on montre quand même le popup
        setShowPromoPopup(true);
      }
      
      setInitialShowComplete(true);
    };
    
    // Affichage instantané du popup
    checkPromoPopupStatus();
  }, []);
  
  // Vérifier si l'utilisateur vient de se connecter
  useEffect(() => {
    const checkLoginStatus = async () => {
      if (isAuthenticated && user && initialShowComplete) {
        // Vérifier si la popup a déjà été affichée après cette connexion
        const lastLoginPopup = await storage.getItem('login_popup_shown');
        if (!lastLoginPopup || JSON.parse(lastLoginPopup) !== user.id) {
          // Afficher la popup après une nouvelle connexion
          setShowPromoPopup(true);
          // Marquer que la popup a été affichée pour cet utilisateur
          await storage.setItem('login_popup_shown', JSON.stringify(user.id));
        }
      }
    };
    
    checkLoginStatus();
  }, [isAuthenticated, user, initialShowComplete]);
  
  // Fonction pour fermer le popup et enregistrer la date
  const handleClosePromoPopup = async () => {
    try {
      // Enregistrer la date actuelle comme dernière fois que le popup a été montré
      await storage.setItem('promo_popup_last_shown', JSON.stringify(new Date().toISOString()));
    } catch (error) {
      console.error('Error saving promo popup last shown date:', error);
    }
    
    // Fermer le popup
    setShowPromoPopup(false);
  };

  return (
    <>
      {/* Affichage de la promotion Gold pour tous les membres */}
      <GoldMembershipPromo 
        visible={showPromoPopup} 
        onClose={handleClosePromoPopup}
        onSubscribe={() => {
          Alert.alert("Abonnement Gold", "Redirection vers le processus d'abonnement Gold");
          handleClosePromoPopup();
        }}
      />
    </>
  );
}
