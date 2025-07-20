// Script de vérification pour le système de points x10
// Vérifier que toutes les mises à jour ont été appliquées correctement

const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification du système de points (x10)...\n');

// Fichiers à vérifier
const filesToCheck = [
  {
    path: 'utils/pointsConversion.ts',
    checks: [
      { pattern: /CONVERSION_RATE = 62/, description: 'Taux de conversion mis à jour (62)' },
      { pattern: /calculateCashback.*100/, description: 'Cashback mis à jour (100 points)' }
    ]
  },
  {
    path: 'components/RewardsModal.tsx',
    checks: [
      { pattern: /totalCashback.*100/, description: 'Cashback total mis à jour (100)' },
      { pattern: /originalPrice: 50/, description: 'Prix mockés mis à jour (x10)' },
      { pattern: /cashback: 100/, description: 'Cashback mockés mis à jour (100)' }
    ]
  },
  {
    path: 'components/WalletModal.tsx',
    checks: [
      { pattern: /fcfaToPoints/, description: 'Fonction de conversion importée et utilisée' },
      { pattern: /points: 161/, description: 'Données de transaction mises à jour' }
    ]
  },
  {
    path: 'supabase/migrations/20250118000000_update_points_system_x10.sql',
    checks: [
      { pattern: /points_amount \* 62/, description: 'Fonction DB points_to_fcfa mise à jour' },
      { pattern: /points \* 10/, description: 'Multiplication des points existants' },
      { pattern: /RETURN 100/, description: 'Fonction calculate_cashback mise à jour' }
    ]
  },
  {
    path: 'README.md',
    checks: [
      { pattern: /1 point = 62 FCFA/, description: 'Taux de conversion dans README mis à jour' },
      { pattern: /70-100 points/, description: 'Échelle des points mise à jour' },
      { pattern: /Cashback.*100 points/, description: 'Description du cashback mise à jour' }
    ]
  }
];

let allPassed = true;
let totalChecks = 0;
let passedChecks = 0;

filesToCheck.forEach(file => {
  console.log(`📄 Vérification de ${file.path}:`);
  
  const filePath = path.join(__dirname, file.path);
  
  if (!fs.existsSync(filePath)) {
    console.log(`   ❌ Fichier non trouvé: ${file.path}`);
    allPassed = false;
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  file.checks.forEach(check => {
    totalChecks++;
    if (check.pattern.test(content)) {
      console.log(`   ✅ ${check.description}`);
      passedChecks++;
    } else {
      console.log(`   ❌ ${check.description}`);
      allPassed = false;
    }
  });
  
  console.log('');
});

// Vérifications supplémentaires
console.log('📋 Vérifications supplémentaires:');

// Vérifier qu'il n'y a plus de références à l'ancien taux
const filesToScan = [
  'components/SimpleWalletModal.tsx',
  'components/CheckoutModal.tsx',
  'components/CartModal.tsx',
  'app/(tabs)/orders.tsx'
];

filesToScan.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Chercher d'anciennes références au taux 620
    if (content.includes('620') && !content.includes('// ancien: 620')) {
      console.log(`   ⚠️  Référence potentielle à l'ancien taux (620) dans ${filePath}`);
    }
    
    // Vérifier l'utilisation des bonnes fonctions de conversion
    if (content.includes('pointsToFcfa') || content.includes('fcfaToPoints')) {
      console.log(`   ✅ Utilise les fonctions de conversion dans ${filePath}`);
      totalChecks++;
      passedChecks++;
    }
  }
});

console.log('\n📊 Résumé:');
console.log(`   Vérifications réussies: ${passedChecks}/${totalChecks}`);

if (allPassed && passedChecks === totalChecks) {
  console.log('\n🎉 Toutes les vérifications sont réussies !');
  console.log('✅ Le système de points x10 a été correctement implémenté.');
  console.log('\n🔄 Prochaines étapes:');
  console.log('   1. Exécuter la migration de base de données');
  console.log('   2. Tester l\'application avec les nouvelles valeurs');
  console.log('   3. Vérifier que tous les affichages utilisent les bonnes conversions');
} else {
  console.log('\n⚠️  Certaines vérifications ont échoué.');
  console.log('🔧 Veuillez corriger les problèmes identifiés ci-dessus.');
}

console.log('\n📝 Notes importantes:');
console.log('   • Nouveau taux: 1 point = 62 FCFA (au lieu de 620)');
console.log('   • Tous les points existants seront multipliés par 10');
console.log('   • Cashback: 100 points par commande (au lieu de 10)');
console.log('   • Migration DB: 20250118000000_update_points_system_x10.sql');
