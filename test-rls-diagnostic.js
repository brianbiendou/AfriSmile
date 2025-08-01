// Test de diagnostic pour l'erreur RLS
// Vérifier les politiques et permissions Supabase

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wmaplqmwcixhptfodnqg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtYXBscW13Y2l4aHB0Zm9kbnFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2ODgxNzIsImV4cCI6MjA2ODI2NDE3Mn0.tesg_Zla2RV8JLAhvIbchYpbT97wLcv5IhPMrLVQTaU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRLSPolicies() {
  console.log('🔍 DIAGNOSTIC DES POLITIQUES RLS');
  console.log('================================\n');

  // Test 1: Vérifier la connexion
  console.log('1. Test de connexion Supabase...');
  try {
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    if (error) {
      console.log('❌ Erreur de connexion:', error.message);
    } else {
      console.log('✅ Connexion OK');
    }
  } catch (err) {
    console.log('❌ Erreur de réseau:', err.message);
  }

  // Test 2: Tenter une inscription directe
  console.log('\n2. Test d\'inscription directe...');
  try {
    const { data, error } = await supabase.auth.signUp({
      email: `test-${Date.now()}@test.com`,
      password: 'testpassword123'
    });
    
    if (error) {
      console.log('❌ Erreur auth.signUp:', error.message);
    } else {
      console.log('✅ Auth.signUp réussi:', data.user?.id);
      
      // Test 3: Tenter l'insertion en base
      console.log('\n3. Test d\'insertion en base...');
      const { data: insertData, error: insertError } = await supabase
        .from('users')
        .insert({
          id: data.user?.id,
          email: data.user?.email,
          first_name: 'Test',
          last_name: 'User',
          phone: '123456789',
          address: 'Test Address',
          user_type: 'client'
        });
        
      if (insertError) {
        console.log('❌ Erreur insertion users:', insertError.message);
        console.log('Code:', insertError.code);
        console.log('Details:', insertError.details);
      } else {
        console.log('✅ Insertion users réussie');
      }
    }
  } catch (err) {
    console.log('❌ Erreur générale:', err.message);
  }

  // Test 4: Vérifier les politiques via SQL
  console.log('\n4. Vérification des politiques...');
  try {
    const { data: policies, error: policyError } = await supabase.rpc('get_policies');
    if (policyError) {
      console.log('❌ Impossible de récupérer les politiques:', policyError.message);
    } else {
      console.log('📋 Politiques trouvées:', policies?.length || 0);
    }
  } catch (err) {
    console.log('⚠️  Fonction get_policies non disponible');
  }

  console.log('\n💡 SOLUTIONS RECOMMANDÉES:');
  console.log('1. Exécuter le script fix-rls-inscription.sql dans l\'éditeur SQL');
  console.log('2. Vérifier que RLS est activé mais avec des politiques permissives');
  console.log('3. S\'assurer que la politique INSERT autorise TO public');
}

// Exécuter le test
testRLSPolicies().catch(console.error);
