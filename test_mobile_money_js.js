import { createClient } from '@supabase/supabase-js'

// Configuration Supabase local
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testMobileMoneySystem() {
  console.log('🧪 Test du système Mobile Money...\n')
  
  try {
    // Test 1: Vérifier les frais Mobile Money
    console.log('1. Récupération des frais Mobile Money:')
    const { data: fees, error: feesError } = await supabase
      .from('mobile_money_fees')
      .select('*')
      .order('provider')
    
    if (feesError) throw feesError
    
    fees.forEach(fee => {
      console.log(`   ${fee.provider_name}: ${fee.fee_amount} FCFA`)
    })
    
    // Test 2: Tester les fonctions de conversion
    console.log('\n2. Test des fonctions de conversion:')
    const { data: conversionTest, error: conversionError } = await supabase
      .rpc('points_to_fcfa', { points_amount: 100 })
    
    if (conversionError) throw conversionError
    console.log(`   100 points = ${conversionTest} FCFA`)
    
    const { data: fcfaTest, error: fcfaError } = await supabase
      .rpc('fcfa_to_points', { fcfa_amount: 1000 })
    
    if (fcfaError) throw fcfaError  
    console.log(`   1000 FCFA = ${fcfaTest} points`)
    
    // Test 3: Simuler un calcul de transaction avec frais
    console.log('\n3. Simulation transaction avec frais MTN:')
    const montantTransaction = 5000
    const feesMTN = fees.find(f => f.provider === 'mtn')
    
    if (feesMTN) {
      const totalAvecFrais = montantTransaction + feesMTN.fee_amount
      console.log(`   Montant: ${montantTransaction} FCFA`)
      console.log(`   Frais MTN: ${feesMTN.fee_amount} FCFA`)
      console.log(`   Total: ${totalAvecFrais} FCFA`)
      
      // Conversion en points
      const { data: pointsEquivalent } = await supabase
        .rpc('fcfa_to_points', { fcfa_amount: totalAvecFrais })
      console.log(`   Équivalent points: ${pointsEquivalent} points`)
    }
    
    console.log('\n✅ Système Mobile Money opérationnel !')
    
  } catch (error) {
    console.error('❌ Erreur:', error.message)
  }
}

// Exécuter le test
testMobileMoneySystem()
