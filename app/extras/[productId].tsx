import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Plus, Minus, ShoppingCart } from 'lucide-react-native';
import { useCart } from '@/contexts/CartContext';
import { ExtraItem, mockExtras } from '@/data/extras';
import { fcfaToPoints } from '@/utils/pointsConversion';

const { width } = Dimensions.get('window');

export default function ExtrasScreen() {
  const { productId, productName, productImage, basePrice, quantity: initialQuantity, providerId, providerName } = useLocalSearchParams<{
    productId: string;
    productName: string;
    productImage: string;
    basePrice: string;
    quantity: string;
    providerId: string;
    providerName: string;
  }>();

  const { addToCart } = useCart();
  const [selectedExtras, setSelectedExtras] = useState<ExtraItem[]>([]);
  const [quantity, setQuantity] = useState(parseInt(initialQuantity || '1'));

  // Obtenir les extras disponibles
  const availableExtras = mockExtras.filter(extra => extra.category === 'accompagnements' || extra.category === 'boissons');

  const toggleExtra = (extra: ExtraItem) => {
    setSelectedExtras(prev => {
      const isSelected = prev.some(item => item.id === extra.id);
      if (isSelected) {
        return prev.filter(item => item.id !== extra.id);
      } else {
        return [...prev, extra];
      }
    });
  };

  const calculateTotalPrice = () => {
    const productTotal = parseFloat(basePrice || '0') * quantity;
    const extrasTotal = selectedExtras.reduce((sum, extra) => sum + extra.price, 0);
    return productTotal + extrasTotal;
  };

  const handleAddToCart = () => {
    const cartItem = {
      productId: productId!,
      productName: productName!,
      productImage: productImage!,
      basePrice: parseFloat(basePrice || '0'),
      quantity: quantity,
      customizations: [],
      extras: selectedExtras,
      totalPrice: calculateTotalPrice(),
      providerId: providerId!,
      providerName: providerName || 'Restaurant',
    };

    addToCart(cartItem);
    
    // Afficher l'alert pour demander si on continue ou va au panier
    Alert.alert(
      'Extras ajoutés !',
      `${selectedExtras.length} extra(s) ont été ajoutés à votre commande.`,
      [
        { 
          text: 'Continuer les achats', 
          onPress: () => {
            // Retourner vers la page du prestataire au lieu de l'accueil
            if (providerId) {
              router.replace({
                pathname: '/order/[providerId]',
                params: { providerId: providerId, returnToModal: 'true' }
              });
            } else {
              router.replace('/');
            }
          }
        },
        { 
          text: 'Voir le panier', 
          onPress: () => router.replace('/?showCart=true') 
        },
      ]
    );
  };

  const handleSkipExtras = () => {
    // Afficher l'alert pour demander si on continue ou va au panier
    Alert.alert(
      'Commande ajoutée !',
      'Votre plat a été ajouté au panier sans extras.',
      [
        { 
          text: 'Continuer les achats', 
          onPress: () => {
            // Retourner vers la page du prestataire au lieu de l'accueil
            if (providerId) {
              router.replace({
                pathname: '/order/[providerId]',
                params: { providerId: providerId, returnToModal: 'true' }
              });
            } else {
              router.replace('/');
            }
          }
        },
        { 
          text: 'Voir le panier', 
          onPress: () => router.replace('/?showCart=true') 
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personnaliser votre commande</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Product Info */}
        <View style={styles.productSection}>
          <Image source={{ uri: productImage }} style={styles.productImage} />
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{productName}</Text>
            <Text style={styles.productPrice}>{fcfaToPoints(parseFloat(basePrice || '0'))} pts</Text>
            <Text style={styles.productPriceFcfa}>{parseFloat(basePrice || '0').toLocaleString()} FCFA</Text>
          </View>
        </View>

        {/* Quantity Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quantité</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Minus size={20} color="#000" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(quantity + 1)}
            >
              <Plus size={20} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Extras Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Extras (Optionnel)</Text>
          <Text style={styles.sectionSubtitle}>Ajoutez des accompagnements à votre plat</Text>
          
          {availableExtras.map((extra) => (
            <TouchableOpacity
              key={extra.id}
              style={styles.extraItem}
              onPress={() => toggleExtra(extra)}
            >
              <Image source={{ uri: extra.image }} style={styles.extraImage} />
              <View style={styles.extraInfo}>
                <Text style={styles.extraName}>{extra.name}</Text>
                <Text style={styles.extraDescription}>{extra.description}</Text>
                <Text style={styles.extraPrice}>+{fcfaToPoints(extra.price)} pts</Text>
                <Text style={styles.extraPriceFcfa}>+{extra.price.toLocaleString()} FCFA</Text>
              </View>
              <View style={[
                styles.checkbox,
                selectedExtras.some(item => item.id === extra.id) && styles.checkboxSelected
              ]}>
                {selectedExtras.some(item => item.id === extra.id) && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomContainer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalPrice}>{fcfaToPoints(calculateTotalPrice())} pts</Text>
          <Text style={styles.totalPriceFcfa}>{calculateTotalPrice().toLocaleString()} FCFA</Text>
        </View>
        
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkipExtras}>
            <Text style={styles.skipButtonText}>Passer les extras</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
            <ShoppingCart size={20} color="#fff" />
            <Text style={styles.addToCartButtonText}>
              Ajouter au panier ({selectedExtras.length} extras)
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  placeholder: {
    width: 34,
  },
  scrollView: {
    flex: 1,
  },
  productSection: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 8,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00B14F',
  },
  productPriceFcfa: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
  },
  extraItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  extraImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 15,
  },
  extraInfo: {
    flex: 1,
  },
  extraName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  extraDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  extraPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00B14F',
  },
  extraPriceFcfa: {
    fontSize: 11,
    color: '#999',
    textDecorationLine: 'line-through',
    marginTop: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DDD',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 15,
  },
  checkboxSelected: {
    backgroundColor: '#00B14F',
    borderColor: '#00B14F',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00B14F',
  },
  totalPriceFcfa: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  addToCartButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    backgroundColor: '#00B14F',
    borderRadius: 8,
    gap: 10,
  },
  addToCartButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
