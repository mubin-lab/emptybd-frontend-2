const fs = require('fs');
let content = fs.readFileSync('src/app/(main-layout)/messages/page.tsx', 'utf8');

// 1. Find Group Info Modal exactly
const modalStartIdx = content.indexOf('              {/* Group Info Modal */}');
const modalEndMarker = '                </div>\n              )}\n';
const modalEndIdx = content.indexOf(modalEndMarker, modalStartIdx) + modalEndMarker.length;

let modalContentRaw = content.substring(modalStartIdx, modalEndIdx);

// Remove modal from original location
content = content.substring(0, modalStartIdx) + content.substring(modalEndIdx);

// Clean up the modal content to just be the inner div
let modalContentClean = modalContentRaw.replace(/\{\/\* Group Info Modal \*\/\}\n\s*\{showGroupInfoModal && activeConversation\?\.isGroup && \(\n/, '');
modalContentClean = modalContentClean.replace(/\s*\)\}\n*$/, '');

// Change absolute positioning to flex-1 relative
modalContentClean = modalContentClean.replace(
  'absolute top-0 left-0 w-full h-full bg-gray-950/95 z-50 p-4 md:p-6 flex flex-col justify-start overflow-y-auto backdrop-blur-md',
  'flex-1 overflow-y-auto p-4 md:p-6 flex flex-col justify-start bg-gray-950 z-50 animate-in fade-in duration-200'
);

// 2. Find Messages Area and Input Area exactly
const msgStartIdx = content.indexOf('              {/* Messages area */}');
const inputEndMarker = '                </form>\n              </div>';
const inputEndIdx = content.indexOf(inputEndMarker, msgStartIdx) + inputEndMarker.length;

const chatAreaContent = content.substring(msgStartIdx, inputEndIdx);

// 3. Replace the whole block
const newLayout = '{showGroupInfoModal && activeConversation?.isGroup ? (\\n' +
modalContentClean +
'\\n              ) : (\\n                <>\\n' +
chatAreaContent +
'\\n                </>\\n              )}';

content = content.substring(0, msgStartIdx) + newLayout + content.substring(inputEndIdx);

fs.writeFileSync('src/app/(main-layout)/messages/page.tsx', content);
console.log("Fixed Layout Successfully");
