import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ViewStyle,
  Animated,
} from 'react-native';
import { Star, MapPin } from 'lucide-react-native';
import { type Provider } from '@/data/providers';
import { useEffect, useRef } from 'react';

interface ProviderCardProps {
  provider: Provider;
  onPress: (provider: Provider) => void;
  style?: ViewStyle;
}

export default function ProviderCard({ provider, onPress, style }: ProviderCardProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  // Calcul des économies basé sur le pourcentage de réduction
  const calculateSavings = (discount: number) => {
    // Génération de montants aléatoires non ronds se terminant par 0
    const minAmount = 1000;
    const maxAmount = 6000;
    
    // Générer un nombre aléatoire entre min et max
    const randomAmount = Math.floor(Math.random() * (maxAmount - minAmount + 1)) + minAmount;
    
    // Ajuster selon le pourcentage de réduction (plus de réduction = plus d'économies)
    const adjustedAmount = Math.floor(randomAmount * (discount / 20)); // Base 20% comme référence
    
    // S'assurer que le dernier chiffre est 0 (arrondir à la dizaine)
    return Math.floor(adjustedAmount / 10) * 10;
  };

  const savingsAmount = calculateSavings(provider.discount);

  useEffect(() => {
    // Animation de pulsation subtile
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    // Animation de shimmer
    const shimmerAnimation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    );

    pulseAnimation.start();
    shimmerAnimation.start();

    return () => {
      pulseAnimation.stop();
      shimmerAnimation.stop();
    };
  }, []);

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });
  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={() => onPress(provider)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: provider.image }} style={styles.image} />
        {provider.discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{provider.discount}%</Text>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {provider.name}
        </Text>
        <Text style={styles.category}>{provider.category}</Text>
        
        <View style={styles.info}>
          <View style={styles.rating}>
            <Star size={14} color="#FFD700" fill="#FFD700" />
            <Text style={styles.ratingText}>{provider.rating}</Text>
          </View>
          
          <Animated.View 
            style={[
              styles.savingsContainer,
              { transform: [{ scale: pulseAnim }] }
            ]}
          >
            <View style={styles.savingsBackground}>
              <Animated.View 
                style={[
                  styles.shimmerOverlay,
                  {
                    transform: [{ translateX: shimmerTranslate }],
                  }
                ]} 
              />
              <Text style={styles.savingsText}>
                Jusqu'à {savingsAmount.toLocaleString()} FCFA de réduction
              </Text>
            </View>
          </Animated.View>
        </View>
        
        <View style={styles.location}>
          <MapPin size={12} color="#8E8E8E" />
          <Text style={styles.locationText}>{provider.location}</Text>
        </View>
        
        <View style={styles.discountInfo}>
          <Text style={styles.discountInfoText}>
            ({provider.discount}% de réduction)
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 150,
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  discountText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    padding: 15,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: '#8E8E8E',
    marginBottom: 8,
  },
  info: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  estimatedTime: {
    fontSize: 14,
    color: '#8E8E8E',
    fontWeight: '500',
  },
  savingsContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  savingsBackground: {
    backgroundColor: '#FFF3E0', // Orange clair
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF9800', // Orange vif
    position: 'relative',
    overflow: 'hidden',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    width: 30,
  },
  savingsText: {
    fontSize: 11,
    color: '#FF9800', // Orange vif
    fontWeight: 'bold',
    textAlign: 'center',
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#8E8E8E',
  },
  discountInfo: {
    marginTop: 8,
  },
  discountInfoText: {
    fontSize: 14,
    color: '#00B14F',
    fontWeight: '600',
  },
});