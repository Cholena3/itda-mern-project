const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Scheme = require('./backend/models/Scheme');
const Project = require('./backend/models/Project');
const Work = require('./backend/models/Work');

async function seedWorks() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get existing schemes and projects
    const schemes = await Scheme.find().limit(5);
    const projects = await Project.find().limit(5);

    if (projects.length === 0 || schemes.length === 0) {
      console.log('No projects or schemes found. Please run seed-sample-data.js first.');
      process.exit(1);
    }

    console.log(`Found ${schemes.length} schemes and ${projects.length} projects`);

    // Create works for each project
    const works = [
      // Works for Road Construction project
      {
        name: 'Road Section A - 5km',
        description: 'First section of village connecting road from km 0 to km 5',
        projectId: projects[0]._id,
        schemeId: projects[0].schemeId,
        budget: 1000000,
        startDate: new Date('2024-04-15'),
        endDate: new Date('2024-08-31'),
        status: 'Completed',
        progress: 100,
        contractor: 'ABC Infrastructure Ltd.',
        amountSpent: 950000,
        district: 'Gajapati',
        block: 'Mohana',
        village: 'Karadasingi'
      },
      {
        name: 'Road Section B - 10km',
        description: 'Second section of village connecting road from km 5 to km 15',
        projectId: projects[0]._id,
        schemeId: projects[0].schemeId,
        budget: 2000000,
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-01-31'),
        status: 'Active',
        progress: 45,
        contractor: 'ABC Infrastructure Ltd.',
        amountSpent: 900000,
        district: 'Gajapati',
        block: 'Mohana',
        village: 'Badasingi'
      },
      {
        name: 'Road Section C - 10km',
        description: 'Third section of village connecting road from km 15 to km 25',
        projectId: projects[0]._id,
        schemeId: projects[0].schemeId,
        budget: 2000000,
        startDate: new Date('2025-02-01'),
        endDate: new Date('2025-03-31'),
        status: 'Planning',
        progress: 0,
        contractor: 'ABC Infrastructure Ltd.',
        amountSpent: 0,
        district: 'Gajapati',
        block: 'Mohana',
        village: 'Luhagudi'
      },
      // Works for School Building project
      {
        name: 'School Building Block A',
        description: 'Construction of new classroom block with 6 rooms',
        projectId: projects[1]._id,
        schemeId: projects[1].schemeId,
        budget: 1500000,
        startDate: new Date('2024-05-15'),
        endDate: new Date('2024-10-31'),
        status: 'Active',
        progress: 60,
        contractor: 'XYZ Construction',
        amountSpent: 900000,
        district: 'Gajapati',
        block: 'Mohana',
        gramPanchayat: 'Birikote',
        village: 'Birikote'
      },
      {
        name: 'School Toilet Block',
        description: 'Construction of separate toilet blocks for boys and girls',
        projectId: projects[1]._id,
        schemeId: projects[1].schemeId,
        budget: 500000,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-09-30'),
        status: 'Active',
        progress: 80,
        contractor: 'XYZ Construction',
        amountSpent: 400000,
        district: 'Gajapati',
        block: 'Mohana',
        gramPanchayat: 'Birikote',
        village: 'Birikote'
      },
      {
        name: 'School Playground Development',
        description: 'Development of playground and sports facilities',
        projectId: projects[1]._id,
        schemeId: projects[1].schemeId,
        budget: 1000000,
        startDate: new Date('2024-11-01'),
        endDate: new Date('2024-12-31'),
        status: 'Planning',
        progress: 0,
        contractor: 'Sports Infra Co.',
        amountSpent: 0,
        district: 'Gajapati',
        block: 'Mohana',
        gramPanchayat: 'Birikote',
        village: 'Birikote'
      },
      // Works for PHC project
      {
        name: 'PHC Building Renovation',
        description: 'Complete renovation of existing PHC building',
        projectId: projects[2]._id,
        schemeId: projects[2].schemeId,
        budget: 2000000,
        startDate: new Date('2024-06-20'),
        endDate: new Date('2024-12-31'),
        status: 'Active',
        progress: 35,
        contractor: 'Healthcare Infra Ltd.',
        amountSpent: 700000,
        district: 'Gajapati',
        block: 'Rayagada',
        gramPanchayat: 'Chandragiri',
        village: 'Chandragiri'
      },
      {
        name: 'Medical Equipment Installation',
        description: 'Installation of X-ray machine, ECG, and other equipment',
        projectId: projects[2]._id,
        schemeId: projects[2].schemeId,
        budget: 2500000,
        startDate: new Date('2024-10-01'),
        endDate: new Date('2025-02-28'),
        status: 'Active',
        progress: 20,
        contractor: 'MedTech Solutions',
        amountSpent: 500000,
        district: 'Gajapati',
        block: 'Rayagada',
        gramPanchayat: 'Chandragiri',
        village: 'Chandragiri'
      },
      // Works for Irrigation project
      {
        name: 'Main Canal Construction',
        description: 'Construction of 7km main irrigation canal',
        projectId: projects[3]._id,
        schemeId: projects[3].schemeId,
        budget: 4000000,
        startDate: new Date('2024-03-15'),
        endDate: new Date('2025-01-31'),
        status: 'Active',
        progress: 70,
        contractor: 'Irrigation Works Pvt Ltd.',
        amountSpent: 2800000,
        district: 'Gajapati',
        block: 'Nuagada',
        gramPanchayat: 'Kendupadar',
        village: 'Kendupadar'
      },
      {
        name: 'Distribution Channels',
        description: 'Construction of 8km distribution channels',
        projectId: projects[3]._id,
        schemeId: projects[3].schemeId,
        budget: 4000000,
        startDate: new Date('2024-08-01'),
        endDate: new Date('2025-06-30'),
        status: 'Active',
        progress: 25,
        contractor: 'Irrigation Works Pvt Ltd.',
        amountSpent: 1000000,
        district: 'Gajapati',
        block: 'Nuagada',
        gramPanchayat: 'Alasi',
        village: 'Alasi'
      },
      // Works for ITI Training Center
      {
        name: 'ITI Building Construction',
        description: 'Construction of main ITI building with classrooms and workshops',
        projectId: projects[4]._id,
        schemeId: projects[4].schemeId,
        budget: 1500000,
        startDate: new Date('2024-07-01'),
        endDate: new Date('2024-12-31'),
        status: 'Active',
        progress: 15,
        contractor: 'Education Infra Builders',
        amountSpent: 225000,
        district: 'Gajapati',
        block: 'R.Udayagiri',
        gramPanchayat: 'Padmapur',
        village: 'Padmapur'
      },
      {
        name: 'Workshop Equipment Setup',
        description: 'Procurement and installation of workshop equipment',
        projectId: projects[4]._id,
        schemeId: projects[4].schemeId,
        budget: 1000000,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-31'),
        status: 'Planning',
        progress: 0,
        contractor: 'Technical Equipment Suppliers',
        amountSpent: 0,
        district: 'Gajapati',
        block: 'R.Udayagiri',
        gramPanchayat: 'Padmapur',
        village: 'Padmapur'
      }
    ];

    console.log('\nCreating works...');
    let createdCount = 0;
    for (const workData of works) {
      const work = new Work(workData);
      await work.save();
      createdCount++;
      console.log(`✓ Created work: ${workData.name} (${workData.status} - ${workData.progress}%)`);
    }

    // Get summary
    const totalWorks = await Work.countDocuments();
    const activeWorks = await Work.countDocuments({ status: 'Active' });
    const completedWorks = await Work.countDocuments({ status: 'Completed' });
    const planningWorks = await Work.countDocuments({ status: 'Planning' });

    console.log('\n✅ Works created successfully!');
    console.log('\nWorks Summary:');
    console.log(`  - Total Works: ${totalWorks}`);
    console.log(`  - Active: ${activeWorks}`);
    console.log(`  - Completed: ${completedWorks}`);
    console.log(`  - Planning: ${planningWorks}`);

  } catch (error) {
    console.error('❌ Error seeding works:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the seed function
seedWorks();