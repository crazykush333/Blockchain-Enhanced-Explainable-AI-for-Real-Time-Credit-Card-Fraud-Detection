const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env');

try {
    console.log('Attemping to read .env from:', envPath);

    if (!fs.existsSync(envPath)) {
        console.error('❌ .env file not found!');
        process.exit(1);
    }

    // Try reading as buffer first to detect encoding
    const buffer = fs.readFileSync(envPath);
    let content = '';

    // Check for BOM or null bytes indicating UTF-16
    if (buffer.indexOf('\0') !== -1 || buffer.toString('hex').startsWith('fffe') || buffer.toString('hex').startsWith('feff')) {
        console.log('Detected UTF-16/UCS-2 encoding');
        content = buffer.toString('ucs2');
    } else {
        console.log('Detected UTF-8/ASCII encoding');
        content = buffer.toString('utf8');
    }

    console.log('File length:', content.length);

    // Debug: Print first 20 bytes in hex
    console.log('Hex Header:', buffer.slice(0, 20).toString('hex'));

    // Parse lines - relax regex to find key anywhere
    const lines = content.split(/\r?\n/);
    let privateKey = ''; // Initialize privateKey here

    // Try regex on whole content first (ignoring line breaks for a moment)
    const globalMatch = content.match(/GANACHE_PRIVATE_KEY\s*=\s*([0-9a-fA-Fx]+)/);
    if (globalMatch) {
        privateKey = globalMatch[1].trim();
    } else {
        // Fallback line by line
        for (const line of lines) {
            if (line.includes('GANACHE_PRIVATE_KEY')) {
                console.log('Found line with key:', line.substring(0, 20) + '...');
                const parts = line.split('=');
                if (parts.length >= 2) {
                    privateKey = parts[1].trim();
                    // Clean up potential quotes or whitespace
                    privateKey = privateKey.replace(/['"]/g, '').trim();
                    break;
                }
            }
        }
    }

    if (!privateKey) {
        console.error('❌ Could not find GANACHE_PRIVATE_KEY in file content.');
        // Debug print first few chars of lines if failed
        console.log('Preview of file content:', content.substring(0, 100));
        process.exit(1);
    }

    console.log('✅ Found Private Key');

    // Check if VITE_ variable already exists in the content
    if (content.includes('VITE_GANACHE_PRIVATE_KEY')) {
        console.log('ℹ️ VITE_GANACHE_PRIVATE_KEY already exists. Verifying value...');
        // Optional: Update it if different? For now just skip.
    } else {
        // Append properly
        const newContent = content.trim() + `\nVITE_GANACHE_PRIVATE_KEY=${privateKey}\n`;
        fs.writeFileSync(envPath, newContent, 'utf8'); // Save as standard UTF-8
        console.log('✅ Automatically added VITE_GANACHE_PRIVATE_KEY to .env');
        console.log('✅ Converted file to UTF-8');
    }

} catch (error) {
    console.error('Stack error:', error);
}
