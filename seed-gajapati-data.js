const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import MongoDB models
const User = require('./backend/models/User');
const Scheme = require('./backend/models/Scheme');
const Project = require('./backend/models/Project');
const Work = require('./backend/models/Work');

// MongoDB connection string
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/itda_project_management';

async function seedDatabase() {
  try {
    console.log('🚀 Starting ITDA Parlakhemundi Data Seeding...\n');
    
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
    const users = await User.create([
      {
        username: 'admin',
        email: 'admin@itda.parlakhemundi.gov.in',
        password: 'admin123',
        role: 'admin',
        department: 'ITDA Administration, Mohana'
      },
      {
        username: 'po_mohana',
        email: 'po.mohana@itda.parlakhemundi.gov.in',
        password: 'manager123',
        role: 'manager',
        department: 'Project Office, Mohana Block'
      },
      {
        username: 'po_rayagada',
        email: 'po.rayagada@itda.parlakhemundi.gov.in',
        password: 'manager123',
        role: 'manager',
        department: 'Project Office, R.Udayagiri Block'
      },
      {
        username: 'viewer_gajapati',
        email: 'viewer@itda.parlakhemundi.gov.in',
        password: 'viewer123',
        role: 'viewer',
        department: 'District Collectorate, Paralakhemundi'
      }
    ]);
    console.log(`✅ Created ${users.length} users\n`);
    
    // Create Schemes specific to Gajapati District
    console.log('📋 Creating schemes for ITDA Parlakhemundi...');
    const schemes = await Scheme.create([
      {
        name: 'PVTG Development - Lanjia Saora',
        description: 'Special development program for Particularly Vulnerable Tribal Group (PVTG) Lanjia Saora community in Mohana and R.Udayagiri blocks',
        budget: 150000000,
        startDate: new Date('2024-04-01'),
        endDate: new Date('2025-03-31'),
        status: 'Active'
      },
      {
        name: 'Odisha Tribal Empowerment & Livelihoods Programme Plus (OTELP+)',
        description: 'Improving quality of life of tribal households through promotion of sustainable livelihoods in Gajapati district',
        budget: 200000000,
        startDate: new Date('2024-04-01'),
        endDate: new Date('2025-03-31'),
        status: 'Active'
      },
      {
        name: 'Focussed Area Development Programme (FADP)',
        description: 'Infrastructure development in tribal sub-plan areas of Mohana, R.Udayagiri, and Nuagada blocks',
        budget: 100000000,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: 'Active'
      },
      {
        name: 'Biju Pucca Ghar Yojana - Tribal Areas',
        description: 'Providing pucca houses to tribal families in Gajapati district under state housing scheme',
        budget: 80000000,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2025-05-31'),
        status: 'Active'
      },
      {
        name: 'Ekalavya Model Residential School (EMRS) Mohana',
        description: 'Quality education for tribal students through residential school at Mohana block',
        budget: 120000000,
        startDate: new Date('2024-04-01'),
        endDate: new Date('2025-03-31'),
        status: 'Planning'
      },
      {
        name: 'Van Dhan Vikas Kendra - Gajapati',
        description: 'Value addition centers for Minor Forest Produce (MFP) including Hill Broom, Siali Leaf, Tamarind, and Mahua',
        budget: 30000000,
        startDate: new Date('2024-04-01'),
        endDate: new Date('2025-03-31'),
        status: 'Active'
      },
      {
        name: 'Jal Jeevan Mission - Tribal Habitations',
        description: 'Piped water supply to tribal villages in hilly areas of Mohana and R.Udayagiri blocks',
        budget: 90000000,
        startDate: new Date('2024-05-01'),
        endDate: new Date('2025-03-31'),
        status: 'Active'
      }
    ]);
    console.log(`✅ Created ${schemes.length} schemes\n`);
    
    // Create Projects for Gajapati District
    console.log('🏗️ Creating projects for Parlakhemundi blocks...');
    const projects = await Project.create([
      // PVTG Development Projects
      {
        name: 'Lanjia Saora Habitat Development - Chandragiri',
        description: 'Integrated habitat development for 12 Lanjia Saora villages in Chandragiri GP, Mohana block',
        schemeId: schemes[0]._id,
        budget: 35000000,
        startDate: new Date('2024-05-01'),
        endDate: new Date('2025-02-28'),
        status: 'Active',
        district: 'Gajapati',
        block: 'Mohana',
        gramPanchayat: 'Chandragiri',
        village: 'Chandragiri'
      },
      {
        name: 'Skill Development Center - Tumba',
        description: 'Skill training center for PVTG youth in traditional crafts and modern trades at Tumba, R.Udayagiri',
        schemeId: schemes[0]._id,
        budget: 15000000,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-12-31'),
        status: 'Active',
        district: 'Gajapati',
        block: 'Mohana',
        gramPanchayat: 'Chandragiri',
        village: 'Tumba'
      },
      
      // OTELP+ Projects
      {
        name: 'Millet Processing Unit - Mohana',
        description: 'Establishment of millet processing and packaging unit for tribal SHGs in Mohana block',
        schemeId: schemes[1]._id,
        budget: 8000000,
        startDate: new Date('2024-04-15'),
        endDate: new Date('2024-11-30'),
        status: 'Active',
        district: 'Gajapati',
        block: 'Mohana',
        gramPanchayat: 'Gangabada',
        village: 'Gangabada'
      },
      {
        name: 'Cashew Plantation - R.Udayagiri',
        description: 'Development of 500 acres cashew plantation in tribal areas of R.Udayagiri block',
        schemeId: schemes[1]._id,
        budget: 12000000,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2025-03-31'),
        status: 'Active',
        district: 'Gajapati',
        block: 'R.Udayagiri',
        gramPanchayat: 'Kinchilingi',
        village: 'Kinchilingi'
      },
      
      // FADP Infrastructure Projects
      {
        name: 'Mohana-Seranga Road (15 KM)',
        description: 'All-weather concrete road connecting Mohana block headquarters to Seranga GP',
        schemeId: schemes[2]._id,
        budget: 25000000,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-11-30'),
        status: 'Active',
        district: 'Gajapati',
        block: 'Mohana',
        gramPanchayat: 'Seranga',
        village: 'Seranga'
      },
      {
        name: 'Ramagiri-Labanyagada Bridge',
        description: 'Construction of RCC bridge over Mahendratanaya river connecting tribal villages',
        schemeId: schemes[2]._id,
        budget: 18000000,
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-12-31'),
        status: 'Active',
        district: 'Gajapati',
        block: 'R.Udayagiri',
        gramPanchayat: 'Ramagiri',
        village: 'Labanyagada'
      },
      
      // Housing Projects
      {
        name: 'Pucca Houses - Gangabada GP',
        description: 'Construction of 150 pucca houses for tribal families in Gangabada GP, Mohana',
        schemeId: schemes[3]._id,
        budget: 22500000,
        startDate: new Date('2024-07-01'),
        endDate: new Date('2025-03-31'),
        status: 'Active',
        district: 'Gajapati',
        block: 'Mohana',
        gramPanchayat: 'Gangabada',
        village: 'Manikpur'
      },
      {
        name: 'Pucca Houses - Kinchilingi GP',
        description: 'Construction of 100 pucca houses for tribal families in Kinchilingi GP, R.Udayagiri',
        schemeId: schemes[3]._id,
        budget: 15000000,
        startDate: new Date('2024-08-01'),
        endDate: new Date('2025-03-31'),
        status: 'Planning',
        district: 'Gajapati',
        block: 'R.Udayagiri',
        gramPanchayat: 'Kinchilingi',
        village: 'Sindhiba'
      },
      
      // Water Supply Projects
      {
        name: 'Piped Water Supply - Luhagudi Cluster',
        description: 'Providing tap water to 8 tribal villages in Luhagudi GP, Mohana block',
        schemeId: schemes[6]._id,
        budget: 18000000,
        startDate: new Date('2024-05-15'),
        endDate: new Date('2025-01-31'),
        status: 'Active',
        district: 'Gajapati',
        block: 'Mohana',
        gramPanchayat: 'Luhagudi',
        village: 'Paniganda'
      },
      {
        name: 'Solar Water Pumping - Dumbala',
        description: 'Solar-powered water supply system for hilltop villages in Dumbala GP, R.Udayagiri',
        schemeId: schemes[6]._id,
        budget: 12000000,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-12-31'),
        status: 'Active',
        district: 'Gajapati',
        block: 'R.Udayagiri',
        gramPanchayat: 'Dumbala',
        village: 'Khadanga'
      }
    ]);
    console.log(`✅ Created ${projects.length} projects\n`);
    
    // Create Works
    console.log('🔨 Creating works for ongoing projects...');
    const works = await Work.create([
      // Mohana-Seranga Road Works
      {
        name: 'Earthwork & Sub-grade (0-5 KM)',
        description: 'Earth cutting, filling and sub-grade preparation for first 5 KM stretch',
        schemeId: schemes[2]._id,
        projectId: projects[4]._id,
        contractor: 'M/s Kalinga Construction Pvt. Ltd.',
        budget: 4000000,
        amountSpent: 2800000,
        progress: 70,
        startDate: new Date('2024-02-15'),
        endDate: new Date('2024-05-31'),
        status: 'Active',
        district: 'Gajapati',
        block: 'Mohana',
        gramPanchayat: 'Seranga',
        village: 'Seranga'
      },
      {
        name: 'Concrete Road Work (0-5 KM)',
        description: 'Laying of M30 grade concrete for road surface',
        schemeId: schemes[2]._id,
        projectId: projects[4]._id,
        contractor: 'M/s Kalinga Construction Pvt. Ltd.',
        budget: 6000000,
        amountSpent: 2400000,
        progress: 40,
        startDate: new Date('2024-04-01'),
        endDate: new Date('2024-08-31'),
        status: 'Active',
        district: 'Gajapati',
        block: 'Mohana',
        gramPanchayat: 'Seranga',
        village: 'Katama'
      },
      
      // Ramagiri-Labanyagada Bridge Works
      {
        name: 'Foundation & Pier Construction',
        description: 'Bridge foundation work including pile foundation and pier construction',
        schemeId: schemes[2]._id,
        projectId: projects[5]._id,
        contractor: 'M/s Eastern Bridge Construction Co.',
        budget: 7000000,
        amountSpent: 5600000,
        progress: 80,
        startDate: new Date('2024-03-15'),
        endDate: new Date('2024-07-31'),
        status: 'Active',
        district: 'Gajapati',
        block: 'R.Udayagiri',
        gramPanchayat: 'Ramagiri',
        village: 'Ramagiri'
      },
      {
        name: 'Superstructure & Deck Slab',
        description: 'Construction of bridge superstructure and deck slab',
        schemeId: schemes[2]._id,
        projectId: projects[5]._id,
        contractor: 'M/s Eastern Bridge Construction Co.',
        budget: 8000000,
        amountSpent: 2000000,
        progress: 25,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-11-30'),
        status: 'Active',
        district: 'Gajapati',
        block: 'R.Udayagiri',
        gramPanchayat: 'Ramagiri',
        village: 'Labanyagada'
      },
      
      // Housing Works - Gangabada
      {
        name: 'Site Development & Foundation (50 Houses)',
        description: 'Site leveling and foundation work for first phase of 50 houses',
        schemeId: schemes[3]._id,
        projectId: projects[6]._id,
        contractor: 'M/s Tribal Housing Corporation',
        budget: 5000000,
        amountSpent: 3500000,
        progress: 70,
        startDate: new Date('2024-07-15'),
        endDate: new Date('2024-09-30'),
        status: 'Active',
        district: 'Gajapati',
        block: 'Mohana',
        gramPanchayat: 'Gangabada',
        village: 'Gangabada'
      },
      {
        name: 'Superstructure Construction (50 Houses)',
        description: 'Wall construction, roofing and finishing for 50 houses',
        schemeId: schemes[3]._id,
        projectId: projects[6]._id,
        contractor: 'M/s Tribal Housing Corporation',
        budget: 7500000,
        amountSpent: 1500000,
        progress: 20,
        startDate: new Date('2024-08-15'),
        endDate: new Date('2024-12-31'),
        status: 'Active',
        district: 'Gajapati',
        block: 'Mohana',
        gramPanchayat: 'Gangabada',
        village: 'Kujasingh'
      },
      
      // Water Supply Works - Luhagudi
      {
        name: 'Intake Well & Pump House',
        description: 'Construction of intake well and pump house at Luhagudi stream',
        schemeId: schemes[6]._id,
        projectId: projects[8]._id,
        contractor: 'M/s Aqua Tech Solutions',
        budget: 3000000,
        amountSpent: 2100000,
        progress: 70,
        startDate: new Date('2024-05-15'),
        endDate: new Date('2024-08-31'),
        status: 'Active',
        district: 'Gajapati',
        block: 'Mohana',
        gramPanchayat: 'Luhagudi',
        village: 'Luhagudi'
      },
      {
        name: 'Pipeline Laying (12 KM)',
        description: 'Laying of distribution pipeline network to 8 villages',
        schemeId: schemes[6]._id,
        projectId: projects[8]._id,
        contractor: 'M/s Aqua Tech Solutions',
        budget: 6000000,
        amountSpent: 1800000,
        progress: 30,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-11-30'),
        status: 'Active',
        district: 'Gajapati',
        block: 'Mohana',
        gramPanchayat: 'Luhagudi',
        village: 'Paniganda'
      },
      {
        name: 'Overhead Tank (1 Lakh Litre)',
        description: 'Construction of overhead water storage tank',
        schemeId: schemes[6]._id,
        projectId: projects[8]._id,
        contractor: 'M/s Aqua Tech Solutions',
        budget: 4000000,
        amountSpent: 500000,
        progress: 15,
        startDate: new Date('2024-07-01'),
        endDate: new Date('2024-12-31'),
        status: 'Active',
        district: 'Gajapati',
        block: 'Mohana',
        gramPanchayat: 'Luhagudi',
        village: 'Bhaliaguda'
      },
      
      // Millet Processing Unit Work
      {
        name: 'Building Construction & Machinery',
        description: 'Construction of processing unit building and installation of millet processing machinery',
        schemeId: schemes[1]._id,
        projectId: projects[2]._id,
        contractor: 'M/s Rural Tech Industries',
        budget: 6000000,
        amountSpent: 3000000,
        progress: 50,
        startDate: new Date('2024-04-15'),
        endDate: new Date('2024-09-30'),
        status: 'Active',
        district: 'Gajapati',
        block: 'Mohana',
        gramPanchayat: 'Gangabada',
        village: 'Raibada'
      }
    ]);
    console.log(`✅ Created ${works.length} works\n`);
    
    // Summary
    console.log('🎉 ITDA Parlakhemundi database seeding completed!\n');
    console.log('📊 Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Schemes: ${schemes.length}`);
    console.log(`   Projects: ${projects.length}`);
    console.log(`   Works: ${works.length}`);
    
    console.log('\n📝 Login Credentials:');
    console.log('   Admin: admin@itda.parlakhemundi.gov.in / admin123');
    console.log('   Manager (Mohana): po.mohana@itda.parlakhemundi.gov.in / manager123');
    console.log('   Manager (R.Udayagiri): po.rayagada@itda.parlakhemundi.gov.in / manager123');
    console.log('   Viewer: viewer@itda.parlakhemundi.gov.in / viewer123');
    
    console.log('\n📍 Parlakhemundi ITDA Blocks Covered:');
    console.log('   - Mohana (ITDA Headquarters)');
    console.log('   - R.Udayagiri');
    console.log('   - Nuagada');
    console.log('   - Rayagada');
    
    console.log('\n🎯 Key Focus Areas:');
    console.log('   - PVTG (Lanjia Saora) Development');
    console.log('   - Infrastructure (Roads & Bridges)');
    console.log('   - Tribal Housing');
    console.log('   - Water Supply to Hill Villages');
    console.log('   - Livelihood Programs (Millet, Cashew, MFP)');
    console.log('   - Education (EMRS)');
    
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