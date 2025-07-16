import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { X, QrCode, Star, MapPin, Clock } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { type Provider } from '@/data/providers';
import QRCodeDisplay from '@/components/QRCodeDisplay';

interface ProviderDetailModalProps {
  visible: boolean;
  onClose: () => void;
  provider: Provider | null;
  userPoints: number;
}

const mockServices = [
  { id: '1', name: 'Menu Thiéboudiènne', originalPrice: 3500, pointsPrice: 7000, category: 'Plat principal' },
  { id: '2', name: 'Jus de gingembre', originalPrice: 1000, pointsPrice: 2000, category: 'Boisson' },
  { id: '3', name: 'Salade de fruits', originalPrice: 1500, pointsPrice: 3000, category: 'Dessert' },
  { id: '4', name: 'Poisson braisé', originalPrice: 4000, pointsPrice: 8000, category: 'Plat principal' },
];

export default function ProviderDetailModal({ visible, onClose, provider, userPoints }: ProviderDetailModalProps) {
  const [showQR, setShowQR] = useState(false);
  const [qrTimer, setQrTimer] = useState(15);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showQR && qrTimer > 0) {
      interval = setInterval(() => {
        setQrTimer((prev) => prev - 1);
      }, 1000);
    } else if (qrTimer === 0) {
      setShowQR(false);
      setQrTimer(15);
    }
    return () => clearInterval(interval);
  }, [showQR, qrTimer]);

  const handleShowQR = () => {
    setShowQR(true);
    setQrTimer(15);
  };

  const handleServicePress = (service: any) => {
    const discountedPrice = service.originalPrice * (1 - (provider?.discount || 0) / 100);
    Alert.alert(
      'Commande',
      `${service.name}\nPrix original: ${service.originalPrice.toLocaleString()} FCFA\nPrix avec réduction: ${Math.round(discountedPrice).toLocaleString()} FCFA\nOu ${service.pointsPrice.toLocaleString()} points`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Commander', onPress: () => Alert.alert('Succès', 'Commande ajoutée !') },
      ]
    );
  };

  if (!provider) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <Image source={{ uri: provider.image }} style={styles.headerImage} />
          
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.providerInfo}>
              <Text style={styles.providerName}>{provider.name}</Text>
              <Text style={styles.providerCategory}>{provider.category}</Text>
              
              <View style={styles.infoRow}>
                <View style={styles.rating}>
                  <Star size={16} color="#FFD700" fill="#FFD700" />
                  <Text style={styles.ratingText}>{provider.rating}</Text>
                </View>
                
                <View style={styles.location}>
                  <MapPin size={16} color="#8E8E8E" />
                  <Text style={styles.locationText}>{provider.location}</Text>
                </View>
                
                <View style={styles.discount}>
                  <Text style={styles.discountText}>-{provider.discount}%</Text>
                </View>
              </View>
            </View>

            {/* QR Code Section */}
            <View style={styles.qrSection}>
              {!showQR ? (
                <TouchableOpacity style={styles.qrButton} onPress={handleShowQR}>
                  <QrCode size={24} color="#fff" />
                  <Text style={styles.qrButtonText}>Afficher le QR Code</Text>
                </TouchableOpacity>
              ) : (
                <QRCodeDisplay 
                  provider={provider} 
                  timer={qrTimer}
                  onExpire={() => setShowQR(false)}
                />
              )}
            </View>

            {/* Services */}
            <View style={styles.servicesSection}>
              <Text style={styles.sectionTitle}>Services disponibles</Text>
              {mockServices.map((service) => {
                const discountedPrice = service.originalPrice * (1 - provider.discount / 100);
                return (
                  <TouchableOpacity
                    key={service.id}
                    style={styles.serviceCard}
                    onPress={() => handleServicePress(service)}
                  >
                    <View style={styles.serviceInfo}>
                      <Text style={styles.serviceName}>{service.name}</Text>
                      <Text style={styles.serviceCategory}>{service.category}</Text>
                      
                      <View style={styles.priceRow}>
                        <View style={styles.priceContainer}>
                          <Text style={styles.originalPrice}>
                            {service.originalPrice.toLocaleString()} FCFA
                          </Text>
                          <Text style={styles.discountedPrice}>
                            {Math.round(discountedPrice).toLocaleString()} FCFA
                          </Text>
                        </View>
                        
                        <View style={styles.pointsContainer}>
                          <Text style={styles.pointsPrice}>
                            {service.pointsPrice.toLocaleString()} pts
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  closeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  headerImage: {
    width: '100%',
    height: 200,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  providerInfo: {
    marginBottom: 20,
  },
  providerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  providerCategory: {
    fontSize: 16,
    color: '#8E8E8E',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
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
  location: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#8E8E8E',
  },
  discount: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  qrSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  qrButton: {
    backgroundColor: '#00B14F',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  qrButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  servicesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  serviceCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  serviceCategory: {
    fontSize: 14,
    color: '#8E8E8E',
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  originalPrice: {
    fontSize: 12,
    color: '#8E8E8E',
    textDecorationLine: 'line-through',
  },
  discountedPrice: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  pointsContainer: {
    backgroundColor: '#00B14F',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pointsPrice: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});