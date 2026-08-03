const fs = require('fs');
let content = fs.readFileSync('src/app/(main-layout)/messages/page.tsx', 'utf8');

content = content.replace(
  'className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col justify-start bg-gray-950 z-50 animate-in fade-in duration-200"',
  'className="w-full max-w-[350px] overflow-y-auto p-4 md:p-6 flex flex-col justify-start bg-gray-950 border-r border-white/10 z-50 animate-in fade-in duration-200 h-full"'
);

fs.writeFileSync('src/app/(main-layout)/messages/page.tsx', content);
console.log("Replaced width successfully");
