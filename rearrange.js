const fs = require('fs');
let content = fs.readFileSync('src/app/(main-layout)/messages/page.tsx', 'utf8');

// Normalize newlines to \n
content = content.replace(/\r\n/g, '\n');

const headerStart = content.indexOf('              {/* Header */}');
const modalConditionStart = content.indexOf('{showGroupInfoModal && activeConversation?.isGroup ? (');
const elseStart = content.indexOf('\n              ) : (\n                <>\n              {/* Messages area */}');
const endOfCondition = content.indexOf('\n              )}', elseStart);

if (headerStart === -1 || modalConditionStart === -1 || elseStart === -1 || endOfCondition === -1) {
  console.log("Could not find bounds!");
  process.exit(1);
}

const headerContent = content.substring(headerStart, modalConditionStart);

// modalContent includes the actual JSX of the modal
const modalContent = content.substring(modalConditionStart + '{showGroupInfoModal && activeConversation?.isGroup ? ('.length, elseStart);

// chatContent includes the JSX of Messages and Input area (inside the <>)
const chatContent = content.substring(elseStart + '\n              ) : (\n                <>\n'.length, endOfCondition);

const newLayout = `{showGroupInfoModal && activeConversation?.isGroup ? (\n` +
  modalContent +
  `\n            ) : (\n              <>\n` +
  headerContent +
  chatContent +
  `              </>\n            )}`;

content = content.substring(0, headerStart) + newLayout + content.substring(endOfCondition + '\n              )}'.length);

fs.writeFileSync('src/app/(main-layout)/messages/page.tsx', content);
console.log("Rearranged successfully!");
