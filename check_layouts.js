const fs = require('fs');
const path = require('path');

const APP_DIR = path.join('d:', 'Documents', 'projects', 'bidder-project', 'frontend', 'src', 'app');

function findMissingLayouts(dir) {
    let missingLayouts = [];
    const files = fs.readdirSync(dir);
    
    let hasPage = false;
    let hasLayout = false;
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stats = fs.statSync(fullPath);
        
        if (stats.isDirectory() && file !== 'admin' && file !== 'api') {
            missingLayouts = missingLayouts.concat(findMissingLayouts(fullPath));
        } else if (file === 'page.tsx') {
            hasPage = true;
        } else if (file === 'layout.tsx') {
            hasLayout = true;
        }
    }
    
    if (hasPage && !hasLayout && !dir.includes('admin') && !dir.includes('api')) {
        missingLayouts.push(path.relative(APP_DIR, dir) || 'root');
    }
    
    return missingLayouts;
}

const missing = findMissingLayouts(APP_DIR);
console.log("Pages missing layout.tsx:");
console.log(missing.length > 0 ? missing.join('\\n') : "All pages have a layout.tsx file!");
