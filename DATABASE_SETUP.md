# Database Setup Guide for Civic Lens

This guide will help you set up MongoDB for the Civic Lens project.

## Prerequisites

- MongoDB installed locally OR
- MongoDB Atlas account (cloud)

## Option 1: Local MongoDB Setup

### 1. Install MongoDB

**Windows:**
- Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
- Run the installer and follow the setup wizard
- MongoDB will typically run on `mongodb://localhost:27017`

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
# Ubuntu/Debian
sudo apt-get install -y mongodb

# Start MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### 2. Verify MongoDB is Running

```bash
# Check if MongoDB is running
mongosh
# or
mongo
```

If you see the MongoDB shell, you're good to go!

## Option 2: MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for a free account
3. Create a new cluster (free tier is fine)
4. Create a database user
5. Whitelist your IP address (or use 0.0.0.0/0 for development)
6. Get your connection string (it will look like: `mongodb+srv://username:password@cluster.mongodb.net/civiclens`)

## Database Configuration

### 1. Create `.env` file in the `backend-node` folder

Create a file named `.env` in the `backend-node` directory:

```env
# MongoDB Connection
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/civiclens

# For MongoDB Atlas, use your connection string:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/civiclens

# JWT Secret (change this to a random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Port
PORT=5000

# CORS Origins (comma-separated)
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# ML Service URL
ML_SERVICE_URL=http://localhost:5001/predict
```

### 2. Database Collections

The application will automatically create these collections when you start using the app:

1. **users** - Citizen accounts
   - Fields: username, email, password, pincode, createdAt, updatedAt
   - Indexes: username (unique), email (unique), pincode

2. **departments** - Government department accounts
   - Fields: department, pincode, password, createdAt, updatedAt
   - Indexes: department + pincode (composite unique), pincode

3. **complaints** - User-submitted complaints
   - Fields: username, category, address, description, pincode, upvote, downvote, status, createdAt, updatedAt
   - Indexes: pincode, category, pincode + category, createdAt, status

4. **comments** - Comments on complaints
   - Fields: complaintId, username, content, createdAt, updatedAt
   - Indexes: complaintId, complaintId + createdAt, username

## Starting the Application

### 1. Install Backend Dependencies

```bash
cd backend-node
npm install
```

### 2. Start the Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm run build
npm start
```

The server will start on `http://localhost:5000` (or the port specified in `.env`)

### 3. Verify Database Connection

When you start the backend, you should see:
```
✅ Connected to MongoDB
🚀 Server running on port 5000
```

If you see an error, check:
- MongoDB is running (for local setup)
- Connection string is correct in `.env`
- Network access is allowed (for Atlas)

## Testing the Setup

Once everything is running:

1. Start the backend: `cd backend-node && npm run dev`
2. Start the citizen frontend: `cd citizen && npm run dev`
3. Start the department frontend: `cd department && npm run dev`

Try creating a user account in the citizen portal - if it works, your database is set up correctly!

## Troubleshooting

### MongoDB Connection Error

**Error:** `MongoServerError: Authentication failed`

**Solution:** Check your MongoDB connection string and credentials in `.env`

**Error:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Solution:** 
- Make sure MongoDB is running locally
- Check if the port (27017) is correct
- For Atlas, check your IP whitelist

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:** Change the PORT in `.env` to a different number (e.g., 5001)

## Production Considerations

1. **Change JWT_SECRET** to a strong random string
2. **Use MongoDB Atlas** or a managed MongoDB service
3. **Set up proper CORS** origins (only your production domains)
4. **Enable MongoDB authentication** in production
5. **Use environment variables** for all sensitive data
6. **Set up database backups**

## Database Schema Reference

### Users Collection
```javascript
{
  _id: ObjectId,
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  pincode: String (required, 6 digits),
  createdAt: Date,
  updatedAt: Date
}
```

### Departments Collection
```javascript
{
  _id: ObjectId,
  department: String (enum: ["waterlogging", "potholes", "garbages", "streetlight", "others"]),
  pincode: String (required, 6 digits),
  password: String (hashed, required),
  createdAt: Date,
  updatedAt: Date
}
// Unique constraint on: department + pincode
```

### Complaints Collection
```javascript
{
  _id: ObjectId,
  username: String (required),
  category: String (enum: ["waterlogging", "potholes", "garbages", "streetlight", "others"]),
  address: String (required),
  description: String (optional),
  pincode: String (required, 6 digits),
  upvote: Number (default: 0),
  downvote: Number (default: 0),
  status: String (enum: ["active", "resolved"], default: "active"),
  createdAt: Date,
  updatedAt: Date
}
```

### Comments Collection
```javascript
{
  _id: ObjectId,
  complaintId: ObjectId (reference to complaint),
  username: String (required),
  content: String (required, max 500 characters),
  createdAt: Date,
  updatedAt: Date
}
// Indexes: complaintId, complaintId + createdAt (descending), username
```

## Next Steps

After setting up the database:

1. ✅ Backend is running and connected to MongoDB
2. ✅ Create test accounts (citizen and department)
3. ✅ Submit test complaints
4. ✅ Test upvote/downvote functionality
5. ✅ Test complaint resolution (department portal)
6. ✅ Test comment functionality
7. ✅ Test complaint status functionality (active/resolved)

Good luck with your project! 🚀