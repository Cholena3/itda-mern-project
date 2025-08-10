const mongoose = require('mongoose');
require('dotenv').config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/itda-project';

async function cleanupIndexes() {
  try {
    console.log('🧹 Cleaning up all unnecessary indexes...\n');
    
    // Connect to MongoDB
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB\n');
    
    const db = mongoose.connection.db;
    
    // Drop unnecessary indexes
    const indexesToDrop = [
      { collection: 'schemes', index: 'schCode_1' },
      { collection: 'projects', index: 'projCode_1' },
      { collection: 'works', index: 'workCode_1' }
    ];
    
    for (const { collection, index } of indexesToDrop) {
      try {
        const coll = db.collection(collection);
        await coll.dropIndex(index);
        console.log(`✅ Dropped ${index} from ${collection}`);
      } catch (err) {
        console.log(`✔️ ${index} not found in ${collection} (already removed)`);
      }
    }
    
    console.log('\n✅ Cleanup completed successfully');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n📡 Closed MongoDB connection');
    process.exit();
  }
}

cleanupIndexes();