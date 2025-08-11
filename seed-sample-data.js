const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./backend/models/User');
const Scheme = require('./backend/models/Scheme');
const Project = require('./backend/models/Project');
const Work = require('./backend/models/Work');

async function seedSampleData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create sample schemes
    console.log('\nCreating sample schemes...');
    const schemes = [
      {
        name: 'Rural Infrastructure Development',
        description: 'Development of rural roads, water supply, and electricity infrastructure',
        budget: 50000000,
        startDate: new Date('2024-04-01'),
        endDate: new Date('2025-03-31'),
        status: 'Active'
      },
      {
        name: 'Tribal Education Enhancement',
        description: 'Improving educational facilities and resources in tribal areas',
        budget: 25000000,
        startDate: new Date('2024-04-01'),
        endDate: new Date('2025-03-31'),
        status: 'Active'
      },
      {
        name: 'Healthcare Improvement Program',
        description: 'Upgrading healthcare facilities and services in ITDA regions',
        budget: 35000000,
        startDate: new Date('2024-04-01'),
        endDate: new Date('2025-03-31'),
        status: 'Active'
      },
      {
        name: 'Agricultural Development Scheme',
        description: 'Supporting agricultural productivity and farmer welfare',
        budget: 40000000,
        startDate: new Date('2024-04-01'),
        endDate: new Date('2025-03-31'),
        status: 'Active'
      },
      {
        name: 'Skill Development Program',
        description: 'Vocational training and skill enhancement for tribal youth',
        budget: 15000000,
        startDate: new Date('2024-04-01'),
        endDate: new Date('2025-03-31'),
        status: 'Planning'
      }
    ];

    const createdSchemes = [];
    for (const schemeData of schemes) {
      const scheme = new Scheme(schemeData);
      await scheme.save();
      createdSchemes.push(scheme);
      console.log(`✓ Created scheme: ${schemeData.name}`);
    }

    // Create sample projects
    console.log('\nCreating sample projects...');
    const projects = [
      {
        name: 'Road Construction - Village Connect',
        description: 'Construction of 25km rural roads connecting 5 villages',
        schemeId: createdSchemes[0]._id,
        budget: 5000000,
        startDate: new Date('2024-04-01'),
        endDate: new Date('2025-03-31'),
        status: 'Active',
        district: 'Gajapati',
        block: 'Mohana'
      },
      {
        name: 'School Building Renovation',
        description: 'Renovation of 10 tribal schools including new classrooms and facilities',
        schemeId: createdSchemes[1]._id,
        budget: 3000000,
        startDate: new Date('2024-05-01'),
        endDate: new Date('2024-12-31'),
        status: 'Active',
        district: 'Gajapati',
        block: 'Mohana'
      },
      {
        name: 'Primary Health Center Upgrade',
        description: 'Upgrading PHC with modern equipment and facilities',
        schemeId: createdSchemes[2]._id,
        budget: 4500000,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2025-02-28'),
        status: 'Active',
        district: 'Gajapati',
        block: 'Rayagada'
      },
      {
        name: 'Irrigation Canal Development',
        description: 'Construction of 15km irrigation canal for agricultural support',
        schemeId: createdSchemes[3]._id,
        budget: 8000000,
        startDate: new Date('2024-03-01'),
        endDate: new Date('2025-06-30'),
        status: 'Active',
        district: 'Gajapati',
        block: 'Nuagada'
      },
      {
        name: 'ITI Training Center',
        description: 'Establishing ITI center for vocational training',
        schemeId: createdSchemes[4]._id,
        budget: 2500000,
        startDate: new Date('2024-07-01'),
        endDate: new Date('2025-01-31'),
        status: 'Planning',
        district: 'Gajapati',
        block: 'R.Udayagiri'
      }
    ];

    const createdProjects = [];
    for (const projectData of projects) {
      const project = new Project(projectData);
      await project.save();
      createdProjects.push(project);
      console.log(`✓ Created project: ${projectData.name}`);
    }

    // Skip works for now - can be added later through the UI

    // Get summary
    const schemeCount = await Scheme.countDocuments();
    const projectCount = await Project.countDocuments();
    const workCount = await Work.countDocuments();
    const userCount = await User.countDocuments();

    console.log('\n✅ Sample data created successfully!');
    console.log('\nDatabase Summary:');
    console.log(`  - ${schemeCount} Schemes`);
    console.log(`  - ${projectCount} Projects`);
    console.log(`  - ${workCount} Works`);
    console.log(`  - ${userCount} Users`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the seed function
seedSampleData();