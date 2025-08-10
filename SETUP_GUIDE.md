# Complete MERN Stack Setup Guide for Windows

## Step 1: Install Node.js and npm

1. **Download Node.js**
   - Go to https://nodejs.org/
   - Download the LTS version (recommended)
   - Run the installer and follow the installation wizard
   - Keep all default settings

2. **Verify Installation**
   Open Command Prompt or PowerShell and run:
   ```bash
   node --version
   npm --version
   ```
   You should see version numbers for both.

## Step 2: Install MongoDB

### Option A: MongoDB Community Server (Local Installation)

1. **Download MongoDB**
   - Go to https://www.mongodb.com/try/download/community
   - Select Windows as platform
   - Download the MSI installer

2. **Install MongoDB**
   - Run the installer
   - Choose "Complete" installation
   - Install MongoDB as a Windows Service (check the box)
   - Install MongoDB Compass (GUI tool) when prompted

3. **Verify MongoDB Installation**
   - MongoDB should start automatically as a Windows service
   - Open MongoDB Compass to verify connection to `mongodb://localhost:27017`

### Option B: MongoDB Atlas (Cloud - Easier for beginners)

1. **Create Free Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free account
   - Create a free cluster (M0 Sandbox)

2. **Configure Cluster**
   - Click "Connect" on your cluster
   - Add your IP address to whitelist
   - Create database user (save username/password)
   - Choose "Connect your application"
   - Copy the connection string

3. **Update .env file**
   Replace the MONGODB_URI in your `.env` file with:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/itda_project_management?retryWrites=true&w=majority
   ```

## Step 3: Install Git (if not already installed)

1. **Download Git**
   - Go to https://git-scm.com/download/win
   - Download and run the installer
   - Use default settings

2. **Verify Installation**
   ```bash
   git --version
   ```

## Step 4: Setup the MERN Application

1. **Navigate to project directory**
   ```bash
   cd C:\Users\chole\eclipse-workspace\ITDAPROJECT1\itda-mern
   ```

2. **Install Backend Dependencies**
   ```bash
   npm install
   ```
   
   If you get any errors, try:
   ```bash
   npm cache clean --force
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```
   
   Note: You'll see some warnings about deprecated packages - this is normal and won't affect functionality.

4. **Additional Frontend Dependencies**
   Still in the frontend directory, install the UI and visualization libraries:
   ```bash
   npm install axios react-router-dom @mui/material @emotion/react @emotion/styled @mui/icons-material recharts react-hook-form react-query
   ```

5. **Return to root directory**
   ```bash
   cd ..
   ```

## Step 5: Configure Environment Variables

1. **Check .env file exists**
   The `.env` file should already be in `C:\Users\chole\eclipse-workspace\ITDAPROJECT1\itda-mern\.env`

2. **Update if using MongoDB Atlas**
   If using cloud MongoDB, update the MONGODB_URI as shown in Step 2, Option B.

## Step 6: Create Upload Directory

1. **Create directory for file uploads**
   ```bash
   mkdir backend\uploads\work_photos
   ```

## Step 7: Create Initial Admin User

1. **Start only the backend server first**
   ```bash
   npm run server
   ```

2. **In a new terminal, create admin user**
   Use a tool like Postman or curl to create user, or use this PowerShell command:
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"username":"admin","email":"admin@itda.com","password":"admin123","role":"admin","department":"IT"}'
   ```

   Or if you have MongoDB Compass:
   - Connect to your database
   - Create a new document in the `users` collection with the registration data

## Step 8: Run the Complete Application

1. **Install concurrently (if not already installed)**
   ```bash
   npm install --save-dev concurrently
   ```

2. **Start both backend and frontend**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on http://localhost:5000
   - Frontend React app on http://localhost:3000

3. **Access the Application**
   - Open your browser and go to http://localhost:3000
   - Login with:
     - Email: admin@itda.com
     - Password: admin123

## Step 9: Troubleshooting

### Common Issues and Solutions:

1. **Port 5000 or 3000 already in use**
   - Change port in `.env` file or
   - Kill the process using the port:
   ```bash
   netstat -ano | findstr :5000
   taskkill /PID <PID_NUMBER> /F
   ```

2. **MongoDB connection error**
   - Ensure MongoDB service is running:
   ```bash
   net start MongoDB
   ```
   - Or check Windows Services for MongoDB Server

3. **npm install fails**
   - Clear npm cache:
   ```bash
   npm cache clean --force
   ```
   - Delete node_modules and package-lock.json, then reinstall

4. **React app not loading**
   - Check if proxy is set correctly in frontend/package.json
   - Should be: `"proxy": "http://localhost:5000"`

5. **CORS errors**
   - Backend server must be running
   - Check that cors middleware is configured in server.js

## Step 10: Verify Everything Works

1. **Test Backend API**
   - Go to http://localhost:5000/api/schemes
   - Should return empty array [] or list of schemes

2. **Test Frontend**
   - Login at http://localhost:3000
   - Navigate through Dashboard, Schemes, Projects, Works, Progress
   - Try creating a new scheme

## Additional Tools (Optional but Recommended)

1. **Postman** - For API testing
   - Download from https://www.postman.com/downloads/

2. **MongoDB Compass** - GUI for MongoDB
   - Usually installed with MongoDB
   - Or download from https://www.mongodb.com/products/compass

3. **VS Code Extensions**
   - ES7+ React/Redux/React-Native snippets
   - Prettier - Code formatter
   - MongoDB for VS Code
   - Thunder Client (API testing within VS Code)

## Next Steps

Once everything is running:
1. Create schemes, projects, and works through the UI
2. Upload work progress photos
3. View progress charts and dashboard
4. Customize the application as needed

## Support

If you encounter issues:
1. Check the browser console (F12) for frontend errors
2. Check the terminal running `npm run dev` for backend errors
3. Verify all dependencies are installed correctly
4. Ensure MongoDB is running and accessible