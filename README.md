# ITDA Project Management System

A comprehensive web application for managing Integrated Tribal Development Agency (ITDA) projects in Parlakhemundi, Gajapati District, Odisha. Built with MERN stack for robust performance and scalability.

## Features

- **User Authentication**: Secure login system with JWT tokens
- **Dashboard**: Overview of schemes, projects, works with visual charts
- **Schemes Management**: Create, update, delete, and view schemes
- **Projects Management**: Manage projects under schemes with progress tracking
- **Works Management**: Track individual work items under projects
- **Progress Tracking**: Visual progress monitoring with charts and graphs
- **Photo Upload**: Upload and manage work progress photos

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- Multer for file uploads
- Bcrypt for password hashing

### Frontend
- React with TypeScript
- Material-UI for components
- React Router for navigation
- Axios for API calls
- Recharts for data visualization

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
```bash
cd itda-mern
```

2. **Install backend dependencies**
```bash
npm install
```

3. **Install frontend dependencies**
```bash
cd frontend
npm install
```

4. **Configure environment variables**
Create a `.env` file in the root directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/itda_project_management
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
```

5. **Create upload directories**
```bash
mkdir -p backend/uploads/work_photos
```

6. **Start MongoDB**
Make sure MongoDB is running on your system.

7. **Run the application**

For development (runs both backend and frontend):
```bash
npm run dev
```

Or run separately:

Backend only:
```bash
npm run server
```

Frontend only:
```bash
npm run client
```

## Project Structure

```
itda-mern/
├── backend/
│   ├── models/         # MongoDB schemas
│   ├── routes/         # API endpoints
│   ├── uploads/        # File upload directory
│   └── server.js       # Express server setup
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable React components
│   │   ├── contexts/   # React contexts (Auth)
│   │   ├── pages/      # Page components
│   │   └── App.tsx     # Main App component
│   └── package.json
├── .env                # Environment variables
└── package.json        # Backend dependencies
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Schemes
- `GET /api/schemes` - Get all schemes
- `POST /api/schemes` - Create new scheme
- `PUT /api/schemes/:id` - Update scheme
- `DELETE /api/schemes/:id` - Delete scheme

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/scheme/:schCode` - Get projects by scheme
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Works
- `GET /api/works` - Get all works
- `GET /api/works/project/:projCode` - Get works by project
- `POST /api/works` - Create new work
- `PUT /api/works/:id` - Update work
- `DELETE /api/works/:id` - Delete work

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/recent-projects` - Get recent projects
- `GET /api/dashboard/progress-overview` - Get progress overview

## Default Login Credentials

For testing, you can create a user through the API or MongoDB directly:

```javascript
// Use this in MongoDB shell or Compass
db.users.insertOne({
  username: "admin",
  email: "admin@itda.com",
  password: "$2a$10$YourHashedPasswordHere", // Use bcrypt to hash
  role: "admin",
  department: "IT",
  isActive: true
})
```

## Development

### Adding New Features
1. Create model in `backend/models/`
2. Add routes in `backend/routes/`
3. Update server.js to include new routes
4. Create frontend components in `frontend/src/`
5. Update navigation if needed

### Build for Production

```bash
cd frontend
npm run build
```

The build files will be in `frontend/build/` directory.

## License

This project is proprietary to ITDA.