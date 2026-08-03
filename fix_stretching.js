const fs = require('fs');
let content = fs.readFileSync('src/app/(main-layout)/messages/page.tsx', 'utf8');

content = content.replace(
  'className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 flex flex-col gap-4"',
  'className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 flex flex-col gap-4 w-full min-w-0"'
);

content = content.replace(
  'className="mt-2"\n                        ><h5',
  'className="mt-2 w-full min-w-0"\n                        ><h5' // Not exact, better use regex or just replace className="mt-2" exactly
);

content = content.replace(
  '<div className="mt-2">\n                        <h5 className="text-xs text-gray-500 mb-2 font-medium">Suggestions</h5>',
  '<div className="mt-2 w-full min-w-0">\n                        <h5 className="text-xs text-gray-500 mb-2 font-medium">Suggestions</h5>'
);

content = content.replace(
  '<div className="mt-2">\r\n                        <h5 className="text-xs text-gray-500 mb-2 font-medium">Suggestions</h5>',
  '<div className="mt-2 w-full min-w-0">\r\n                        <h5 className="text-xs text-gray-500 mb-2 font-medium">Suggestions</h5>'
);

// We should also make sure the container of the entire modal doesn't stretch
content = content.replace(
  'flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 flex flex-col justify-start bg-gray-950 z-50 animate-in fade-in duration-200',
  'flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 flex flex-col justify-start bg-gray-950 z-50 animate-in fade-in duration-200 w-full min-w-0'
);

fs.writeFileSync('src/app/(main-layout)/messages/page.tsx', content);
console.log('Fixed container stretching');
