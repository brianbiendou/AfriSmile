import React, { createContext, useContext, useState, useEffect } from 'react';
import storage from '@/utils/storage';
import { ExtraItem } from '@/data/extras';
import { useOrders } from './OrdersContext';

interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  basePrice: number;
  quantity: number;
  customizations: {
    categoryId: string;
    categoryName: string;
    selectedOptions: {
      id: string;
      name: string;
      price: number;
    }[];
  }[];
  extras?: ExtraItem[];
  couponCode?: string;
  couponDiscount?: number;
  totalPrice: number;
  providerId: string;
  providerName: string;
  // Informations spécifiques aux réservations beauté
  bookingDate?: string; // Date de la réservation (format ISO)
  bookingTime?: string; // Heure de la réservation (ex: "14:30")
  serviceType?: string; // Type de service (coiffure, ongles, etc.)
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (item: Omit<CartItem, 'id'>) => string; // Retourne l'ID du nouvel élément
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateItemExtras: (itemId: string, extras: ExtraItem[]) => void;
  applyCoupon: (itemId: string, code: string, discount: number) => void;
  removeCoupon: (itemId: string) => void;
  clearCart: () => void;
  getCartItemsByProvider: (providerId: string) => CartItem[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const savedCart = await storage.getItem('cart');
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        }
      } catch (error) {
        console.error('Error loading cart from storage:', error);
      }
    };
    loadCart();
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    const saveCart = async () => {
      try {
        await storage.setItem('cart', JSON.stringify(cartItems));
      } catch (error) {
        console.error('Error saving cart to storage:', error);
      }
    };
    saveCart();
  }, [cartItems]);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + item.totalPrice, 0);

  const addToCart = (newItem: Omit<CartItem, 'id'>) => {
    const itemId = `${newItem.productId}_${Date.now()}_${Math.random()}`;
    
    setCartItems(prev => {
      const updated = [...prev, {
        ...newItem,
        id: itemId
      }];
      
      // Déclencher la création/mise à jour du brouillon de commande
      // Cette partie sera gérée par un hook personnalisé
      return updated;
    });
    
    return itemId; // Retourner l'ID pour pouvoir l'utiliser ailleurs
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCartItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const pricePerUnit = item.totalPrice / item.quantity;
        return {
          ...item,
          quantity,
          totalPrice: pricePerUnit * quantity
        };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartItemsByProvider = (providerId: string) => {
    return cartItems.filter(item => item.providerId === providerId);
  };
  
  const updateItemExtras = (itemId: string, extras: ExtraItem[]) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === itemId) {
        // Calculer le prix total avec les nouveaux extras
        const extrasPrice = extras.reduce((total, extra) => total + extra.price, 0);
        const baseItemPrice = item.totalPrice / item.quantity - (item.extras?.reduce((total, extra) => total + extra.price, 0) || 0);
        const newTotalPrice = (baseItemPrice + extrasPrice) * item.quantity;
        
        return {
          ...item,
          extras: extras,
          totalPrice: newTotalPrice
        };
      }
      return item;
    }));
  };
  
  const applyCoupon = (itemId: string, code: string, discount: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const originalPrice = item.totalPrice;
        const discountedPrice = originalPrice - (originalPrice * discount / 100);
        
        return {
          ...item,
          couponCode: code,
          couponDiscount: discount,
          totalPrice: discountedPrice
        };
      }
      return item;
    }));
  };
  
  const removeCoupon = (itemId: string) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === itemId && item.couponDiscount && item.couponCode) {
        const originalPrice = item.totalPrice / (1 - item.couponDiscount / 100);
        
        return {
          ...item,
          couponCode: undefined,
          couponDiscount: undefined,
          totalPrice: originalPrice
        };
      }
      return item;
    }));
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      cartTotal,
      addToCart,
      removeFromCart,
      updateQuantity,
      updateItemExtras,
      applyCoupon,
      removeCoupon,
      clearCart,
      getCartItemsByProvider
    }}>
      {children}
    </CartContext.Provider>
  );
};