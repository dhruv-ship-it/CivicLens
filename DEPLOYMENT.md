# Deployment Guide for CivicLens

This guide explains how to deploy the CivicLens application to production environments.

## Project Structure for Deployment

```
civiclens/
├── backend-node/          # Node.js backend API
├── backend-python/        # Python ML service
├── citizen/               # Citizen portal frontend
├── department/            # Department portal frontend
├── DATABASE_SETUP.md      # Database configuration guide
├── DEPLOYMENT.md          # This file
└── README.md              # Main project README
```

## Services Overview

1. **Citizen Portal** (`citizen/`) - Next.js frontend deployed to Vercel
2. **Department Portal** (`department/`) - Next.js frontend deployed to Vercel
3. **Backend API** (`backend-node/`) - Node.js/Express backend deployed to Render
4. **ML Service** (`backend-python/`) - Python/Flask ML service deployed to Render

## Prerequisites

- GitHub/GitLab account for version control
- Vercel account for frontend deployment
- Render account for backend deployment
- MongoDB Atlas account (or other MongoDB hosting service)
- Domain names (optional but recommended)

## Environment Variables

Each service requires specific environment variables. Create these in your deployment platforms rather than committing them to version control.

### Backend API (`backend-node/`)

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/civiclens
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
CORS_ORIGINS=https://citizen.yourdomain.com,https://department.yourdomain.com
ML_SERVICE_URL=https://ml-service-your-render-url.onrender.com/predict
```

### ML Service (`backend-python/`)

```env
PORT=5001
MODEL_PATH=./models/final_model_ResNet50.h5
```

### Citizen Portal (`citizen/`)

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

### Department Portal (`department/`)

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

## Deployment Steps

### 1. Prepare Your Repository

1. Push your code to GitHub/GitLab
2. Ensure all secrets are removed from the codebase
3. Verify `.env.example` files exist but `.env` files are in `.gitignore`

### 2. Deploy Backend API to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New Web Service"
3. Connect your GitHub repository
4. Select the `backend-node/` directory
5. Set the following:
   - Name: `civiclens-api`
   - Runtime: Node
   - Build command: `npm install`
   - Start command: `npm start`
   - Plan: Free or Standard
6. Add environment variables from the list above
7. Click "Create Web Service"

### 3. Deploy ML Service to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New Web Service"
3. Connect your GitHub repository
4. Select the `backend-python/` directory
5. Set the following:
   - Name: `civiclens-ml`
   - Runtime: Python
   - Build command: `pip install -r requirements.txt`
   - Start command: `python ml/predict.py`
   - Plan: Free or Standard
6. Add environment variables from the list above
7. Upload your ML model file (`final_model_ResNet50.h5`) to the `backend-python/models/` directory
8. Click "Create Web Service"

### 4. Deploy Citizen Portal to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Connect your GitHub repository
4. Select the `citizen/` directory
5. Set the following:
   - Project Name: `civiclens-citizen`
   - Framework Preset: Next.js
6. Add environment variables from the list above
7. Click "Deploy"

### 5. Deploy Department Portal to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Connect your GitHub repository
4. Select the `department/` directory
5. Set the following:
   - Project Name: `civiclens-department`
   - Framework Preset: Next.js
6. Add environment variables from the list above
7. Click "Deploy"

## Post-Deployment Configuration

### 1. Update CORS Settings

Once you have your frontend URLs from Vercel:
1. Update the `CORS_ORIGINS` in your backend API environment variables
2. Redeploy the backend API

### 2. Update ML Service URL

Once you have your ML service URL from Render:
1. Update the `ML_SERVICE_URL` in your backend API environment variables
2. Redeploy the backend API

### 3. Custom Domains (Optional)

For each service, you can add custom domains in their respective dashboards:
- Vercel: Project Settings → Domains
- Render: Web Service Settings → Custom Domains

## Monitoring and Maintenance

### Logs
- Vercel: Dashboard → Project → Logs
- Render: Dashboard → Service → Logs

### Scaling
- Render automatically scales web services based on traffic
- For high-traffic applications, consider upgrading to paid plans

### Backups
- Regularly backup your MongoDB database
- Keep copies of your ML model file

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Verify `CORS_ORIGINS` includes your frontend URLs
   - Ensure there are no trailing slashes

2. **ML Service Connection Issues**
   - Verify `ML_SERVICE_URL` is correct
   - Check that the ML service is running on Render

3. **Database Connection Issues**
   - Verify `MONGODB_URI` is correct
   - Check MongoDB Atlas IP whitelist settings

4. **Environment Variables Not Loading**
   - Ensure variables are set in the deployment platform, not in code
   - Check for typos in variable names

### Useful Commands for Debugging

```bash
# Test API connectivity
curl https://api.yourdomain.com/api/health

# Test ML service connectivity
curl https://ml-service-your-render-url.onrender.com/health

# Check frontend builds
vercel logs civiclens-citizen
vercel logs civiclens-department
```

## Cost Considerations

### Free Tier Options
- Vercel: Free tier with limitations on bandwidth and build minutes
- Render: Free tier with service sleeping after inactivity
- MongoDB Atlas: Free tier with shared cluster

### Paid Options
- Vercel Pro: For production applications with higher traffic
- Render Standard: For always-on services
- MongoDB Atlas: Dedicated clusters for better performance

## Security Best Practices

1. **Secrets Management**
   - Never commit secrets to version control
   - Use deployment platform's secret management

2. **HTTPS**
   - All services should use HTTPS (provided by default on Vercel/Render)

3. **Authentication**
   - Use strong JWT secrets
   - Implement rate limiting for API endpoints

4. **Database Security**
   - Use strong database passwords
   - Restrict database access with IP whitelisting
   - Enable database encryption

By following this guide, you should have a fully deployed CivicLens application ready for production use.