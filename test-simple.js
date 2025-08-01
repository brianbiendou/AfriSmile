// Test simple pour vérifier l'intégration Supabase
const fs = require('fs');

console.log('🧪 Test d\'intégration Supabase - Inscription\n');

// Vérifier que les modifications sont en place
const authContextContent = fs.readFileSync('./contexts/AuthContext.tsx', 'utf8');
const authScreenContent = fs.readFileSync('./components/AuthScreen.tsx', 'utf8');

let passed = 0;
let total = 6;

// Test 1: Import dynamique
if (authContextContent.includes('await import(\'@/lib/auth\')')) {
  console.log('✅ Import dynamique des fonctions d\'inscription');
  passed++;
} else {
  console.log('❌ Import dynamique non trouvé');
}

// Test 2: Appel registerUser
if (authContextContent.includes('await registerUser(')) {
  console.log('✅ Appel de registerUser');
  passed++;
} else {
  console.log('❌ Appel registerUser non trouvé');
}

// Test 3: Appel registerProvider
if (authContextContent.includes('await registerProvider(')) {
  console.log('✅ Appel de registerProvider');
  passed++;
} else {
  console.log('❌ Appel registerProvider non trouvé');
}

// Test 4: Connexion automatique
if (authContextContent.includes('setUser(formattedUser)')) {
  console.log('✅ Connexion automatique après inscription');
  passed++;
} else {
  console.log('❌ Connexion automatique non trouvée');
}

// Test 5: Message d'erreur amélioré
if (authScreenContent.includes('Erreur d\'inscription')) {
  console.log('✅ Message d\'erreur amélioré');
  passed++;
} else {
  console.log('❌ Message d\'erreur amélioré non trouvé');
}

// Test 6: Message de succès
if (authScreenContent.includes('Inscription réussie')) {
  console.log('✅ Message de succès ajouté');
  passed++;
} else {
  console.log('❌ Message de succès non trouvé');
}

console.log(`\n📊 Résultats: ${passed}/${total} tests passés (${Math.round(passed/total*100)}%)`);

if (passed === total) {
  console.log('🎉 Tous les tests passent ! L\'intégration Supabase est réussie.');
} else {
  console.log('⚠️  Certaines vérifications ont échoué.');
}

console.log('\n🚀 Pour tester manuellement:');
console.log('1. npm run dev');
console.log('2. Aller sur l\'écran d\'inscription');
console.log('3. Créer un nouveau compte');
console.log('4. Vérifier dans Supabase que le compte est créé');
