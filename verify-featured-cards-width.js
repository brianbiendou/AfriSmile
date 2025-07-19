/**
 * Script de vérification de la réduction de largeur des cartes "Recommandés pour vous"
 * Vérifie que la largeur a été réduite de 40% dans la section featuredCard
 */

const fs = require('fs');
const path = require('path');

// Chemin vers le fichier index.tsx
const filePath = path.join(__dirname, 'app', '(tabs)', 'index.tsx');

function verifyFeaturedCardsWidthReduction() {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    console.log('🔍 Vérification de la réduction de largeur - Section "Recommandés pour vous"...\n');
    
    // Vérifications spécifiques
    const checks = [
      {
        search: 'width: width * 0.42',
        description: '✅ Nouvelle largeur appliquée (width * 0.42)',
        isNew: true
      },
      {
        search: '// Réduit de 40%',
        description: '✅ Commentaire explicatif ajouté',
        isNew: true
      },
      {
        search: 'marginLeft: 20',
        description: '✅ Espacement horizontal conservé',
        isNew: false
      }
    ];
    
    // Vérifications des anciennes valeurs qui ne doivent plus être présentes
    const oldChecks = [
      {
        search: 'width: width * 0.7,',
        description: '⚠️ Ancienne largeur encore présente (width * 0.7)',
        shouldNotExist: true
      }
    ];
    
    let passedChecks = 0;
    let totalChecks = checks.length;
    
    // Vérifier les nouvelles valeurs
    checks.forEach(check => {
      if (fileContent.includes(check.search)) {
        console.log(check.description);
        passedChecks++;
      } else {
        console.log(`❌ MANQUANT: ${check.description}`);
      }
    });
    
    // Vérifier les anciennes valeurs
    console.log('\n🔍 Vérification des anciennes valeurs...');
    let oldValuesFound = 0;
    
    oldChecks.forEach(check => {
      if (fileContent.includes(check.search)) {
        console.log(check.description);
        oldValuesFound++;
      } else {
        console.log(`✅ Ancienne valeur correctement supprimée: ${check.search}`);
      }
    });
    
    // Vérifier la structure générale
    console.log('\n🔍 Vérification de la structure...');
    
    if (fileContent.includes('featuredCard:')) {
      console.log('✅ Style featuredCard trouvé');
    } else {
      console.log('❌ Style featuredCard non trouvé');
    }
    
    if (fileContent.includes('Recommandés pour vous')) {
      console.log('✅ Section "Recommandés pour vous" trouvée');
    } else {
      console.log('❌ Section "Recommandés pour vous" non trouvée');
    }
    
    if (fileContent.includes('fullWidthCard')) {
      console.log('✅ Style fullWidthCard préservé (non modifié)');
    } else {
      console.log('⚠️ Style fullWidthCard non trouvé');
    }
    
    // Résumé final
    console.log(`\n📊 Résumé: ${passedChecks}/${totalChecks} vérifications passées`);
    
    if (passedChecks === totalChecks && oldValuesFound === 0) {
      console.log('🎉 Modification appliquée avec succès !');
      console.log('✨ La largeur des cartes "Recommandés pour vous" a été réduite de 40%');
      console.log('📐 Nouvelle largeur: 42% de l\'écran (au lieu de 70%)');
    } else if (oldValuesFound > 0) {
      console.log('⚠️ Des anciennes valeurs sont encore présentes.');
    } else {
      console.log('⚠️ Certaines vérifications ont échoué.');
    }
    
    // Afficher un extrait du code modifié
    console.log('\n📄 Extrait du code modifié:');
    const featuredCardMatch = fileContent.match(/featuredCard:\s*{[\s\S]*?},/);
    if (featuredCardMatch) {
      console.log(featuredCardMatch[0]);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la lecture du fichier:', error.message);
  }
}

// Exécution du script
verifyFeaturedCardsWidthReduction();
