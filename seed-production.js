// WARNING: Only run this once to avoid duplicate data
// This will seed your production database with test accounts and sample data

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./backend/models/User');
const Scheme = require('./backend/models/Scheme');
const Project = require('./backend/models/Project');
const Work = require('./backend/models/Work');

async function seedDatabase() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if users already exist
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('⚠️  Database already has users. Skipping seed to avoid duplicates.');
      console.log(`Found ${existingUsers} existing users.`);
      process.exit(0);
    }

    // Create users
    console.log('\nCreating users...');
    const users = [
      {
        username: 'admin',
        email: 'admin@itda.gov.in',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
        department: 'Administration'
      },
      {
        username: 'manager',
        email: 'manager@itda.gov.in',
        password: await bcrypt.hash('manager123', 10),
        role: 'manager',
        department: 'Project Management'
      },
      {
        username: 'viewer',
        email: 'viewer@itda.gov.in',
        password: await bcrypt.hash('viewer123', 10),
        role: 'viewer',
        department: 'Monitoring'
      }
    ];

    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      console.log(`✓ Created user: ${userData.email} (password: ${userData.email.split('@')[0]}123)`);
    }

    console.log('\n✅ Seed completed successfully!');
    console.log('\nYou can now login with:');
    console.log('  Admin: admin@itda.gov.in / admin123');
    console.log('  Manager: manager@itda.gov.in / manager123');
    console.log('  Viewer: viewer@itda.gov.in / viewer123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the seed function
seedDatabase();