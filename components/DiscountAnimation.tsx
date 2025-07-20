import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, Dimensions } from 'react-native';
import { Sparkles } from 'lucide-react-native';

interface DiscountAnimationProps {
  visible: boolean;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  onAnimationEnd: () => void;
}

const { width } = Dimensions.get('window');

const DiscountAnimation: React.FC<DiscountAnimationProps> = ({
  visible,
  originalPrice,
  discountedPrice,
  discountPercentage,
  onAnimationEnd
}) => {
  // Animation values
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const priceAnim = useRef(new Animated.Value(originalPrice)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const discountOpacityAnim = useRef(new Animated.Value(0)).current;
  const sparklesAnim = useRef(new Animated.Value(0)).current;
  
  // Confetti animation values
  const confettiOpacity = useRef(new Animated.Value(0)).current;
  const confettiPositions = useRef(
    Array.from({ length: 20 }).map(() => ({
      x: new Animated.Value(width / 2),
      y: new Animated.Value(100),
      rotate: new Animated.Value(0),
      scale: new Animated.Value(0.5 + Math.random() * 0.5)
    }))
  ).current;
  
  useEffect(() => {
    if (visible) {
      // Reset animations
      opacityAnim.setValue(0);
      priceAnim.setValue(originalPrice);
      scaleAnim.setValue(1);
      discountOpacityAnim.setValue(0);
      sparklesAnim.setValue(0);
      confettiOpacity.setValue(0);
      
      // Start animation sequence
      Animated.sequence([
        // Fade in
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        
        // Show sparkles
        Animated.timing(sparklesAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        
        // Short pause before price change
        Animated.delay(200),
        
        // Price change animation with pulse effect
        Animated.parallel([
          // Price counting down
          Animated.timing(priceAnim, {
            toValue: discountedPrice,
            duration: 1200,
            useNativeDriver: false, // We need to interpolate to string
          }),
          
          // Pulse effect
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            })
          ]),
          
          // Show discount badge
          Animated.timing(discountOpacityAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          
          // Launch confetti
          Animated.parallel([
            Animated.timing(confettiOpacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            ...confettiPositions.map((confetti, index) => {
              // Random direction and distance
              const xDirection = Math.random() > 0.5 ? 1 : -1;
              const xDistance = 30 + Math.random() * 100;
              const yDistance = 50 + Math.random() * 100;
              const rotateAmount = Math.random() * 360;
              
              return Animated.parallel([
                Animated.timing(confetti.x, {
                  toValue: width / 2 + (xDirection * xDistance),
                  duration: 1000 + Math.random() * 500,
                  useNativeDriver: true,
                }),
                Animated.timing(confetti.y, {
                  toValue: 100 - yDistance,
                  duration: 1000 + Math.random() * 500,
                  useNativeDriver: true,
                }),
                Animated.timing(confetti.rotate, {
                  toValue: rotateAmount,
                  duration: 1000 + Math.random() * 500,
                  useNativeDriver: true,
                })
              ]);
            })
          ])
        ]),
        
        // Hold the animation for a moment
        Animated.delay(1000),
        
        // Fade everything out
        Animated.parallel([
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(confettiOpacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          })
        ])
      ]).start(() => {
        // Call the callback when animation is complete
        onAnimationEnd();
      });
    }
  }, [visible]);
  
  // Don't render if not visible
  if (!visible) return null;
  
  // Interpolate price for smooth counting animation
  const animatedPrice = priceAnim.interpolate({
    inputRange: [discountedPrice, originalPrice],
    outputRange: [discountedPrice, originalPrice],
    extrapolate: 'clamp',
  });
  
  // Interpolate sparkles rotation for effect
  const sparklesRotation = sparklesAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.animationContainer,
          { opacity: opacityAnim }
        ]}
      >
        {/* Prix en cours d'animation */}
        <Animated.Text 
          style={[
            styles.priceText,
            {
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          {/* Format the animated value as a string with thousand separators */}
          <Animated.Text>
            {priceAnim.interpolate({
              inputRange: [discountedPrice, originalPrice],
              outputRange: [discountedPrice.toLocaleString(), originalPrice.toLocaleString()],
              extrapolate: 'clamp',
            })}
          </Animated.Text> pts
        </Animated.Text>
        
        {/* Badge de réduction */}
        <Animated.View 
          style={[
            styles.discountBadge,
            { opacity: discountOpacityAnim }
          ]}
        >
          <Text style={styles.discountText}>-{discountPercentage}%</Text>
        </Animated.View>
        
        {/* Sparkles icon avec rotation */}
        <Animated.View
          style={{
            position: 'absolute',
            top: -30,
            transform: [{ rotate: sparklesRotation }],
            opacity: sparklesAnim
          }}
        >
          <Sparkles size={32} color="#FFD700" />
        </Animated.View>
      </Animated.View>
      
      {/* Confetti effect */}
      {confettiPositions.map((confetti, index) => (
        <Animated.View
          key={index}
          style={{
            position: 'absolute',
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#00B14F', '#9B59B6'][index % 5],
            opacity: confettiOpacity,
            transform: [
              { translateX: confetti.x },
              { translateY: confetti.y },
              { rotate: confetti.rotate.interpolate({
                inputRange: [0, 360],
                outputRange: ['0deg', '360deg'],
              })},
              { scale: confetti.scale }
            ]
          }}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    zIndex: 1000,
  },
  animationContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 30,
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  priceText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#00B14F',
    textAlign: 'center',
  },
  discountBadge: {
    position: 'absolute',
    top: -15,
    right: -15,
    backgroundColor: '#FF6B6B',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  discountText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default DiscountAnimation;
