import { Animated, Easing, StyleSheet } from 'react-native';
import React, { useEffect, useRef } from 'react';

interface AnimatedCouponProps {
  visible: boolean;
  style?: any;
  onAnimationEnd?: () => void;
  couponCode?: string;
  discount?: number;
  children?: React.ReactNode;
}

/**
 * Composant d'animation pour l'application d'un coupon
 * Affiche une animation lorsqu'un coupon est appliqué
 */
const AnimatedCoupon: React.FC<AnimatedCouponProps> = ({ 
  visible, 
  style, 
  onAnimationEnd, 
  couponCode,
  discount,
  children 
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset animations
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);
      opacityAnim.setValue(0);

      // Start animation sequence
      Animated.sequence([
        // Fade in and scale up
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
            easing: Easing.elastic(1.2),
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        
        // Rotate slightly
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        
        // Wait for a moment
        Animated.delay(1000),
        
        // Fade out
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (onAnimationEnd) {
          onAnimationEnd();
        }
      });
    }
  }, [visible]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: ['0deg', '-5deg', '5deg', '-3deg', '0deg'],
  });

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          opacity: opacityAnim,
          transform: [
            { scale: scaleAnim },
            { rotate },
          ],
        },
      ]}
    >
      {children ? children : (
        <>
          <Animated.Text style={styles.title}>
            Coupon appliqué !
          </Animated.Text>
          {couponCode && (
            <Animated.Text style={styles.couponCode}>
              {couponCode}
            </Animated.Text>
          )}
          {discount !== undefined && (
            <Animated.Text style={styles.discount}>
              Réduction de {discount}%
            </Animated.Text>
          )}
        </>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 200,
    marginLeft: -100,
    marginTop: -60,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 2,
    borderColor: '#FF6B6B',
    zIndex: 1000,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 10,
    textAlign: 'center',
  },
  couponCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  discount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00B14F',
    textAlign: 'center',
  },
});

export default AnimatedCoupon;
