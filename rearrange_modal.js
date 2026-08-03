const fs = require('fs');

let content = fs.readFileSync('src/app/(main-layout)/messages/page.tsx', 'utf8');

const modalStart = content.indexOf('{/* Group Info Modal */}');
const modalEndMarker = '                </div>\n              )}';
const modalEnd = content.indexOf(modalEndMarker, modalStart) + modalEndMarker.length;

let modalContent = content.substring(modalStart, modalEnd);
// Remove the original modal from content
content = content.substring(0, modalStart) + content.substring(modalEnd);

// Strip the conditional wrapping from the modalContent to extract inner JSX
modalContent = modalContent.replace(/\{\/\* Group Info Modal \*\/\}\n\s*\{showGroupInfoModal && activeConversation\?\.isGroup && \(\n/, '');
modalContent = modalContent.replace(/\s*\)\}\n*$/, '');

const msgStart = content.indexOf('{/* Messages area */}');
const inputEndMarker = '</form>\n              </div>';
const inputEnd = content.indexOf(inputEndMarker, msgStart) + inputEndMarker.length;

const messagesAndInputArea = content.substring(msgStart, inputEnd);

// Also let's change absolute positioning of modal content
modalContent = modalContent.replace('absolute top-0 left-0 w-full h-full bg-gray-950/95 z-50 p-4 md:p-6 flex flex-col justify-start overflow-y-auto backdrop-blur-md', 'flex-1 overflow-y-auto p-4 md:p-6 flex flex-col justify-start bg-gray-950 z-50 animate-in fade-in duration-200');

const replacement = `{showGroupInfoModal && activeConversation?.isGroup ? (\n` + 
  modalContent + 
  `\n              ) : (\n                <>\n                  ` + 
  messagesAndInputArea + 
  `\n                </>\n              )}`;

content = content.substring(0, msgStart) + replacement + content.substring(inputEnd);

fs.writeFileSync('src/app/(main-layout)/messages/page.tsx', content);
