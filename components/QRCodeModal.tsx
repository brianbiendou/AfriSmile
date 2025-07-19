import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { X, Download, Share } from 'lucide-react-native';
import { Alert } from 'react-native';
import { useEffect, useRef } from 'react';

interface QRCodeModalProps {
  visible: boolean;
  onClose: () => void;
  user: {
    name: string;
    points: number;
  };
}

export default function QRCodeModal({ visible, onClose, user }: QRCodeModalProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
    }
  }, [visible]);

  const handleDownload = () => {
    Alert.alert('Téléchargement', 'QR Code sauvegardé dans votre galerie');
  };

  const handleShare = () => {
    Alert.alert('Partage', 'Fonctionnalité de partage bientôt disponible');
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleOverlayPress = () => {
    handleClose();
  };

  // QR Code généré avec une API gratuite
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=USER_${user.name.replace(' ', '_')}_POINTS_${user.points}`;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={handleOverlayPress}
      >
        <Animated.View 
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }
          ]}
          onStartShouldSetResponder={() => true}
          onResponderGrant={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Mon QR Code</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color="#8E8E8E" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.subtitle}>
              Présentez ce code au commerçant pour bénéficier de vos réductions
            </Text>

            <View style={styles.qrContainer}>
              <Image source={{ uri: qrCodeUrl }} style={styles.qrCode} />
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userPoints}>
                {user.points.toLocaleString()} points disponibles
              </Text>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionButton} onPress={handleDownload}>
                <Download size={20} color="#00B14F" />
                <Text style={styles.actionText}>Télécharger</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                <Share size={20} color="#00B14F" />
                <Text style={styles.actionText}>Partager</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.warning}>
              ⚠️ Ce QR code est personnel et ne doit pas être partagé
            </Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  closeButton: {
    padding: 5,
  },
  content: {
    alignItems: 'center',
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E8E',
    textAlign: 'center',
    marginBottom: 30,
  },
  qrContainer: {
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  qrCode: {
    width: 200,
    height: 200,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  userPoints: {
    fontSize: 16,
    color: '#00B14F',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9F4',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  actionText: {
    color: '#00B14F',
    fontSize: 14,
    fontWeight: '600',
  },
  warning: {
    fontSize: 12,
    color: '#FF6B6B',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});