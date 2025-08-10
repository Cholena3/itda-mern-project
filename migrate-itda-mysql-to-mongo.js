const mysql = require('mysql2/promise');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.migration' });

// Import MongoDB models
const User = require('./backend/models/User');
const Scheme = require('./backend/models/Scheme');
const Project = require('./backend/models/Project');
const Work = require('./backend/models/Work');

// MySQL connection configuration
const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'itda',
  port: process.env.MYSQL_PORT || 3306
};

// MongoDB connection string
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/itda-project';

// Helper function to safely parse JSON
function safeJsonParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return [];
  }
}

// Migration functions
async function migrateSchemes(mysqlConnection) {
  console.log('📊 Migrating Schemes...');
  
  try {
    // Fetch schemes from MySQL
    const [schemes] = await mysqlConnection.execute('SELECT * FROM schemes');
    
    if (schemes.length === 0) {
      console.log('No schemes found in MySQL database');
      return new Map();
    }
    
    // Clear existing schemes in MongoDB
    await Scheme.deleteMany({});
    
    // Create a mapping of old IDs to new MongoDB IDs
    const schemeIdMap = new Map();
    let migratedCount = 0;
    
    for (const scheme of schemes) {
      try {
        const newScheme = new Scheme({
          name: scheme.SchemeName || scheme.scheme_name || 'Unnamed Scheme',
          description: scheme.Description || scheme.description || '',
          budget: parseFloat(scheme.Budget || scheme.budget) || 0,
          startDate: scheme.StartDate || scheme.start_date || new Date(),
          endDate: scheme.EndDate || scheme.end_date || new Date(),
          status: scheme.Status || scheme.status || 'Planning',
          createdAt: scheme.created_at || new Date(),
          updatedAt: scheme.updated_at || new Date()
        });
        
        const savedScheme = await newScheme.save();
        // Map both SchemeID and id (in case column name varies)
        schemeIdMap.set(scheme.SchemeID || scheme.id || scheme.scheme_id, savedScheme._id);
        migratedCount++;
        console.log(`  ✓ Migrated scheme: ${newScheme.name}`);
      } catch (err) {
        console.error(`  ✗ Error migrating scheme:`, err.message);
      }
    }
    
    console.log(`✅ Successfully migrated ${migratedCount}/${schemes.length} schemes\n`);
    return schemeIdMap;
  } catch (error) {
    console.error('Error migrating schemes:', error);
    return new Map();
  }
}

async function migrateProjects(mysqlConnection, schemeIdMap) {
  console.log('📊 Migrating Projects...');
  
  try {
    // Try 'project' table (as you mentioned)
    let projects;
    try {
      [projects] = await mysqlConnection.execute('SELECT * FROM project');
    } catch (err) {
      // If 'project' doesn't exist, try 'projects'
      try {
        [projects] = await mysqlConnection.execute('SELECT * FROM projects');
      } catch (err2) {
        console.log('No project/projects table found in MySQL database');
        return new Map();
      }
    }
    
    if (projects.length === 0) {
      console.log('No projects found in MySQL database');
      return new Map();
    }
    
    // Clear existing projects in MongoDB
    await Project.deleteMany({});
    
    // Create a mapping of old IDs to new MongoDB IDs
    const projectIdMap = new Map();
    let migratedCount = 0;
    
    for (const project of projects) {
      try {
        // Get the new MongoDB scheme ID
        const mongoSchemeId = schemeIdMap.get(
          project.SchemeID || project.scheme_id || project.schemeId
        ) || null;
        
        const newProject = new Project({
          name: project.ProjectName || project.project_name || project.name || 'Unnamed Project',
          description: project.Description || project.description || '',
          schemeId: mongoSchemeId,
          budget: parseFloat(project.Budget || project.budget) || 0,
          startDate: project.StartDate || project.start_date || new Date(),
          endDate: project.EndDate || project.end_date || new Date(),
          status: project.Status || project.status || 'Planning',
          // Additional fields that might exist
          location: project.Location || project.location || '',
          district: project.District || project.district || '',
          block: project.Block || project.block || '',
          gp: project.GP || project.gp || '',
          village: project.Village || project.village || '',
          createdAt: project.created_at || new Date(),
          updatedAt: project.updated_at || new Date()
        });
        
        const savedProject = await newProject.save();
        projectIdMap.set(
          project.ProjectID || project.id || project.project_id, 
          savedProject._id
        );
        migratedCount++;
        console.log(`  ✓ Migrated project: ${newProject.name}`);
      } catch (err) {
        console.error(`  ✗ Error migrating project:`, err.message);
      }
    }
    
    console.log(`✅ Successfully migrated ${migratedCount}/${projects.length} projects\n`);
    return projectIdMap;
  } catch (error) {
    console.error('Error migrating projects:', error);
    return new Map();
  }
}

async function migrateWorks(mysqlConnection, schemeIdMap, projectIdMap) {
  console.log('📊 Migrating Works...');
  
  try {
    // Fetch works from MySQL
    const [works] = await mysqlConnection.execute('SELECT * FROM works');
    
    if (works.length === 0) {
      console.log('No works found in MySQL database');
      return;
    }
    
    // Clear existing works in MongoDB
    await Work.deleteMany({});
    
    let migratedCount = 0;
    
    for (const work of works) {
      try {
        // Get the new MongoDB IDs
        const mongoSchemeId = schemeIdMap.get(
          work.SchemeID || work.scheme_id || work.schemeId
        ) || null;
        const mongoProjectId = projectIdMap.get(
          work.ProjectID || work.project_id || work.projectId
        ) || null;
        
        const newWork = new Work({
          name: work.WorkName || work.work_name || work.name || 'Unnamed Work',
          description: work.Description || work.description || '',
          schemeId: mongoSchemeId,
          projectId: mongoProjectId,
          contractor: work.Contractor || work.contractor || '',
          budget: parseFloat(work.Budget || work.budget) || 0,
          amountSpent: parseFloat(work.AmountSpent || work.amount_spent || work.amountSpent) || 0,
          progress: parseFloat(work.Progress || work.progress) || 0,
          startDate: work.StartDate || work.start_date || new Date(),
          endDate: work.EndDate || work.end_date || new Date(),
          status: work.Status || work.status || 'Planning',
          photos: work.Photos ? safeJsonParse(work.Photos) : [],
          // Additional fields
          location: work.Location || work.location || '',
          district: work.District || work.district || '',
          block: work.Block || work.block || '',
          gp: work.GP || work.gp || '',
          village: work.Village || work.village || '',
          createdAt: work.created_at || new Date(),
          updatedAt: work.updated_at || new Date()
        });
        
        await newWork.save();
        migratedCount++;
        console.log(`  ✓ Migrated work: ${newWork.name}`);
      } catch (err) {
        console.error(`  ✗ Error migrating work:`, err.message);
      }
    }
    
    console.log(`✅ Successfully migrated ${migratedCount}/${works.length} works\n`);
  } catch (error) {
    console.error('Error migrating works:', error);
  }
}

async function migrateWorkPhotos(mysqlConnection) {
  console.log('📊 Checking Work Photos...');
  
  try {
    const [photos] = await mysqlConnection.execute('SELECT * FROM work_photos LIMIT 10');
    
    if (photos.length > 0) {
      console.log(`Found ${photos.length} work photos in MySQL`);
      console.log('Note: Photo files need to be manually copied to backend/uploads/work_photos/');
      console.log('Photo references are stored in the works collection\n');
    } else {
      console.log('No work photos found\n');
    }
  } catch (error) {
    console.log('work_photos table not found or empty\n');
  }
}

async function migrateLocationData(mysqlConnection) {
  console.log('📊 Analyzing Location Data...');
  
  try {
    // Check district table
    const [districts] = await mysqlConnection.execute('SELECT COUNT(*) as count FROM district');
    console.log(`  Found ${districts[0].count} districts`);
    
    // Check block table
    const [blocks] = await mysqlConnection.execute('SELECT COUNT(*) as count FROM block');
    console.log(`  Found ${blocks[0].count} blocks`);
    
    // Check gp table
    const [gps] = await mysqlConnection.execute('SELECT COUNT(*) as count FROM gp');
    console.log(`  Found ${gps[0].count} gram panchayats`);
    
    // Check gpvil table
    const [villages] = await mysqlConnection.execute('SELECT COUNT(*) as count FROM gpvil');
    console.log(`  Found ${villages[0].count} villages`);
    
    console.log('\nNote: Location data (district, block, gp, village) is embedded in projects and works\n');
  } catch (error) {
    console.log('Some location tables not found\n');
  }
}

async function createDefaultUsers() {
  console.log('📊 Creating Default Users...');
  
  try {
    // Clear existing users
    await User.deleteMany({});
    
    // Create default users
    const defaultUsers = [
      {
        username: 'admin',
        email: 'admin@itda.gov.in',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
        department: 'Administration'
      },
      {
        username: 'manager',
        email: 'manager@itda.gov.in',
        password: await bcrypt.hash('manager123', 10),
        role: 'manager',
        department: 'Project Management'
      },
      {
        username: 'viewer',
        email: 'viewer@itda.gov.in',
        password: await bcrypt.hash('viewer123', 10),
        role: 'viewer',
        department: 'General'
      }
    ];
    
    for (const userData of defaultUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`  ✓ Created user: ${userData.username} (password: ${userData.username}123)`);
    }
    
    console.log('✅ Default users created\n');
  } catch (error) {
    console.error('Error creating default users:', error);
  }
}

async function showTableStructure(mysqlConnection) {
  console.log('📋 Analyzing MySQL Database Structure...\n');
  
  try {
    // Show all tables
    const [tables] = await mysqlConnection.execute('SHOW TABLES');
    console.log('Available tables:');
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      console.log(`  - ${tableName}`);
      
      // Show first few columns of each table
      try {
        const [columns] = await mysqlConnection.execute(
          `SHOW COLUMNS FROM ${tableName}`
        );
        const columnNames = columns.slice(0, 5).map(col => col.Field).join(', ');
        console.log(`    Columns: ${columnNames}${columns.length > 5 ? ', ...' : ''}`);
      } catch (err) {
        console.log(`    Could not read structure`);
      }
    }
    console.log();
  } catch (error) {
    console.error('Error analyzing database:', error);
  }
}

async function migrate() {
  let mysqlConnection;
  
  try {
    console.log('🚀 Starting ITDA MySQL to MongoDB Migration...\n');
    console.log('Configuration:');
    console.log(`  MySQL: ${mysqlConfig.user}@${mysqlConfig.host}:${mysqlConfig.port}/${mysqlConfig.database}`);
    console.log(`  MongoDB: ${mongoUri}\n`);
    
    // Connect to MySQL
    console.log('📡 Connecting to MySQL...');
    mysqlConnection = await mysql.createConnection(mysqlConfig);
    console.log('✅ Connected to MySQL\n');
    
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB\n');
    
    // Show MySQL database structure
    await showTableStructure(mysqlConnection);
    
    // Warning
    console.log('⚠️  WARNING: This will replace all data in MongoDB with data from MySQL!');
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Perform migrations
    const schemeIdMap = await migrateSchemes(mysqlConnection);
    const projectIdMap = await migrateProjects(mysqlConnection, schemeIdMap);
    await migrateWorks(mysqlConnection, schemeIdMap, projectIdMap);
    await migrateWorkPhotos(mysqlConnection);
    await migrateLocationData(mysqlConnection);
    await createDefaultUsers();
    
    console.log('🎉 Migration completed successfully!\n');
    
    // Show summary
    const userCount = await User.countDocuments();
    const schemeCount = await Scheme.countDocuments();
    const projectCount = await Project.countDocuments();
    const workCount = await Work.countDocuments();
    
    console.log('📊 Migration Summary:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Schemes: ${schemeCount}`);
    console.log(`   Projects: ${projectCount}`);
    console.log(`   Works: ${workCount}`);
    
    console.log('\n📝 Login Credentials:');
    console.log('   Admin: admin@itda.gov.in / admin123');
    console.log('   Manager: manager@itda.gov.in / manager123');
    console.log('   Viewer: viewer@itda.gov.in / viewer123');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check MySQL credentials in .env.migration');
    console.error('2. Ensure MySQL database "itda" exists');
    console.error('3. Ensure MongoDB is running on localhost:27017');
  } finally {
    // Close connections
    if (mysqlConnection) {
      await mysqlConnection.end();
      console.log('\n📡 Closed MySQL connection');
    }
    
    await mongoose.connection.close();
    console.log('📡 Closed MongoDB connection');
    
    process.exit();
  }
}

// Run migration
migrate();