// Test spécifique pour vérifier la correction du password_hash
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wmaplqmwcixhptfodnqg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtYXBscW13Y2l4aHB0Zm9kbnFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2ODgxNzIsImV4cCI6MjA2ODI2NDE3Mn0.tesg_Zla2RV8JLAhvIbchYpbT97wLcv5IhPMrLVQTaU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testPasswordHashFix() {
  console.log('🔧 TEST DE LA CORRECTION PASSWORD_HASH');
  console.log('=====================================\n');

  const testEmail = `test-passwordhash-${Date.now()}@test.com`;
  const testPassword = 'TestPassword123!';

  try {
    console.log('1. Création du compte Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    if (authError) {
      console.log('❌ Erreur Auth:', authError.message);
      return;
    }

    console.log('✅ Compte Auth créé:', authData.user?.id);

    console.log('\n2. Test d\'insertion dans la table users...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user?.id,
        email: testEmail,
        password_hash: 'supabase_managed', // Valeur placeholder
        role: 'client',
        first_name: 'Test',
        last_name: 'User',
        phone: '123456789',
        points: 1000,
        balance: 500,
        is_active: true,
      })
      .select()
      .single();

    if (userError) {
      console.log('❌ Erreur insertion users:', userError.message);
      console.log('Code:', userError.code);
      console.log('Details:', userError.details);
      
      if (userError.code === '42501') {
        console.log('\n💡 Solution: Exécuter fix-rls-inscription.sql');
      } else if (userError.message.includes('password_hash')) {
        console.log('\n💡 Solution: Exécuter fix-password-hash-constraint.sql');
      }
    } else {
      console.log('✅ Insertion users réussie !');
      console.log('User ID:', userData.id);
      console.log('Email:', userData.email);
      console.log('Password Hash:', userData.password_hash);
    }

    console.log('\n3. Nettoyage...');
    // Supprimer le test user
    if (userData?.id) {
      await supabase.from('users').delete().eq('id', userData.id);
      console.log('✅ Test user supprimé');
    }

  } catch (error) {
    console.log('❌ Erreur générale:', error.message);
  }
}

testPasswordHashFix().catch(console.error);
