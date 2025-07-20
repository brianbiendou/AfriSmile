import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Smartphone, CheckCircle, Info } from 'lucide-react-native';
import AllModalsTestSuite from '../components/AllModalsTestSuite';
import { useResponsiveDimensions } from '../hooks/useResponsiveDimensions';

export default function ModalResponsiveTestScreen() {
  const [showTestSuite, setShowTestSuite] = useState(false);
  const dimensions = useResponsiveDimensions();

  const deviceInfo = {
    width: dimensions.width,
    height: dimensions.height,
    aspectRatio: dimensions.aspectRatio,
    isLargeScreen: dimensions.isLargeScreen,
    isTablet: dimensions.isTablet,
    isSamsungS23Ultra: dimensions.isSamsungS23Ultra,
  };

  const getDeviceType = () => {
    if (dimensions.isTablet) return '📱 Tablette';
    if (dimensions.isSamsungS23Ultra) return '📱 Samsung S23 Ultra';
    if (dimensions.isLargeScreen) return '📱 Grand écran';
    return '📱 Écran standard';
  };

  const getOptimizationStatus = () => {
    if (dimensions.isSamsungS23Ultra || dimensions.isLargeScreen) {
      return '✅ Optimisé pour grand écran';
    }
    return '✅ Configuration standard';
  };

  if (showTestSuite) {
    return <AllModalsTestSuite onClose={() => setShowTestSuite(false)} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Test de Responsivité des Modales</Text>
        <Text style={styles.subtitle}>
          Vérifiez l'adaptation automatique sur Samsung S23 Ultra
        </Text>
      </View>

      <View style={styles.content}>
        {/* Device Detection Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Smartphone size={24} color="#00B14F" />
            <Text style={styles.cardTitle}>Détection de l'appareil</Text>
          </View>
          <View style={styles.deviceStats}>
            <Text style={styles.deviceType}>{getDeviceType()}</Text>
            <Text style={styles.optimizationStatus}>{getOptimizationStatus()}</Text>
          </View>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Largeur</Text>
              <Text style={styles.statValue}>{deviceInfo.width}px</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Hauteur</Text>
              <Text style={styles.statValue}>{deviceInfo.height}px</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Ratio</Text>
              <Text style={styles.statValue}>{deviceInfo.aspectRatio.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Status Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <CheckCircle size={24} color="#4ECDC4" />
            <Text style={styles.cardTitle}>Statut des corrections</Text>
          </View>
          <View style={styles.statusList}>
            <Text style={styles.statusItem}>✅ CartModal - Corrigé</Text>
            <Text style={styles.statusItem}>✅ CheckoutModal - Corrigé</Text>
            <Text style={styles.statusItem}>✅ ProviderDetailModal - Corrigé</Text>
            <Text style={styles.statusItem}>✅ WalletModal - Corrigé</Text>
            <Text style={styles.statusItem}>✅ UnsoldProductsModal - Corrigé</Text>
            <Text style={styles.statusItem}>✅ ProductCustomizationModal - Corrigé</Text>
            <Text style={styles.statusItem}>✅ QRCodeModal - Corrigé</Text>
            <Text style={styles.statusItem}>✅ RewardsModal - Corrigé</Text>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Info size={24} color="#FF9500" />
            <Text style={styles.cardTitle}>Améliorations apportées</Text>
          </View>
          <View style={styles.improvementsList}>
            <Text style={styles.improvement}>
              🔧 Hook useResponsiveModalStyles() créé
            </Text>
            <Text style={styles.improvement}>
              📏 Détection automatique Samsung S23 Ultra
            </Text>
            <Text style={styles.improvement}>
              📐 Largeur adaptative : 85% vs 95%
            </Text>
            <Text style={styles.improvement}>
              📏 Taille max augmentée : 450px vs 400px
            </Text>
            <Text style={styles.improvement}>
              🎨 Bordures et ombres améliorées
            </Text>
            <Text style={styles.improvement}>
              📖 Polices plus grandes sur grands écrans
            </Text>
          </View>
        </View>

        {/* Test Button */}
        <TouchableOpacity
          style={styles.testButton}
          onPress={() => setShowTestSuite(true)}
        >
          <Text style={styles.testButtonText}>🧪 Lancer la suite de tests</Text>
        </TouchableOpacity>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>📋 Instructions de test</Text>
          <Text style={styles.instructionsText}>
            1. Lancez la suite de tests{'\n'}
            2. Testez chaque modal individuellement{'\n'}
            3. Vérifiez l'adaptation sur votre Samsung S23 Ultra{'\n'}
            4. Comparez avec d'autres appareils si disponibles
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 10,
  },
  deviceStats: {
    marginBottom: 15,
  },
  deviceType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00B14F',
    marginBottom: 5,
  },
  optimizationStatus: {
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  statusList: {
    gap: 8,
  },
  statusItem: {
    fontSize: 14,
    color: '#00B14F',
    lineHeight: 20,
  },
  improvementsList: {
    gap: 8,
  },
  improvement: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  testButton: {
    backgroundColor: '#00B14F',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#00B14F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  testButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  instructionsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
