import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Smartphone, ShoppingCart, Wallet, Gift, QrCode, Settings, LogOut } from 'lucide-react-native';

// Import all modals
import CartModal from './CartModal';
import CheckoutModal from './CheckoutModal';
import ProviderDetailModal from './ProviderDetailModal';
import SimpleWalletModal from './SimpleWalletModal';
import UnsoldProductsModal from './UnsoldProductsModal';
import ProductCustomizationModal from './ProductCustomizationModal';
import QRCodeModal from './QRCodeModal';
import RewardsModal from './RewardsModal';

// Test data
const mockProduct = {
  id: '1',
  name: 'Thiéboudienne Test',
  description: 'Plat de test pour vérifier la modal de customisation',
  points: 64,  // 5000 FCFA en nouveaux points
  image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
  category: 'Plats',
};

const mockUser = {
  name: 'Test User',
  email: 'test@example.com',
  points: 1915,  // 150000 FCFA en nouveaux points
  balance: 150000,
  totalSavings: 638,  // 50000 FCFA ÷ 78.359 = 638 points
  ordersCount: 15,
};

const mockProvider = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Restaurant Test',
  category: 'Restaurant',
  image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
  rating: 4.5,
  location: 'Abidjan, Plateau',
  discount: 20,
  estimatedTime: '15-25 min',
  description: 'Restaurant de test pour vérifier les modales responsives',
};

interface AllModalsTestSuiteProps {
  onClose: () => void;
}

export default function AllModalsTestSuite({ onClose }: AllModalsTestSuiteProps) {
  // Modal states
  const [showCartModal, setShowCartModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showSimpleWalletModal, setShowSimpleWalletModal] = useState(false);
  const [showUnsoldModal, setShowUnsoldModal] = useState(false);
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showRewardsModal, setShowRewardsModal] = useState(false);

  const modalTests = [
    {
      name: 'CartModal',
      description: 'Modal du panier avec articles',
      icon: ShoppingCart,
      color: '#00B14F',
      onPress: () => setShowCartModal(true),
    },
    {
      name: 'CheckoutModal',
      description: 'Modal de commande et paiement',
      icon: Wallet,
      color: '#4ECDC4',
      onPress: () => setShowCheckoutModal(true),
    },
    {
      name: 'ProviderDetailModal',
      description: 'Détails du prestataire avec QR et menu',
      icon: Settings,
      color: '#FF6B6B',
      onPress: () => setShowProviderModal(true),
    },
    {
      name: 'SimpleWalletModal',
      description: 'Portefeuille simplifié avec rechargement',
      icon: Wallet,
      color: '#6BCF7F',
      onPress: () => setShowSimpleWalletModal(true),
    },
    {
      name: 'UnsoldProductsModal',
      description: 'Produits invendus avec réductions',
      icon: Gift,
      color: '#FF9500',
      onPress: () => setShowUnsoldModal(true),
    },
    {
      name: 'ProductCustomizationModal',
      description: 'Customisation de produits',
      icon: Settings,
      color: '#8E44AD',
      onPress: () => setShowCustomizationModal(true),
    },
    {
      name: 'QRCodeModal',
      description: 'Modal de QR Code',
      icon: QrCode,
      color: '#2C3E50',
      onPress: () => setShowQRModal(true),
    },
    {
      name: 'RewardsModal',
      description: 'Récompenses et historique',
      icon: Gift,
      color: '#E74C3C',
      onPress: () => setShowRewardsModal(true),
    },
  ];

  const handleAddToCart = (product: any, customizations: any[], quantity: number, totalPrice: number) => {
    Alert.alert('Succès', `${product.name} ajouté au panier (${quantity}x - ${totalPrice.toLocaleString()} pts)`);
  };

  const handleCheckout = () => {
    setShowCartModal(false);
    setShowCheckoutModal(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Test Suite - Modales Responsives</Text>
        <Text style={styles.subtitle}>
          Testez toutes les modales sur Samsung S23 Ultra et autres appareils
        </Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Fermer</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📱 Test d'adaptabilité responsive</Text>
          <Text style={styles.infoText}>
            Suite de tests pour les modales principales de l'application. Toutes les modales utilisent useResponsiveModalStyles() pour s'adapter automatiquement aux grands écrans.
          </Text>
          <Text style={styles.infoFeatures}>
            ✅ Modales essentielles uniquement{'\n'}
            ✅ Panier et commandes{'\n'}
            ✅ Portefeuille simplifié{'\n'}
            ✅ Détails prestataires{'\n'}
            ✅ QR Code et récompenses{'\n'}
            ✅ Customisation produits
          </Text>
        </View>

        <View style={styles.modalGrid}>
          {modalTests.map((test, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.modalCard, { borderLeftColor: test.color }]}
              onPress={test.onPress}
            >
              <View style={[styles.modalIcon, { backgroundColor: test.color }]}>
                <test.icon size={20} color="#fff" />
              </View>
              <View style={styles.modalInfo}>
                <Text style={styles.modalName}>{test.name}</Text>
                <Text style={styles.modalDescription}>{test.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.deviceInfo}>
          <Text style={styles.deviceTitle}>🔍 Informations de test</Text>
          <Text style={styles.deviceText}>
            Cette suite teste la responsivité des modales sur différentes tailles d'écran.
            Les styles s'adaptent automatiquement selon la détection du dispositif.
          </Text>
        </View>
      </ScrollView>

      {/* All Modals */}
      <CartModal
        visible={showCartModal}
        onClose={() => setShowCartModal(false)}
        onCheckout={handleCheckout}
      />

      <CheckoutModal
        visible={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
      />

      <ProviderDetailModal
        visible={showProviderModal}
        onClose={() => setShowProviderModal(false)}
        provider={mockProvider}
        userPoints={mockUser.points}
      />

      <SimpleWalletModal
        visible={showSimpleWalletModal}
        onClose={() => setShowSimpleWalletModal(false)}
      />

      <UnsoldProductsModal
        visible={showUnsoldModal}
        onClose={() => setShowUnsoldModal(false)}
        provider={mockProvider}
        userPoints={mockUser.points}
        onAddToCart={handleAddToCart}
      />

      <ProductCustomizationModal
        visible={showCustomizationModal}
        onClose={() => setShowCustomizationModal(false)}
        product={mockProduct}
        onAddToCart={handleAddToCart}
      />

      <QRCodeModal
        visible={showQRModal}
        onClose={() => setShowQRModal(false)}
        user={mockUser}
      />

      <RewardsModal
        visible={showRewardsModal}
        onClose={() => setShowRewardsModal(false)}
        user={mockUser}
      />
    </View>
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
    paddingTop: 40,
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
    marginBottom: 15,
    lineHeight: 22,
  },
  closeButton: {
    backgroundColor: '#00B14F',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#00B14F',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },
  infoFeatures: {
    fontSize: 13,
    color: '#00B14F',
    lineHeight: 18,
    fontFamily: 'monospace',
  },
  modalGrid: {
    gap: 12,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  modalInfo: {
    flex: 1,
  },
  modalName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  deviceInfo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#3498DB',
  },
  deviceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  deviceText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
