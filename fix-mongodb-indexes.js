const mongoose = require('mongoose');
require('dotenv').config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/itda-project';

async function fixIndexes() {
  try {
    console.log('🔧 Fixing MongoDB indexes...\n');
    
    // Connect to MongoDB
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB\n');
    
    // Get the schemes collection
    const db = mongoose.connection.db;
    const schemesCollection = db.collection('schemes');
    
    // List all indexes
    console.log('Current indexes on schemes collection:');
    const indexes = await schemesCollection.indexes();
    indexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });
    
    // Drop the problematic index if it exists
    try {
      await schemesCollection.dropIndex('schCode_1');
      console.log('\n✅ Dropped schCode_1 index');
    } catch (err) {
      console.log('\n✔️ schCode_1 index not found (already removed or doesn\'t exist)');
    }
    
    // Check for other collections with similar issues
    const collections = ['projects', 'works', 'users'];
    for (const collName of collections) {
      try {
        const coll = db.collection(collName);
        const indexes = await coll.indexes();
        console.log(`\nIndexes on ${collName}:`);
        indexes.forEach(index => {
          console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
        });
      } catch (err) {
        console.log(`\n${collName} collection not found`);
      }
    }
    
    console.log('\n✅ Index cleanup completed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n📡 Closed MongoDB connection');
    process.exit();
  }
}

fixIndexes();