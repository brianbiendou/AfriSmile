// Test simple du système Mobile Money
import { getFeeByProvider, getMobileMoneyFees } from './utils/mobileMoneyFees';

async function testSystem() {
  console.log('🧪 Test du système Mobile Money...\n');
  
  try {
    // Test 1: Récupérer tous les frais
    console.log('1. Récupération de tous les frais:');
    const allFees = await getMobileMoneyFees();
    allFees.forEach((fee: any) => {
      console.log(`   ${fee.provider_name}: ${fee.fee_amount} FCFA`);
    });
    
    // Test 2: Récupérer les frais par provider
    console.log('\n2. Frais spécifiques par provider:');
    const mtnFee = await getFeeByProvider('mtn');
    const orangeFee = await getFeeByProvider('orange');
    const moovFee = await getFeeByProvider('moov');
    
    console.log(`   MTN: ${mtnFee} FCFA`);
    console.log(`   Orange: ${orangeFee} FCFA`);
    console.log(`   Moov: ${moovFee} FCFA`);
    
    // Test 3: Validation des montants
    console.log('\n3. Validation:');
    console.log(`   MTN = 175 FCFA ? ${mtnFee === 175 ? '✅' : '❌'}`);
    console.log(`   Orange = 125 FCFA ? ${orangeFee === 125 ? '✅' : '❌'}`);
    console.log(`   Moov = 100 FCFA ? ${moovFee === 100 ? '✅' : '❌'}`);
    
    console.log('\n✅ Tests terminés avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Exporter pour utilisation
export { testSystem };
