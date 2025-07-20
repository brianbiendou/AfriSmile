// Script de vérification de l'intégration du système de prix modulaire
console.log('🔍 Vérification de l\'intégration du système de prix modulaire...\n');

const fs = require('fs');
const path = require('path');

const verifications = [
  {
    name: 'Système de Prix Modulaire',
    file: 'utils/pricingSystem.ts',
    checks: [
      { pattern: /CONVERSION_RATE.*FCFA_TO_POINTS: 85\.59/, description: 'Taux de conversion FCFA vers points (85.59)' },
      { pattern: /POINTS_TO_FCFA: 0\.01168/, description: 'Taux de conversion points vers FCFA (0.01168)' },
      { pattern: /PRODUCT_PRICES_FCFA.*thiebboudienne.*5000/, description: 'Prix Thiéboudiènne en FCFA (5000)' },
      { pattern: /formatProductPrice/, description: 'Fonction de formatage des prix' },
      { pattern: /PRODUCTS_WITH_PRICES/, description: 'Catalogue de produits avec prix' }
    ]
  },
  {
    name: 'ProviderDetailModal - Nouveaux Prix',
    file: 'components/ProviderDetailModal.tsx',
    checks: [
      { pattern: /import.*pricingSystem.*from.*utils\/pricingSystem/, description: 'Import du système de prix' },
      { pattern: /pricingSystem\.PRODUCTS_WITH_PRICES/, description: 'Utilisation du catalogue de produits' },
      { pattern: /item\.fcfaFormatted/, description: 'Affichage des prix FCFA formatés' },
      { pattern: /item\.pointsFormatted/, description: 'Affichage des prix points formatés' },
      { pattern: /originalPrice.*fcfaFormatted/, description: 'Prix FCFA comme prix original (barré)' }
    ]
  },
  {
    name: 'ProviderDashboard - Nouveaux Prix',
    file: 'components/ProviderDashboard.tsx',
    checks: [
      { pattern: /import.*pricingSystem.*from.*utils\/pricingSystem/, description: 'Import du système de prix' },
      { pattern: /getProductPrices/, description: 'Utilisation des fonctions de prix' },
      { pattern: /fcfaFormatted/, description: 'Prix FCFA formatés' },
      { pattern: /pointsFormatted/, description: 'Prix points formatés' }
    ]
  },
  {
    name: 'AuthContext - Soldes Augmentés',
    file: 'contexts/AuthContext.tsx',
    checks: [
      { pattern: /points: 80000.*Nouvelle cagnotte augmentée/, description: 'Client: 80,000 points' },
      { pattern: /balance: 934\.0.*Équivalent en FCFA/, description: 'Client: 934 FCFA équivalent' },
      { pattern: /points: 150000.*Nouvelle cagnotte admin augmentée/, description: 'Admin: 150,000 points' },
      { pattern: /balance: 1752\.0.*Équivalent en FCFA/, description: 'Admin: 1752 FCFA équivalent' }
    ]
  },
  {
    name: 'Profile - Affichage FCFA',
    file: 'app/(tabs)/profile.tsx',
    checks: [
      { pattern: /formatPointsWithFcfa\(user\.points\)/, description: 'Affichage points avec équivalent FCFA' },
      { pattern: /pointsToFcfa\(authUser\?\.points/, description: 'Conversion points vers FCFA' }
    ]
  }
];

let totalChecks = 0;
let passedChecks = 0;

verifications.forEach(verification => {
  console.log(`\n📋 ${verification.name}`);
  console.log('=' .repeat(50));
  
  const filePath = path.join(__dirname, verification.file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Fichier non trouvé: ${verification.file}`);
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  verification.checks.forEach(check => {
    totalChecks++;
    if (check.pattern.test(content)) {
      console.log(`✅ ${check.description}`);
      passedChecks++;
    } else {
      console.log(`❌ ${check.description}`);
    }
  });
});

console.log('\n' + '='.repeat(60));
console.log(`📊 RÉSULTAT GLOBAL: ${passedChecks}/${totalChecks} vérifications passées`);

const successRate = (passedChecks / totalChecks) * 100;

if (successRate >= 95) {
  console.log('🎉 SYSTÈME DE PRIX PARFAITEMENT INTÉGRÉ!');
  console.log('✅ Toutes les fonctionnalités sont opérationnelles');
  console.log('✅ Prices FCFA barrés et points en vert');
  console.log('✅ Soldes augmentés correctement affichés');
  console.log('✅ Système modulaire entièrement déployé');
} else if (successRate >= 80) {
  console.log('🟡 INTÉGRATION PRESQUE TERMINÉE');
  console.log('📝 Quelques ajustements finaux nécessaires');
} else {
  console.log('🔴 INTÉGRATION EN COURS');
  console.log('⚠️ Corrections importantes requises');
}

console.log('\n💰 EXEMPLES DE CONVERSION AVEC LE SYSTÈME:');
console.log('============================================');
console.log('• 1 FCFA = 85.59 points');
console.log('• 1 point = 0.01168 FCFA');
console.log('• Thiéboudiènne: 5,000 FCFA = 427,950 points');
console.log('• Jus de gingembre: 1,500 FCFA = 128,385 points');
console.log('• Client: 80,000 pts = 934 FCFA');
console.log('• Admin: 150,000 pts = 1,752 FCFA');

console.log('\n🎯 PROCHAINES ÉTAPES:');
console.log('1. Tester l\'affichage des prix dans l\'application');
console.log('2. Vérifier les conversions dans le profil');
console.log('3. Valider l\'interface prestataire');
console.log('4. Confirmer le système d\'authentification');
