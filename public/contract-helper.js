// Helper function to set contract address in localStorage
// Run this in browser console after deploying the contract

window.setContractAddress = function(address) {
  if (!address || !address.startsWith('0x')) {
    console.error('❌ Invalid contract address. Must start with 0x');
    return;
  }
  
  localStorage.setItem('transactionRegistryAddress', address);
  console.log('✅ Contract address set:', address);
  console.log('🔄 Refresh the page to start using the contract');
};

window.getContractAddress = function() {
  const address = localStorage.getItem('transactionRegistryAddress');
  if (address) {
    console.log('📋 Current contract address:', address);
  } else {
    console.log('⚠️ No contract address set. Run: setContractAddress("0x...")');
  }
  return address;
};

console.log('🛠️ Helper functions loaded:');
console.log('  - setContractAddress("0x...")  →  Set contract address');
console.log('  - getContractAddress()         →  View current address');
console.log('\n💡 After deploying contract, run: setContractAddress("YOUR_ADDRESS")');
