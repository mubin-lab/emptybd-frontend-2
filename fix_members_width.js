const fs = require('fs');
let content = fs.readFileSync('src/app/(main-layout)/messages/page.tsx', 'utf8');

content = content.replace(
  'className="mb-6 bg-gray-900/50 p-4 rounded-xl border border-gray-800"',
  'className="mb-6 bg-gray-900/50 p-4 rounded-xl border border-gray-800 w-full min-w-0"'
);

fs.writeFileSync('src/app/(main-layout)/messages/page.tsx', content);
console.log('Fixed members width');
