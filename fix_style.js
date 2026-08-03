const fs = require('fs');
let content = fs.readFileSync('src/app/(main-layout)/messages/page.tsx', 'utf8');

content = content.replace(
  'className="flex gap-2 overflow-x-auto pb-2 hide-scroll"',
  'className="-mx-4 px-4 flex gap-2 overflow-x-auto pb-2 hide-scroll"'
);

// We should also check the Staged Members area!
// The staged members currently has:
// <div className="flex flex-wrap gap-2 mb-2 p-2 bg-black/20 rounded-lg border border-gray-800/50">
// This wraps correctly, so it's fine.

fs.writeFileSync('src/app/(main-layout)/messages/page.tsx', content);
console.log('Fixed styling');
