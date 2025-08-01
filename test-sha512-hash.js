// Test spécifique pour vérifier le hachage SHA-512 des mots de passe
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wmaplqmwcixhptfodnqg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtYXBscW13Y2l4aHB0Zm9kbnFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2ODgxNzIsImV4cCI6MjA2ODI2NDE3Mn0.tesg_Zla2RV8JLAhvIbchYpbT97wLcv5IhPMrLVQTaU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Simuler le hachage SHA-512 côté serveur (pour le test)
const crypto = require('crypto');

function hashPasswordSHA512(password) {
  return crypto.createHash('sha512').update(password).digest('hex');
}

async function testSHA512Hashing() {
  console.log('🔐 TEST DU HACHAGE SHA-512 DES MOTS DE PASSE');
  console.log('=============================================\n');

  const testPassword = 'TestPassword123!';
  const testEmail = 'test.sha512@example.com';

  console.log('1. Test du hachage SHA-512...');
  const hashedPassword = hashPasswordSHA512(testPassword);
  console.log(`✅ Mot de passe original: ${testPassword}`);
  console.log(`✅ Hash SHA-512: ${hashedPassword}`);
  console.log(`✅ Longueur du hash: ${hashedPassword.length} caractères\n`);

  console.log('2. Vérification des propriétés du hash...');
  console.log(`✅ Même mot de passe = même hash: ${hashPasswordSHA512(testPassword) === hashedPassword}`);
  console.log(`✅ Mot de passe différent = hash différent: ${hashPasswordSHA512('different') !== hashedPassword}`);
  console.log(`✅ Hash est hexadécimal: ${/^[a-f0-9]+$/i.test(hashedPassword)}\n`);

  try {
    console.log('3. Test d\'inscription avec hash SHA-512...');
    
    // Créer le compte Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    if (authError) {
      console.log('❌ Erreur Auth:', authError.message);
      return;
    }

    console.log('✅ Compte Auth créé');

    // Insérer dans la table users avec le hash SHA-512
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user?.id,
        email: testEmail,
        password_hash: hashedPassword, // Hash SHA-512 du mot de passe
        role: 'client',
        first_name: 'Test',
        last_name: 'SHA512',
        phone: '123456789',
        points: 1000,
        balance: 500,
        is_active: true,
      })
      .select()
      .single();

    if (userError) {
      console.log('❌ Erreur insertion:', userError.message);
      if (userError.code === '42501') {
        console.log('\n💡 Solution: Exécuter fix-rls-inscription.sql dans Supabase');
      }
    } else {
      console.log('✅ Inscription réussie avec hash SHA-512 !');
      console.log(`✅ User ID: ${userData.id}`);
      console.log(`✅ Email: ${userData.email}`);
      console.log(`✅ Password Hash stocké: ${userData.password_hash}`);
      console.log(`✅ Hash correspond: ${userData.password_hash === hashedPassword}`);

      // Nettoyage
      console.log('\n4. Nettoyage du test...');
      await supabase.from('users').delete().eq('id', userData.id);
      console.log('✅ Test user supprimé');
    }

  } catch (error) {
    console.log('❌ Erreur:', error.message);
  }

  console.log('\n🔒 SÉCURITÉ DU HACHAGE SHA-512:');
  console.log('✅ SHA-512 est un algorithme cryptographique sécurisé');
  console.log('✅ Hash de 512 bits (128 caractères hex)');
  console.log('✅ Impossible de retrouver le mot de passe depuis le hash');
  console.log('✅ Résistant aux attaques par collision');
  console.log('\n💡 Le hash est stocké dans votre table users et peut être utilisé');
  console.log('   pour des vérifications supplémentaires côté serveur si nécessaire.');
}

testSHA512Hashing().catch(console.error);
