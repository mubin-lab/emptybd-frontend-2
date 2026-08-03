const fs = require('fs');
let content = fs.readFileSync('src/app/(main-layout)/messages/page.tsx', 'utf8');

// Normalize newlines to \n
content = content.replace(/\r\n/g, '\n');

const headerStart = content.indexOf('              {/* Header */}');
const headerEndMarker = '                </button>\n              </div>';
const headerEnd = content.indexOf(headerEndMarker, headerStart) + headerEndMarker.length;

if (headerStart === -1 || headerEnd === -1) {
  console.log("Could not find header bounds!");
  process.exit(1);
}

const headerContent = content.substring(headerStart, headerEnd);

const wrappedHeader = `{(!showGroupInfoModal || !activeConversation?.isGroup) && (\n` +
  `                <>\n` + 
  headerContent +
  `\n                </>\n` +
  `              )}`;

content = content.substring(0, headerStart) + wrappedHeader + content.substring(headerEnd);

fs.writeFileSync('src/app/(main-layout)/messages/page.tsx', content);
console.log("Wrapped Header Successfully");
