import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Smile, Zap, ArrowRight, Coins } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { useEffect, useRef, useState } from 'react';

const { width, height } = Dimensions.get('window');

export default function AppSwitcher() {
  const { currentApp, setCurrentApp } = useApp();
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Animations principales
  const slideAnim = useRef(new Animated.Value(currentApp === 'afrismile' ? 0 : 1)).current;
  const transitionOverlayAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  // Animations des particules de points
  const particleAnims = useRef(
    Array.from({ length: 12 }, () => ({
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
      scale: new Animated.Value(0),
      opacity: new Animated.Value(0),
      rotate: new Animated.Value(0),
    }))
  ).current;
  
  // Animation de la vague
  const waveAnim = useRef(new Animated.Value(0)).current;
  
  // Animation du flash
  const flashAnim = useRef(new Animated.Value(0)).current;
  
  // Animation de morphing
  const morphAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: currentApp === 'afrismile' ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentApp]);

  const startSpectacularTransition = (targetApp: 'afrismile' | 'kolofap') => {
    if (isTransitioning || currentApp === targetApp) return;
    
    setIsTransitioning(true);
    
    // 1. Animation de préparation (0-300ms)
    Animated.parallel([
      // Scale down légèrement
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 200,
        useNativeDriver: true,
      }),
      // Overlay apparaît
      Animated.timing(transitionOverlayAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      // Rotation subtile
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Animation des particules de points (300-1500ms)
    setTimeout(() => {
      const particleAnimations = particleAnims.map((particle, index) => {
        const angle = (index / particleAnims.length) * 2 * Math.PI;
        const radius = 80 + Math.random() * 40;
        const finalX = Math.cos(angle) * radius;
        const finalY = Math.sin(angle) * radius;
        
        return Animated.sequence([
          // Apparition
          Animated.parallel([
            Animated.timing(particle.scale, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(particle.opacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]),
          // Mouvement en spirale
          Animated.parallel([
            Animated.timing(particle.translateX, {
              toValue: finalX,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(particle.translateY, {
              toValue: finalY,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(particle.rotate, {
              toValue: 360 * (2 + Math.random()),
              duration: 800,
              useNativeDriver: true,
            }),
          ]),
          // Convergence vers le centre
          Animated.parallel([
            Animated.timing(particle.translateX, {
              toValue: targetApp === 'kolofap' ? 100 : -100,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(particle.translateY, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(particle.scale, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(particle.opacity, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
        ]);
      });
      
      Animated.parallel(particleAnimations).start();
    }, 300);

    // 3. Animation de vague (800ms)
    setTimeout(() => {
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }, 800);

    // 4. Flash de transition (1200ms)
    setTimeout(() => {
      Animated.sequence([
        Animated.timing(flashAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(flashAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }, 1200);

    // 5. Morphing final (1400ms)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(morphAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: targetApp === 'afrismile' ? 0 : 1,
          duration: 400,
          useNativeDriver: false,
        }),
      ]).start();
    }, 1400);

    // 6. Changement d'app et nettoyage (1800ms)
    setTimeout(() => {
      setCurrentApp(targetApp);
    }, 1600);

    // 7. Animation de sortie (2000ms)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(transitionOverlayAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(morphAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsTransitioning(false);
        // Reset toutes les animations
        particleAnims.forEach(particle => {
          particle.translateX.setValue(0);
          particle.translateY.setValue(0);
          particle.scale.setValue(0);
          particle.opacity.setValue(0);
          particle.rotate.setValue(0);
        });
      });
    }, 2000);
  };

  const switcherWidth = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '50%'],
  });

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '5deg'],
  });

  const waveScale = waveAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1.5, 0],
  });

  const waveOpacity = waveAnim.interpolate({
    inputRange: [0, 0.3, 0.7, 1],
    outputRange: [0, 0.8, 0.8, 0],
  });

  const morphScale = morphAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.1, 1],
  });

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.switcherContainer,
          {
            transform: [
              { scale: scaleAnim },
              { rotate: rotateInterpolate },
            ],
          }
        ]}
      >
        <Animated.View style={[styles.activeBg, { left: switcherWidth }]} />
        
        <TouchableOpacity
          style={[
            styles.appButton,
            currentApp === 'afrismile' && styles.activeButton
          ]}
          onPress={() => startSpectacularTransition('afrismile')}
          disabled={isTransitioning}
        >
          <Animated.View style={{ transform: [{ scale: morphScale }] }}>
            <Smile size={20} color={currentApp === 'afrismile' ? '#fff' : '#00B14F'} />
          </Animated.View>
          <Text style={[
            styles.appButtonText,
            currentApp === 'afrismile' && styles.activeButtonText
          ]}>
            Afrismile
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.appButton,
            currentApp === 'kolofap' && styles.activeButton
          ]}
          onPress={() => startSpectacularTransition('kolofap')}
          disabled={isTransitioning}
        >
          <Animated.View style={{ transform: [{ scale: morphScale }] }}>
            <Zap size={20} color={currentApp === 'kolofap' ? '#fff' : '#6B46C1'} />
          </Animated.View>
          <Text style={[
            styles.appButtonText,
            currentApp === 'kolofap' && styles.activeButtonText
          ]}>
            Kolofap
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Overlay de transition spectaculaire */}
      <Animated.View 
        style={[
          styles.transitionOverlay,
          {
            opacity: transitionOverlayAnim,
            pointerEvents: isTransitioning ? 'auto' : 'none',
          }
        ]}
      >
        {/* Vague de transition */}
        <Animated.View 
          style={[
            styles.wave,
            {
              transform: [{ scale: waveScale }],
              opacity: waveOpacity,
            }
          ]}
        />

        {/* Flash de transition */}
        <Animated.View 
          style={[
            styles.flash,
            {
              opacity: flashAnim,
            }
          ]}
        />

        {/* Particules de points */}
        <View style={styles.particlesContainer}>
          {particleAnims.map((particle, index) => (
            <Animated.View
              key={index}
              style={[
                styles.particle,
                {
                  transform: [
                    { translateX: particle.translateX },
                    { translateY: particle.translateY },
                    { scale: particle.scale },
                    { 
                      rotate: particle.rotate.interpolate({
                        inputRange: [0, 360],
                        outputRange: ['0deg', '360deg'],
                      })
                    },
                  ],
                  opacity: particle.opacity,
                }
              ]}
            >
              <Coins size={16} color="#FFD700" />
            </Animated.View>
          ))}
        </View>

        {/* Flèche de transfert */}
        {isTransitioning && (
          <Animated.View 
            style={[
              styles.transferArrow,
              {
                opacity: transitionOverlayAnim,
                transform: [
                  { 
                    translateX: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-50, 50],
                    })
                  },
                  { scale: morphScale },
                ],
              }
            ]}
          >
            <ArrowRight size={32} color="#FFD700" />
          </Animated.View>
        )}

        {/* Texte de transition */}
        {isTransitioning && (
          <Animated.View 
            style={[
              styles.transitionText,
              {
                opacity: transitionOverlayAnim,
                transform: [{ scale: morphScale }],
              }
            ]}
          >
            <Text style={styles.transitionLabel}>
              Transfert de points en cours...
            </Text>
          </Animated.View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    position: 'relative',
  },
  switcherContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    padding: 4,
    position: 'relative',
    zIndex: 2,
  },
  activeBg: {
    position: 'absolute',
    top: 4,
    width: '50%',
    height: '85%',
    backgroundColor: '#6B46C1',
    borderRadius: 20,
    zIndex: 1,
  },
  appButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    zIndex: 2,
    gap: 8,
  },
  activeButton: {
    // Style géré par l'animation
  },
  appButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeButtonText: {
    color: '#fff',
  },
  transitionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(107, 70, 193, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  wave: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(107, 70, 193, 0.3)',
    borderWidth: 2,
    borderColor: 'rgba(107, 70, 193, 0.5)',
  },
  flash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 215, 0, 0.8)',
  },
  particlesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  transferArrow: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  transitionText: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: 'rgba(107, 70, 193, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  transitionLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});