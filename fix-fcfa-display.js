#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fichiers prioritaires à corriger
const targetFiles = [
  'app/(account)/rewards.tsx',
  'app/order-summary.tsx', 
  'components/GoldMembershipModal.tsx',
  'components/DiscountSection.tsx',
  'utils/pricingSystem.ts'
];

const workspaceRoot = 'c:\\Users\\clark\\Videos\\Afrique\\AfriSmile_and_Kolofap';

// Patterns à rechercher et remplacer
const patterns = [
  {
    search: /(\w+)\.toLocaleString\(\)\s*FCFA/g,
    replace: 'formatFcfaAmount($1)'
  },
  {
    search: /(\w+)\.toLocaleString\(\)\s*pts/g,
    replace: 'formatPointsAmount($1)'
  },
  {
    search: /\$\{([^}]+)\.toLocaleString\(\)\}\s*FCFA/g,
    replace: '${formatFcfaAmount($1)}'
  },
  {
    search: /(\w+)\s*:\s*(\w+)\.toLocaleString\(\)\s*\+\s*\' FCFA\'/g,
    replace: '$1: formatFcfaAmount($2)'
  }
];

// Imports à ajouter
const importsToAdd = {
  'formatFcfaAmount': '@/utils/pointsConversion',
  'formatPointsAmount': '@/utils/pointsConversion',
  'getResponsiveTextProps': '@/utils/responsiveStyles'
};

function processFile(filePath) {
  const fullPath = path.join(workspaceRoot, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ Fichier non trouvé: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;
  
  // Vérifier si les imports existent déjà
  const hasFormatFcfaAmount = content.includes('formatFcfaAmount');
  const hasFormatPointsAmount = content.includes('formatPointsAmount');
  const hasGetResponsiveTextProps = content.includes('getResponsiveTextProps');
  
  // Ajouter les imports si nécessaire
  if (!hasFormatFcfaAmount || !hasFormatPointsAmount) {
    const importRegex = /import.*@\/utils\/pointsConversion['"]/;
    const match = content.match(importRegex);
    
    if (match) {
      // Modifier l'import existant
      const existingImport = match[0];
      if (!hasFormatFcfaAmount) {
        content = content.replace(existingImport, existingImport.replace(/\}/, ', formatFcfaAmount}'));
        modified = true;
      }
      if (!hasFormatPointsAmount) {
        content = content.replace(existingImport, existingImport.replace(/\}/, ', formatPointsAmount}'));
        modified = true;
      }
    } else {
      // Ajouter un nouvel import
      const importLine = "import { formatFcfaAmount, formatPointsAmount } from '@/utils/pointsConversion';";
      content = importLine + '\n' + content;
      modified = true;
    }
  }
  
  // Ajouter l'import pour getResponsiveTextProps si nécessaire
  if (!hasGetResponsiveTextProps) {
    const importLine = "import { getResponsiveTextProps } from '@/utils/responsiveStyles';";
    content = importLine + '\n' + content;
    modified = true;
  }
  
  // Appliquer les patterns de remplacement
  patterns.forEach(pattern => {
    const newContent = content.replace(pattern.search, pattern.replace);
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  });
  
  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Corrigé: ${filePath}`);
  } else {
    console.log(`ℹ️  Aucune modification nécessaire: ${filePath}`);
  }
}

console.log('🚀 Application des corrections FCFA...\n');

targetFiles.forEach(processFile);

console.log('\n✨ Corrections appliquées ! Vérifiez maintenant les erreurs de compilation.');
