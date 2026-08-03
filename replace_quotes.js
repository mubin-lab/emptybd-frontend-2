const fs = require('fs');
const path = require('path');

const targetFiles = [
  "d:/Documents/projects/bidder-project/frontend/src/app/(main-layout)/digital-exchange/[id]/layout.tsx",
  "d:/Documents/projects/bidder-project/frontend/src/app/(main-layout)/e-commerce-products/[id]/layout.tsx",
  "d:/Documents/projects/bidder-project/frontend/src/app/(main-layout)/user/[id]/layout.tsx",
  "d:/Documents/projects/bidder-project/frontend/src/app/(main-layout)/shop/[email]/layout.tsx",
  "d:/Documents/projects/bidder-project/frontend/src/app/(main-layout)/bid/all-selling-product/[id]/layout.tsx"
];

for (const file of targetFiles) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    // Replace double backslash quote with single backslash quote (for single-quoted strings)
    // or just regular quote for backtick strings.
    // It's safer to just replace EmptyBD\\'s with EmptyBD\'s and Bangladesh\\'s with Bangladesh\'s
    content = content.replace(/EmptyBD\\\\'s/g, "EmptyBD\\\\'s"); // wait, replace /EmptyBD\\\\'s/g with EmptyBD\\'s
    // To be precise: in regex, /EmptyBD\\\\'s/ matches `EmptyBD\\'s`. We want to replace `\\'` with `\'`.
    content = content.replace(/EmptyBD\\\\'/g, "EmptyBD\\'");
    content = content.replace(/Bangladesh\\\\'/g, "Bangladesh\\'");
    
    // Also, if they are inside template literals, we actually don't even need the backslash.
    // Let's just normalize to template literals where needed or just use regular quotes.
    
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Fixed ${file}`);
  }
}
