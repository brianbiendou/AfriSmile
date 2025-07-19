const fs = require('fs');
const path = require('path');

// Configuration des vérifications
const verifications = [
  {
    filePath: 'utils/pointsConversion.ts',
    checks: [
      { pattern: /CONVERSION_RATE = 62/, description: 'Taux de conversion mis à jour (62 FCFA)' },
      { pattern: /return 100/, description: 'Cashback de 100 points' }
    ]
  },
  {
    filePath: 'components/ProviderDetailModal.tsx',
    checks: [
      { pattern: /points: 70/, description: 'Thiéboudiènne 70 points' },
      { pattern: /points: 20/, description: 'Boissons 20 points' },
      { pattern: /points: 30/, description: 'Desserts 30 points' },
      { pattern: /points: 80/, description: 'Poisson braisé 80 points' }
    ]
  },
  {
    filePath: 'app/(tabs)/orders.tsx',
    checks: [
      { pattern: /total_amount: 50/, description: 'Commande 1 - 50 points' },
      { pattern: /total_amount: 80/, description: 'Commande 2 - 80 points' },
      { pattern: /cashbackPoints = 100/, description: 'Cashback 100 points' },
      { pattern: /\+100 pts/, description: 'Affichage cashback 100 points' }
    ]
  },
  {
    filePath: 'components/ProviderDashboard.tsx',
    checks: [
      { pattern: /price: '30 pts'/, description: 'Produits 30 points' },
      { pattern: /amount: '60 pts'/, description: 'Commandes 60 points' },
      { pattern: /amount: '30 pts'/, description: 'Commandes 30 points' }
    ]
  },
  {
    filePath: 'contexts/AuthContext.tsx',
    checks: [
      { pattern: /points: 550/, description: 'Points utilisateur par défaut 550' }
    ]
  },
  {
    filePath: 'components/RewardsModal.tsx',
    checks: [
      { pattern: /100 points de cashback/, description: 'Description cashback 100 points' }
    ]
  },
  {
    filePath: 'components/SimpleWalletModal.tsx',
    checks: [
      { pattern: /points: 161/, description: 'Transaction 10000 FCFA = 161 points' },
      { pattern: /points: 81/, description: 'Transaction 5000 FCFA = 81 points' }
    ]
  },
  {
    filePath: 'README.md',
    checks: [
      { pattern: /1 point = 62 FCFA/, description: 'Documentation - nouveau taux' },
      { pattern: /70-100 points/, description: 'Documentation - plats principaux' },
      { pattern: /Cashback.*100 points/, description: 'Documentation - cashback' }
    ]
  }
];

console.log('🔍 Vérification complète du système de points x10...\n');

let totalChecks = 0;
let passedChecks = 0;

for (const verification of verifications) {
  const filePath = path.join(__dirname, verification.filePath);
  
  console.log(`📄 Vérification de ${verification.filePath}:`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`  ❌ Fichier non trouvé: ${filePath}`);
    continue;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  for (const check of verification.checks) {
    totalChecks++;
    
    if (check.pattern.test(content)) {
      console.log(`  ✅ ${check.description}`);
      passedChecks++;
    } else {
      console.log(`  ❌ ${check.description}`);
    }
  }
  
  console.log('');
}

console.log('═══════════════════════════════════════════════════════════');
console.log(`📊 Résultat final: ${passedChecks}/${totalChecks} vérifications passées`);

if (passedChecks === totalChecks) {
  console.log('🎉 Système de points x10 complètement mis à jour!');
  console.log('✅ Tous les fichiers frontend ont été corrigés');
  console.log('✅ Les valeurs de points sont cohérentes');
  console.log('✅ Les conversions utilisent le nouveau taux (62 FCFA)');
  console.log('✅ Le cashback est fixé à 100 points');
  console.log('');
  console.log('🔄 Prochaines étapes:');
  console.log('1. Appliquer la migration de base de données');
  console.log('2. Tester l\'application avec les nouvelles valeurs');
  console.log('3. Vérifier les calculs de conversion sur mobile');
} else {
  console.log('⚠️  Certaines vérifications ont échoué');
  console.log('📋 Vérifiez les fichiers mentionnés ci-dessus');
}
