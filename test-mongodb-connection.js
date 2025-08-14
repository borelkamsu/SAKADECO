const mongoose = require('mongoose');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL || 'mongodb+srv://lama:lama@cluster0.254tgqb.mongodb.net/SDK?retryWrites=true&w=majority&appName=Cluster0';

async function testMongoDBConnection() {
  console.log('🧪 Testing MongoDB connection...');
  console.log('📡 Database URL:', DATABASE_URL.replace(/\/\/.*@/, '//***:***@'));
  
  try {
    await mongoose.connect(DATABASE_URL, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority'
    });
    
    console.log('✅ Successfully connected to MongoDB Atlas');
    console.log('📊 Database:', mongoose.connection.db?.databaseName || 'Unknown');
    
    if (mongoose.connection.db) {
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('📚 Available collections:', collections.map(c => c.name));
      
      // Test products collection
      const products = await mongoose.connection.db.collection('products').find().limit(3).toArray();
      console.log('📦 Sample products:', products.length);
      if (products.length > 0) {
        console.log('   -', products[0].name);
      }
    }
    
    await mongoose.disconnect();
    console.log('✅ Test completed successfully');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('🔍 Error details:', {
      name: error.name,
      code: error.code,
      message: error.message
    });
    
    if (error.code === 'ENOTFOUND') {
      console.log('💡 This might be a DNS resolution issue');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 This might be a network access issue');
    } else if (error.message.includes('authentication')) {
      console.log('💡 This might be an authentication issue');
    }
  }
}

testMongoDBConnection();
