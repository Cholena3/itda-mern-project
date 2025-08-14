const mongoose = require('mongoose');
const Project = require('../models/Project');
const Work = require('../models/Work');
require('dotenv').config({ path: '../.env' });

// Sample location data for Gajapati district
const locations = [
  {
    district: 'Gajapati (Parlakhemundi)',
    block: 'Mohana',
    gramPanchayat: 'Luhagudi',
    village: 'Luhagudi'
  },
  {
    district: 'Gajapati (Parlakhemundi)',
    block: 'Mohana',
    gramPanchayat: 'Dhabaluguda',
    village: 'Dhabaluguda'
  },
  {
    district: 'Gajapati (Parlakhemundi)',
    block: 'R.Udayagiri',
    gramPanchayat: 'Chandragiri',
    village: 'Ramagiri'
  },
  {
    district: 'Gajapati (Parlakhemundi)',
    block: 'R.Udayagiri',
    gramPanchayat: 'Labarsingh',
    village: 'Labarsingh'
  },
  {
    district: 'Gajapati (Parlakhemundi)',
    block: 'Gumma',
    gramPanchayat: 'Kinchilingi',
    village: 'Kinchilingi'
  },
  {
    district: 'Gajapati (Parlakhemundi)',
    block: 'Gumma',
    gramPanchayat: 'Khandava',
    village: 'Ankuli'
  },
  {
    district: 'Gajapati (Parlakhemundi)',
    block: 'Rayagada',
    gramPanchayat: 'Dura',
    village: 'Kachapaju'
  },
  {
    district: 'Gajapati (Parlakhemundi)',
    block: 'Rayagada',
    gramPanchayat: 'Patakhanda',
    village: 'Patakhanda'
  },
  {
    district: 'Gajapati (Parlakhemundi)',
    block: 'Nuagada',
    gramPanchayat: 'Bahalda',
    village: 'Bahalda'
  },
  {
    district: 'Gajapati (Parlakhemundi)',
    block: 'Nuagada',
    gramPanchayat: 'Dengapadar',
    village: 'Dengapadar'
  },
  {
    district: 'Gajapati (Parlakhemundi)',
    block: 'Kasinagar',
    gramPanchayat: 'Bhaliagada',
    village: 'Bhaliagada'
  },
  {
    district: 'Gajapati (Parlakhemundi)',
    block: 'Kasinagar',
    gramPanchayat: 'Tabarada',
    village: 'Tabarada'
  },
  {
    district: 'Gajapati (Parlakhemundi)',
    block: 'Gosani',
    gramPanchayat: 'Bagasala',
    village: 'Bagasala'
  },
  {
    district: 'Gajapati (Parlakhemundi)',
    block: 'Gosani',
    gramPanchayat: 'Gosani',
    village: 'Gosani'
  }
];

const assignLocations = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Get all projects without complete location data
    const projects = await Project.find({
      $or: [
        { block: { $exists: false } },
        { block: null },
        { block: '' },
        { gramPanchayat: { $exists: false } },
        { gramPanchayat: null },
        { gramPanchayat: '' }
      ]
    });

    console.log(`Found ${projects.length} projects without location data`);

    // Assign random locations to projects
    for (let i = 0; i < projects.length; i++) {
      const location = locations[i % locations.length];
      await Project.findByIdAndUpdate(projects[i]._id, {
        district: location.district,
        block: location.block,
        gramPanchayat: location.gramPanchayat,
        village: location.village
      });
      console.log(`Updated project: ${projects[i].name} with location: ${location.block}, ${location.gramPanchayat}`);
    }

    // Get all works without complete location data
    const works = await Work.find({
      $or: [
        { block: { $exists: false } },
        { block: null },
        { block: '' },
        { gramPanchayat: { $exists: false } },
        { gramPanchayat: null },
        { gramPanchayat: '' }
      ]
    });

    console.log(`Found ${works.length} works without location data`);

    // Assign random locations to works
    for (let i = 0; i < works.length; i++) {
      const location = locations[i % locations.length];
      await Work.findByIdAndUpdate(works[i]._id, {
        district: location.district,
        block: location.block,
        gramPanchayat: location.gramPanchayat,
        village: location.village
      });
      console.log(`Updated work: ${works[i].name} with location: ${location.block}, ${location.gramPanchayat}`);
    }

    // Verify the updates
    const updatedProjects = await Project.find({ block: { $exists: true, $ne: null, $ne: '' } }).countDocuments();
    const updatedWorks = await Work.find({ block: { $exists: true, $ne: null, $ne: '' } }).countDocuments();

    console.log('\n=== Update Summary ===');
    console.log(`Total projects with location data: ${updatedProjects}`);
    console.log(`Total works with location data: ${updatedWorks}`);

    // Show sample data for verification
    const sampleProject = await Project.findOne({ block: { $exists: true } });
    if (sampleProject) {
      console.log('\nSample Project with location:');
      console.log({
        name: sampleProject.name,
        district: sampleProject.district,
        block: sampleProject.block,
        gramPanchayat: sampleProject.gramPanchayat,
        village: sampleProject.village
      });
    }

    console.log('\nLocation assignment completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error assigning locations:', error);
    process.exit(1);
  }
};

// Run the script
assignLocations();