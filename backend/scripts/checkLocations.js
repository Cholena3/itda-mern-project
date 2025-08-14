const mongoose = require('mongoose');
const Project = require('../models/Project');
const Work = require('../models/Work');
require('dotenv').config({ path: '../.env' });

const checkLocations = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Check projects
    console.log('\n=== CHECKING PROJECTS ===');
    const projects = await Project.find({});
    console.log(`Total projects: ${projects.length}`);
    
    projects.forEach(project => {
      console.log(`\nProject: ${project.name}`);
      console.log(`  District: ${project.district || 'NOT SET'}`);
      console.log(`  Block: ${project.block || 'NOT SET'}`);
      console.log(`  Gram Panchayat: ${project.gramPanchayat || 'NOT SET'}`);
      console.log(`  Village: ${project.village || 'NOT SET'}`);
    });

    // Check works
    console.log('\n=== CHECKING WORKS ===');
    const works = await Work.find({});
    console.log(`Total works: ${works.length}`);
    
    works.forEach(work => {
      console.log(`\nWork: ${work.name}`);
      console.log(`  District: ${work.district || 'NOT SET'}`);
      console.log(`  Block: ${work.block || 'NOT SET'}`);
      console.log(`  Gram Panchayat: ${work.gramPanchayat || 'NOT SET'}`);
      console.log(`  Village: ${work.village || 'NOT SET'}`);
    });

    // Test filter query
    console.log('\n=== TESTING FILTER QUERIES ===');
    
    // Test 1: Find all with district
    const withDistrict = await Project.find({ district: 'Gajapati (Parlakhemundi)' });
    console.log(`\nProjects with district 'Gajapati (Parlakhemundi)': ${withDistrict.length}`);
    
    // Test 2: Find with specific block
    const withBlock = await Project.find({ block: 'Mohana' });
    console.log(`Projects with block 'Mohana': ${withBlock.length}`);
    
    // Test 3: Find with gram panchayat
    const withGP = await Project.find({ gramPanchayat: 'Luhagudi' });
    console.log(`Projects with GP 'Luhagudi': ${withGP.length}`);

    // Test 4: Combined filter
    const combined = await Project.find({ 
      district: 'Gajapati (Parlakhemundi)',
      block: 'Mohana'
    });
    console.log(`Projects with district AND block filter: ${combined.length}`);

    // Check distinct values
    console.log('\n=== DISTINCT VALUES ===');
    const distinctBlocks = await Project.distinct('block');
    console.log('Distinct blocks in projects:', distinctBlocks);
    
    const distinctGPs = await Project.distinct('gramPanchayat');
    console.log('Distinct GPs in projects:', distinctGPs);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkLocations();