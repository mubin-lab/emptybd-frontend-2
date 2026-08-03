const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src/app/(main-layout)');

function addPrefetch(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      addPrefetch(filePath);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Regex to find <Link ... > and add prefetch={false} if not already present
      // We look for <Link followed by whitespace or line breaks, up to the closing >
      // We use a replacer function to be safe.
      let changed = false;
      content = content.replace(/<Link\b([^>]*?)>/g, (match, p1) => {
        // Skip if prefetch is already defined
        if (p1.includes('prefetch=')) {
          return match;
        }
        changed = true;
        return `<Link prefetch={false}${p1}>`;
      });

      if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
      }
    }
  }
}

addPrefetch(directoryPath);
console.log("Done.");
