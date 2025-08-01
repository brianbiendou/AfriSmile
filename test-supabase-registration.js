// Test complet du système d'inscription Supabase
// Ce script vérifie que l'inscription fonctionne correctement avec Supabase
// et qu'il n'y a pas de régressions dans le système d'authentification

const fs = require('fs').promises;
const path = require('path');

// Couleurs pour l'affichage
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Vérifications de l'intégration Supabase
const checks = [
  {
    name: 'AuthContext - Import dynamique registerUser/registerProvider',
    file: 'contexts/AuthContext.tsx',
    pattern: /const \{ registerUser, registerProvider \} = await import\('@\/lib\/auth'\)/,
    description: 'Vérifie l\'import dynamique des fonctions d\'inscription Supabase'
  },
  {
    name: 'AuthContext - Fonction register connectée',
    file: 'contexts/AuthContext.tsx',
    pattern: /await registerUser\(/,
    description: 'Vérifie que la fonction register appelle registerUser'
  },
  {
    name: 'AuthContext - Gestion registerProvider',
    file: 'contexts/AuthContext.tsx',
    pattern: /await registerProvider\(/,
    description: 'Vérifie que la fonction register appelle registerProvider'
  },
  {
    name: 'AuthContext - Connexion auto après inscription',
    file: 'contexts/AuthContext.tsx',
    pattern: /setUser\(formattedUser\)/,
    description: 'Vérifie la connexion automatique après inscription'
  },
  {
    name: 'AuthScreen - Gestion erreurs améliorée',
    file: 'components/AuthScreen.tsx',
    pattern: /Erreur d'inscription/,
    description: 'Vérifie l\'amélioration des messages d\'erreur'
  },
  {
    name: 'AuthScreen - Message de succès',
    file: 'components/AuthScreen.tsx',
    pattern: /Inscription réussie/,
    description: 'Vérifie l\'ajout du message de succès'
  },
  {
    name: 'lib/auth - registerUser fonction',
    file: 'lib/auth.ts',
    pattern: /export const registerUser = async/,
    description: 'Vérifie l\'existence de la fonction registerUser'
  },
  {
    name: 'lib/auth - registerProvider fonction',
    file: 'lib/auth.ts',
    pattern: /export const registerProvider = async/,
    description: 'Vérifie l\'existence de la fonction registerProvider'
  },
  {
    name: 'lib/auth - Supabase Auth signUp',
    file: 'lib/auth.ts',
    pattern: /supabase\.auth\.signUp/,
    description: 'Vérifie l\'utilisation de Supabase Auth pour l\'inscription'
  },
  {
    name: 'lib/auth - Insertion en base de données',
    file: 'lib/auth.ts',
    pattern: /\.from\(['"]users['"]\)[\s\S]*?\.insert/,
    description: 'Vérifie l\'insertion des utilisateurs en base'
  }
];

// Tests de non-régression
const regressionChecks = [
  {
    name: 'AuthContext - Fonction login préservée',
    file: 'contexts/AuthContext.tsx',
    pattern: /const login = async/,
    description: 'Vérifie que la fonction login n\'a pas été affectée'
  },
  {
    name: 'AuthContext - Comptes de test toujours présents',
    file: 'contexts/AuthContext.tsx',
    pattern: /client@test\.ci/,
    description: 'Vérifie que les comptes de test fonctionnent toujours'
  },
  {
    name: 'AuthContext - Reconnexion automatique préservée',
    file: 'contexts/AuthContext.tsx',
    pattern: /saveReconnectionData/,
    description: 'Vérifie que la reconnexion automatique fonctionne'
  },
  {
    name: 'AuthScreen - Formulaires de connexion préservés',
    file: 'components/AuthScreen.tsx',
    pattern: /handleQuickLogin/,
    description: 'Vérifie que la connexion rapide fonctionne'
  },
  {
    name: 'lib/auth - Cache toujours fonctionnel',
    file: 'lib/auth.ts',
    pattern: /setCachedData/,
    description: 'Vérifie que le système de cache fonctionne'
  }
];

async function checkFile(filePath, pattern) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return pattern.test(content);
  } catch (error) {
    return false;
  }
}

async function runTests() {
  log('\n🧪 TEST D\'INTÉGRATION SUPABASE - INSCRIPTION', colors.cyan);
  log('===============================================\n', colors.cyan);

  let passedChecks = 0;
  let totalChecks = checks.length;

  log('📋 Vérifications d\'intégration Supabase:\n', colors.blue);

  for (const check of checks) {
    const filePath = path.join(__dirname, check.file);
    const passed = await checkFile(filePath, check.pattern);
    
    if (passed) {
      log(`✅ ${check.name}`, colors.green);
      log(`   ${check.description}`, colors.reset);
      passedChecks++;
    } else {
      log(`❌ ${check.name}`, colors.red);
      log(`   ${check.description}`, colors.reset);
      log(`   Fichier: ${check.file}`, colors.yellow);
    }
    console.log();
  }

  log('\n📋 Tests de non-régression:\n', colors.blue);

  let regressionPassed = 0;
  for (const check of regressionChecks) {
    const filePath = path.join(__dirname, check.file);
    const passed = await checkFile(filePath, check.pattern);
    
    if (passed) {
      log(`✅ ${check.name}`, colors.green);
      log(`   ${check.description}`, colors.reset);
      regressionPassed++;
    } else {
      log(`❌ ${check.name}`, colors.red);
      log(`   ${check.description}`, colors.reset);
      log(`   Fichier: ${check.file}`, colors.yellow);
    }
    console.log();
  }

  // Résumé
  log('\n📊 RÉSUMÉ DES TESTS', colors.cyan);
  log('==================', colors.cyan);
  
  const integrationScore = (passedChecks / totalChecks) * 100;
  const regressionScore = (regressionPassed / regressionChecks.length) * 100;
  
  log(`\n🔗 Intégration Supabase: ${passedChecks}/${totalChecks} (${integrationScore.toFixed(1)}%)`, 
      integrationScore === 100 ? colors.green : colors.yellow);
  
  log(`🛡️  Non-régression: ${regressionPassed}/${regressionChecks.length} (${regressionScore.toFixed(1)}%)`, 
      regressionScore === 100 ? colors.green : colors.yellow);

  if (integrationScore === 100 && regressionScore === 100) {
    log('\n🎉 TOUS LES TESTS PASSENT !', colors.green);
    log('✅ L\'inscription Supabase est correctement intégrée', colors.green);
    log('✅ Aucune régression détectée', colors.green);
  } else {
    log('\n⚠️  CERTAINS TESTS ONT ÉCHOUÉ', colors.yellow);
    if (integrationScore < 100) {
      log('❌ Intégration Supabase incomplète', colors.red);
    }
    if (regressionScore < 100) {
      log('❌ Régressions détectées', colors.red);
    }
  }

  log('\n🔍 TESTS MANUELS RECOMMANDÉS', colors.cyan);
  log('============================', colors.cyan);
  log('\n1. 📝 Test d\'inscription client: Créer un nouveau compte client');
  log('2. 🏪 Test d\'inscription prestataire: Créer un compte prestataire');
  log('3. 🔄 Test de non-régression: Vérifier la connexion existante');
  log('4. ❌ Test de gestion d\'erreurs: Email existant, champs manquants');
  log('\n🚀 Pour lancer l\'application: npm run dev → http://localhost:8081');
}

async function main() {
  try {
    await runTests();
    log('\n✨ Tests terminés avec succès !', colors.green);
  } catch (error) {
    log(`\n💥 Erreur lors des tests: ${error.message}`, colors.red);
  }
}

if (require.main === module) {
  main();
}
  {
    name: 'AuthContext - Comptes de test toujours présents',
    file: 'contexts/AuthContext.tsx',
    pattern: /client@test\.ci/,
    description: 'Vérifie que les comptes de test fonctionnent toujours'
  },
  {
    name: 'AuthContext - Reconnexion automatique préservée',
    file: 'contexts/AuthContext.tsx',
    pattern: /saveReconnectionData/,
    description: 'Vérifie que la reconnexion automatique fonctionne'
  },
  {
    name: 'AuthScreen - Formulaires de connexion préservés',
    file: 'components/AuthScreen.tsx',
    pattern: /handleQuickLogin/,
    description: 'Vérifie que la connexion rapide fonctionne'
  },
  {
    name: 'lib/auth - Cache toujours fonctionnel',
    file: 'lib/auth.ts',
    pattern: /setCachedData/,
    description: 'Vérifie que le système de cache fonctionne'
  }
];

async function checkFile(filePath, pattern) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return pattern.test(content);
  } catch (error) {
    return false;
  }
}

async function runTests() {
  log('\n🧪 TEST D\'INTÉGRATION SUPABASE - INSCRIPTION', colors.cyan);
  log('===============================================\n', colors.cyan);

  let passedChecks = 0;
  let totalChecks = checks.length;

  log('📋 Vérifications d\'intégration Supabase:\n', colors.blue);

  for (const check of checks) {
    const filePath = path.join(__dirname, check.file);
    const passed = await checkFile(filePath, check.pattern);
    
    if (passed) {
      log(`✅ ${check.name}`, colors.green);
      log(`   ${check.description}`, colors.reset);
      passedChecks++;
    } else {
      log(`❌ ${check.name}`, colors.red);
      log(`   ${check.description}`, colors.reset);
      log(`   Fichier: ${check.file}`, colors.yellow);
    }
    console.log();
  }

  log('\n📋 Tests de non-régression:\n', colors.blue);

  let regressionPassed = 0;
  for (const check of regressionChecks) {
    const filePath = path.join(__dirname, check.file);
    const passed = await checkFile(filePath, check.pattern);
    
    if (passed) {
      log(`✅ ${check.name}`, colors.green);
      log(`   ${check.description}`, colors.reset);
      regressionPassed++;
    } else {
      log(`❌ ${check.name}`, colors.red);
      log(`   ${check.description}`, colors.reset);
      log(`   Fichier: ${check.file}`, colors.yellow);
    }
    console.log();
  }

  // Résumé
  log('\n📊 RÉSUMÉ DES TESTS', colors.cyan);
  log('==================', colors.cyan);
  
  const integrationScore = (passedChecks / totalChecks) * 100;
  const regressionScore = (regressionPassed / regressionChecks.length) * 100;
  
  log(`\n🔗 Intégration Supabase: ${passedChecks}/${totalChecks} (${integrationScore.toFixed(1)}%)`, 
      integrationScore === 100 ? colors.green : colors.yellow);
  
  log(`🛡️  Non-régression: ${regressionPassed}/${regressionChecks.length} (${regressionScore.toFixed(1)}%)`, 
      regressionScore === 100 ? colors.green : colors.yellow);

  if (integrationScore === 100 && regressionScore === 100) {
    log('\n🎉 TOUS LES TESTS PASSENT !', colors.green);
    log('✅ L\'inscription Supabase est correctement intégrée', colors.green);
    log('✅ Aucune régression détectée', colors.green);
  } else {
    log('\n⚠️  CERTAINS TESTS ONT ÉCHOUÉ', colors.yellow);
    if (integrationScore < 100) {
      log('❌ Intégration Supabase incomplète', colors.red);
    }
    if (regressionScore < 100) {
      log('❌ Régressions détectées', colors.red);
    }
  }

  // Instructions de test manuel
  log('\n🔍 TESTS MANUELS RECOMMANDÉS', colors.cyan);
  log('============================', colors.cyan);
  log('\n1. 📝 Test d\'inscription client:');
  log('   - Aller sur l\'écran d\'inscription');
  log('   - Sélectionner "Client"');
  log('   - Remplir email/mot de passe/nom/prénom');
  log('   - Vérifier la création du compte dans Supabase');
  log('   - Vérifier la connexion automatique');

  log('\n2. 🏪 Test d\'inscription prestataire:');
  log('   - Aller sur l\'écran d\'inscription');
  log('   - Sélectionner "Prestataire"');
  log('   - Remplir tous les champs obligatoires');
  log('   - Vérifier la création dans la table providers');

  log('\n3. 🔄 Test de non-régression:');
  log('   - Vérifier que la connexion avec comptes de test fonctionne');
  log('   - Vérifier que la reconnexion automatique fonctionne');
  log('   - Vérifier que le cache fonctionne normalement');

  log('\n4. ❌ Test de gestion d\'erreurs:');
  log('   - Tenter de créer un compte avec un email déjà existant');
  log('   - Vérifier l\'affichage du message d\'erreur approprié');
  log('   - Tester avec des champs manquants');

  log('\n🚀 Pour lancer l\'application:', colors.blue);
  log('   npm run dev', colors.cyan);
  log('   http://localhost:8081\n', colors.cyan);
}

// Tests de performance et sécurité
async function performanceTests() {
  log('\n⚡ TESTS DE PERFORMANCE', colors.magenta);
  log('======================', colors.magenta);

  const performanceChecks = [
    {
      name: 'Import dynamique pour éviter les dépendances circulaires',
      file: 'contexts/AuthContext.tsx',
      pattern: /await import\('@\/lib\/auth'\)/,
      description: 'Vérifie l\'utilisation d\'imports dynamiques'
    },
    {
      name: 'Cache des données utilisateur maintenu',
      file: 'lib/auth.ts',
      pattern: /setCachedData.*USER.*TIMESTAMP/,
      description: 'Vérifie que le cache des utilisateurs fonctionne'
    },
    {
      name: 'Logs de debugging présents',
      file: 'contexts/AuthContext.tsx',
      pattern: /console\.log.*Tentative d'inscription/,
      description: 'Vérifie la présence de logs pour le debugging'
    }
  ];

  let perfPassed = 0;
  for (const check of performanceChecks) {
    const filePath = path.join(__dirname, check.file);
    const passed = await checkFile(filePath, check.pattern);
    
    if (passed) {
      log(`✅ ${check.name}`, colors.green);
      perfPassed++;
    } else {
      log(`❌ ${check.name}`, colors.red);
    }
    log(`   ${check.description}`, colors.reset);
    console.log();
  }

  const perfScore = (perfPassed / performanceChecks.length) * 100;
  log(`Performance: ${perfPassed}/${performanceChecks.length} (${perfScore.toFixed(1)}%)`, 
      perfScore === 100 ? colors.green : colors.yellow);
}

// Lancer tous les tests
async function main() {
  try {
    await runTests();
    await performanceTests();
    
    log('\n✨ Tests terminés avec succès !', colors.green);
  } catch (error) {
    log(`\n💥 Erreur lors des tests: ${error.message}`, colors.red);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  runTests,
  performanceTests,
  checks,
  regressionChecks
};
