const mongoose = require('mongoose');
const Project = require('../models/Project');
const Work = require('../models/Work');
require('dotenv').config({ path: '../.env' });

// Get the location hierarchy from the locations route
const parlakhemundiLocations = {
  district: 'Gajapati (Parlakhemundi)',
  blocks: [
    {
      name: 'Mohana',
      gramPanchayats: [
        { name: 'Chandragiri', villages: ['Chandragiri', 'Tumba', 'Kereba', 'Badapada'] },
        { name: 'Gangabada', villages: ['Gangabada', 'Kujasingh', 'Manikpur', 'Raibada'] },
        { name: 'Luhagudi', villages: ['Luhagudi', 'Paniganda', 'Bhaliaguda', 'Kenduguda'] },
        { name: 'Seranga', villages: ['Seranga', 'Katama', 'Jeeranga', 'Dhobaguda'] }
      ]
    },
    {
      name: 'R.Udayagiri',
      gramPanchayats: [
        { name: 'Kinchilingi', villages: ['Kinchilingi', 'Sindhiba', 'Tarangini', 'Jharaguda'] },
        { name: 'Dumbala', villages: ['Dumbala', 'Khadanga', 'Luhangi', 'Pandava'] },
        { name: 'Ramagiri', villages: ['Ramagiri', 'Labanyagada', 'Ambaguda', 'Karadabadi'] },
        { name: 'Padmapur', villages: ['Padmapur', 'Haridapadar', 'Jagannathpur', 'Bhimpur'] }
      ]
    },
    {
      name: 'Nuagada',
      gramPanchayats: [
        { name: 'Alada', villages: ['Alada', 'Badagada', 'Kumbhikota', 'Narayanpur'] },
        { name: 'Dimiripali', villages: ['Dimiripali', 'Chandanpur', 'Khajuripada', 'Talapada'] },
        { name: 'Loba', villages: ['Loba', 'Biribatia', 'Dengapadar', 'Kendubadi'] }
      ]
    },
    {
      name: 'Rayagada',
      gramPanchayats: [
        { name: 'Koinpur', villages: ['Koinpur', 'Bhaleri', 'Garabandha', 'Jharigaon'] },
        { name: 'Sindurapur', villages: ['Sindurapur', 'Badakalakote', 'Laxmipur', 'Ratnapur'] },
        { name: 'Dura', villages: ['Dura', 'Jeerango', 'Kasipur', 'Mandimera'] }
      ]
    },
    {
      name: 'Gumma',
      gramPanchayats: [
        { name: 'Gumma', villages: ['Gumma', 'Baghalati', 'Dhepaguda', 'Khandava'] },
        { name: 'Juba', villages: ['Juba', 'Amjhiri', 'Birikote', 'Chitapalli'] }
      ]
    }
  ]
};

const validateLocationData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Get all unique combinations from database
    const projectLocations = await Project.find({}, 'block gramPanchayat village').lean();
    const workLocations = await Work.find({}, 'block gramPanchayat village').lean();
    
    const allDbLocations = [...projectLocations, ...workLocations];
    
    console.log('\n=== VALIDATING LOCATION DATA ===');
    
    const invalidLocations = [];
    
    for (const record of allDbLocations) {
      if (!record.block) continue;
      
      // Find the block in hierarchy
      const blockData = parlakhemundiLocations.blocks.find(b => b.name === record.block);
      
      if (!blockData) {
        invalidLocations.push({
          type: 'Invalid Block',
          block: record.block,
          gp: record.gramPanchayat,
          village: record.village
        });
        continue;
      }
      
      // Check if GP exists in this block
      if (record.gramPanchayat) {
        const gpData = blockData.gramPanchayats.find(gp => gp.name === record.gramPanchayat);
        
        if (!gpData) {
          invalidLocations.push({
            type: 'Invalid GP for Block',
            block: record.block,
            gp: record.gramPanchayat,
            village: record.village,
            validGPs: blockData.gramPanchayats.map(gp => gp.name)
          });
        }
      }
    }
    
    if (invalidLocations.length > 0) {
      console.log('\nFound invalid location combinations:');
      invalidLocations.forEach(loc => {
        console.log(`\n${loc.type}:`);
        console.log(`  Block: ${loc.block}`);
        console.log(`  GP: ${loc.gp}`);
        console.log(`  Village: ${loc.village}`);
        if (loc.validGPs) {
          console.log(`  Valid GPs for this block: ${loc.validGPs.join(', ')}`);
        }
      });
      
      // Fix the invalid locations
      console.log('\n=== FIXING INVALID LOCATIONS ===');
      
      // Fix Works with invalid GPs
      const fixPromises = [];
      
      // These are the mismatched GPs we found
      const gpFixes = [
        { wrong: 'Dhabaluguda', correct: 'Gangabada', block: 'Mohana' },
        { wrong: 'Chandragiri', correct: 'Chandragiri', block: 'Mohana' },
        { wrong: 'Labarsingh', correct: 'Ramagiri', block: 'R.Udayagiri' },
        { wrong: 'Kinchilingi', correct: 'Kinchilingi', block: 'R.Udayagiri' },
        { wrong: 'Khandava', correct: 'Gumma', block: 'Gumma' },
        { wrong: 'Birikote', correct: 'Juba', block: 'Gumma' },
        { wrong: 'Chandragiri', correct: 'Koinpur', block: 'Rayagada' },
        { wrong: 'Kendupadar', correct: 'Loba', block: 'Nuagada' },
        { wrong: 'Alasi', correct: 'Alada', block: 'Nuagada' },
        { wrong: 'Padmapur', correct: 'Padmapur', block: 'R.Udayagiri' }
      ];
      
      for (const fix of gpFixes) {
        fixPromises.push(
          Project.updateMany(
            { block: fix.block, gramPanchayat: fix.wrong },
            { $set: { gramPanchayat: fix.correct } }
          )
        );
        fixPromises.push(
          Work.updateMany(
            { block: fix.block, gramPanchayat: fix.wrong },
            { $set: { gramPanchayat: fix.correct } }
          )
        );
      }
      
      // Also move Birikote works from Mohana to Gumma block
      fixPromises.push(
        Work.updateMany(
          { gramPanchayat: 'Birikote' },
          { $set: { block: 'Gumma', gramPanchayat: 'Juba' } }
        )
      );
      
      const results = await Promise.all(fixPromises);
      console.log('Fixed location mismatches');
      
    } else {
      console.log('\nAll location data is valid!');
    }
    
    // Show final summary
    console.log('\n=== FINAL LOCATION SUMMARY ===');
    const finalProjects = await Project.find({}, 'name block gramPanchayat').lean();
    const finalWorks = await Work.find({}, 'name block gramPanchayat').lean();
    
    console.log('\nProjects:');
    finalProjects.forEach(p => {
      console.log(`  ${p.name}: ${p.block} -> ${p.gramPanchayat}`);
    });
    
    console.log('\nWorks (first 5):');
    finalWorks.slice(0, 5).forEach(w => {
      console.log(`  ${w.name}: ${w.block} -> ${w.gramPanchayat}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

validateLocationData();