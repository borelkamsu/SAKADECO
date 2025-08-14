const https = require('https');

const BASE_URL = 'https://sakadeco-group-2bq7qu8gt-borelkamsus-projects.vercel.app';

function testAPI(endpoint) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${endpoint}`;
    console.log(`🔍 Testing: ${url}`);
    
    const options = {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    };
    
    const req = https.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📊 Status: ${res.statusCode}`);
        console.log(`📄 Headers:`, res.headers);
        
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
    });
    
    req.on('error', (err) => {
      console.error(`❌ Request error:`, err.message);
      reject(err);
    });
    
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Vercel API...\n');
  
  try {
    await testAPI('/api/health');
    console.log('\n---\n');
    await testAPI('/api/products');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

runTests();
