# CivicLens

CivicLens is a civic complaint management system that allows citizens to report local issues and government departments to manage and resolve them. The system features automatic image classification using machine learning to categorize complaints.

## Project Structure

```
civiclens/
├── backend-node/          # Node.js backend API
├── backend-python/        # Python ML service
├── citizen/               # Citizen portal frontend
├── department/            # Department portal frontend
├── DATABASE_SETUP.md      # Database configuration guide
├── DEPLOYMENT.md          # Deployment guide
└── README.md              # This file
```

## Services

### 1. Citizen Portal (`citizen/`)
A Next.js frontend for citizens to:
- Register and login
- Submit complaints with images
- View and vote on complaints
- Comment on complaints
- Track complaint status

### 2. Department Portal (`department/`)
A Next.js frontend for government departments to:
- Register and login
- View complaints in their jurisdiction
- Resolve complaints
- Comment on complaints

### 3. Backend API (`backend-node/`)
A Node.js/Express backend that:
- Handles user authentication
- Manages complaints, votes, and comments
- Communicates with the ML service
- Provides RESTful APIs for both frontends

### 4. ML Service (`backend-python/`)
A Python/Flask microservice that:
- Classifies images using a ResNet50 model
- Provides prediction endpoints for the backend
- Runs independently of the main backend

## Prerequisites

- Node.js 18 or higher
- Python 3.8 or higher
- MongoDB (local or Atlas)
- npm/yarn and pip

## Setup Instructions

### 1. Database Setup
Follow the instructions in [DATABASE_SETUP.md](DATABASE_SETUP.md) to set up MongoDB.

### 2. Backend API (`backend-node/`)
```bash
cd backend-node
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### 3. ML Service (`backend-python/`)
```bash
cd backend-python
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration
python ml/predict.py
```

### 4. Citizen Portal (`citizen/`)
```bash
cd citizen
npm install
cp .env.example .env.local
# Edit .env.local with your API URL
npm run dev
```

### 5. Department Portal (`department/`)
```bash
cd department
npm install
cp .env.example .env.local
# Edit .env.local with your API URL
npm run dev
```

## Environment Variables

Each service has its own environment variables. Check the `.env.example` file in each directory for required variables.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### Vercel (Frontends)
- Citizen Portal: Deploy the `citizen/` directory
- Department Portal: Deploy the `department/` directory

### Render (Backends)
- Backend API: Deploy the `backend-node/` directory
- ML Service: Deploy the `backend-python/` directory

Make sure to configure environment variables appropriately for each deployment platform.

## API Documentation

The backend API provides RESTful endpoints for:
- User authentication
- Department authentication
- Complaint management
- Voting system
- Comment system

Refer to the README files in each service directory for detailed API documentation.