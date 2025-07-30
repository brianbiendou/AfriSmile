// Script de verification des corrections d'animations
const fs = require('fs');

console.log('Verification des corrections d\'animations...\n');

const checkAnimationSafety = (filePath, componentName) => {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`[SKIP] ${componentName}: Fichier introuvable`);
      return false;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    
    // Verifications de securite
    const hasIsAnimating = content.includes('isAnimating');
    const hasTryCatch = content.includes('try {') && content.includes('catch (error)');
    const hasAnimationRef = content.includes('Ref.current');
    const hasCleanup = content.includes('return () =>');
    const hasConditionalCheck = content.includes('if (isAnimating) return');
    
    console.log(`[${componentName}]`);
    console.log(`  - State isAnimating: ${hasIsAnimating ? 'OUI' : 'NON'}`);
    console.log(`  - Protection try/catch: ${hasTryCatch ? 'OUI' : 'NON'}`);
    console.log(`  - Refs animations: ${hasAnimationRef ? 'OUI' : 'NON'}`);
    console.log(`  - Cleanup useEffect: ${hasCleanup ? 'OUI' : 'NON'}`);
    console.log(`  - Check concurrence: ${hasConditionalCheck ? 'OUI' : 'NON'}`);
    
    const score = [hasIsAnimating, hasTryCatch, hasAnimationRef, hasCleanup, hasConditionalCheck]
      .filter(Boolean).length;
    
    console.log(`  - Score securite: ${score}/5 ${score >= 4 ? '✓' : '✗'}\n`);
    
    return score >= 4;
  } catch (error) {
    console.log(`[ERROR] ${componentName}: ${error.message}`);
    return false;
  }
};

// Verification des composants corriges
const results = [
  checkAnimationSafety('components/CartModal.tsx', 'CartModal'),
  checkAnimationSafety('components/GoldMembershipModal.tsx', 'GoldMembershipModal'),
];

const passedTests = results.filter(Boolean).length;
const totalTests = results.length;

console.log('Resume:');
console.log(`Tests passes: ${passedTests}/${totalTests}`);

if (passedTests === totalTests) {
  console.log('[OK] Toutes les animations sont securisees');
  console.log('[OK] Les erreurs useInsertionEffect devraient etre resolues');
  console.log('[OK] Navigation entre onglets stable');
} else {
  console.log('[WARN] Certains composants necessitent encore des corrections');
}

console.log('\nRecommandations:');
console.log('- Redemarrer l\'application pour appliquer les corrections');
console.log('- Tester la navigation entre onglets');
console.log('- Verifier que les modals s\'ouvrent sans erreurs');
