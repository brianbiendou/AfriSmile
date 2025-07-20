import React from 'react';
import { View } from 'react-native';
import AnimatedCoupon from './AnimatedCoupon';
import { useCoupon } from '@/contexts/CouponContext';

/**
 * Composant global pour afficher les animations de coupons
 * Ce composant est monté une seule fois au niveau de l'application
 * et réagit aux changements dans le CouponContext
 */
const GlobalCouponAnimation: React.FC = () => {
  const { showCouponAnimation, activeCoupon, setShowCouponAnimation } = useCoupon();
  
  if (!activeCoupon) {
    return null;
  }
  
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
      <AnimatedCoupon
        visible={showCouponAnimation}
        couponCode={activeCoupon.code}
        discount={activeCoupon.discount}
        onAnimationEnd={() => setShowCouponAnimation(false)}
      />
    </View>
  );
};

export default GlobalCouponAnimation;
