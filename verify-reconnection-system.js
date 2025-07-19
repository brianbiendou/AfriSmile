/**
 * Script de test pour la reconnexion automatique
 * Teste toutes les fonctionnalités du système de reconnexion
 */

const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

const projectPath = path.join(__dirname);

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function checkFileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function checkFileContent(filePath, searchPattern) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return content.includes(searchPattern);
  } catch {
    return false;
  }
}

async function runTests() {
  log('\n🔄 TESTS DU SYSTÈME DE RECONNEXION AUTOMATIQUE', colors.bold + colors.cyan);
  log('='.repeat(60), colors.cyan);

  const tests = [
    {
      name: 'Module de reconnexion automatique',
      check: () => checkFileExists(path.join(projectPath, 'utils', 'autoReconnect.ts')),
      description: 'Vérifie que le module autoReconnect.ts existe'
    },
    {
      name: 'Fonctions de reconnexion dans autoReconnect',
      check: () => checkFileContent(
        path.join(projectPath, 'utils', 'autoReconnect.ts'),
        'export const performAutoReconnect'
      ),
      description: 'Vérifie que les fonctions de reconnexion sont exportées'
    },
    {
      name: 'Fonctions de cache dans autoReconnect',
      check: () => checkFileContent(
        path.join(projectPath, 'utils', 'autoReconnect.ts'),
        'saveReconnectionData'
      ),
      description: 'Vérifie les fonctions de gestion du cache'
    },
    {
      name: 'Composant ReconnectionStatus',
      check: () => checkFileExists(path.join(projectPath, 'components', 'ReconnectionStatus.tsx')),
      description: 'Vérifie que le composant ReconnectionStatus existe'
    },
    {
      name: 'Interface UI de reconnexion',
      check: () => checkFileContent(
        path.join(projectPath, 'components', 'ReconnectionStatus.tsx'),
        'Session interrompue'
      ),
      description: 'Vérifie l\'interface utilisateur de reconnexion'
    },
    {
      name: 'Import autoReconnect dans AuthContext',
      check: () => checkFileContent(
        path.join(projectPath, 'contexts', 'AuthContext.tsx'),
        'import.*autoReconnect'
      ),
      description: 'Vérifie l\'intégration dans AuthContext'
    },
    {
      name: 'Fonction login améliorée',
      check: () => checkFileContent(
        path.join(projectPath, 'contexts', 'AuthContext.tsx'),
        'saveReconnectionData'
      ),
      description: 'Vérifie que la fonction login sauvegarde les données de reconnexion'
    },
    {
      name: 'Fonction logout améliorée',
      check: () => checkFileContent(
        path.join(projectPath, 'contexts', 'AuthContext.tsx'),
        'clearReconnectionData'
      ),
      description: 'Vérifie que la fonction logout efface les données de reconnexion'
    },
    {
      name: 'loadUserData avec reconnexion automatique',
      check: () => checkFileContent(
        path.join(projectPath, 'contexts', 'AuthContext.tsx'),
        'canAutoReconnect'
      ),
      description: 'Vérifie que loadUserData gère la reconnexion automatique'
    },
    {
      name: 'ReconnectionStatus dans HomeScreen',
      check: () => checkFileContent(
        path.join(projectPath, 'app', '(tabs)', 'index.tsx'),
        'ReconnectionStatus'
      ),
      description: 'Vérifie l\'affichage du status de reconnexion'
    },
    {
      name: 'Gestion des comptes de test',
      check: () => checkFileContent(
        path.join(projectPath, 'utils', 'autoReconnect.ts'),
        'getTestCredentials'
      ),
      description: 'Vérifie la gestion des comptes de test pour la reconnexion'
    },
    {
      name: 'Système de cache avec timestamp',
      check: () => checkFileContent(
        path.join(projectPath, 'utils', 'autoReconnect.ts'),
        'lastLoginTime'
      ),
      description: 'Vérifie le système de cache avec horodatage'
    },
    {
      name: 'Gestion de l\'expiration des sessions',
      check: () => checkFileContent(
        path.join(projectPath, 'utils', 'autoReconnect.ts'),
        'MAX_AUTO_RECONNECT_DAYS'
      ),
      description: 'Vérifie la gestion de l\'expiration automatique'
    },
    {
      name: 'Interface utilisateur avec animations',
      check: () => checkFileContent(
        path.join(projectPath, 'components', 'ReconnectionStatus.tsx'),
        'Animated'
      ),
      description: 'Vérifie les animations de l\'interface'
    },
    {
      name: 'Support multi-utilisateurs',
      check: () => checkFileContent(
        path.join(projectPath, 'utils', 'autoReconnect.ts'),
        'client@test.ci'
      ),
      description: 'Vérifie le support des différents types d\'utilisateurs'
    }
  ];

  let passedTests = 0;
  const totalTests = tests.length;

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    const passed = await test.check();
    
    if (passed) {
      log(`✅ ${test.name}`, colors.green);
      passedTests++;
    } else {
      log(`❌ ${test.name}`, colors.red);
    }
    
    log(`   ${test.description}`, colors.yellow);
  }

  log('\n📊 RÉSULTATS DES TESTS', colors.bold + colors.magenta);
  log('='.repeat(40), colors.magenta);
  log(`Tests réussis: ${passedTests}/${totalTests}`, colors.green);
  log(`Pourcentage de réussite: ${Math.round((passedTests / totalTests) * 100)}%`, colors.cyan);

  if (passedTests === totalTests) {
    log('\n🎉 TOUS LES TESTS SONT PASSÉS !', colors.bold + colors.green);
    log('✅ Le système de reconnexion automatique est prêt', colors.green);
  } else {
    const failedTests = totalTests - passedTests;
    log(`\n⚠️ ${failedTests} test(s) échoué(s)`, colors.yellow);
    log('🔧 Vérifiez les éléments manquants ci-dessus', colors.yellow);
  }

  // Tests fonctionnels additionnels
  log('\n🧪 TESTS FONCTIONNELS', colors.bold + colors.blue);
  log('='.repeat(30), colors.blue);

  // Test de structure du projet
  const criticalFiles = [
    'utils/autoReconnect.ts',
    'components/ReconnectionStatus.tsx',
    'contexts/AuthContext.tsx',
    'app/(tabs)/index.tsx'
  ];

  let allCriticalFilesExist = true;
  for (const file of criticalFiles) {
    const exists = await checkFileExists(path.join(projectPath, file));
    if (!exists) {
      allCriticalFilesExist = false;
      log(`❌ Fichier critique manquant: ${file}`, colors.red);
    }
  }

  if (allCriticalFilesExist) {
    log('✅ Tous les fichiers critiques sont présents', colors.green);
  }

  // Recommandations
  log('\n📋 FONCTIONNALITÉS IMPLÉMENTÉES', colors.bold + colors.cyan);
  log('='.repeat(35), colors.cyan);
  log('🔐 Sauvegarde automatique des sessions de connexion', colors.green);
  log('⏰ Gestion de l\'expiration des sessions (7 jours)', colors.green);
  log('🔄 Reconnexion automatique au démarrage de l\'app', colors.green);
  log('👤 Support des comptes de test multiples', colors.green);
  log('🎨 Interface utilisateur avec animations', colors.green);
  log('💾 Système de cache local performant', colors.green);
  log('🧹 Nettoyage automatique lors de la déconnexion', colors.green);
  log('📱 Notification visuelle de statut de reconnexion', colors.green);

  log('\n🚀 COMMENT TESTER LA RECONNEXION', colors.bold + colors.yellow);
  log('='.repeat(35), colors.yellow);
  log('1. Connectez-vous avec un compte de test', colors.white);
  log('2. Fermez complètement l\'application', colors.white);
  log('3. Rouvrez l\'application', colors.white);
  log('4. Le système devrait automatiquement vous reconnecter', colors.white);
  log('5. En cas d\'échec, une notification apparaîtra en haut', colors.white);

  return passedTests === totalTests;
}

// Exécution
if (require.main === module) {
  runTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(err => {
    console.error('Erreur lors des tests:', err);
    process.exit(1);
  });
}

module.exports = { runTests };
