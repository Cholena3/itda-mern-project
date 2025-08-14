const mongoose = require('mongoose');
const Project = require('../models/Project');
const Work = require('../models/Work');
const Scheme = require('../models/Scheme');
require('dotenv').config({ path: '../.env' });

const testFilter = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB\n');

    // Test different filter combinations
    console.log('=== TESTING FILTER COMBINATIONS ===\n');
    
    // Test 1: District only
    console.log('1. Filter by District only (Gajapati (Parlakhemundi)):');
    const districtFilter = { district: 'Gajapati (Parlakhemundi)' };
    const projectsByDistrict = await Project.find(districtFilter).populate('schemeId');
    const worksByDistrict = await Work.find(districtFilter);
    console.log(`   Projects found: ${projectsByDistrict.length}`);
    console.log(`   Works found: ${worksByDistrict.length}`);
    
    // Get unique scheme IDs from projects
    const schemeIds = [...new Set(projectsByDistrict.map(p => p.schemeId?._id?.toString()).filter(Boolean))];
    const schemes = await Scheme.find({ _id: { $in: schemeIds } });
    console.log(`   Schemes found: ${schemes.length}`);
    
    // Test 2: District + Block
    console.log('\n2. Filter by District + Block (Mohana):');
    const blockFilter = { district: 'Gajapati (Parlakhemundi)', block: 'Mohana' };
    const projectsByBlock = await Project.find(blockFilter);
    const worksByBlock = await Work.find(blockFilter);
    console.log(`   Projects found: ${projectsByBlock.length}`);
    projectsByBlock.forEach(p => console.log(`     - ${p.name}`));
    console.log(`   Works found: ${worksByBlock.length}`);
    worksByBlock.forEach(w => console.log(`     - ${w.name}`));
    
    // Test 3: District + Block + GP
    console.log('\n3. Filter by District + Block + GP (Mohana -> Luhagudi):');
    const gpFilter = { 
      district: 'Gajapati (Parlakhemundi)', 
      block: 'Mohana',
      gramPanchayat: 'Luhagudi'
    };
    const projectsByGP = await Project.find(gpFilter);
    const worksByGP = await Work.find(gpFilter);
    console.log(`   Projects found: ${projectsByGP.length}`);
    projectsByGP.forEach(p => console.log(`     - ${p.name}`));
    console.log(`   Works found: ${worksByGP.length}`);
    worksByGP.forEach(w => console.log(`     - ${w.name}`));
    
    // Test 4: Show all unique block-GP combinations
    console.log('\n4. All unique Block-GP combinations in database:');
    const allProjects = await Project.find({}, 'block gramPanchayat').lean();
    const allWorks = await Work.find({}, 'block gramPanchayat').lean();
    
    const combinations = new Set();
    [...allProjects, ...allWorks].forEach(item => {
      if (item.block && item.gramPanchayat) {
        combinations.add(`${item.block} -> ${item.gramPanchayat}`);
      }
    });
    
    Array.from(combinations).sort().forEach(combo => {
      console.log(`   ${combo}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testFilter();