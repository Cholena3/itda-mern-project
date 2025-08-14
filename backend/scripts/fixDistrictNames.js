const mongoose = require('mongoose');
const Project = require('../models/Project');
const Work = require('../models/Work');
require('dotenv').config({ path: '../.env' });

const fixDistrictNames = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Fix projects with incorrect district name
    const projectsUpdated = await Project.updateMany(
      { district: 'Gajapati' },
      { $set: { district: 'Gajapati (Parlakhemundi)' } }
    );
    console.log(`Updated ${projectsUpdated.modifiedCount} projects with correct district name`);

    // Fix works with incorrect district name
    const worksUpdated = await Work.updateMany(
      { district: 'Gajapati' },
      { $set: { district: 'Gajapati (Parlakhemundi)' } }
    );
    console.log(`Updated ${worksUpdated.modifiedCount} works with correct district name`);

    // Verify the fix
    const projectsWithWrongDistrict = await Project.countDocuments({ district: 'Gajapati' });
    const worksWithWrongDistrict = await Work.countDocuments({ district: 'Gajapati' });
    
    console.log('\n=== VERIFICATION ===');
    console.log(`Projects with 'Gajapati' (should be 0): ${projectsWithWrongDistrict}`);
    console.log(`Works with 'Gajapati' (should be 0): ${worksWithWrongDistrict}`);
    
    const projectsWithCorrectDistrict = await Project.countDocuments({ district: 'Gajapati (Parlakhemundi)' });
    const worksWithCorrectDistrict = await Work.countDocuments({ district: 'Gajapati (Parlakhemundi)' });
    
    console.log(`Projects with 'Gajapati (Parlakhemundi)': ${projectsWithCorrectDistrict}`);
    console.log(`Works with 'Gajapati (Parlakhemundi)': ${worksWithCorrectDistrict}`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixDistrictNames();