import React, { useEffect } from 'react';
import { useGold } from '@/contexts/GoldContext';

/**
 * Composant de test pour forcer l'affichage du popup Gold
 * Placez ce composant temporairement dans votre app pour tester le design
 * 
 * Usage:
 * 1. Importez ce composant dans _layout.tsx ou index.tsx
 * 2. Ajoutez <GoldPopupTester /> après les autres composants
 * 3. Le popup s'affichera automatiquement après 1 seconde
 * 4. Supprimez ce composant après les tests
 */
export default function GoldPopupTester() {
  const { setShowMembershipModal } = useGold();

  useEffect(() => {
    // Forcer l'affichage du popup après 1 seconde pour test
    const timer = setTimeout(() => {
      console.log('🧪 FORÇAGE DU POPUP GOLD POUR TEST');
      setShowMembershipModal(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return null; // Ce composant ne rend rien visuellement
}
