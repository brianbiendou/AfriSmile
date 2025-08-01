import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Alert,
  ScrollView,
  Share as RNShare,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { ArrowLeft, Download, Share, QrCode } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function QRCodeScreen() {
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  // Auth context
  const { user: authUser } = useAuth();
  
  // User data
  const user = {
    name: authUser ? `${authUser.first_name} ${authUser.last_name}` : 'Utilisateur',
    points: authUser?.points || 0,
  };

  // Animation d'entrée
  useEffect(() => {
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
  }, []);

  const handleDownload = () => {
    // Simulation de téléchargement
    Alert.alert(
      'Téléchargement',
      'Votre QR code a été enregistré dans votre galerie.',
      [{ text: 'OK' }]
    );
  };

  const handleShare = async () => {
    try {
      await RNShare.share({
        message: `Mon code QR personnel AfriSmile. Scannez pour me trouver et bénéficier d'avantages exclusifs!`,
        title: 'Mon QR Code AfriSmile',
      });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de partager le QR code');
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" translucent />
      <Stack.Screen
        options={{
          headerShown: false, // Désactiver le header par défaut
        }}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header personnalisé qui bouge avec le scroll */}
        <View style={styles.customHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mon QR Code</Text>
          <View style={styles.headerSpacer} />
        </View>
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.qrContainer}>
            <View style={styles.qrHeader}>
              <Text style={styles.qrDescription}>
                Scannez ce code pour accéder rapidement à votre profil et bénéficier de 
                réductions exclusives
              </Text>
            </View>
            
            <View style={styles.qrCodeWrapper}>
              <View style={styles.qrCorner} />
              <View style={[styles.qrCorner, styles.topRight]} />
              <View style={[styles.qrCorner, styles.bottomLeft]} />
              <View style={[styles.qrCorner, styles.bottomRight]} />
              
              {/* QR code généré dynamiquement */}
              <View style={styles.qrCodeGenerated}>
                {/* Simuler l'affichage d'un QR code avec des éléments View */}
                <View style={styles.qrInnerPattern} />
                <View style={[styles.qrInnerPattern, { top: 20, left: 120 }]} />
                <View style={[styles.qrInnerPattern, { bottom: 20, left: 20 }]} />
              </View>
              
              <View style={styles.qrLogo}>
                <Text style={styles.logoText}>AfriSmile</Text>
              </View>
            </View>
            
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userId}>ID: AFRI-{authUser?.id || '000000'}</Text>
            
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleDownload}
              >
                <Download size={20} color="#00B14F" />
                <Text style={styles.actionText}>Télécharger</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleShare}
              >
                <Share size={20} color="#00B14F" />
                <Text style={styles.actionText}>Partager</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <QrCode size={24} color="#00B14F" />
            </View>
            <Text style={styles.infoTitle}>Comment utiliser mon QR Code?</Text>
            <Text style={styles.infoDescription}>
              Présentez ce QR Code lors de vos achats chez nos partenaires pour:
            </Text>
            <View style={styles.bulletPoints}>
              <View style={styles.bulletPoint}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>
                  Identifier rapidement votre compte
                </Text>
              </View>
              <View style={styles.bulletPoint}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>
                  Accéder à vos réductions personnalisées
                </Text>
              </View>
              <View style={styles.bulletPoint}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>
                  Cumuler des points de fidélité automatiquement
                </Text>
              </View>
              <View style={styles.bulletPoint}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>
                  Bénéficier de promotions exclusives
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16,
    backgroundColor: '#FAFAFA',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  headerSpacer: {
    width: 40, // Même largeur que le bouton back pour centrer le titre
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
  },
  qrContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    marginBottom: 20,
  },
  qrHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  qrTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  qrDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  qrCodeWrapper: {
    position: 'relative',
    width: 250,
    height: 250,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  qrCorner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#00B14F',
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  topRight: {
    left: undefined,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    top: undefined,
    bottom: 0,
    borderTopWidth: 0,
    borderLeftWidth: 3,
    borderBottomWidth: 3,
  },
  bottomRight: {
    top: undefined,
    left: undefined,
    right: 0,
    bottom: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 3,
    borderBottomWidth: 3,
  },
  qrCode: {
    width: 200,
    height: 200,
  },
  qrCodeGenerated: {
    width: 200,
    height: 200,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
  },
  qrInnerPattern: {
    width: 60,
    height: 60,
    backgroundColor: '#00B14F',
    position: 'absolute',
    top: 20,
    left: 20,
    borderRadius: 10,
  },
  qrLogo: {
    position: 'absolute',
    width: 50,
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  logoText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#00B14F',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 10,
  },
  userId: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 177, 79, 0.1)',
    borderRadius: 8,
  },
  actionText: {
    marginLeft: 8,
    color: '#00B14F',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  infoIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 177, 79, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
  },
  infoDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 15,
  },
  bulletPoints: {
    width: '100%',
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00B14F',
    marginRight: 10,
  },
  bulletText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
});
