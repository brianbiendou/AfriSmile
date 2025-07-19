// Ce fichier est maintenant obsolète - les données viennent de Supabase
// Gardé pour compatibilité temporaire

export interface ProviderCompat {
  id: string;
  name: string;
  category: string;
  image: string;
  rating: number;
  estimatedTime: string;
  location: string;
  discount: number;
}

// Fonction de conversion pour compatibilité
export const convertProviderToCompat = (provider: any): ProviderCompat => ({
  id: provider.id,
  name: provider.business_name,
  category: provider.category,
  image: provider.image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
  rating: provider.rating,
  estimatedTime: provider.estimated_time,
  location: provider.location,
  discount: provider.discount_percentage,
});