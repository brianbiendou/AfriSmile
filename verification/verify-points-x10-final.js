#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration des vérifications
const checkConfig = [
  {
    filePath: 'utils/pointsConversion.ts',
    checks: [
      { pattern: /const CONVERSION_RATE = 62/, description: 'Taux de conversion 62 FCFA par point' },
      { pattern: /return 100/, description: 'Cashback 100 points par commande' }
    ]
  },
  {
    filePath: 'components/ProviderDetailModal.tsx',
    checks: [
      { pattern: /points: 70/, description: 'Thiéboudiènne 70 points' },
      { pattern: /points: 80/, description: 'Poisson braisé 80 points' },
      { pattern: /points: 20/, description: 'Boissons 20 points' },
      { pattern: /points: 30/, description: 'Desserts 30 points' }
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
    filePath: 'components/AuthScreen.tsx',
    checks: [
      { pattern: /150 pts/, description: 'Points Marie mis à jour (150)' },
      { pattern: /500 pts/, description: 'Points Admin mis à jour (500)' }
    ]
  },
  {
    filePath: 'components/RewardsModal.tsx',
    checks: [
      { pattern: /100 points de cashback/, description: 'Description cashback 100 points' },
      { pattern: /cashback: 100/, description: 'Cashback mockés mis à jour (100)' }
    ]
  },
  {
    filePath: 'components/SimpleWalletModal.tsx',
    checks: [
      { pattern: /points: 161/, description: 'Transaction 10000 FCFA = 161 points' },
      { pattern: /points: 81/, description: 'Transaction 5000 FCFA = 81 points' },
      { pattern: /points: 242/, description: 'Transaction 15000 FCFA = 242 points' }
    ]
  },
  {
    filePath: 'components/WalletModal.tsx',
    checks: [
      { pattern: /points: 161/, description: 'Transaction WalletModal 10000 FCFA = 161 points' },
      { pattern: /points: 81/, description: 'Transaction WalletModal 5000 FCFA = 81 points' }
    ]
  },
  {
    filePath: 'README.md',
    checks: [
      { pattern: /1 point = 62 FCFA/, description: 'Documentation - nouveau taux' },
      { pattern: /70-100 points/, description: 'Documentation - plats principaux' },
      { pattern: /Cashback.*100 points/, description: 'Documentation - cashback' }
    ]
  },
  {
    filePath: 'supabase/migrations/20250118000000_update_points_system_x10.sql',
    checks: [
      { pattern: /points_amount \* 62/, description: 'Fonction DB points_to_fcfa mise à jour' },
      { pattern: /points \* 10/, description: 'Multiplication des points existants' },
      { pattern: /RETURN 100/, description: 'Fonction calculate_cashback mise à jour' }
    ]
  }
];

console.log('🔍 Vérification finale du système de points x10...\n');

let totalChecks = 0;
let passedChecks = 0;
let failedFiles = [];

checkConfig.forEach(({ filePath, checks }) => {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ Fichier non trouvé: ${filePath}`);
    failedFiles.push(filePath);
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  let filePassedChecks = 0;
  
  console.log(`📄 ${filePath}`);
  
  checks.forEach(({ pattern, description }) => {
    totalChecks++;
    if (pattern.test(content)) {
      console.log(`   ✅ ${description}`);
      passedChecks++;
      filePassedChecks++;
    } else {
      console.log(`   ❌ ${description}`);
      if (!failedFiles.includes(filePath)) {
        failedFiles.push(filePath);
      }
    }
  });
  
  const filePassRate = (filePassedChecks / checks.length * 100).toFixed(1);
  console.log(`   📊 ${filePassedChecks}/${checks.length} vérifications passées (${filePassRate}%)\n`);
});

// Résumé global
const globalPassRate = (passedChecks / totalChecks * 100).toFixed(1);
console.log('═'.repeat(60));
console.log(`📊 RÉSUMÉ GLOBAL:`);
console.log(`   Total des vérifications: ${totalChecks}`);
console.log(`   Vérifications réussies: ${passedChecks}`);
console.log(`   Vérifications échouées: ${totalChecks - passedChecks}`);
console.log(`   Taux de réussite: ${globalPassRate}%`);

if (failedFiles.length > 0) {
  console.log(`\n⚠️  Fichiers nécessitant une attention:`);
  failedFiles.forEach(file => console.log(`   - ${file}`));
}

console.log('\n🎯 Statut du système de points x10:');
if (globalPassRate >= 95) {
  console.log('   🟢 EXCELLENT - Système x10 entièrement déployé!');
} else if (globalPassRate >= 80) {
  console.log('   🟡 BON - Quelques ajustements mineurs nécessaires');
} else {
  console.log('   🔴 ATTENTION - Corrections importantes requises');
}

console.log('\n🚀 Prochaines étapes:');
console.log('   1. Tester l\'application sur mobile');
console.log('   2. Vérifier les conversions points/FCFA');
console.log('   3. Valider le cashback de 100 points');
console.log('   4. Contrôler l\'affichage des prix');

console.log('\n═'.repeat(60));
