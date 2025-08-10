const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import MongoDB models
const User = require('./backend/models/User');
const Scheme = require('./backend/models/Scheme');
const Project = require('./backend/models/Project');
const Work = require('./backend/models/Work');

// MongoDB connection string - use the same as backend
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/itda_project_management';

async function seedDatabase() {
  try {
    console.log('🚀 Starting MongoDB Seeding...\n');
    
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB\n');
    
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Scheme.deleteMany({});
    await Project.deleteMany({});
    await Work.deleteMany({});
    console.log('✅ Existing data cleared\n');
    
    // Create Users
    console.log('👥 Creating users...');
    // Don't hash passwords here - the User model's pre-save hook will do it
    const users = await User.create([
      {
        username: 'admin',
        email: 'admin@itda.gov.in',
        password: 'admin123',  // Plain password - will be hashed by model
        role: 'admin',
        department: 'Administration'
      },
      {
        username: 'manager',
        email: 'manager@itda.gov.in',
        password: 'manager123',  // Plain password - will be hashed by model
        role: 'manager',
        department: 'Project Management'
      },
      {
        username: 'viewer',
        email: 'viewer@itda.gov.in',
        password: 'viewer123',  // Plain password - will be hashed by model
        role: 'viewer',
        department: 'General'
      }
    ]);
    console.log(`✅ Created ${users.length} users\n`);
    
    // Create Schemes
    console.log('📋 Creating schemes...');
    const schemes = await Scheme.create([
      {
        name: 'Pradhan Mantri Gram Sadak Yojana (PMGSY)',
        description: 'Rural road connectivity program to provide all-weather road access to unconnected villages',
        budget: 50000000,
        startDate: new Date('2024-04-01'),
        endDate: new Date('2025-03-31'),
        status: 'Active'
      },
      {
        name: 'Integrated Tribal Development Program (ITDP)',
        description: 'Comprehensive development program for tribal areas including education, health, and infrastructure',
        budget: 100000000,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: 'Active'
      },
      {
        name: 'Jal Jeevan Mission - Tribal Areas',
        description: 'Providing functional tap water connections to every rural household in tribal areas',
        budget: 75000000,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2025-05-31'),
        status: 'Active'
      },
      {
        name: 'Eklavya Model Residential Schools (EMRS)',
        description: 'Establishing quality educational institutions for tribal students',
        budget: 200000000,
        startDate: new Date('2024-04-01'),
        endDate: new Date('2025-03-31'),
        status: 'Planning'
      },
      {
        name: 'Van Dhan Vikas Kendra',
        description: 'Skill development and capacity building for tribal forest produce collectors',
        budget: 25000000,
        startDate: new Date('2023-04-01'),
        endDate: new Date('2024-03-31'),
        status: 'Completed'
      }
    ]);
    console.log(`✅ Created ${schemes.length} schemes\n`);
    
    // Create Projects
    console.log('🏗️ Creating projects...');
    const projects = await Project.create([
      // PMGSY Projects
      {
        name: 'Paderu-Araku Road Construction',
        description: 'Construction of 25km all-weather road connecting Paderu to Araku Valley',
        schemeId: schemes[0]._id,
        budget: 15000000,
        startDate: new Date('2024-05-01'),
        endDate: new Date('2024-12-31'),
        status: 'Active'
      },
      {
        name: 'G.Madugula-Chintapalli Link Road',
        description: 'Construction of 18km road linking G.Madugula to Chintapalli mandal',
        schemeId: schemes[0]._id,
        budget: 10000000,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2025-02-28'),
        status: 'Active'
      },
      
      // ITDP Projects
      {
        name: 'Tribal Health Center - Munchingiputtu',
        description: 'Construction of 50-bed primary health center with modern facilities',
        schemeId: schemes[1]._id,
        budget: 25000000,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-11-30'),
        status: 'Active'
      },
      {
        name: 'Digital Literacy Centers',
        description: 'Establishing 10 computer education centers in tribal villages',
        schemeId: schemes[1]._id,
        budget: 5000000,
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-09-30'),
        status: 'Active'
      },
      
      // Jal Jeevan Mission Projects
      {
        name: 'Piped Water Supply - Pedabayalu',
        description: 'Providing tap water connections to 500 households in Pedabayalu mandal',
        schemeId: schemes[2]._id,
        budget: 20000000,
        startDate: new Date('2024-07-01'),
        endDate: new Date('2025-03-31'),
        status: 'Active'
      },
      {
        name: 'Water Treatment Plant - Dumbriguda',
        description: 'Construction of water treatment plant with 5 MLD capacity',
        schemeId: schemes[2]._id,
        budget: 30000000,
        startDate: new Date('2024-08-01'),
        endDate: new Date('2025-04-30'),
        status: 'Planning'
      },
      
      // EMRS Projects
      {
        name: 'EMRS Construction - Araku Valley',
        description: 'Construction of residential school for 500 tribal students with hostel facilities',
        schemeId: schemes[3]._id,
        budget: 80000000,
        startDate: new Date('2024-05-01'),
        endDate: new Date('2025-12-31'),
        status: 'Planning'
      }
    ]);
    console.log(`✅ Created ${projects.length} projects\n`);
    
    // Create Works
    console.log('🔨 Creating works...');
    const works = await Work.create([
      // Works for Paderu-Araku Road
      {
        name: 'Earth Work - Km 0 to 5',
        description: 'Earthwork excavation and filling for road formation',
        schemeId: schemes[0]._id,
        projectId: projects[0]._id,
        contractor: 'M/s Krishna Constructions',
        budget: 2000000,
        amountSpent: 1200000,
        progress: 60,
        startDate: new Date('2024-05-15'),
        endDate: new Date('2024-07-31'),
        status: 'Active'
      },
      {
        name: 'Sub-base Preparation - Km 0 to 5',
        description: 'Laying and compaction of granular sub-base',
        schemeId: schemes[0]._id,
        projectId: projects[0]._id,
        contractor: 'M/s Krishna Constructions',
        budget: 1500000,
        amountSpent: 500000,
        progress: 35,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-08-15'),
        status: 'Active'
      },
      
      // Works for Tribal Health Center
      {
        name: 'Foundation Work',
        description: 'Foundation excavation and RCC foundation for health center building',
        schemeId: schemes[1]._id,
        projectId: projects[2]._id,
        contractor: 'M/s Sai Builders',
        budget: 5000000,
        amountSpent: 4500000,
        progress: 90,
        startDate: new Date('2024-02-15'),
        endDate: new Date('2024-04-30'),
        status: 'Active'
      },
      {
        name: 'Superstructure Construction',
        description: 'RCC frame structure, brick work, and roofing',
        schemeId: schemes[1]._id,
        projectId: projects[2]._id,
        contractor: 'M/s Sai Builders',
        budget: 8000000,
        amountSpent: 3000000,
        progress: 40,
        startDate: new Date('2024-05-01'),
        endDate: new Date('2024-09-30'),
        status: 'Active'
      },
      
      // Works for Water Supply
      {
        name: 'Pipeline Laying - Phase 1',
        description: 'Laying of 10km distribution pipeline in village areas',
        schemeId: schemes[2]._id,
        projectId: projects[4]._id,
        contractor: 'M/s Aqua Solutions',
        budget: 6000000,
        amountSpent: 2000000,
        progress: 30,
        startDate: new Date('2024-07-15'),
        endDate: new Date('2024-11-30'),
        status: 'Active'
      },
      {
        name: 'Overhead Tank Construction',
        description: 'Construction of 1 lakh liter capacity overhead water tank',
        schemeId: schemes[2]._id,
        projectId: projects[4]._id,
        contractor: 'M/s Aqua Solutions',
        budget: 4000000,
        amountSpent: 0,
        progress: 0,
        startDate: new Date('2024-08-01'),
        endDate: new Date('2024-12-31'),
        status: 'Planning'
      }
    ]);
    console.log(`✅ Created ${works.length} works\n`);
    
    // Summary
    console.log('🎉 Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Schemes: ${schemes.length}`);
    console.log(`   Projects: ${projects.length}`);
    console.log(`   Works: ${works.length}`);
    
    console.log('\n📝 Login Credentials:');
    console.log('   Admin: admin@itda.gov.in / admin123');
    console.log('   Manager: manager@itda.gov.in / manager123');
    console.log('   Viewer: viewer@itda.gov.in / viewer123');
    
    console.log('\n✨ Sample data includes:');
    console.log('   - Road construction projects under PMGSY');
    console.log('   - Health center construction under ITDP');
    console.log('   - Water supply projects under Jal Jeevan Mission');
    console.log('   - School construction under EMRS');
    console.log('   - Various works with different progress levels');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n📡 Closed MongoDB connection');
    process.exit();
  }
}

// Run seeding
seedDatabase();