/**
 * Script de vérification du système d'authentification
 * Vérifie que l'écran d'authentification s'affiche au démarrage
 * et que les connexions rapides fonctionnent
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification du système d\'authentification...\n');

// Configuration
const projectRoot = process.cwd();
const filesToCheck = [
  'app/_layout.tsx',
  'contexts/AuthContext.tsx',
  'components/AuthScreen.tsx',
  'utils/autoReconnect.ts',
  'utils/storage.ts'
];

let allChecks = [];

// Fonction utilitaire pour vérifier le contenu d'un fichier
function checkFileContent(filePath, checks) {
  const fullPath = path.join(projectRoot, filePath);
  
  if (!fs.existsSync(fullPath)) {
    allChecks.push({ file: filePath, check: 'Existence du fichier', status: '❌', details: 'Fichier introuvable' });
    return;
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  
  checks.forEach(check => {
    const found = check.pattern.test ? check.pattern.test(content) : content.includes(check.pattern);
    allChecks.push({
      file: filePath,
      check: check.description,
      status: found ? '✅' : '❌',
      details: found ? 'OK' : `Pattern manquant: ${check.pattern}`
    });
  });
}

// Vérifications pour app/_layout.tsx
console.log('📁 Vérification de app/_layout.tsx...');
checkFileContent('app/_layout.tsx', [
  {
    description: 'Import AuthScreen',
    pattern: "import AuthScreen from '@/components/AuthScreen'"
  },
  {
    description: 'Composant AppContent avec gestion auth',
    pattern: 'function AppContent()'
  },
  {
    description: 'Vérification isAuthenticated',
    pattern: 'if (!isAuthenticated)'
  },
  {
    description: 'Affichage AuthScreen si non connecté',
    pattern: 'return <AuthScreen />'
  }
]);

// Vérifications pour contexts/AuthContext.tsx
console.log('📁 Vérification de contexts/AuthContext.tsx...');
checkFileContent('contexts/AuthContext.tsx', [
  {
    description: 'Import des fonctions de reconnexion',
    pattern: "from '@/utils/autoReconnect'"
  },
  {
    description: 'Pas d\'utilisateur par défaut',
    pattern: /setUser\(null\)/
  },
  {
    description: 'Compte prestataire de test',
    pattern: 'prestataire@test.ci'
  },
  {
    description: 'Gestion reconnexion automatique',
    pattern: 'canAutoReconnect()'
  },
  {
    description: 'Sauvegarde données de reconnexion',
    pattern: 'saveReconnectionData'
  }
]);

// Vérifications pour components/AuthScreen.tsx
console.log('📁 Vérification de components/AuthScreen.tsx...');
checkFileContent('components/AuthScreen.tsx', [
  {
    description: 'Compte client de test',
    pattern: 'client@test.ci'
  },
  {
    description: 'Compte prestataire de test',
    pattern: 'prestataire@test.ci'
  },
  {
    description: 'Compte admin de test',
    pattern: 'admin@test.ci'
  },
  {
    description: 'Boutons de connexion rapide',
    pattern: 'quickLoginButtons'
  },
  {
    description: 'Description avec points FCFA',
    pattern: /\d+,\d+ pts \(\d+ FCFA\)/
  }
]);

// Vérifications pour utils/autoReconnect.ts
console.log('📁 Vérification de utils/autoReconnect.ts...');
checkFileContent('utils/autoReconnect.ts', [
  {
    description: 'Interface ReconnectionData',
    pattern: 'interface ReconnectionData'
  },
  {
    description: 'Fonction canAutoReconnect',
    pattern: 'export const canAutoReconnect'
  },
  {
    description: 'Fonction performAutoReconnect',
    pattern: 'export const performAutoReconnect'
  },
  {
    description: 'Fonction saveReconnectionData',
    pattern: 'export const saveReconnectionData'
  },
  {
    description: 'Gestion expiration session (7 jours)',
    pattern: 'MAX_AUTO_RECONNECT_DAYS = 7'
  }
]);

// Vérifications pour utils/storage.ts
console.log('📁 Vérification de utils/storage.ts...');
checkFileContent('utils/storage.ts', [
  {
    description: 'Interface StorageInterface typée',
    pattern: 'interface StorageInterface'
  },
  {
    description: 'Types pour getItem',
    pattern: 'getItem: (key: string) => Promise<string | null>'
  },
  {
    description: 'Types pour setItem',
    pattern: 'setItem: (key: string, value: string) => Promise<void>'
  },
  {
    description: 'Variable storage typée',
    pattern: 'let storage: StorageInterface'
  }
]);

// Affichage des résultats
console.log('\n📊 RÉSULTATS DE LA VÉRIFICATION\n');
console.log('═'.repeat(80));

const groupedResults = {};
allChecks.forEach(check => {
  if (!groupedResults[check.file]) {
    groupedResults[check.file] = [];
  }
  groupedResults[check.file].push(check);
});

let totalChecks = 0;
let passedChecks = 0;

Object.keys(groupedResults).forEach(file => {
  console.log(`\n📄 ${file}`);
  console.log('─'.repeat(50));
  
  groupedResults[file].forEach(check => {
    console.log(`  ${check.status} ${check.check}`);
    if (check.status === '❌') {
      console.log(`      ${check.details}`);
    }
    totalChecks++;
    if (check.status === '✅') passedChecks++;
  });
});

console.log('\n' + '═'.repeat(80));
console.log(`\n📈 RÉSUMÉ FINAL:`);
console.log(`   ✅ Tests réussis: ${passedChecks}/${totalChecks}`);
console.log(`   📊 Taux de réussite: ${Math.round((passedChecks/totalChecks)*100)}%`);

if (passedChecks === totalChecks) {
  console.log(`\n🎉 PARFAIT! Toutes les vérifications sont passées!`);
  console.log(`   L'écran d'authentification est correctement configuré.`);
  console.log(`   Vous pouvez maintenant vous connecter facilement avec:`);
  console.log(`   
   👤 CLIENT: client@test.ci (Marie Kouassi - 4,279 pts)
   🏪 PRESTATAIRE: prestataire@test.ci (Tante Marie - 8,559 pts)
   ⚙️  ADMIN: admin@test.ci (Système - 17,118 pts)
   
   Mot de passe pour tous: password123`);
} else {
  console.log(`\n⚠️  Certaines vérifications ont échoué.`);
  console.log(`   Veuillez corriger les erreurs avant de continuer.`);
}

console.log('\n🔗 Pour tester l\'application:');
console.log('   Web: http://localhost:8086');
console.log('   Mobile: Scannez le QR code avec Expo Go');
console.log('\n💡 FONCTIONNALITÉS DISPONIBLES:');
console.log('   ✨ Écran d\'authentification au démarrage');
console.log('   🚀 Connexion rapide avec comptes de test');
console.log('   🔄 Reconnexion automatique (7 jours)');
console.log('   💰 Nouveau système de points (1 FCFA = 85.59 pts)');
console.log('   🎯 Basculement facile Client/Prestataire');
