import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useState } from 'react';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, MapPin, Star, Clock, Calendar } from 'lucide-react-native';
import { useCart } from '@/contexts/CartContext';

// Mock data pour les prestations beauté
const mockBeautyServices = [
  {
    id: '1',
    name: 'Coiffure Complète',
    description: 'Shampoing, coupe, brushing et mise en forme',
    duration: '2h',
    points: 96, // 7500 FCFA ÷ 78.359
    fcfaPrice: 7500,
    image: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg',
    category: 'Coiffure'
  },
  {
    id: '2',
    name: 'Manucure Française',
    description: 'Soin des ongles avec vernis français classique',
    duration: '1h30',
    points: 64, // 5000 FCFA ÷ 78.359
    fcfaPrice: 5000,
    image: 'https://images.pexels.com/photos/3997379/pexels-photo-3997379.jpeg',
    category: 'Ongles'
  },
  {
    id: '3',
    name: 'Soin Visage Complet',
    description: 'Nettoyage, gommage, masque et hydratation',
    duration: '1h15',
    points: 77, // 6000 FCFA ÷ 78.359
    fcfaPrice: 6000,
    image: 'https://images.pexels.com/photos/3985322/pexels-photo-3985322.jpeg',
    category: 'Soins'
  },
  {
    id: '4',
    name: 'Maquillage Événement',
    description: 'Maquillage professionnel pour événements spéciaux',
    duration: '1h',
    points: 89, // 7000 FCFA ÷ 78.359
    fcfaPrice: 7000,
    image: 'https://images.pexels.com/photos/3997394/pexels-photo-3997394.jpeg',
    category: 'Maquillage'
  }
];

// Mock data pour le prestataire (vous pouvez l'adapter selon vos données)
const mockProvider = {
  id: '1',
  name: 'Salon Belle Époque',
  category: 'Beauté',
  rating: 4.8,
  location: 'Plateau, Abidjan',
  image: 'https://images.pexels.com/photos/3993456/pexels-photo-3993456.jpeg',
  description: 'Salon de beauté moderne offrant des services de coiffure, esthétique et bien-être dans un cadre élégant et relaxant.',
  phone: '+225 07 12 34 56 78',
  address: 'Rue des Jardins, Plateau, Abidjan',
  openingHours: 'Lun-Sam: 8h00-19h00, Dim: 10h00-17h00'
};

export default function BeautyBookingScreen() {
  const { providerId } = useLocalSearchParams();
  const [selectedService, setSelectedService] = useState<any>(null);
  const { addToCart } = useCart();

  const handleServiceSelect = (service: any) => {
    setSelectedService(service);
    // Ajouter directement au panier puis naviguer vers le calendrier
    const cartItemId = addToCart({
      productId: service.id,
      productName: service.name,
      productImage: service.image,
      basePrice: service.points,
      quantity: 1,
      customizations: [{
        categoryId: 'booking',
        categoryName: 'Service de beauté',
        selectedOptions: [{
          id: 'service',
          name: `${service.name} (${service.duration})`,
          price: 0
        }]
      }],
      totalPrice: service.points,
      providerId: providerId as string,
      providerName: mockProvider.name
    });

    // Montrer une alert pour confirmer et aller au panier
    Alert.alert(
      'Service sélectionné',
      `${service.name} a été ajouté au panier. Vous pourrez finaliser votre réservation lors du paiement.`,
      [
        {
          text: 'Continuer',
          style: 'cancel',
        },
        {
          text: 'Voir le panier',
          style: 'default',
          onPress: () => {
            router.push('/cart');
          }
        }
      ]
    );
  };

  const categories = [...new Set(mockBeautyServices.map(service => service.category))];

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Réservation',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color="#000" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Informations du salon */}
        <View style={styles.providerSection}>
          <Image source={{ uri: mockProvider.image }} style={styles.providerImage} />
          <View style={styles.providerInfo}>
            <Text style={styles.providerName}>{mockProvider.name}</Text>
            
            <View style={styles.ratingRow}>
              <Star size={16} color="#FFD700" fill="#FFD700" />
              <Text style={styles.ratingText}>{mockProvider.rating}</Text>
            </View>
            
            <View style={styles.locationRow}>
              <MapPin size={16} color="#8B5CF6" />
              <Text style={styles.locationText}>{mockProvider.location}</Text>
            </View>
            
            <Text style={styles.description}>{mockProvider.description}</Text>
            
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Informations pratiques</Text>
              <Text style={styles.infoText}>📍 {mockProvider.address}</Text>
              <Text style={styles.infoText}>📞 {mockProvider.phone}</Text>
              <Text style={styles.infoText}>🕐 {mockProvider.openingHours}</Text>
            </View>
          </View>
        </View>

        {/* Liste des prestations par catégorie */}
        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>Nos Prestations</Text>
          
          {categories.map((category) => (
            <View key={category} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{category}</Text>
              
              {mockBeautyServices
                .filter(service => service.category === category)
                .map((service) => (
                  <TouchableOpacity 
                    key={service.id} 
                    style={styles.serviceCard}
                    onPress={() => handleServiceSelect(service)}
                    activeOpacity={0.7}
                  >
                    <Image source={{ uri: service.image }} style={styles.serviceImage} />
                    
                    <View style={styles.serviceInfo}>
                      <Text style={styles.serviceName}>{service.name}</Text>
                      <Text style={styles.serviceDescription}>{service.description}</Text>
                      
                      <View style={styles.serviceDetails}>
                        <View style={styles.durationContainer}>
                          <Clock size={14} color="#8B5CF6" />
                          <Text style={styles.duration}>{service.duration}</Text>
                        </View>
                        
                        <View style={styles.priceContainer}>
                          <Text style={styles.fcfaPrice}>{service.fcfaPrice.toLocaleString()} FCFA</Text>
                          <Text style={styles.pointsPrice}>{service.points} pts</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  providerSection: {
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  providerImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  providerInfo: {
    padding: 20,
  },
  providerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 10,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  locationText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: '#F8F4FF',
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  servicesSection: {
    backgroundColor: '#fff',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 20,
    textAlign: 'center',
  },
  categorySection: {
    marginBottom: 25,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 15,
    paddingBottom: 5,
    borderBottomWidth: 2,
    borderBottomColor: '#8B5CF6',
  },
  serviceCard: {
    flexDirection: 'row',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 5,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  serviceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  duration: {
    marginLeft: 5,
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  fcfaPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  pointsPrice: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: 'bold',
  },
});
