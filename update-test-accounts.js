// Script pour mettre à jour les comptes de test avec les bons hashs SHA-512
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabaseUrl = 'https://wmaplqmwcixhptfodnqg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtYXBscW13Y2l4aHB0Zm9kbnFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2ODgxNzIsImV4cCI6MjA2ODI2NDE3Mn0.tesg_Zla2RV8JLAhvIbchYpbT97wLcv5IhPMrLVQTaU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

function hashPasswordSHA512(password) {
  return crypto.createHash('sha512').update(password).digest('hex');
}

async function updateTestAccountHashes() {
  console.log('🔧 MISE À JOUR DES COMPTES DE TEST');
  console.log('==================================\n');

  const testPassword = 'password123';
  const hashedPassword = hashPasswordSHA512(testPassword);
  
  console.log(`🔐 Mot de passe de test: "${testPassword}"`);
  console.log(`🔐 Hash SHA-512: ${hashedPassword}\n`);

  const testAccounts = [
    { email: 'client@test.ci', name: 'Client Test' },
    { email: 'admin@test.ci', name: 'Admin Test' }
  ];

  for (const account of testAccounts) {
    console.log(`🔄 Mise à jour de ${account.name} (${account.email})...`);
    
    try {
      // Vérifier si le compte existe
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('email', account.email)
        .maybeSingle();

      if (checkError) {
        console.log(`❌ Erreur de vérification: ${checkError.message}`);
        continue;
      }

      if (existingUser) {
        // Mettre à jour le hash du mot de passe
        const { data: updateResult, error: updateError } = await supabase
          .from('users')
          .update({ password_hash: hashedPassword })
          .eq('email', account.email)
          .select();

        if (updateError) {
          console.log(`❌ Erreur de mise à jour: ${updateError.message}`);
        } else {
          console.log(`✅ ${account.name} mis à jour avec succès`);
        }
      } else {
        console.log(`⚠️  ${account.name} n'existe pas encore`);
      }
    } catch (error) {
      console.log(`❌ Erreur système: ${error.message}`);
    }
  }

  console.log('\n🧪 Test de connexion après mise à jour...');
  
  // Tester la connexion avec le compte client
  const testEmail = 'client@test.ci';
  const testPasswordInput = 'password123';
  const testHash = hashPasswordSHA512(testPasswordInput);
  
  console.log(`\n🔍 Test de connexion pour: ${testEmail}`);
  
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('email', testEmail)
    .maybeSingle();

  if (!userError && userData) {
    console.log(`✅ Utilisateur trouvé: ${userData.first_name} ${userData.last_name}`);
    console.log(`🔐 Hash en base: ${userData.password_hash?.substring(0, 20)}...`);
    console.log(`🔐 Hash calculé: ${testHash.substring(0, 20)}...`);
    
    if (userData.password_hash === testHash) {
      console.log('🎉 SUCCÈS ! Les hashs correspondent - Connexion possible');
    } else {
      console.log('❌ Les hashs ne correspondent pas - Problème détecté');
    }
  } else {
    console.log('❌ Utilisateur non trouvé');
  }

  console.log('\n✨ Mise à jour terminée !');
  console.log('Vous pouvez maintenant tester la connexion dans votre application.');
}

updateTestAccountHashes().catch(console.error);
