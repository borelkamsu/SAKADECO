// Script pour tester l'API Vercel
const https = require('https');

// URL Vercel
const BASE_URL = 'https://sakadeco-group-2bq7qu8gt-borelkamsus-projects.vercel.app';

function testEndpoint(endpoint) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${endpoint}`;
    console.log(`🔍 Testing: ${url}`);
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`✅ ${endpoint}:`, json);
          resolve(json);
        } catch (e) {
          console.log(`📄 ${endpoint}:`, data);
          resolve(data);
        }
      });
    }).on('error', (err) => {
      console.error(`❌ ${endpoint}:`, err.message);
      reject(err);
    });
  });
}

async function runTests() {
  console.log('🧪 Testing Vercel API endpoints...\n');
  
  try {
    // Test health endpoint
    await testEndpoint('/api/health');
    console.log('');
    
    // Test products endpoint
    await testEndpoint('/api/products');
    console.log('');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Instructions
console.log('📝 Instructions:');
console.log('1. Modifiez la variable BASE_URL avec votre URL Vercel');
console.log('2. Exécutez: node test-vercel.js');
console.log('');

// Run tests if URL is set
if (BASE_URL !== 'https://votre-projet.vercel.app') {
  runTests();
} else {
  console.log('⚠️  Veuillez d\'abord modifier BASE_URL avec votre URL Vercel');
}
