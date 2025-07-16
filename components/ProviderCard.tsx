import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ViewStyle,
} from 'react-native';
import { Star, MapPin } from 'lucide-react-native';
import { type Provider } from '@/data/providers';

interface ProviderCardProps {
  provider: Provider;
  onPress: (provider: Provider) => void;
  style?: ViewStyle;
}

export default function ProviderCard({ provider, onPress, style }: ProviderCardProps) {
  // Calcul du prix avec réduction
  const originalPrice = 5000; // Prix de base exemple
  const discountedPrice = originalPrice * (1 - provider.discount / 100);

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
          
          <View style={styles.priceContainer}>
            <Text style={styles.originalPrice}>{originalPrice.toLocaleString()} FCFA</Text>
            <Text style={styles.discountedPrice}>{Math.round(discountedPrice).toLocaleString()} FCFA</Text>
          </View>
        </View>
        
        <View style={styles.location}>
          <MapPin size={12} color="#8E8E8E" />
          <Text style={styles.locationText}>{provider.location}</Text>
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
    top: 10,
    right: 10,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
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
  priceContainer: {
    alignItems: 'flex-end',
  },
  originalPrice: {
    fontSize: 12,
    color: '#8E8E8E',
    textDecorationLine: 'line-through',
  },
  discountedPrice: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: 'bold',
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
});