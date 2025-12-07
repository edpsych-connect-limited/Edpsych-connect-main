const fs = require('fs');
const path = require('path');

const CLOUDINARY_RESULTS_PATH = path.join(__dirname, '..', 'cloudinary-upload-results.json');
const OUTPUT_PATH = path.join(__dirname, '..', 'cloudinary-video-urls.json');

function main() {
  console.log('Generating Video URL Mapping...');
  
  if (!fs.existsSync(CLOUDINARY_RESULTS_PATH)) {
    console.error('Error: Cloudinary results file not found. Run upload script first.');
    process.exit(1);
  }
  
  const results = JSON.parse(fs.readFileSync(CLOUDINARY_RESULTS_PATH, 'utf8'));
  const mapping = {};
  
  results.forEach(item => {
    if (item.status === 'uploaded' || item.status === 'skipped') {
      // Map key to secure URL
      mapping[item.key] = item.secureUrl;
      
      // Also map normalized versions for easier lookup
      // e.g. "autism-spectrum-support/autism-m1-l1" -> "autism-m1-l1"
      const basename = path.basename(item.key);
      if (basename !== item.key) {
        mapping[basename] = item.secureUrl;
      }
    }
  });
  
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(mapping, null, 2));
  console.log(`Successfully mapped ${Object.keys(mapping).length} video URLs.`);
  console.log(`Saved to ${OUTPUT_PATH}`);
}

main();