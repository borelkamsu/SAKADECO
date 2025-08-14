import https from 'https';

const url = 'https://sakadeco-group-9slfche96-borelkamsus-projects.vercel.app/';

console.log('Testing main site:', url);

const req = https.get(url, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (data.includes('SakaDeco Group') || data.includes('SKD')) {
      console.log('✅ Site principal fonctionne !');
    } else if (data.includes('Authentication Required')) {
      console.log('❌ Site protégé par authentification Vercel');
    } else {
      console.log('❓ Réponse inattendue');
    }
  });
});

req.on('error', (err) => {
  console.error('Error:', err.message);
});

req.end();

