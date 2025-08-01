import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, MapPin, Star, Clock } from 'lucide-react-native';

// Types pour les services de beauté
interface BeautyService {
  id: string;
  name: string;
  emoji: string;
  description: string;
  estimatedDuration: string;
  color: string;
  gradient: string[];
}

// Mock data pour le prestataire (vous pouvez l'adapter selon vos données)
const mockProvider = {
  id: '1',
  name: 'Beauty Palace',
  category: 'Beauté',
  rating: 4.8,
  location: 'Plateau, Abidjan',
  image: 'https://images.pexels.com/photos/3993456/pexels-photo-3993456.jpeg',
  description: 'Salon de beauté moderne offrant des services de coiffure, esthétique et bien-être dans un cadre élégant et relaxant.',
  estimatedTime: '45-75 min'
};

// Services de beauté disponibles
const beautyServices: BeautyService[] = [
  {
    id: 'coiffure',
    name: 'Coiffure',
    emoji: '💇‍♀️',
    description: 'Coupe, coloration, brushing et soins capillaires',
    estimatedDuration: '1h30 - 3h',
    color: '#FF6B9D',
    gradient: ['#FF6B9D', '#C44569']
  },
  {
    id: 'ongles',
    name: 'Ongles',
    emoji: '💅',
    description: 'Manucure, pédicure et nail art professionnel',
    estimatedDuration: '45min - 2h',
    color: '#A8E6CF',
    gradient: ['#A8E6CF', '#88C9A1']
  },
  {
    id: 'soins',
    name: 'Soins',
    emoji: '🧴',
    description: 'Soins du visage, gommages et traitements',
    estimatedDuration: '1h - 2h',
    color: '#FFB347',
    gradient: ['#FFB347', '#FF9A33']
  },
  {
    id: 'maquillage',
    name: 'Maquillage',
    emoji: '💄',
    description: 'Maquillage professionnel pour tous événements',
    estimatedDuration: '45min - 1h30',
    color: '#DDA0DD',
    gradient: ['#DDA0DD', '#BA82BA']
  }
];

export default function BeautyServicesScreen() {
  const { providerId } = useLocalSearchParams();

  const handleServiceSelect = (service: BeautyService) => {
    // Naviguer vers la page de calendrier avec les paramètres du service
    router.push({
      pathname: '/beauty/calendar',
      params: {
        providerId: providerId as string,
        serviceId: service.id,
        serviceName: service.name,
        serviceEmoji: service.emoji,
        providerName: mockProvider.name
      }
    });
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Services de Beauté',
          headerStyle: {
            backgroundColor: '#FAFAFA',
          },
          headerTintColor: '#000',
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
              <Text style={styles.reviewCount}> • 150+ avis</Text>
            </View>
            
            <View style={styles.locationRow}>
              <MapPin size={16} color="#8B5CF6" />
              <Text style={styles.locationText}>{mockProvider.location}</Text>
            </View>

            <View style={styles.timeRow}>
              <Clock size={16} color="#00B14F" />
              <Text style={styles.timeText}>Disponibilité : {mockProvider.estimatedTime}</Text>
            </View>
            
            <Text style={styles.description}>{mockProvider.description}</Text>
          </View>
        </View>

        {/* Titre section */}
        <View style={styles.servicesHeaderSection}>
          <Text style={styles.sectionTitle}>Choisissez votre service</Text>
          <Text style={styles.sectionSubtitle}>
            Sélectionnez le type de prestation que vous souhaitez réserver
          </Text>
        </View>

        {/* Liste des services */}
        <View style={styles.servicesSection}>
          {beautyServices.map((service, index) => (
            <TouchableOpacity 
              key={service.id} 
              style={[
                styles.serviceCard,
                { backgroundColor: service.color + '15' }
              ]}
              onPress={() => handleServiceSelect(service)}
              activeOpacity={0.7}
            >
              <View style={styles.serviceIconContainer}>
                <Text style={styles.serviceEmoji}>{service.emoji}</Text>
              </View>
              
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceDescription}>{service.description}</Text>
                
                <View style={styles.serviceDuration}>
                  <Clock size={14} color="#666" />
                  <Text style={styles.durationText}>{service.estimatedDuration}</Text>
                </View>
              </View>

              <View style={[styles.arrowContainer, { backgroundColor: service.color }]}>
                <Text style={styles.arrow}>→</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Note informative */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>📅 Étape suivante</Text>
          <Text style={styles.infoText}>
            Après avoir sélectionné votre service, vous pourrez choisir votre créneau préféré dans notre calendrier de réservation.
          </Text>
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
    marginBottom: 15,
    borderRadius: 0,
    overflow: 'hidden',
  },
  providerImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  providerInfo: {
    padding: 20,
  },
  providerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  locationText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#00B14F',
    fontWeight: '500',
  },
  description: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  servicesHeaderSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 5,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  servicesSection: {
    paddingHorizontal: 20,
    gap: 15,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  serviceIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  serviceEmoji: {
    fontSize: 30,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 5,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  serviceDuration: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    marginLeft: 5,
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  arrowContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  infoSection: {
    margin: 20,
    padding: 20,
    backgroundColor: '#E8F4FD',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0084FF',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0084FF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
});
