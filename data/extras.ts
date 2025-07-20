// Données mock pour les extras de commande
export interface ExtraItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

export const mockExtras: ExtraItem[] = [
  {
    id: 'extra1',
    name: 'Bouteille d\'eau minérale',
    description: 'Eau minérale naturelle fraîche et purifiée, 50cl.',
    price: 2.55, // 200 FCFA
    image: 'https://images.unsplash.com/photo-1593574892022-af4adc4b5b8a',
    category: 'boissons',
  },
  {
    id: 'extra2',
    name: 'Coca-Cola',
    description: 'Boisson gazeuse rafraîchissante, 33cl.',
    price: 3.19, // 250 FCFA
    image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7',
    category: 'boissons',
  },
  {
    id: 'extra3',
    name: 'Fanta Orange',
    description: 'Boisson gazeuse à l\'orange, 33cl.',
    price: 3.19, // 250 FCFA
    image: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3',
    category: 'boissons',
  },
  {
    id: 'extra4',
    name: 'Portion de frites',
    description: 'Frites croustillantes fraîchement préparées.',
    price: 3.83, // 300 FCFA
    image: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d',
    category: 'accompagnements',
  },
  {
    id: 'extra5',
    name: 'Alloco',
    description: 'Bananes plantain frites, spécialité locale délicieuse.',
    price: 3.19, // 250 FCFA
    image: 'https://images.unsplash.com/photo-1593280405882-fa68a0eb5cc5',
    category: 'accompagnements',
  },
  {
    id: 'extra6',
    name: 'Petit Pot de Piment',
    description: 'Piment local épicé pour rehausser le goût de vos plats.',
    price: 1.28, // 100 FCFA
    image: 'https://images.unsplash.com/photo-1589010588553-46e8e7c21788',
    category: 'condiments',
  },
  {
    id: 'extra7',
    name: 'Mayonnaise',
    description: 'Sauce mayonnaise onctueuse en petit pot individuel.',
    price: 1.28, // 100 FCFA
    image: 'https://images.unsplash.com/photo-1563599175592-c58dc214deff',
    category: 'condiments',
  },
  {
    id: 'extra8',
    name: 'Salade Fraîche',
    description: 'Petite portion de salade fraîche assortie.',
    price: 2.55, // 200 FCFA
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
    category: 'accompagnements',
  },
];

export const getExtrasByCategory = () => {
  const categories: { [key: string]: ExtraItem[] } = {};
  
  mockExtras.forEach(extra => {
    if (!categories[extra.category]) {
      categories[extra.category] = [];
    }
    categories[extra.category].push(extra);
  });
  
  return categories;
};

export const getExtrasById = (ids: string[]): ExtraItem[] => {
  return mockExtras.filter(extra => ids.includes(extra.id));
};
