export interface Provider {
  id: string;
  name: string;
  category: string;
  image: string;
  rating: number;
  estimatedTime: string;
  location: string;
  discount: number;
}

export const mockProviders: Provider[] = [
  {
    id: '1',
    name: 'Chez Tante Marie',
    category: 'Cuisine Africaine',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    rating: 4.8,
    estimatedTime: '25-35 min', // Gardé pour compatibilité mais non affiché
    location: 'Cocody',
    discount: 25, // Augmenté pour plus d'économies
  },
  {
    id: '2',
    name: 'Beauty Palace',
    category: 'Salon de Beauté',
    image: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg',
    rating: 4.6,
    estimatedTime: '45-60 min',
    location: 'Plateau',
    discount: 30, // Augmenté pour plus d'économies
  },
  {
    id: '3',
    name: 'Pizza Express CI',
    category: 'Fast Food',
    image: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg',
    rating: 4.4,
    estimatedTime: '20-30 min',
    location: 'Marcory',
    discount: 15, // Augmenté légèrement
  },
  {
    id: '4',
    name: 'Café des Arts',
    category: 'Café & Pâtisserie',
    image: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg',
    rating: 4.7,
    estimatedTime: '15-25 min',
    location: 'Zone 4',
    discount: 12, // Augmenté pour avoir des économies visibles
  },
  {
    id: '5',
    name: 'Nails Studio',
    category: 'Manucure & Pédicure',
    image: 'https://images.pexels.com/photos/3997379/pexels-photo-3997379.jpeg',
    rating: 4.9,
    estimatedTime: '30-45 min',
    location: 'Riviera',
    discount: 35, // Le plus élevé pour attirer l'attention
  },
  {
    id: '6',
    name: 'Burger King CI',
    category: 'Fast Food',
    image: 'https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg',
    rating: 4.2,
    estimatedTime: '15-25 min',
    location: 'Adjamé',
    discount: 18, // Augmenté pour plus d'attractivité
  },
];