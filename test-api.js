const https = require('https');

const url = 'https://sakadeco-group-9slfche96-borelkamsus-projects.vercel.app/api/products';

console.log('Testing API:', url);

const req = https.get(url, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
  });
});

req.on('error', (err) => {
  console.error('Error:', err.message);
});

req.end();

