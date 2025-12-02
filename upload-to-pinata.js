// Script to upload NFT SVGs to IPFS using Pinata
// Run: node upload-to-pinata.js

// You need to get a free API key from https://www.pinata.cloud/
// Set them as environment variables:
// export PINATA_API_KEY="your-api-key"
// export PINATA_SECRET_KEY="your-secret-key"
const apiKey = process.env.PINATA_API_KEY || '';
const secretKey = process.env.PINATA_SECRET_KEY || '';

if (!apiKey || !secretKey) {
  console.error('❌ Please set PINATA_API_KEY and PINATA_SECRET_KEY environment variables');
  console.log('Get free API keys from: https://www.pinata.cloud/');
  console.log('1. Sign up for free');
  console.log('2. Go to API Keys section');
  console.log('3. Create a new key');
  console.log('4. Copy API Key and Secret Key');
  process.exit(1);
}

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

async function uploadFileToPinata(name, content, contentType) {
  // Use node-fetch for proper FormData support
  const FormData = (await import('form-data')).default;
  const fetch = (await import('node-fetch')).default;
  
  const formData = new FormData();
  
  formData.append('file', Buffer.from(content), {
    filename: `${name}`,
    contentType: contentType
  });
  
  const pinataMetadata = JSON.stringify({
    name: name
  });
  formData.append('pinataMetadata', pinataMetadata);
  
  const pinataOptions = JSON.stringify({
    cidVersion: 0
  });
  formData.append('pinataOptions', pinataOptions);
  
  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      'pinata_api_key': apiKey,
      'pinata_secret_api_key': secretKey,
      ...formData.getHeaders()
    },
    body: formData
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Pinata API error: ${response.status} - ${error}`);
  }
  
  return await response.json();
}

async function uploadJSONToPinata(name, json) {
  const fetch = (await import('node-fetch')).default;
  
  const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'pinata_api_key': apiKey,
      'pinata_secret_api_key': secretKey
    },
    body: JSON.stringify({
      pinataContent: json,
      pinataMetadata: {
        name: name
      },
      pinataOptions: {
        cidVersion: 0
      }
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Pinata API error: ${response.status} - ${error}`);
  }
  
  return await response.json();
}

async function uploadToPinata() {
  console.log('🚀 Uploading NFT images and metadata to Pinata IPFS...\n');
  
  const imageResults = {};
  const metadataResults = {};
  
  // Step 1: Upload SVG images
  console.log('📤 Step 1: Uploading images...\n');
  for (const [name, svg] of Object.entries(nftSvgs)) {
    try {
      console.log(`  Uploading ${name} image...`);
      const result = await uploadFileToPinata(
        `${name.toLowerCase()}.svg`,
        svg,
        'image/svg+xml'
      );
      
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
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
      
      const result = await uploadJSONToPinata(
        `${name.toLowerCase()}.json`,
        fullMetadata
      );
      
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
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

uploadToPinata().catch(console.error);
