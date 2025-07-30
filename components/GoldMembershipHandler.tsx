import React from 'react';
import { useGold } from '@/contexts/GoldContext';
import GoldMembershipModal from './GoldMembershipModal';

export default function GoldMembershipHandler() {
  const {
    showMembershipModal,
    setShowMembershipModal,
    setHasSeenMembershipModal,
    activateGoldMembership,
  } = useGold();

  const handleClose = () => {
    setShowMembershipModal(false);
    setHasSeenMembershipModal(true);
  };

  const handleSubscriptionSuccess = async (plan: 'monthly' | 'quarterly' | 'yearly') => {
    try {
      await activateGoldMembership(plan);
      setShowMembershipModal(false);
      setHasSeenMembershipModal(true);
    } catch (error) {
      console.error('Erreur lors de l\'activation de l\'abonnement:', error);
    }
  };

  return (
    <GoldMembershipModal
      visible={showMembershipModal}
      onClose={handleClose}
    />
  );
}
