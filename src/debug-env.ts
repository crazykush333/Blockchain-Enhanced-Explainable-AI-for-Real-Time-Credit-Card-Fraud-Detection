/**
 * Quick check to ensure private key is loaded in browser
 * This will be visible in the browser console when you open the app
 */

console.log('%c🔍 ENVIRONMENT DEBUG', 'color: blue; font-size: 14px; font-weight: bold;');
console.log('Checking if private key is loaded...\n');

// Check all VITE_ variables
const allEnv = Object.entries(import.meta.env)
  .filter(([key]) => key.startsWith('VITE_') || key.startsWith('PUBLIC_'))
  .map(([key, value]) => ({
    key,
    value: value ? `${String(value).substring(0, 10)}...` : 'undefined'
  }));

console.table(allEnv);

const hasPrivateKey = !!import.meta.env.VITE_GANACHE_PRIVATE_KEY;
console.log(`\n${hasPrivateKey ? '✅' : '❌'} VITE_GANACHE_PRIVATE_KEY: ${hasPrivateKey ? 'FOUND' : 'NOT FOUND'}`);

if (!hasPrivateKey) {
  console.error('❌ CRITICAL: Private key is not loaded!');
  console.error('   Make sure .env file has:');
  console.error('   VITE_GANACHE_PRIVATE_KEY=0x...');
  console.error('\n   Then restart the dev server with: npm run dev');
}
