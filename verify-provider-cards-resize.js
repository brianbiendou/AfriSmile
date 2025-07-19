/**
 * Script de vérification des modifications de taille des cartes prestataires
 * Vérifie que toutes les valeurs ont été réduites de 40% (multipliées par 0.6)
 */

const fs = require('fs');
const path = require('path');

// Chemin vers le fichier ProviderCard.tsx
const filePath = path.join(__dirname, 'components', 'ProviderCard.tsx');

// Valeurs attendues après réduction de 40%
const expectedValues = {
  // Card styles
  'borderRadius: 10': 'borderRadius réduit de 16 à 10',
  'height: 1': 'shadowOffset height réduit de 2 à 1',
  'shadowRadius: 5': 'shadowRadius réduit de 8 à 5',
  
  // Image
  'height: 90': 'Image height réduite de 150 à 90',
  
  // Discount badge
  'top: 7': 'Badge top réduit de 12 à 7',
  'right: 7': 'Badge right réduit de 12 à 7',
  'paddingHorizontal: 7': 'Badge paddingHorizontal réduit de 12 à 7',
  'paddingVertical: 4': 'Badge paddingVertical réduit de 6 à 4',
  'borderRadius: 12': 'Badge borderRadius réduit de 20 à 12',
  
  // Font sizes
  'fontSize: 8': 'FontSize réduit (plusieurs instances)',
  'fontSize: 10': 'Name fontSize réduit de 16 à 10',
  'fontSize: 7': 'Petits textes fontSize réduits',
  
  // Paddings and margins
  'padding: 9': 'Content padding réduit de 15 à 9',
  'marginBottom: 2': 'Name marginBottom réduit de 4 à 2',
  'marginBottom: 5': 'Category marginBottom réduit de 8 à 5',
  'marginBottom: 4': 'Info marginBottom réduit de 6 à 4',
  'marginLeft: 2': 'MarginLeft réduits de 4 à 2',
  'marginTop: 5': 'DiscountInfo marginTop réduit de 8 à 5',
  
  // Icon sizes
  'size={8}': 'Star icon size réduite de 14 à 8',
  'size={7}': 'MapPin icon size réduite de 12 à 7',
  
  // Savings container
  'paddingHorizontal: 5': 'Savings paddingHorizontal réduit de 8 à 5',
  'paddingVertical: 2': 'Savings paddingVertical réduit de 4 à 2',
  'borderRadius: 7': 'Savings borderRadius réduit de 12 à 7',
  'width: 18': 'Shimmer width réduite de 30 à 18',
};

function verifyProviderCardChanges() {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    console.log('🔍 Vérification des modifications des cartes prestataires...\n');
    
    let changesFound = 0;
    let totalChecks = Object.keys(expectedValues).length;
    
    for (const [value, description] of Object.entries(expectedValues)) {
      if (fileContent.includes(value)) {
        console.log(`✅ ${description}`);
        changesFound++;
      } else {
        console.log(`❌ MANQUANT: ${description}`);
      }
    }
    
    console.log(`\n📊 Résumé: ${changesFound}/${totalChecks} modifications détectées`);
    
    if (changesFound === totalChecks) {
      console.log('🎉 Toutes les modifications ont été appliquées avec succès !');
      console.log('✨ Les cartes prestataires ont été réduites de 40% avec tous les éléments ajustés proportionnellement.');
    } else {
      console.log('⚠️ Certaines modifications semblent manquer. Vérifiez le fichier manuellement.');
    }
    
    // Vérification additionnelle des valeurs originales qui ne devraient plus être présentes
    const oldValues = [
      'height: 150',
      'borderRadius: 16',
      'borderRadius: 20',
      'fontSize: 14',
      'fontSize: 16',
      'padding: 15',
      'size={14}',
      'size={12}',
      'paddingHorizontal: 12'
    ];
    
    console.log('\n🔍 Vérification des anciennes valeurs...');
    let oldValuesFound = 0;
    
    for (const oldValue of oldValues) {
      if (fileContent.includes(oldValue)) {
        console.log(`⚠️ Ancienne valeur encore présente: ${oldValue}`);
        oldValuesFound++;
      }
    }
    
    if (oldValuesFound === 0) {
      console.log('✅ Aucune ancienne valeur détectée - Migration complète !');
    } else {
      console.log(`⚠️ ${oldValuesFound} anciennes valeurs encore présentes.`);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la lecture du fichier:', error.message);
  }
}

// Exécution du script
verifyProviderCardChanges();
