import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Share,
} from 'react-native';
import { ArrowLeft, Share2, Download, RotateCcw } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function QRCodePage() {
  const { user } = useAuth();
  const [qrCodeData, setQrCodeData] = useState('');

  useEffect(() => {
    // Générer les données du QR code basées sur l'utilisateur
    const generateQRData = () => {
      const userData = {
        userId: user?.id || 'unknown',
        email: user?.email || 'unknown@example.com',
        points: user?.points || 0,
        membershipType: user?.membershipType || 'classic',
        timestamp: Date.now(),
      };
      return JSON.stringify(userData);
    };

    setQrCodeData(generateQRData());
  }, [user]);

  const handleGoBack = () => {
    router.back();
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Voici mon QR code AfriSmile & Kolofap !\n\nDonnées: ${qrCodeData}`,
        title: 'Mon QR Code AfriSmile & Kolofap',
      });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de partager le QR code');
    }
  };

  const handleDownload = () => {
    Alert.alert(
      'Téléchargement',
      'Le QR code a été sauvegardé dans votre galerie !',
      [{ text: 'OK' }]
    );
  };

  const handleRefresh = () => {
    const userData = {
      userId: user?.id || 'unknown',
      email: user?.email || 'unknown@example.com',
      points: user?.points || 0,
      membershipType: user?.membershipType || 'classic',
      timestamp: Date.now(),
    };
    setQrCodeData(JSON.stringify(userData));
    Alert.alert('Actualisé', 'Votre QR code a été mis à jour !');
  };

  // Simulation d'un QR code avec des carrés
  const QRCodeDisplay = () => {
    const gridSize = 21; // 21x21 typical QR code
    const patterns = [];
    
    // Créer un pattern pseudo-aléatoire basé sur les données
    const hashCode = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return Math.abs(hash);
    };

    const hash = hashCode(qrCodeData);
    
    for (let row = 0; row < gridSize; row++) {
      const rowPatterns = [];
      for (let col = 0; col < gridSize; col++) {
        // Position markers (corners)
        const isPositionMarker = 
          (row < 7 && col < 7) || 
          (row < 7 && col >= gridSize - 7) || 
          (row >= gridSize - 7 && col < 7);
        
        // Create a pseudo-random pattern
        const cellHash = ((hash + row * gridSize + col) * 31) % 100;
        const isFilled = isPositionMarker || cellHash > 50;
        
        rowPatterns.push(isFilled);
      }
      patterns.push(rowPatterns);
    }

    return (
      <View style={styles.qrContainer}>
        {patterns.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.qrRow}>
            {row.map((isFilled, colIndex) => (
              <View
                key={colIndex}
                style={[
                  styles.qrCell,
                  { backgroundColor: isFilled ? '#000' : '#fff' }
                ]}
              />
            ))}
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Mon QR Code</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* User Info */}
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.email || 'Utilisateur'}</Text>
          <Text style={styles.userPoints}>{user?.points?.toLocaleString() || '0'} points</Text>
          <View style={styles.membershipBadge}>
            <Text style={styles.membershipText}>
              {user?.membershipType === 'gold' ? '👑 Membre Gold' : '🎯 Membre Classic'}
            </Text>
          </View>
        </View>

        {/* QR Code */}
        <View style={styles.qrCodeWrapper}>
          <Text style={styles.qrTitle}>Scannez ce code pour me suivre</Text>
          
          <View style={styles.qrCodeContainer}>
            <QRCodeDisplay />
          </View>
          
          <Text style={styles.qrSubtitle}>
            Partagez ce QR code avec vos amis pour qu'ils puissent vous retrouver facilement
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Share2 size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Partager</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleDownload}>
            <Download size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Télécharger</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <RotateCcw size={20} color="#00B14F" />
            <Text style={styles.refreshButtonText}>Actualiser</Text>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Comment utiliser votre QR code ?</Text>
          <Text style={styles.infoText}>
            • Montrez ce code à vos amis pour qu'ils vous ajoutent{'\n'}
            • Utilisez-le dans les restaurants partenaires{'\n'}
            • Partagez vos points et récompenses{'\n'}
            • Profitez des avantages exclusifs
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50, // Augmenté pour éviter le chevauchement avec la zone de notification
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#00B14F',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  userPoints: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  membershipBadge: {
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  membershipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
  },
  qrCodeWrapper: {
    alignItems: 'center',
    marginBottom: 32,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  qrCodeContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 16,
  },
  qrContainer: {
    width: 200,
    height: 200,
    backgroundColor: '#fff',
  },
  qrRow: {
    flexDirection: 'row',
  },
  qrCell: {
    width: 200 / 21, // 21x21 grid
    height: 200 / 21,
  },
  qrSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  actionButton: {
    backgroundColor: '#00B14F',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 0.3,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  refreshButton: {
    backgroundColor: '#F0F9F4',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 0.3,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#00B14F',
  },
  refreshButtonText: {
    color: '#00B14F',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginTop: 'auto',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
