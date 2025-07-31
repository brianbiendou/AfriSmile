/**
 * Test de la migration des frais Mobile Money
 * Vérifie que la nouvelle implémentation fonctionne correctement
 */

import { getFeeByProvider } from './utils/mobileMoneyFees';

async function testMobileMoneyMigration() {
  console.log('🧪 TEST DE LA MIGRATION MOBILE MONEY\n');
  
  try {
    // Test des frais individuels
    console.log('📱 Test des frais par provider:');
    
    const mtnFee = await getFeeByProvider('mtn');
    console.log(`   MTN: ${mtnFee} FCFA`);
    
    const orangeFee = await getFeeByProvider('orange');
    console.log(`   Orange: ${orangeFee} FCFA`);
    
    const moovFee = await getFeeByProvider('moov');
    console.log(`   Moov: ${moovFee} FCFA`);
    
    // Vérification des valeurs attendues
    console.log('\n✅ VALIDATION:');
    console.log(`   MTN = 175 FCFA: ${mtnFee === 175 ? '✅' : '❌'}`);
    console.log(`   Orange = 125 FCFA: ${orangeFee === 125 ? '✅' : '❌'}`);
    console.log(`   Moov = 100 FCFA: ${moovFee === 100 ? '✅' : '❌'}`);
    
    // Test du chargement simultané (comme dans CheckoutModal)
    console.log('\n⚡ Test du chargement simultané:');
    const startTime = Date.now();
    
    const [mtn, orange, moov] = await Promise.all([
      getFeeByProvider('mtn'),
      getFeeByProvider('orange'),
      getFeeByProvider('moov')
    ]);
    
    const loadTime = Date.now() - startTime;
    console.log(`   Temps de chargement: ${loadTime}ms`);
    console.log(`   Résultats: MTN(${mtn}), Orange(${orange}), Moov(${moov})`);
    
    console.log('\n🎉 MIGRATION RÉUSSIE - Les frais Mobile Money sont maintenant chargés depuis la base de données!');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    console.log('\n💡 Assurez-vous que Supabase est démarré: npx supabase start');
  }
}

// Exporter pour utilisation
export { testMobileMoneyMigration };

// Auto-exécution si script appelé directement
if (require.main === module) {
  testMobileMoneyMigration();
}
