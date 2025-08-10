const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.migration' });

async function testConnection() {
  const config = {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'itda',
    port: process.env.MYSQL_PORT || 3306
  };
  
  console.log('Testing MySQL connection with:');
  console.log(`Host: ${config.host}`);
  console.log(`Port: ${config.port}`);
  console.log(`User: ${config.user}`);
  console.log(`Database: ${config.database}`);
  console.log(`Password: ${config.password ? '***' + config.password.slice(-3) : '(empty)'}`);
  
  try {
    const connection = await mysql.createConnection(config);
    console.log('\n✅ Connected successfully!');
    
    // Show databases
    const [databases] = await connection.execute('SHOW DATABASES');
    console.log('\nAvailable databases:');
    databases.forEach(db => console.log(`  - ${Object.values(db)[0]}`));
    
    // Show tables in current database
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`\nTables in '${config.database}':`);
    tables.forEach(table => console.log(`  - ${Object.values(table)[0]}`));
    
    await connection.end();
  } catch (error) {
    console.error('\n❌ Connection failed:', error.message);
    console.error('\nPossible issues:');
    console.error('1. MySQL server not running');
    console.error('2. Wrong password (check .env.migration)');
    console.error('3. Database does not exist');
    console.error('4. User does not have permissions');
    
    // Try without password
    if (config.password) {
      console.log('\nTrying without password...');
      try {
        const connection = await mysql.createConnection({
          ...config,
          password: ''
        });
        console.log('✅ Connected without password!');
        await connection.end();
      } catch (err) {
        console.log('❌ Also failed without password');
      }
    }
  }
}

testConnection();