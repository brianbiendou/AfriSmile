import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '@/lib/storage';

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
  totalPrice: number;
  providerId: string;
  providerName: string;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
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
    
    setCartItems(prev => [...prev, {
      ...newItem,
      id: itemId
    }]);
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

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      cartTotal,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartItemsByProvider
    }}>
      {children}
    </CartContext.Provider>
  );
};