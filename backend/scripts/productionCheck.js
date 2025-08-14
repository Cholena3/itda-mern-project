// This script should be run on the production server to check data
const mongoose = require('mongoose');
const Project = require('../models/Project');
const Work = require('../models/Work');

// Use production MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI;

const checkProductionData = async () => {
  try {
    console.log('Connecting to production database...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Count documents
    const projectCount = await Project.countDocuments();
    const workCount = await Work.countDocuments();
    
    console.log(`\nTotal projects: ${projectCount}`);
    console.log(`Total works: ${workCount}`);
    
    // Check district values
    const projectsWithCorrectDistrict = await Project.countDocuments({ 
      district: 'Gajapati (Parlakhemundi)' 
    });
    const worksWithCorrectDistrict = await Work.countDocuments({ 
      district: 'Gajapati (Parlakhemundi)' 
    });
    
    console.log(`\nProjects with 'Gajapati (Parlakhemundi)': ${projectsWithCorrectDistrict}`);
    console.log(`Works with 'Gajapati (Parlakhemundi)': ${worksWithCorrectDistrict}`);
    
    // Check for wrong district values
    const projectsWithWrongDistrict = await Project.countDocuments({ 
      district: 'Gajapati' 
    });
    const worksWithWrongDistrict = await Work.countDocuments({ 
      district: 'Gajapati' 
    });
    
    console.log(`\nProjects with 'Gajapati' (wrong): ${projectsWithWrongDistrict}`);
    console.log(`Works with 'Gajapati' (wrong): ${worksWithWrongDistrict}`);
    
    // Sample some data
    console.log('\n=== Sample Project ===');
    const sampleProject = await Project.findOne();
    if (sampleProject) {
      console.log({
        name: sampleProject.name,
        district: sampleProject.district,
        block: sampleProject.block,
        gramPanchayat: sampleProject.gramPanchayat
      });
    }
    
    console.log('\n=== Sample Work ===');
    const sampleWork = await Work.findOne();
    if (sampleWork) {
      console.log({
        name: sampleWork.name,
        district: sampleWork.district,
        block: sampleWork.block,
        gramPanchayat: sampleWork.gramPanchayat
      });
    }
    
    // If wrong data found, fix it
    if (projectsWithWrongDistrict > 0 || worksWithWrongDistrict > 0) {
      console.log('\n=== FIXING DISTRICT NAMES ===');
      
      const projectsUpdated = await Project.updateMany(
        { district: 'Gajapati' },
        { $set: { district: 'Gajapati (Parlakhemundi)' } }
      );
      console.log(`Updated ${projectsUpdated.modifiedCount} projects`);
      
      const worksUpdated = await Work.updateMany(
        { district: 'Gajapati' },
        { $set: { district: 'Gajapati (Parlakhemundi)' } }
      );
      console.log(`Updated ${worksUpdated.modifiedCount} works`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

// Only run if called directly
if (require.main === module) {
  checkProductionData();
}

module.exports = checkProductionData;