/**
 * Script pour insérer les frais Mobile Money dans la base de données
 */

const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyyH-qQwv8Hdp7fsn3W0YpN81IU';

async function insertMobileMoneyFees() {
  console.log('📝 INSERTION DES FRAIS MOBILE MONEY...\n');
  
  const fees = [
    {
      provider: 'mtn',
      provider_name: 'MTN Mobile Money',
      fee_amount: 175.00,
      min_amount: 1.00,
      max_amount: 1000000.00,
      is_active: true
    },
    {
      provider: 'orange',
      provider_name: 'Orange Money',
      fee_amount: 125.00,
      min_amount: 1.00,
      max_amount: 1000000.00,
      is_active: true
    },
    {
      provider: 'moov',
      provider_name: 'Moov Money',
      fee_amount: 100.00,
      min_amount: 1.00,
      max_amount: 1000000.00,
      is_active: true
    }
  ];
  
  try {
    for (const fee of fees) {
      console.log(`Insertion ${fee.provider_name}...`);
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/mobile_money_fees`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(fee)
      });
      
      if (response.ok || response.status === 409) { // 409 = conflit, déjà existant
        console.log(`   ✅ ${fee.provider_name}: ${fee.fee_amount} FCFA`);
      } else {
        const error = await response.text();
        console.log(`   ❌ Erreur pour ${fee.provider_name}:`, error);
      }
    }
    
    // Vérification finale
    console.log('\n🔍 VÉRIFICATION...');
    const verifyResponse = await fetch(`${SUPABASE_URL}/rest/v1/mobile_money_fees`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    });
    
    if (verifyResponse.ok) {
      const insertedFees = await verifyResponse.json();
      console.log(`✅ ${insertedFees.length} frais Mobile Money trouvés dans la base`);
      
      insertedFees.forEach(fee => {
        console.log(`   ${fee.provider_name}: ${fee.fee_amount} FCFA`);
      });
      
      console.log('\n🎉 INSERTION TERMINÉE AVEC SUCCÈS!');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// Exécuter l'insertion
insertMobileMoneyFees();
