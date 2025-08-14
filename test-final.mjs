import https from 'https';

const url = 'https://sakadeco-group-melt5xuhx-borelkamsus-projects.vercel.app/api/products';

console.log('Testing final deployment API:', url);

const req = https.get(url, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      try {
        const products = JSON.parse(data);
        console.log('✅ API fonctionne parfaitement !');
        console.log(`📦 ${products.length} produits trouvés :`);
        products.forEach((product, index) => {
          console.log(`   ${index + 1}. ${product.name} - ${product.price}€ (${product.category})`);
        });
      } catch (e) {
        console.log('❓ Réponse JSON invalide:', data.substring(0, 200));
      }
    } else if (data.includes('Authentication Required')) {
      console.log('❌ API protégée par authentification Vercel');
    } else {
      console.log('❓ Réponse inattendue:', data.substring(0, 200));
    }
  });
});

req.on('error', (err) => {
  console.error('Error:', err.message);
});

req.end();

