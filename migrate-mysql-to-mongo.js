const mysql = require('mysql2/promise');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

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
  database: process.env.MYSQL_DATABASE || 'itda_db',
  port: process.env.MYSQL_PORT || 3306
};

// MongoDB connection string
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/itda-project';

// Migration functions
async function migrateUsers(mysqlConnection) {
  console.log('📊 Migrating Users...');
  
  try {
    // Fetch users from MySQL
    const [users] = await mysqlConnection.execute('SELECT * FROM users');
    
    if (users.length === 0) {
      console.log('No users found in MySQL database');
      return;
    }
    
    // Clear existing users in MongoDB (optional)
    await User.deleteMany({});
    
    let migratedCount = 0;
    for (const user of users) {
      try {
        // Hash password if it's not already hashed
        let hashedPassword = user.password;
        if (!user.password.startsWith('$2')) {
          hashedPassword = await bcrypt.hash(user.password, 10);
        }
        
        const newUser = new User({
          username: user.username || user.name,
          email: user.email,
          password: hashedPassword,
          role: user.role || 'viewer',
          department: user.department || 'General',
          createdAt: user.created_at || user.createdAt || new Date(),
          updatedAt: user.updated_at || user.updatedAt || new Date()
        });
        
        await newUser.save();
        migratedCount++;
      } catch (err) {
        console.error(`Error migrating user ${user.email}:`, err.message);
      }
    }
    
    console.log(`✅ Successfully migrated ${migratedCount}/${users.length} users`);
  } catch (error) {
    console.error('Error migrating users:', error);
  }
}

async function migrateSchemes(mysqlConnection) {
  console.log('📊 Migrating Schemes...');
  
  try {
    // Fetch schemes from MySQL
    const [schemes] = await mysqlConnection.execute('SELECT * FROM schemes');
    
    if (schemes.length === 0) {
      console.log('No schemes found in MySQL database');
      return;
    }
    
    // Clear existing schemes in MongoDB (optional)
    await Scheme.deleteMany({});
    
    // Create a mapping of old IDs to new MongoDB IDs
    const schemeIdMap = new Map();
    let migratedCount = 0;
    
    for (const scheme of schemes) {
      try {
        const newScheme = new Scheme({
          name: scheme.name || scheme.scheme_name,
          description: scheme.description || '',
          budget: parseFloat(scheme.budget) || 0,
          startDate: scheme.start_date || scheme.startDate || new Date(),
          endDate: scheme.end_date || scheme.endDate || new Date(),
          status: scheme.status || 'Planning',
          createdAt: scheme.created_at || scheme.createdAt || new Date(),
          updatedAt: scheme.updated_at || scheme.updatedAt || new Date()
        });
        
        const savedScheme = await newScheme.save();
        schemeIdMap.set(scheme.id || scheme.scheme_id, savedScheme._id);
        migratedCount++;
      } catch (err) {
        console.error(`Error migrating scheme ${scheme.name}:`, err.message);
      }
    }
    
    console.log(`✅ Successfully migrated ${migratedCount}/${schemes.length} schemes`);
    return schemeIdMap;
  } catch (error) {
    console.error('Error migrating schemes:', error);
    return new Map();
  }
}

async function migrateProjects(mysqlConnection, schemeIdMap) {
  console.log('📊 Migrating Projects...');
  
  try {
    // Fetch projects from MySQL
    const [projects] = await mysqlConnection.execute('SELECT * FROM projects');
    
    if (projects.length === 0) {
      console.log('No projects found in MySQL database');
      return;
    }
    
    // Clear existing projects in MongoDB (optional)
    await Project.deleteMany({});
    
    // Create a mapping of old IDs to new MongoDB IDs
    const projectIdMap = new Map();
    let migratedCount = 0;
    
    for (const project of projects) {
      try {
        // Get the new MongoDB scheme ID
        const mongoSchemeId = schemeIdMap.get(project.scheme_id) || null;
        
        const newProject = new Project({
          name: project.name || project.project_name,
          description: project.description || '',
          schemeId: mongoSchemeId,
          budget: parseFloat(project.budget) || 0,
          startDate: project.start_date || project.startDate || new Date(),
          endDate: project.end_date || project.endDate || new Date(),
          status: project.status || 'Planning',
          createdAt: project.created_at || project.createdAt || new Date(),
          updatedAt: project.updated_at || project.updatedAt || new Date()
        });
        
        const savedProject = await newProject.save();
        projectIdMap.set(project.id || project.project_id, savedProject._id);
        migratedCount++;
      } catch (err) {
        console.error(`Error migrating project ${project.name}:`, err.message);
      }
    }
    
    console.log(`✅ Successfully migrated ${migratedCount}/${projects.length} projects`);
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
    
    // Clear existing works in MongoDB (optional)
    await Work.deleteMany({});
    
    let migratedCount = 0;
    
    for (const work of works) {
      try {
        // Get the new MongoDB IDs
        const mongoSchemeId = schemeIdMap.get(work.scheme_id) || null;
        const mongoProjectId = projectIdMap.get(work.project_id) || null;
        
        const newWork = new Work({
          name: work.name || work.work_name,
          description: work.description || '',
          schemeId: mongoSchemeId,
          projectId: mongoProjectId,
          contractor: work.contractor || '',
          budget: parseFloat(work.budget) || 0,
          amountSpent: parseFloat(work.amount_spent || work.amountSpent) || 0,
          progress: parseFloat(work.progress) || 0,
          startDate: work.start_date || work.startDate || new Date(),
          endDate: work.end_date || work.endDate || new Date(),
          status: work.status || 'Planning',
          photos: work.photos ? JSON.parse(work.photos) : [],
          createdAt: work.created_at || work.createdAt || new Date(),
          updatedAt: work.updated_at || work.updatedAt || new Date()
        });
        
        await newWork.save();
        migratedCount++;
      } catch (err) {
        console.error(`Error migrating work ${work.name}:`, err.message);
      }
    }
    
    console.log(`✅ Successfully migrated ${migratedCount}/${works.length} works`);
  } catch (error) {
    console.error('Error migrating works:', error);
  }
}

async function migrate() {
  let mysqlConnection;
  
  try {
    console.log('🚀 Starting MySQL to MongoDB migration...\n');
    
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
    
    // Show MySQL database info
    const [tables] = await mysqlConnection.execute('SHOW TABLES');
    console.log('📋 Available MySQL tables:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`   - ${tableName}`);
    });
    console.log();
    
    // Ask for confirmation
    console.log('⚠️  WARNING: This will replace all data in MongoDB with data from MySQL!');
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Perform migrations in order (to maintain relationships)
    await migrateUsers(mysqlConnection);
    const schemeIdMap = await migrateSchemes(mysqlConnection);
    const projectIdMap = await migrateProjects(mysqlConnection, schemeIdMap);
    await migrateWorks(mysqlConnection, schemeIdMap, projectIdMap);
    
    console.log('\n🎉 Migration completed successfully!');
    
    // Show summary
    const userCount = await User.countDocuments();
    const schemeCount = await Scheme.countDocuments();
    const projectCount = await Project.countDocuments();
    const workCount = await Work.countDocuments();
    
    console.log('\n📊 Migration Summary:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Schemes: ${schemeCount}`);
    console.log(`   Projects: ${projectCount}`);
    console.log(`   Works: ${workCount}`);
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
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