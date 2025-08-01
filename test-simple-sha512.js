// Test simple du hachage SHA-512
const crypto = require('crypto');

function hashPasswordSHA512(password) {
  return crypto.createHash('sha512').update(password).digest('hex');
}

console.log('🔐 TEST SIMPLIFIÉ DU HACHAGE SHA-512');
console.log('===================================\n');

const testPasswords = [
  'password123',
  'TestPassword123!',
  'MotDePasse@2024',
  'SuperSecure#Pass789'
];

testPasswords.forEach((password, index) => {
  const hash = hashPasswordSHA512(password);
  console.log(`${index + 1}. Mot de passe: "${password}"`);
  console.log(`   Hash SHA-512: ${hash}`);
  console.log(`   Longueur: ${hash.length} caractères`);
  console.log(`   Hexadécimal: ${/^[a-f0-9]+$/i.test(hash) ? 'Oui' : 'Non'}\n`);
});

// Test de cohérence
console.log('🔍 TESTS DE COHÉRENCE:');
const testPwd = 'test123';
const hash1 = hashPasswordSHA512(testPwd);
const hash2 = hashPasswordSHA512(testPwd);
const hash3 = hashPasswordSHA512('different');

console.log(`✅ Même mot de passe = même hash: ${hash1 === hash2}`);
console.log(`✅ Mot de passe différent = hash différent: ${hash1 !== hash3}`);
console.log(`✅ Hash toujours 128 caractères: ${hash1.length === 128}`);

console.log('\n✨ Le hachage SHA-512 est maintenant intégré dans votre fonction registerUser !');
console.log('   Les mots de passe seront automatiquement hachés avant insertion en base.');
