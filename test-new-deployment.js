const https = require('https');

const BASE_URL = 'https://sakadeco-group-eu1s2b29m-borelkamsus-projects.vercel.app';

function testAPI(endpoint) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${endpoint}`;
    console.log(`🔍 Testing: ${url}`);
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📊 Status: ${res.statusCode}`);
        
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            console.log(`✅ Response:`, json);
          } catch (e) {
            console.log(`📄 Raw response:`, data.substring(0, 200));
          }
        } else {
          console.log(`❌ Error response:`, data.substring(0, 200));
        }
        
        resolve({ statusCode: res.statusCode, data });
      });
    }).on('error', (err) => {
      console.error(`❌ Request error:`, err.message);
      reject(err);
    });
  });
}

async function runTests() {
  console.log('🧪 Testing new deployment...\n');
  
  try {
    console.log('=== Testing /api/health ===');
    await testAPI('/api/health');
    
    console.log('\n=== Testing /api/auth/user ===');
    await testAPI('/api/auth/user');
    
    console.log('\n=== Testing /api/products ===');
    await testAPI('/api/products');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

runTests();
