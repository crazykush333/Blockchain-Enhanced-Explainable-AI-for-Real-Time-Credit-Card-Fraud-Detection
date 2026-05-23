const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env');

try {
    // Read .env file
    // Try reading as utf8 first, but accommodate the likely utf-16le from powerhsell/windows
    let envContent;
    try {
        envContent = fs.readFileSync(envPath, 'utf8');
    } catch (e) {
        envContent = fs.readFileSync(envPath, 'ucs2');
    }

    // Look for GANACHE_PRIVATE_KEY
    const match = envContent.match(/GANACHE_PRIVATE_KEY=(.+)/);

    if (match && match[1]) {
        const key = match[1].trim();
        console.log(`Found Private Key: ${key.slice(0, 6)}...`);

        // Check if VITE_ var exists
        if (!envContent.includes('VITE_GANACHE_PRIVATE_KEY')) {
            const newContent = envContent + `\nVITE_GANACHE_PRIVATE_KEY=${key}\n`;
            fs.writeFileSync(envPath, newContent, 'utf8'); // Write back as standard utf8
            console.log('✅ Added VITE_GANACHE_PRIVATE_KEY to .env');
        } else {
            console.log('ℹ️ VITE_GANACHE_PRIVATE_KEY already exists');
        }
    } else {
        console.error('❌ Could not find GANACHE_PRIVATE_KEY in .env');
    }
} catch (error) {
    console.error('Stack error:', error);
}
