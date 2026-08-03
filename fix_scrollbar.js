const fs = require('fs');
let content = fs.readFileSync('src/app/(main-layout)/messages/page.tsx', 'utf8');

// Replace hide-scroll with custom-scrollbar
content = content.replace(
  'className="-mx-4 px-4 flex gap-2 overflow-x-auto pb-2 hide-scroll"',
  'className="-mx-4 px-4 flex gap-2 overflow-x-auto pb-2 custom-scrollbar"'
);

// Add custom-scrollbar to style block
const styleBlock = `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.08); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.15); }
`;
content = content.replace(
  '.chat-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.15); }',
  '.chat-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.15); }' + styleBlock
);

fs.writeFileSync('src/app/(main-layout)/messages/page.tsx', content);
console.log('Fixed scrollbar issue');
