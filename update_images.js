const fs = require('fs');

async function getWikiImage(title) {
  try {
    const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=1000`, {
      headers: {
        'User-Agent': 'BidderProject/1.0 (mubin@example.com)'
      }
    });
    const data = await res.json();
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    if (pages[pageId].thumbnail) {
      return pages[pageId].thumbnail.source;
    }
  } catch(e) {
      console.error(e.message)
  }
  return null;
}

async function processFile(file) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (let item of data) {
    let query = item.Name.English;
    // Fixes for specific wikipedia page names
    if (query === 'Apple Inc.') query = 'Apple_Inc.';
    if (query === 'Google') query = 'Google';
    
    let img = await getWikiImage(query);
    if (img) {
      item.image = [img];
      console.log(`Updated ${query} -> ${img}`);
    } else {
      console.log(`No image found on Wiki for ${query}, trying alternate...`);
      // Fallbacks
      if (query === 'Kazi Nazrul Islam') {
          item.image = ["https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Kazi_Nazrul_Islam_Portrait.jpg/800px-Kazi_Nazrul_Islam_Portrait.jpg"];
      } else if (query === 'Shirakawa-go') {
          item.image = ["https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Shirakawa-go_Winter_illuminations.jpg/1024px-Shirakawa-go_Winter_illuminations.jpg"];
      } else if (query === 'SpaceX') {
          item.image = ["https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/SpaceX-Logo.svg/1024px-SpaceX-Logo.svg.png"];
      }
    }
  }
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

async function main() {
  await processFile('src/data/greatest-person.json');
  await processFile('src/data/greatest-village.json');
  await processFile('src/data/greatest-company.json');
}
main();
