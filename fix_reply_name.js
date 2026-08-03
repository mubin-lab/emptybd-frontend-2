const fs = require('fs');
let content = fs.readFileSync('src/app/(main-layout)/messages/page.tsx', 'utf8');

const targetStr = `      senderName: replyingToMessage.senderEmail === user.email
        ? "You"
        : getRecipientDetails({ participants: [user.email, replyingToMessage.senderEmail] } as Conversation).name`;

const replaceStr = `      senderName: replyingToMessage.senderEmail === user.email
        ? "You"
        : (activeConversation?.participantDetails?.[replyingToMessage.senderEmail]?.name || replyingToMessage.senderEmail.split('@')[0])`;

content = content.replace(new RegExp(targetStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replaceStr);

fs.writeFileSync('src/app/(main-layout)/messages/page.tsx', content);
console.log('Fixed reply names');
