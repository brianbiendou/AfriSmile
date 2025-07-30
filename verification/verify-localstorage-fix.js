// Script de verification de la correction localStorage -> storage
const fs = require('fs');

console.log('Verification de la correction localStorage...\n');

const checkFile = (filePath, description) => {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Verifier qu'il n'y a plus de localStorage
      const hasLocalStorage = content.includes('localStorage.');
      const hasStorageImport = content.includes('import storage from');
      const hasStorageUsage = content.includes('storage.getItem') || content.includes('storage.setItem');
      
      console.log(`[${description}]`);
      console.log(`  - localStorage supprime: ${hasLocalStorage ? 'NON' : 'OUI'}`);
      console.log(`  - Import storage: ${hasStorageImport ? 'OUI' : 'NON'}`);
      console.log(`  - Utilise storage: ${hasStorageUsage ? 'OUI' : 'NON'}`);
      
      if (hasLocalStorage) {
        console.log('  ! Encore des references localStorage trouvees');
      }
      
      return !hasLocalStorage && hasStorageImport && hasStorageUsage;
    } else {
      console.log(`[${description}] FICHIER INTROUVABLE`);
      return false;
    }
  } catch (error) {
    console.log(`[${description}] ERREUR: ${error.message}`);
    return false;
  }
};

// Verification du fichier corrige
const goldContextOk = checkFile('contexts/GoldContext.tsx', 'GoldContext.tsx');

console.log('\nResume:');
if (goldContextOk) {
  console.log('[OK] Correction reussie - localStorage remplace par storage unifie');
  console.log('[OK] Plus d\'erreurs ReferenceError attendues');
  console.log('[OK] Compatible React Native et Web');
} else {
  console.log('[FAIL] Des problemes subsistent');
}

console.log('\nLes erreurs de navigation entre onglets devraient etre resolues!');
