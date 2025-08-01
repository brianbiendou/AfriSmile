import React, { createContext, useContext, useState, useEffect } from 'react';
import storage from '@/utils/storage';

export interface OrderItem {
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
  extras?: any[];
  couponCode?: string;
  couponDiscount?: number;
  totalPrice: number;
  providerId: string;
  providerName: string;
}

export interface Order {
  id: string;
  status: 'draft' | 'paid' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  items: OrderItem[];
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  discountPercentage: number;
  paymentMethod: 'points' | 'mtn' | 'orange' | 'moov';
  deliveryAddress: string;
  mobileMoneyFee?: number;
  createdAt: string;
  paidAt?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  notes?: string;
}

interface OrdersContextType {
  orders: Order[];
  draftOrder: Order | null;
  createDraftOrder: (items: OrderItem[], totalAmount: number, discountAmount: number, discountPercentage: number) => string;
  updateDraftOrder: (items: OrderItem[], totalAmount: number, discountAmount: number, discountPercentage: number) => void;
  finalizeDraftOrder: (paymentMethod: string, finalAmount: number, mobileMoneyFee?: number) => void;
  clearDraftOrder: () => void;
  continueDraftOrder: () => OrderItem[];
  getOrderById: (orderId: string) => Order | undefined;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
};

export const OrdersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [draftOrder, setDraftOrder] = useState<Order | null>(null);

  // Charger les commandes depuis le stockage
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const savedOrders = await storage.getItem('orders');
        const savedDraftOrder = await storage.getItem('draftOrder');
        
        if (savedOrders) {
          setOrders(JSON.parse(savedOrders));
        }
        
        if (savedDraftOrder) {
          setDraftOrder(JSON.parse(savedDraftOrder));
        }
      } catch (error) {
        console.error('Error loading orders from storage:', error);
      }
    };
    loadOrders();
  }, []);

  // Sauvegarder les commandes
  useEffect(() => {
    const saveOrders = async () => {
      try {
        await storage.setItem('orders', JSON.stringify(orders));
      } catch (error) {
        console.error('Error saving orders to storage:', error);
      }
    };
    saveOrders();
  }, [orders]);

  // Sauvegarder le brouillon
  useEffect(() => {
    const saveDraftOrder = async () => {
      try {
        if (draftOrder) {
          await storage.setItem('draftOrder', JSON.stringify(draftOrder));
        } else {
          await storage.removeItem('draftOrder');
        }
      } catch (error) {
        console.error('Error saving draft order to storage:', error);
      }
    };
    saveDraftOrder();
  }, [draftOrder]);

  const createDraftOrder = (items: OrderItem[], totalAmount: number, discountAmount: number, discountPercentage: number) => {
    const orderId = `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newDraftOrder: Order = {
      id: orderId,
      status: 'draft',
      items: [...items],
      totalAmount,
      discountAmount,
      finalAmount: totalAmount - discountAmount,
      discountPercentage,
      paymentMethod: 'points',
      deliveryAddress: 'Cocody, Abidjan',
      createdAt: new Date().toISOString(),
    };

    setDraftOrder(newDraftOrder);
    return orderId;
  };

  const updateDraftOrder = (items: OrderItem[], totalAmount: number, discountAmount: number, discountPercentage: number) => {
    if (draftOrder) {
      setDraftOrder({
        ...draftOrder,
        items: [...items],
        totalAmount,
        discountAmount,
        finalAmount: totalAmount - discountAmount,
        discountPercentage,
      });
    }
  };

  const finalizeDraftOrder = (paymentMethod: string, finalAmount: number, mobileMoneyFee?: number) => {
    if (draftOrder) {
      const finalizedOrder: Order = {
        ...draftOrder,
        id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'paid',
        paymentMethod: paymentMethod as any,
        finalAmount,
        mobileMoneyFee,
        paidAt: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min
      };

      setOrders(prev => [finalizedOrder, ...prev]);
      setDraftOrder(null);
    }
  };

  const clearDraftOrder = () => {
    setDraftOrder(null);
  };

  const continueDraftOrder = () => {
    if (draftOrder) {
      return draftOrder.items;
    }
    return [];
  };

  const getOrderById = (orderId: string) => {
    return orders.find(order => order.id === orderId);
  };

  return (
    <OrdersContext.Provider value={{
      orders,
      draftOrder,
      createDraftOrder,
      updateDraftOrder,
      finalizeDraftOrder,
      clearDraftOrder,
      continueDraftOrder,
      getOrderById,
    }}>
      {children}
    </OrdersContext.Provider>
  );
};
