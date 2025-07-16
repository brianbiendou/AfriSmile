import {
  View,
  Text,
  StyleSheet,
  Image,
} from 'react-native';
import { type Provider } from '@/data/providers';

interface QRCodeDisplayProps {
  provider: Provider;
  timer: number;
  onExpire: () => void;
}

export default function QRCodeDisplay({ provider, timer, onExpire }: QRCodeDisplayProps) {
  // Génération d'un QR code unique avec timestamp
  const timestamp = Date.now();
  const qrData = `PROVIDER_${provider.id}_DISCOUNT_${provider.discount}_TIME_${timestamp}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>QR Code de réduction</Text>
      <Text style={styles.subtitle}>Présentez ce code au commerçant</Text>
      
      <View style={styles.qrContainer}>
        <Image source={{ uri: qrCodeUrl }} style={styles.qrCode} />
      </View>
      
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>Expire dans {timer}s</Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(timer / 10) * 100}%` }
            ]} 
          />
        </View>
      </View>
      
      <Text style={styles.discountInfo}>
        Réduction de {provider.discount}% applicable
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E8E',
    marginBottom: 20,
  },
  qrContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrCode: {
    width: 150,
    height: 150,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  timerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 8,
  },
  progressBar: {
    width: 150,
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00B14F',
    borderRadius: 2,
  },
  discountInfo: {
    fontSize: 14,
    color: '#00B14F',
    fontWeight: '600',
    textAlign: 'center',
  },
});