import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { X, Smartphone, Crown, CheckCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';

interface GoldPurchaseSimulationProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function GoldPurchaseSimulation({ visible, onClose, onSuccess }: GoldPurchaseSimulationProps) {
  const { updateMembershipType } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<'mtn' | 'orange' | 'moov'>('mtn');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
      setIsProcessing(false);
      setIsSuccess(false);
    }
  }, [visible]);

  const paymentMethods = [
    { id: 'mtn', name: 'MTN Mobile Money', color: '#FFD700', icon: '📱' },
    { id: 'orange', name: 'Orange Money', color: '#FF6600', icon: '🔶' },
    { id: 'moov', name: 'Moov Money', color: '#0066CC', icon: '🔷' },
  ];

  const handlePurchase = async () => {
    setIsProcessing(true);
    
    // Simulation du processus d'achat
    setTimeout(async () => {
      try {
        // Mise à jour du statut membership vers Gold
        await updateMembershipType('gold');
        console.log('✅ Statut membership mis à jour vers Gold');
        
        setIsProcessing(false);
        setIsSuccess(true);
        
        // Animation de succès
        Animated.sequence([
          Animated.timing(successAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.delay(2000),
          Animated.timing(successAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onSuccess();
          onClose();
        });
      } catch (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
        setIsProcessing(false);
        Alert.alert('Erreur', 'Une erreur est survenue lors de la mise à jour de votre statut.');
      }
    }, 3000);
  };

  if (isSuccess) {
    return (
      <Modal visible={visible} transparent={true} animationType="none">
        <View style={styles.overlay}>
          <Animated.View 
            style={[
              styles.successContainer,
              {
                opacity: successAnim,
                transform: [{ scale: successAnim }],
              }
            ]}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.successGradient}
            >
              <CheckCircle size={60} color="#fff" />
              <Text style={styles.successTitle}>Félicitations ! 🎉</Text>
              <Text style={styles.successText}>
                Vous êtes maintenant membre Gold !
              </Text>
              <View style={styles.benefitsContainer}>
                <Text style={styles.benefitText}>✨ Réductions jusqu'à 15%</Text>
                <Text style={styles.benefitText}>👑 Accès VIP aux offres</Text>
                <Text style={styles.benefitText}>🚀 Livraison gratuite</Text>
              </View>
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent={true} animationType="none">
      <Animated.View 
        style={[
          styles.overlay,
          { opacity: fadeAnim }
        ]}
      >
        <Animated.View 
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }],
            }
          ]}
        >
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            style={styles.header}
          >
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#000" />
            </TouchableOpacity>
            
            <Crown size={40} color="#000" />
            <Text style={styles.title}>Abonnement Gold</Text>
            <Text style={styles.subtitle}>1,500 FCFA/mois</Text>
          </LinearGradient>

          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Choisir votre méthode de paiement</Text>
            
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethod,
                  selectedMethod === method.id && styles.selectedMethod
                ]}
                onPress={() => setSelectedMethod(method.id as any)}
              >
                <View style={styles.methodContent}>
                  <Text style={styles.methodIcon}>{method.icon}</Text>
                  <Text style={styles.methodName}>{method.name}</Text>
                </View>
                <View style={[
                  styles.radio,
                  selectedMethod === method.id && styles.radioSelected
                ]} />
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={[
                styles.purchaseButton,
                isProcessing && styles.processingButton
              ]}
              onPress={handlePurchase}
              disabled={isProcessing}
            >
              <LinearGradient
                colors={isProcessing ? ['#9CA3AF', '#6B7280'] : ['#10B981', '#059669']}
                style={styles.buttonGradient}
              >
                <Smartphone size={20} color="#fff" />
                <Text style={styles.buttonText}>
                  {isProcessing ? 'Traitement en cours...' : 'Payer maintenant'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999999999,
    elevation: 9999999999,
  },
  container: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
    marginTop: 5,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedMethod: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  methodContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  radioSelected: {
    borderColor: '#10B981',
    backgroundColor: '#10B981',
  },
  purchaseButton: {
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  processingButton: {
    opacity: 0.7,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  successContainer: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
  },
  successGradient: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 15,
    marginBottom: 10,
  },
  successText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  benefitsContainer: {
    alignItems: 'center',
  },
  benefitText: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 5,
  },
});
