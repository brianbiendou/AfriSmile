/**
 * Script de vérification du remplacement de la section "réduction" 
 * par la section "livraison" dans les cartes prestataires
 */

const fs = require('fs');
const path = require('path');

// Chemin vers le fichier ProviderCard.tsx
const filePath = path.join(__dirname, 'components', 'ProviderCard.tsx');

function verifyContentUpdate() {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    console.log('🔍 Vérification du remplacement de contenu des cartes prestataires...\n');
    
    // Vérifications de suppression (ces éléments ne doivent plus être présents)
    const removedElements = [
      'savingsAmount',
      'generateSavingsAmount',
      'shimmerAnim',
      'shimmerTranslate',
      'savingsContainer',
      'savingsBackground',
      'shimmerOverlay',
      'savingsText',
      'Jusqu\'à',
      'FCFA de réduction'
    ];
    
    // Vérifications d'ajout (ces éléments doivent être présents)
    const addedElements = [
      'deliveryContainer',
      'deliveryBackground', 
      'deliveryText',
      '🚀 Livraison',
      'provider.estimatedTime',
      '#E8F5E8', // Couleur vert clair
      '#00B14F'  // Couleur vert vif
    ];
    
    let removedCount = 0;
    let addedCount = 0;
    
    console.log('❌ Vérification des éléments supprimés:');
    removedElements.forEach(element => {
      if (!fileContent.includes(element)) {
        console.log(`✅ Supprimé: ${element}`);
        removedCount++;
      } else {
        console.log(`⚠️ Encore présent: ${element}`);
      }
    });
    
    console.log('\n✅ Vérification des éléments ajoutés:');
    addedElements.forEach(element => {
      if (fileContent.includes(element)) {
        console.log(`✅ Ajouté: ${element}`);
        addedCount++;
      } else {
        console.log(`❌ Manquant: ${element}`);
      }
    });
    
    console.log(`\n📊 Résumé de la migration:`);
    console.log(`• Éléments supprimés: ${removedCount}/${removedElements.length}`);
    console.log(`• Éléments ajoutés: ${addedCount}/${addedElements.length}`);
    
    // Vérification spécifique de la structure du nouveau contenu
    const hasDeliveryStructure = fileContent.includes('deliveryContainer') && 
                                fileContent.includes('deliveryBackground') && 
                                fileContent.includes('🚀 Livraison {provider.estimatedTime}');
    
    const hasOldStructure = fileContent.includes('savingsContainer') || 
                           fileContent.includes('Jusqu\'à') ||
                           fileContent.includes('FCFA de réduction');
    
    console.log(`\n🎯 Vérification structurelle:`);
    console.log(`• Nouvelle structure livraison: ${hasDeliveryStructure ? '✅' : '❌'}`);
    console.log(`• Ancienne structure réduction: ${hasOldStructure ? '❌ Encore présente' : '✅ Supprimée'}`);
    
    if (hasDeliveryStructure && !hasOldStructure && removedCount >= 8 && addedCount >= 6) {
      console.log('\n🎉 Migration réussie !');
      console.log('✨ La section "réduction" a été remplacée par "livraison" avec succès.');
      console.log('🚀 Les cartes affichent maintenant le temps de livraison estimé.');
    } else {
      console.log('\n⚠️ Migration incomplète. Vérifiez les éléments manquants ci-dessus.');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la lecture du fichier:', error.message);
  }
}

// Fonction pour vérifier les imports
function verifyImports() {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    console.log('\n🔍 Vérification des imports...');
    
    const hasGenerateSavingsImport = fileContent.includes('generateSavingsAmount');
    
    if (!hasGenerateSavingsImport) {
      console.log('✅ Import generateSavingsAmount supprimé');
    } else {
      console.log('⚠️ Import generateSavingsAmount encore présent');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des imports:', error.message);
  }
}

// Exécution des vérifications
console.log('🔧 Vérification du remplacement de contenu - Cartes Prestataires\n');
verifyContentUpdate();
verifyImports();
