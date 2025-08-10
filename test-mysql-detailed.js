const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.migration' });

async function tryConnection(config, description) {
  console.log(`\nTrying: ${description}`);
  console.log(`Config: ${JSON.stringify({...config, password: config.password ? '***' : '(empty)'})}`);
  
  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ SUCCESS! Connected with this configuration');
    
    // Try to list databases
    try {
      const [databases] = await connection.execute('SHOW DATABASES');
      console.log('Available databases:');
      databases.forEach(db => console.log(`  - ${Object.values(db)[0]}`));
    } catch (err) {
      console.log('Could not list databases:', err.message);
    }
    
    await connection.end();
    return true;
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
    return false;
  }
}

async function testAllConnections() {
  const baseConfig = {
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER || 'root',
  };
  
  console.log('MySQL Connection Testing Tool');
  console.log('=============================');
  
  // Test 1: With password from env
  await tryConnection(
    { ...baseConfig, password: process.env.MYSQL_PASSWORD },
    'With password from .env.migration'
  );
  
  // Test 2: Without password
  await tryConnection(
    { ...baseConfig, password: '' },
    'Without password'
  );
  
  // Test 3: With database specified
  await tryConnection(
    { ...baseConfig, password: process.env.MYSQL_PASSWORD, database: 'itda' },
    'With password and database'
  );
  
  // Test 4: Try connecting to mysql database (default)
  await tryConnection(
    { ...baseConfig, password: process.env.MYSQL_PASSWORD, database: 'mysql' },
    'To mysql system database'
  );
  
  // Test 5: Try with different auth plugin
  await tryConnection(
    { 
      ...baseConfig, 
      password: process.env.MYSQL_PASSWORD,
      authPlugins: {
        mysql_native_password: () => () => {
          return Buffer.from(process.env.MYSQL_PASSWORD + '\0');
        }
      }
    },
    'With mysql_native_password plugin'
  );
  
  // Test 6: Try 127.0.0.1 instead of localhost
  await tryConnection(
    { 
      ...baseConfig,
      host: '127.0.0.1',
      password: process.env.MYSQL_PASSWORD
    },
    'Using 127.0.0.1 instead of localhost'
  );
  
  console.log('\n\nTroubleshooting Tips:');
  console.log('=====================');
  console.log('1. Verify MySQL is running: Check Windows Services for MySQL80');
  console.log('2. Password issues:');
  console.log('   - Special characters in password might need escaping');
  console.log('   - Try resetting password with: ALTER USER \'root\'@\'localhost\' IDENTIFIED BY \'YourNewPassword\';');
  console.log('3. Authentication plugin issues:');
  console.log('   - MySQL 8 uses caching_sha2_password by default');
  console.log('   - You might need to change to mysql_native_password');
  console.log('4. Check MySQL error log for more details');
  console.log('   - Usually in: C:\\ProgramData\\MySQL\\MySQL Server 8.0\\Data\\*.err');
}

testAllConnections();