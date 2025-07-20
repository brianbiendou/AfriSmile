// Service pour gérer les événements d'application
type EventCallback = (...args: any[]) => void;

interface EventMap {
  [key: string]: EventCallback[];
}

class EventService {
  private events: EventMap = {};

  /**
   * Ajoute un listener pour un événement spécifique
   */
  on(event: string, callback: EventCallback): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  /**
   * Supprime un listener pour un événement spécifique
   */
  off(event: string, callback: EventCallback): void {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  /**
   * Déclenche un événement avec les arguments fournis
   */
  emit(event: string, ...args: any[]): void {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Erreur lors de l'exécution du callback pour l'événement ${event}:`, error);
      }
    });
  }
  
  /**
   * Supprime tous les listeners pour un événement
   */
  clearEvent(event: string): void {
    this.events[event] = [];
  }
  
  /**
   * Supprime tous les listeners pour tous les événements
   */
  clearAll(): void {
    this.events = {};
  }
}

// Instance singleton pour l'application
export const eventService = new EventService();

// Constantes pour les événements communs
export const APP_EVENTS = {
  OPEN_CART: 'openCart',
  OPEN_WALLET: 'openWallet',
  OPEN_AUTH: 'openAuth',
  ADD_TO_CART: 'addToCart',
  REFRESH_DATA: 'refreshData',
};

export default eventService;
