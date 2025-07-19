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
import { type ProviderCompat } from '@/data/providers';
import { useEffect, useRef } from 'react';

interface ProviderCardProps {
  provider: ProviderCompat;
  onPress: (provider: ProviderCompat) => void;
  style?: ViewStyle;
}

export default function ProviderCard({ provider, onPress, style }: ProviderCardProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animation de pulsation subtile pour le badge de réduction
    if (provider.discount > 0) {
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

      pulseAnimation.start();

      return () => {
        pulseAnimation.stop();
      };
    }
  }, [provider.discount]);
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
            <Star size={8} color="#FFD700" fill="#FFD700" />
            <Text style={styles.ratingText}>{provider.rating}</Text>
          </View>
          
          <View style={styles.deliveryContainer}>
            <View style={styles.deliveryBackground}>
              <Text style={styles.deliveryText}>
                🚀 Livraison {provider.estimatedTime}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.location}>
          <MapPin size={7} color="#8E8E8E" />
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
    borderRadius: 10, // 16 * 0.6 = 9.6 ≈ 10
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, // 2 * 0.6 = 1.2 ≈ 1
    shadowOpacity: 0.1,
    shadowRadius: 5, // 8 * 0.6 = 4.8 ≈ 5
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 90, // 150 * 0.6 = 90
  },
  discountBadge: {
    position: 'absolute',
    top: 7, // 12 * 0.6 = 7.2 ≈ 7
    right: 7, // 12 * 0.6 = 7.2 ≈ 7
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 7, // 12 * 0.6 = 7.2 ≈ 7
    paddingVertical: 4, // 6 * 0.6 = 3.6 ≈ 4
    borderRadius: 12, // 20 * 0.6 = 12
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, // 2 * 0.6 = 1.2 ≈ 1
    shadowOpacity: 0.2,
    shadowRadius: 2, // 4 * 0.6 = 2.4 ≈ 2
    elevation: 4,
  },
  discountText: {
    color: '#fff',
    fontSize: 8, // 14 * 0.6 = 8.4 ≈ 8
    fontWeight: 'bold',
  },
  content: {
    padding: 9, // 15 * 0.6 = 9
  },
  name: {
    fontSize: 10, // 16 * 0.6 = 9.6 ≈ 10
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 2, // 4 * 0.6 = 2.4 ≈ 2
  },
  category: {
    fontSize: 8, // 14 * 0.6 = 8.4 ≈ 8
    color: '#8E8E8E',
    marginBottom: 5, // 8 * 0.6 = 4.8 ≈ 5
  },
  info: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4, // 6 * 0.6 = 3.6 ≈ 4
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 2, // 4 * 0.6 = 2.4 ≈ 2
    fontSize: 8, // 14 * 0.6 = 8.4 ≈ 8
    color: '#000',
    fontWeight: '500',
  },
  estimatedTime: {
    fontSize: 8, // 14 * 0.6 = 8.4 ≈ 8
    color: '#8E8E8E',
    fontWeight: '500',
  },
  deliveryContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  deliveryBackground: {
    backgroundColor: '#E8F5E8', // Vert clair
    paddingHorizontal: 5, // 8 * 0.6 = 4.8 ≈ 5
    paddingVertical: 2, // 4 * 0.6 = 2.4 ≈ 2
    borderRadius: 7, // 12 * 0.6 = 7.2 ≈ 7
    borderWidth: 1,
    borderColor: '#00B14F', // Vert vif
    position: 'relative',
    overflow: 'hidden',
  },
  deliveryText: {
    fontSize: 7, // 11 * 0.6 = 6.6 ≈ 7
    color: '#00B14F', // Vert vif
    fontWeight: 'bold',
    textAlign: 'center',
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 2, // 4 * 0.6 = 2.4 ≈ 2
    fontSize: 7, // 12 * 0.6 = 7.2 ≈ 7
    color: '#8E8E8E',
  },
  discountInfo: {
    marginTop: 5, // 8 * 0.6 = 4.8 ≈ 5
  },
  discountInfoText: {
    fontSize: 8, // 14 * 0.6 = 8.4 ≈ 8
    color: '#00B14F',
    fontWeight: '600',
  },
});