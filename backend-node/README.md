# CivicLens Backend API

This is the Node.js backend API for the CivicLens application. It handles user authentication, complaint management, voting, and communication with the ML service.

## Prerequisites

- Node.js 18 or higher
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. Clone the repository (if not already cloned)
2. Navigate to the `backend-node` directory:
   ```
   cd backend-node
   ```

3. Install dependencies:
   ```
   npm install
   ```

## Environment Variables

Create a `.env` file based on `.env.example`:

```
cp .env.example .env
```

Configure the following variables:
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token signing
- `PORT`: Port to run the server on (default: 5000)
- `CORS_ORIGINS`: Comma-separated list of allowed origins
- `ML_SERVICE_URL`: URL of the ML service (default: http://localhost:5001/predict)

## Running the Service

### Development Mode
```
npm run dev
```

### Production Mode
```
npm run build
npm start
```

The server will start on `http://localhost:5000` (or the port specified in your `.env` file).

## API Endpoints

### User Authentication
- `POST /api/users/signup` - Register a new user
- `POST /api/users/login` - Login as a user
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/profile` - Update user profile

### Department Authentication
- `POST /api/departments/signup` - Register a new department
- `POST /api/departments/login` - Login as a department
- `GET /api/departments/me` - Get current department profile

### Complaints
- `POST /api/complaints` - Create a new complaint
- `GET /api/complaints/user` - Get complaints for current user's pincode
- `GET /api/complaints/user/resolved` - Get resolved complaints for current user's pincode
- `GET /api/complaints/department` - Get complaints for current department
- `GET /api/complaints/department/resolved` - Get resolved complaints for current department
- `PUT /api/complaints/:id/resolve` - Mark a complaint as resolved
- `POST /api/complaints/:id/upvote` - Upvote a complaint
- `POST /api/complaints/:id/downvote` - Downvote a complaint

### Comments
- `POST /api/complaints/:id/comments` - Add a comment to a complaint
- `GET /api/complaints/:id/comments` - Get comments for a complaint

## Deployment

For deployment on Render:
1. Set the build command to: `npm install`
2. Set the start command to: `npm start`
3. Configure environment variables as needed