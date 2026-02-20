const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '../src/migrations/001_init.sql');
const destDir = path.join(__dirname, '../dist/migrations');
const dest = path.join(destDir, '001_init.sql');

if (fs.existsSync(src)) {
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
    console.log('✅ Copied 001_init.sql to dist/migrations');
} else {
    console.warn('⚠️  Warning: src/migrations/001_init.sql not found');
}
