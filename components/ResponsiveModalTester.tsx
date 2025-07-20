import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { Monitor, Smartphone, TabletSmartphone, CheckCircle, AlertTriangle } from 'lucide-react-native';
import CartModal from './CartModal';
import ProviderDetailModal from './ProviderDetailModal';
import CheckoutModal from './CheckoutModal';
import WalletModal from './WalletModal';
import { mockProviders } from '@/data/providers';
import { useAuth } from '@/contexts/AuthContext';

const { width, height } = Dimensions.get('window');

const ResponsiveModalTester: React.FC = () => {
  const [showCartModal, setShowCartModal] = useState(false);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const { user } = useAuth();

  const deviceInfo = {
    width,
    height,
    aspectRatio: (height / width).toFixed(2),
    type: width >= 768 ? 'Tablette' : width > 400 ? 'Grand téléphone' : 'Téléphone standard',
    isSamsungS23Ultra: width > 380 && width < 420 && height / width > 2.1,
  };

  const testModal = (modalName: string, setter: (show: boolean) => void) => {
    Alert.alert(
      `Test ${modalName}`,
      `Ouvrir ${modalName} pour tester l'affichage sur votre appareil ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Tester', onPress: () => setter(true) }
      ]
    );
  };

  const getStatusIcon = () => {
    if (deviceInfo.isSamsungS23Ultra) {
      return <AlertTriangle size={24} color="#FF9500" />;
    } else if (width > 400) {
      return <CheckCircle size={24} color="#00B14F" />;
    } else {
      return <Smartphone size={24} color="#666" />;
    }
  };

  const getStatusMessage = () => {
    if (deviceInfo.isSamsungS23Ultra) {
      return "Samsung S23 Ultra détecté - Correctifs responsifs appliqués !";
    } else if (width > 400) {
      return "Grand écran détecté - Optimisations appliquées";
    } else {
      return "Écran standard - Styles par défaut";
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* En-tête avec info appareil */}
      <View style={styles.deviceCard}>
        <View style={styles.deviceHeader}>
          {getStatusIcon()}
          <Text style={styles.deviceTitle}>Test Modales Responsives</Text>
        </View>
        
        <View style={styles.deviceInfo}>
          <Text style={styles.infoLabel}>Appareil:</Text>
          <Text style={styles.infoValue}>{deviceInfo.type}</Text>
        </View>
        
        <View style={styles.deviceInfo}>
          <Text style={styles.infoLabel}>Dimensions:</Text>
          <Text style={styles.infoValue}>{width} × {height} px</Text>
        </View>
        
        <View style={styles.deviceInfo}>
          <Text style={styles.infoLabel}>Ratio:</Text>
          <Text style={styles.infoValue}>{deviceInfo.aspectRatio}</Text>
        </View>
        
        <View style={styles.statusContainer}>
          <Text style={[
            styles.statusText,
            { color: deviceInfo.isSamsungS23Ultra ? '#FF9500' : width > 400 ? '#00B14F' : '#666' }
          ]}>
            {getStatusMessage()}
          </Text>
        </View>
      </View>

      {/* Tests des modales */}
      <View style={styles.testsSection}>
        <Text style={styles.sectionTitle}>🧪 Tests des Modales</Text>
        <Text style={styles.sectionSubtitle}>
          Testez chaque modale pour vérifier l'affichage sur votre appareil
        </Text>

        <TouchableOpacity 
          style={styles.testButton} 
          onPress={() => testModal('Panier', setShowCartModal)}
        >
          <Text style={styles.testButtonText}>🛒 Tester CartModal</Text>
          <Text style={styles.testButtonDesc}>Modal de panier d'achat</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.testButton} 
          onPress={() => testModal('Détails Prestataire', setShowProviderModal)}
        >
          <Text style={styles.testButtonText}>🏪 Tester ProviderDetailModal</Text>
          <Text style={styles.testButtonDesc}>Modal détails prestataire</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.testButton} 
          onPress={() => testModal('Commande', setShowCheckoutModal)}
        >
          <Text style={styles.testButtonText}>💳 Tester CheckoutModal</Text>
          <Text style={styles.testButtonDesc}>Modal de commande/paiement</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.testButton} 
          onPress={() => testModal('Portefeuille', setShowWalletModal)}
        >
          <Text style={styles.testButtonText}>💰 Tester WalletModal</Text>
          <Text style={styles.testButtonDesc}>Modal de portefeuille</Text>
        </TouchableOpacity>
      </View>

      {/* Guide de test */}
      <View style={styles.guideSection}>
        <Text style={styles.sectionTitle}>📋 Guide de Test</Text>
        
        <View style={styles.guideItem}>
          <Text style={styles.guideNumber}>1.</Text>
          <Text style={styles.guideText}>Cliquez sur chaque bouton de test</Text>
        </View>
        
        <View style={styles.guideItem}>
          <Text style={styles.guideNumber}>2.</Text>
          <Text style={styles.guideText}>Vérifiez que la modale s'affiche correctement</Text>
        </View>
        
        <View style={styles.guideItem}>
          <Text style={styles.guideNumber}>3.</Text>
          <Text style={styles.guideText}>Testez le défilement et les interactions</Text>
        </View>
        
        <View style={styles.guideItem}>
          <Text style={styles.guideNumber}>4.</Text>
          <Text style={styles.guideText}>Fermez la modale et testez la suivante</Text>
        </View>
      </View>

      {/* Problèmes résolus */}
      {deviceInfo.isSamsungS23Ultra && (
        <View style={styles.fixesSection}>
          <Text style={styles.sectionTitle}>✅ Correctifs Appliqués</Text>
          
          <View style={styles.fixItem}>
            <CheckCircle size={16} color="#00B14F" />
            <Text style={styles.fixText}>Largeur modale adaptée aux grands écrans</Text>
          </View>
          
          <View style={styles.fixItem}>
            <CheckCircle size={16} color="#00B14F" />
            <Text style={styles.fixText}>Hauteur maximale ajustée pour écrans allongés</Text>
          </View>
          
          <View style={styles.fixItem}>
            <CheckCircle size={16} color="#00B14F" />
            <Text style={styles.fixText}>Padding et marges optimisés</Text>
          </View>
          
          <View style={styles.fixItem}>
            <CheckCircle size={16} color="#00B14F" />
            <Text style={styles.fixText}>Tailles de police agrandies</Text>
          </View>
        </View>
      )}

      {/* Modales de test */}
      <CartModal
        visible={showCartModal}
        onClose={() => setShowCartModal(false)}
        onCheckout={() => {
          setShowCartModal(false);
          setShowCheckoutModal(true);
        }}
      />

      <ProviderDetailModal
        visible={showProviderModal}
        onClose={() => setShowProviderModal(false)}
        provider={mockProviders[0]}
        userPoints={user?.points || 1021} // 80000 FCFA ÷ 78.359 = 1021 points
      />

      <CheckoutModal
        visible={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
      />

      <WalletModal
        visible={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        user={user}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  deviceCard: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: width > 400 ? '#00B14F' : '#666',
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 12,
  },
  deviceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  deviceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  statusContainer: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#F0F9F4',
    borderRadius: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  testsSection: {
    margin: 20,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  testButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  testButtonDesc: {
    fontSize: 14,
    color: '#666',
  },
  guideSection: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
  },
  guideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  guideNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00B14F',
    width: 20,
  },
  guideText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  fixesSection: {
    backgroundColor: '#F0FDF4',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  fixItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  fixText: {
    fontSize: 14,
    color: '#166534',
    flex: 1,
  },
});

export default ResponsiveModalTester;
