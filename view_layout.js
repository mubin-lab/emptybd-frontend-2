const fs = require('fs');
const content = fs.readFileSync('src/app/(main-layout)/messages/page.tsx', 'utf8');
const startIdx = content.indexOf('hidden md:flex');
console.log(content.substring(startIdx - 200, startIdx + 1000));
