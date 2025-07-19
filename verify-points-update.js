#!/usr/bin/env node

/**
 * Script de vérification des valeurs de points après correction
 * Vérifie que toutes les valeurs ont été correctement divisées par 1000
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE_ROOT = 'c:/Users/clark/Videos/Afrique/V2';

// Fichiers à vérifier avec les valeurs attendues
const FILES_TO_CHECK = {
  'components/ProviderDetailModal.tsx': [
    { search: 'points: 7,', description: 'Thiéboudiènne corrigé' },
    { search: 'points: 2,', description: 'Jus gingembre corrigé' },
    { search: 'points: 3,', description: 'Salade fruits corrigée' },
    { search: 'points: 8,', description: 'Poisson braisé corrigé' }
  ],
  'components/ProductCustomizationModal.tsx': [
    { search: 'price: 1,', description: 'Attiéké corrigé' },
    { search: 'price: 2,', description: 'Crevettes corrigées' },
    { search: 'price: 0,', description: 'Épices gratuites' }
  ],
  'app/(tabs)/orders.tsx': [
    { search: 'total_amount: 5,', description: 'Commande 1 corrigée' },
    { search: 'total_amount: 8,', description: 'Commande 2 corrigée' },
    { search: 'points_used: 4,', description: 'Points utilisés corrigés' }
  ],
  'components/AuthScreen.tsx': [
    { search: '15 pts', description: 'Points Marie corrigés' },
    { search: '50 pts', description: 'Points Admin corrigés' }
  ],
  'components/WalletModal.tsx': [
    { search: 'amount: 10, points: 20', description: 'Transaction 1 corrigée' },
    { search: 'amount: -3, points: -5', description: 'Transaction 2 corrigée' },
    { search: 'numericAmount < 1', description: 'Minimum corrigé' }
  ],
  'components/kolofap/TransactionHistoryModal.tsx': [
    { search: 'amount: 3,', description: 'Transaction Kolofap corrigée' },
    { search: 'amount: 2,', description: 'Transaction Kolofap corrigée' }
  ],
  'components/kolofap/KolofapHome.tsx': [
    { search: 'amount: 1,', description: 'Transaction récente corrigée' },
    { search: 'amount: 3,', description: 'Transaction récente corrigée' }
  ]
};

console.log('🔍 Vérification des corrections des valeurs de points...\n');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = [];

Object.entries(FILES_TO_CHECK).forEach(([filePath, checks]) => {
  const fullPath = path.join(WORKSPACE_ROOT, filePath);
  
  console.log(`📄 Vérification de ${filePath}:`);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`   ❌ Fichier introuvable: ${fullPath}`);
    failedChecks.push(`Fichier introuvable: ${filePath}`);
    return;
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  
  checks.forEach(check => {
    totalChecks++;
    
    if (content.includes(check.search)) {
      console.log(`   ✅ ${check.description}`);
      passedChecks++;
    } else {
      console.log(`   ❌ ${check.description} - "${check.search}" non trouvé`);
      failedChecks.push(`${filePath}: ${check.description}`);
    }
  });
  
  console.log('');
});

// Vérification que les anciennes valeurs élevées ont été supprimées
const HIGH_VALUE_PATTERNS = [
  /\b(7000|2000|3000|4500|8000|10000|15000|20000|25000|50000)\b/g,
  /\b\d{4,}\s*(pts|points|FCFA)\b/g
];

console.log('🔍 Vérification des anciennes valeurs élevées...\n');

Object.keys(FILES_TO_CHECK).forEach(filePath => {
  const fullPath = path.join(WORKSPACE_ROOT, filePath);
  
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    
    HIGH_VALUE_PATTERNS.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches) {
        const filteredMatches = matches.filter(match => {
          // Exclure les URLs, dates, et autres valeurs légitimes
          return !match.includes('pexels') && 
                 !match.includes('Date') && 
                 !match.includes('1000 * 60') &&
                 !match.match(/\d{4}-\d{2}-\d{2}/);
        });
        
        if (filteredMatches.length > 0) {
          console.log(`⚠️  ${filePath}: Anciennes valeurs détectées: ${filteredMatches.join(', ')}`);
          failedChecks.push(`${filePath}: Anciennes valeurs élevées trouvées`);
        }
      }
    });
  }
});

// Résumé final
console.log('\n📊 RÉSUMÉ DE LA VÉRIFICATION\n');
console.log(`✅ Vérifications réussies: ${passedChecks}/${totalChecks}`);

if (failedChecks.length > 0) {
  console.log(`❌ Vérifications échouées: ${failedChecks.length}`);
  console.log('\nDétails des échecs:');
  failedChecks.forEach(failure => console.log(`   - ${failure}`));
} else {
  console.log('🎉 Toutes les vérifications sont passées !');
}

console.log('\n🎯 STATUS FINAL:');
if (failedChecks.length === 0) {
  console.log('✅ SUCCÈS - Toutes les valeurs de points ont été correctement mises à jour');
  console.log('📱 L\'application est prête avec des valeurs cohérentes (7-10 pts/plat)');
} else {
  console.log('⚠️  ATTENTION - Certaines corrections peuvent nécessiter une révision');
}

console.log('\n🚀 Pour tester l\'application:');
console.log('   npm run dev');
console.log('   Ouvrir http://localhost:8082 dans le navigateur');
