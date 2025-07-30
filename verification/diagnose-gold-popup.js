// Script de diagnostic et reset du popup Gold
const fs = require('fs');

console.log('Diagnostic du popup Gold Membership...\n');

// Simulation des conditions d'affichage
console.log('Conditions d\'affichage du popup:');
console.log('1. Utilisateur connecte: OUI (assume)');
console.log('2. Pas d\'abonnement actif: A VERIFIER');
console.log('3. Pas encore vu le modal: A VERIFIER');
console.log('4. Delai de 2 secondes: OUI\n');

console.log('Problemes potentiels:');
console.log('- hasSeenMembershipModal = true (utilisateur a deja vu le popup)');
console.log('- Abonnement deja actif (membership.isActive = true)');
console.log('- Erreur dans la logique shouldShowMembershipModal()');
console.log('- Context GoldProvider pas correctement initialise\n');

console.log('Solutions:');
console.log('1. RESET: Effacer les donnees de storage local');
console.log('2. DEBUG: Ajouter des logs pour voir l\'etat du context');
console.log('3. FORCE: Forcer l\'affichage temporairement\n');

// Verification de l'integration
const checkIntegration = () => {
  console.log('Verification de l\'integration:');
  
  // Check layout
  const layoutPath = 'app/_layout.tsx';
  if (fs.existsSync(layoutPath)) {
    const content = fs.readFileSync(layoutPath, 'utf8');
    const hasGoldProvider = content.includes('<GoldProvider>');
    const hasGoldHandler = content.includes('<GoldMembershipHandler />');
    
    console.log(`- GoldProvider dans layout: ${hasGoldProvider ? 'OUI' : 'NON'}`);
    console.log(`- GoldMembershipHandler dans layout: ${hasGoldHandler ? 'OUI' : 'NON'}`);
  }
  
  // Check handler
  const handlerPath = 'components/GoldMembershipHandler.tsx';
  if (fs.existsSync(handlerPath)) {
    console.log('- GoldMembershipHandler existe: OUI');
  }
  
  // Check modal
  const modalPath = 'components/GoldMembershipModal.tsx';
  if (fs.existsSync(modalPath)) {
    console.log('- GoldMembershipModal existe: OUI');
  }
  
  // Check context
  const contextPath = 'contexts/GoldContext.tsx';
  if (fs.existsSync(contextPath)) {
    console.log('- GoldContext existe: OUI');
  }
};

checkIntegration();

console.log('\nActions recommandees:');
console.log('1. Ajouter des logs de debug dans GoldContext');
console.log('2. Verifier les donnees de storage');
console.log('3. Tester avec un nouvel utilisateur');
console.log('4. Forcer l\'affichage pour tester le design');
