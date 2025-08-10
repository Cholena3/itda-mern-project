# MySQL to MongoDB Migration Guide

## Prerequisites

1. **MySQL Database**: Ensure your MySQL server is running and contains the ITDA data
2. **MongoDB**: Ensure MongoDB is installed and running
3. **Node.js**: Required to run the migration script

## Step 1: Configure Database Connections

Edit the `.env.migration` file with your database credentials:

```env
# MySQL Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=itda_db

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/itda-project
```

## Step 2: Verify MySQL Tables

Your MySQL database should have these tables:
- `users` - User accounts and authentication
- `schemes` - Government schemes
- `projects` - Projects under schemes
- `works` - Work items under projects

## Step 3: Run the Migration

```bash
# Run the migration script
node migrate-mysql-to-mongo.js
```

The script will:
1. Connect to both MySQL and MongoDB
2. Show available MySQL tables
3. Wait 5 seconds (press Ctrl+C to cancel)
4. Migrate data in this order:
   - Users (with password hashing if needed)
   - Schemes
   - Projects (maintaining scheme relationships)
   - Works (maintaining project and scheme relationships)

## Step 4: Verify Migration

After migration, the script will show a summary:
- Total users migrated
- Total schemes migrated
- Total projects migrated
- Total works migrated

## MySQL Table Structure Expected

### users table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY,
  username VARCHAR(255),
  email VARCHAR(255),
  password VARCHAR(255),
  role VARCHAR(50),
  department VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### schemes table
```sql
CREATE TABLE schemes (
  id INT PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  budget DECIMAL(15,2),
  start_date DATE,
  end_date DATE,
  status VARCHAR(50),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### projects table
```sql
CREATE TABLE projects (
  id INT PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  scheme_id INT,
  budget DECIMAL(15,2),
  start_date DATE,
  end_date DATE,
  status VARCHAR(50),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### works table
```sql
CREATE TABLE works (
  id INT PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  scheme_id INT,
  project_id INT,
  contractor VARCHAR(255),
  budget DECIMAL(15,2),
  amount_spent DECIMAL(15,2),
  progress INT,
  start_date DATE,
  end_date DATE,
  status VARCHAR(50),
  photos TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## Troubleshooting

### MySQL Connection Issues
- Verify MySQL is running: `mysql -u root -p`
- Check if the database exists: `SHOW DATABASES;`
- Verify table names: `USE itda_db; SHOW TABLES;`

### MongoDB Connection Issues
- Verify MongoDB is running: `mongosh`
- Check if database exists: `show dbs`

### Common Errors
1. **"ER_ACCESS_DENIED_ERROR"**: Wrong MySQL username/password
2. **"ER_BAD_DB_ERROR"**: Database doesn't exist
3. **"MongoServerError"**: MongoDB not running or wrong URI

## Data Mapping

The migration script maps data as follows:

| MySQL Field | MongoDB Field | Notes |
|------------|---------------|-------|
| id | _id | Auto-generated MongoDB ObjectId |
| scheme_id | schemeId | Converted to MongoDB ObjectId reference |
| project_id | projectId | Converted to MongoDB ObjectId reference |
| created_at | createdAt | Date object |
| updated_at | updatedAt | Date object |
| amount_spent | amountSpent | Camel case conversion |

## Post-Migration Steps

1. **Test the Application**: 
   - Login with migrated user accounts
   - Verify all schemes, projects, and works are visible
   - Check that relationships are maintained

2. **Backup MongoDB**:
   ```bash
   mongodump --db itda-project --out backup/
   ```

3. **Update Application Config**:
   - Ensure `.env` file uses MongoDB URI
   - Remove any MySQL connection code

## Rolling Back

If you need to rollback:
1. Clear MongoDB collections
2. Re-run migration with corrected settings
3. Or restore from backup if available

## Support

If you encounter issues:
1. Check the console output for specific error messages
2. Verify your MySQL table structure matches the expected format
3. Ensure both databases are accessible from your machine