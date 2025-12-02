// Script to upload NFT SVGs to IPFS using NFT.Storage
// Run: node upload-to-ipfs.js

import { NFTStorage, File } from 'nft.storage';

// You need to get a free API key from https://nft.storage/
// Set it as environment variable: export NFT_STORAGE_API_KEY="your-key-here"
const API_KEY = process.env.NFT_STORAGE_API_KEY || '';

if (!API_KEY) {
  console.error('❌ Please set NFT_STORAGE_API_KEY environment variable');
  console.log('Get a free API key from: https://nft.storage/');
  process.exit(1);
}

const storage = new NFTStorage({ token: API_KEY });

const nftSvgs = {
  RedSquare: '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="#f5f5f5"/><rect x="100" y="100" width="200" height="200" fill="#d2042d" stroke="#b0031f" stroke-width="1"/></svg>',
  WhiteOnWhite: '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="#f5f5f5"/><rect x="80" y="80" width="240" height="240" fill="#ffffff" stroke="#e0e0e0" stroke-width="1" opacity="0.9" transform="rotate(5 200 200)"/></svg>',
  BlackCircle: '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="#f5f5f5"/><circle cx="260" cy="140" r="120" fill="#000" stroke="#333" stroke-width="1"/></svg>',
  Suprematist: '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="#f5f5f5"/><rect x="50" y="80" width="100" height="100" fill="#d2042d" transform="rotate(25 100 130)"/><rect x="180" y="60" width="120" height="30" fill="#d2042d" transform="rotate(25 240 75)"/><rect x="200" y="120" width="80" height="80" fill="#d2042d" transform="rotate(25 240 160)"/><rect x="100" y="200" width="60" height="20" fill="#d2042d" transform="rotate(25 130 210)"/><rect x="250" y="200" width="50" height="50" fill="#d2042d" transform="rotate(25 275 225)"/><rect x="80" y="280" width="90" height="25" fill="#d2042d" transform="rotate(25 125 292.5)"/><rect x="220" y="280" width="70" height="20" fill="#d2042d" transform="rotate(25 255 290)"/><rect x="150" y="320" width="100" height="30" fill="#d2042d" transform="rotate(25 200 335)"/><rect x="300" y="300" width="60" height="60" fill="#d2042d" transform="rotate(25 330 330)"/></svg>',
  BlackSquare: '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="#f5f5f5"/><rect x="50" y="50" width="300" height="300" fill="#000" stroke="#333" stroke-width="1"/></svg>'
};

const metadata = {
  RedSquare: {
    name: 'Red Square',
    description: 'A red square homage to Malevich\'s famous composition.',
    attributes: [{ trait_type: 'Artwork', value: 'Red Square' }]
  },
  WhiteOnWhite: {
    name: 'White on White',
    description: 'A minimal white on white composition.',
    attributes: [{ trait_type: 'Artwork', value: 'White on White' }]
  },
  BlackCircle: {
    name: 'Black Circle',
    description: 'A black circle in suprematist style.',
    attributes: [{ trait_type: 'Artwork', value: 'Black Circle' }]
  },
  Suprematist: {
    name: 'Suprematist Composition',
    description: 'A suprematist geometric composition.',
    attributes: [{ trait_type: 'Artwork', value: 'Suprematist' }]
  },
  BlackSquare: {
    name: 'Black Square',
    description: 'A minimal on-chain homage to Malevich\'s Black Square.',
    attributes: [
      { trait_type: 'Mood', value: 'Suprematist' },
      { trait_type: 'Palette', value: 'Black' }
    ]
  }
};

async function uploadToIPFS() {
  console.log('🚀 Uploading NFT images and metadata to IPFS...\n');
  
  const imageResults = {};
  const metadataResults = {};
  
  // Step 1: Upload SVG images
  console.log('📤 Step 1: Uploading images...\n');
  for (const [name, svg] of Object.entries(nftSvgs)) {
    try {
      console.log(`  Uploading ${name} image...`);
      const file = new File([svg], `${name.toLowerCase()}.svg`, { type: 'image/svg+xml' });
      const cid = await storage.storeBlob(file);
      const ipfsUrl = `https://ipfs.io/ipfs/${cid}`;
      imageResults[name] = ipfsUrl;
      console.log(`  ✅ ${name}: ${ipfsUrl}\n`);
    } catch (error) {
      console.error(`  ❌ Error uploading ${name}:`, error.message);
    }
  }
  
  // Step 2: Create metadata with IPFS image URLs and upload
  console.log('📤 Step 2: Uploading metadata...\n');
  for (const [name, meta] of Object.entries(metadata)) {
    try {
      console.log(`  Uploading ${name} metadata...`);
      const fullMetadata = {
        ...meta,
        image: imageResults[name]
      };
      const file = new File([JSON.stringify(fullMetadata)], `${name.toLowerCase()}.json`, { type: 'application/json' });
      const cid = await storage.storeBlob(file);
      const ipfsUrl = `https://ipfs.io/ipfs/${cid}`;
      metadataResults[name] = ipfsUrl;
      console.log(`  ✅ ${name}: ${ipfsUrl}\n`);
    } catch (error) {
      console.error(`  ❌ Error uploading ${name} metadata:`, error.message);
    }
  }
  
  console.log('\n📋 Results:');
  console.log('\nImage IPFS URLs:');
  console.log(JSON.stringify(imageResults, null, 2));
  console.log('\nMetadata IPFS URLs (use these in contracts):');
  console.log(JSON.stringify(metadataResults, null, 2));
  
  console.log('\n📝 Contract-ready format (copy these to your contracts):');
  console.log('\n// MalevichCollectionNFT.sol');
  Object.entries(metadataResults).forEach(([name, url]) => {
    if (name !== 'BlackSquare') {
      const enumName = name === 'WhiteOnWhite' ? 'WhiteOnWhite' : name;
      console.log(`artworkURIs[ArtworkType.${enumName}] = "${url}";`);
    }
  });
  console.log('\n// BlackSquareNFT.sol');
  if (metadataResults.BlackSquare) {
    console.log(`TOKEN_URI = "${metadataResults.BlackSquare}";`);
  }
  
  console.log('\n💡 Next steps:');
  console.log('1. Copy the IPFS URLs above to your contracts');
  console.log('2. Replace data:application/json;base64,... with IPFS URLs');
  console.log('3. Redeploy the contracts');
  console.log('4. New NFTs will display images in MetaMask!');
  
  return { images: imageResults, metadata: metadataResults };
}

uploadToIPFS().catch(console.error);

