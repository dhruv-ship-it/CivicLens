# Civic Lens - Citizen Complaint Management System

A full-stack application for citizens to report civic issues and government departments to manage and resolve them.

## Project Structure

```
civiclens/
├── backend/          # Express.js + TypeScript + MongoDB backend
├── citizen/          # Next.js frontend for citizens
├── department/       # Next.js frontend for government departments
└── README.md         # This file
```

## Features

### Citizen Portal
- ✅ User signup/login with username, email, password, and pincode
- ✅ View all complaints in their pincode area
- ✅ Submit new complaints (category, address, description, optional image)
- ✅ Upvote/downvote complaints
- ✅ Edit profile (username, pincode, password - email cannot be changed)

### Department Portal
- ✅ Department signup/login (department name, pincode, password)
- ✅ View complaints filtered by department category and pincode
- ✅ Resolve complaints (delete from database)
- ✅ View-only profile

## Tech Stack

### Backend
- **Node.js** with **Express.js**
- **TypeScript**
- **MongoDB** with **Mongoose**
- **JWT** for authentication
- **bcryptjs** for password hashing

### Frontend
- **Next.js 16** (React 19)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** components

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)

### 1. Database Setup

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed instructions.

Quick setup:
1. Install MongoDB locally or use MongoDB Atlas
2. Create `.env` file in `backend/` folder:
   ```env
   MONGODB_URI=mongodb://localhost:27017/civiclens
   JWT_SECRET=your-secret-key-here
   PORT=5000
   CORS_ORIGINS=http://localhost:3000,http://localhost:3001
   ```

### 2. Backend Setup

```bash
cd backend
npm install
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. ML Service Setup (for image classification)

The ML service provides image classification for complaints submitted without a category.

```bash
cd backend/ml
# Install Python requirements
pip install -r requirements.txt
# Start the ML service
python predict.py
```

The ML service will run on `http://localhost:5001`

### 4. Citizen Frontend Setup

```bash
cd citizen
npm install
npm run dev
```

Citizen portal will run on `http://localhost:3000`

### 5. Department Frontend Setup

```bash
cd department
npm install
npm run dev
```

Department portal will run on `http://localhost:3001`

## API Endpoints

### User Authentication
- `POST /api/users/signup` - Create user account
- `POST /api/users/login` - Login user
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/profile` - Update user profile

### Department Authentication
- `POST /api/departments/signup` - Create department account
- `POST /api/departments/login` - Login department
- `GET /api/departments/me` - Get current department profile

### Complaints
- `POST /api/complaints` - Create complaint (user only)
- `GET /api/complaints/user` - Get user's pincode complaints
- `GET /api/complaints/department` - Get department's complaints
- `POST /api/complaints/:id/upvote` - Upvote complaint
- `POST /api/complaints/:id/downvote` - Downvote complaint
- `DELETE /api/complaints/:id` - Resolve complaint (department only)

## Database Collections

### users
- username (unique)
- email (unique, cannot be changed)
- password (hashed)
- pincode

### departments
- department (enum: waterlogging, potholes, garbages, streetlight, others)
- pincode
- password (hashed)
- Unique constraint: (department + pincode)

### complaints
- username
- category (enum: waterlogging, potholes, garbages, streetlight, others)
- address
- description (optional)
- pincode
- upvote (default: 0)
- downvote (default: 0)

## Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/civiclens
JWT_SECRET=your-secret-key
PORT=5000
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Development

### Running in Development Mode

1. Start MongoDB
2. Start backend: `cd backend && npm run dev`
3. Start ML service: `cd backend/ml && python predict.py`
4. Start citizen frontend: `cd citizen && npm run dev`
5. Start department frontend: `cd department && npm run dev`

### Building for Production

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd citizen
npm run build
npm start

cd department
npm run build
npm start
```

## Features to Add (Future)

- [x] Image upload and classification using ML model (.h5 format)
- [ ] Image storage (currently images are processed but not stored)

## Notes

- Image classification model is now integrated (users can submit images without selecting a category)
- Images are not stored in the database (only processed for classification)
- JWT tokens are stored in localStorage
- Passwords are hashed using bcryptjs

## License

This project is for educational purposes.

## Support

For issues or questions, please refer to the [DATABASE_SETUP.md](./DATABASE_SETUP.md) guide or check the code comments.

