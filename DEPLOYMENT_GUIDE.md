# ITDA MERN Application - Render Deployment Guide

## Prerequisites

1. **GitHub Account**: Your code must be pushed to a GitHub repository
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **MongoDB Atlas**: Your existing MongoDB connection string

## Step-by-Step Deployment Instructions

### Step 1: Push Code to GitHub

First, create a new repository on GitHub and push your code:

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit for ITDA MERN application"

# Add your GitHub repository as origin
git remote add origin https://github.com/YOUR_USERNAME/ITDA-MERN.git

# Push to GitHub
git push -u origin main
```

### Step 2: Deploy Backend on Render

1. **Login to Render** at [dashboard.render.com](https://dashboard.render.com)

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub account if not already connected
   - Select your `ITDA-MERN` repository
   - Configure the service:
     - **Name**: `itda-backend`
     - **Region**: Oregon (US West)
     - **Branch**: main
     - **Root Directory**: (leave blank)
     - **Runtime**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`

3. **Add Environment Variables**:
   Click "Advanced" and add these environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string from .env
   - `JWT_SECRET`: Click "Generate" to create a secure random string
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   
   Optional (if using these features):
   - `REDIS_URL`: Your Redis URL (if using Redis)
   - `OPENAI_API_KEY`: Your OpenAI API key (if using AI features)

4. **Create Service**: Click "Create Web Service"

5. **Wait for Deployment**: The initial deployment will take 5-10 minutes

6. **Note Your Backend URL**: It will be something like `https://itda-backend.onrender.com`

### Step 3: Deploy Frontend on Render

1. **Create New Static Site**:
   - Click "New +" → "Static Site"
   - Select your `ITDA-MERN` repository
   - Configure the site:
     - **Name**: `itda-frontend`
     - **Branch**: main
     - **Root Directory**: (leave blank)
     - **Build Command**: `cd frontend && npm install && npm run build`
     - **Publish Directory**: `frontend/build`

2. **Add Environment Variables**:
   - `REACT_APP_API_URL`: Your backend URL (e.g., `https://itda-backend.onrender.com`)
   - `REACT_APP_SOCKET_URL`: Same as API URL

3. **Create Static Site**: Click "Create Static Site"

4. **Wait for Deployment**: This will also take 5-10 minutes

### Step 4: Update Configuration

After both services are deployed:

1. **Update Backend CORS Settings**:
   - Go to your backend service on Render
   - Add environment variable:
     - `FRONTEND_URL`: Your frontend URL (e.g., `https://itda-frontend.onrender.com`)
   - This ensures CORS is properly configured

2. **Verify Health Check**:
   - Visit `https://itda-backend.onrender.com/api/health`
   - You should see a success message

### Step 5: Alternative - Using render.yaml (Automated)

If you prefer automated deployment:

1. **Update render.yaml**:
   - Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username
   - Commit and push to GitHub

2. **Create Blueprint**:
   - In Render Dashboard, click "New +" → "Blueprint"
   - Connect your repository
   - Render will automatically detect `render.yaml` and create both services

3. **Configure Environment Variables**:
   - After blueprint creation, go to each service
   - Add the sensitive environment variables (MONGODB_URI, JWT_SECRET, etc.)

## Post-Deployment Checklist

- [ ] Backend is running: Check `https://itda-backend.onrender.com/api/health`
- [ ] Frontend is accessible: Visit `https://itda-frontend.onrender.com`
- [ ] Login functionality works
- [ ] Database connection is successful
- [ ] API calls from frontend to backend work
- [ ] WebSocket connections work (if using real-time features)

## Important Notes

1. **Free Tier Limitations**:
   - Services on free tier spin down after 15 minutes of inactivity
   - First request after inactivity may take 30-60 seconds
   - Consider upgrading to paid tier for production use

2. **Custom Domain**:
   - You can add custom domains in Render dashboard
   - Go to Settings → Custom Domains for each service

3. **Monitoring**:
   - Check Logs tab in Render dashboard for debugging
   - Set up health checks and alerts

4. **Database Security**:
   - Ensure MongoDB Atlas whitelist includes Render's IPs
   - Or use "Allow access from anywhere" (0.0.0.0/0) temporarily

## Troubleshooting

### Backend Not Starting
- Check environment variables are set correctly
- Verify MongoDB connection string
- Check logs in Render dashboard

### Frontend Build Failing
- Ensure all dependencies are in package.json
- Check for TypeScript errors
- Verify build command syntax

### CORS Errors
- Verify FRONTEND_URL environment variable
- Check backend CORS configuration
- Ensure API URLs in frontend match backend URL

### Database Connection Issues
- Verify MongoDB Atlas allows connections from Render
- Check connection string format
- Ensure database user has proper permissions

## Support

For Render-specific issues:
- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)

For application issues:
- Check application logs in Render dashboard
- Review MongoDB Atlas logs
- Test locally with production environment variables