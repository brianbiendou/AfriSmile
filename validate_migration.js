/**
 * Script de validation de la migration Mobile Money
 * Vérifie que tout fonctionne correctement
 */

const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

async function validateMigration() {
  console.log('🔍 VALIDATION DE LA MIGRATION MOBILE MONEY\n');
  
  let allTestsPassed = true;
  
  try {
    // Test 1: Connexion à Supabase
    console.log('1. Test de connexion à Supabase...');
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    if (response.ok) {
      console.log('   ✅ Connexion Supabase réussie');
    } else {
      console.log('   ❌ Erreur de connexion Supabase');
      allTestsPassed = false;
    }
    
    // Test 2: Vérification de la table mobile_money_fees
    console.log('\n2. Vérification de la table mobile_money_fees...');
    const feesResponse = await fetch(`${SUPABASE_URL}/rest/v1/mobile_money_fees`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    if (feesResponse.ok) {
      const fees = await feesResponse.json();
      console.log(`   ✅ Table trouvée avec ${fees.length} entrées`);
      
      // Vérifier les frais spécifiques
      const expectedFees = {
        'mtn': 175,
        'orange': 125,
        'moov': 100
      };
      
      console.log('\n3. Validation des frais par provider...');
      for (const fee of fees) {
        const expected = expectedFees[fee.provider];
        if (fee.fee_amount === expected) {
          console.log(`   ✅ ${fee.provider_name}: ${fee.fee_amount} FCFA (correct)`);
        } else {
          console.log(`   ❌ ${fee.provider_name}: ${fee.fee_amount} FCFA (attendu: ${expected})`);
          allTestsPassed = false;
        }
      }
    } else {
      console.log('   ❌ Table mobile_money_fees non trouvée');
      allTestsPassed = false;
    }
    
    // Test 3: Test des fonctions de conversion
    console.log('\n4. Test des fonctions de conversion...');
    try {
      const conversionResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/points_to_fcfa`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ points_amount: 100 })
      });
      
      if (conversionResponse.ok) {
        const result = await conversionResponse.json();
        console.log(`   ✅ points_to_fcfa(100) = ${result} FCFA`);
        
        // Vérifier que le résultat est cohérent avec le taux 78.359
        const expected = 100 * 78.359;
        if (Math.abs(result - expected) < 0.01) {
          console.log('   ✅ Taux de conversion correct (78.359 FCFA/point)');
        } else {
          console.log(`   ❌ Taux incorrect (attendu: ${expected})`);
          allTestsPassed = false;
        }
      } else {
        console.log('   ❌ Fonction points_to_fcfa non disponible');
        allTestsPassed = false;
      }
    } catch (error) {
      console.log('   ❌ Erreur lors du test de conversion:', error.message);
      allTestsPassed = false;
    }
    
    // Résumé final
    console.log('\n' + '='.repeat(50));
    if (allTestsPassed) {
      console.log('🎉 MIGRATION RÉUSSIE - TOUS LES TESTS PASSÉS ✅');
      console.log('📱 Le système Mobile Money est opérationnel!');
      console.log('🚀 Vous pouvez maintenant intégrer dans votre app');
    } else {
      console.log('❌ MIGRATION ÉCHOUÉE - CERTAINS TESTS ONT ÉCHOUÉ');
      console.log('🔧 Vérifiez les erreurs ci-dessus');
    }
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    console.log('\n🔧 Vérifiez que Supabase est démarré avec: npx supabase start');
  }
}

// Exécuter la validation
validateMigration();
