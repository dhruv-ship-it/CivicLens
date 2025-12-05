# CivicLens ML Service

This is the Python-based machine learning service for the CivicLens application. It provides image classification capabilities for automatically categorizing civic complaints.

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

## Installation

1. Clone the repository (if not already cloned)
2. Navigate to the `backend-python` directory:
   ```
   cd backend-python
   ```

3. Create a virtual environment (recommended):
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Ensure the ML model file is available (see Deployment section for automatic download setup)

## Environment Variables

Create a `.env` file based on `.env.example`:

```
cp .env.example .env
```

Configure the following variables:
- `PORT`: Port to run the service on (default: 5001)
- `MODEL_PATH`: Path to the ML model file (default: ./model.h5)
- `MODEL_DOWNLOAD_URL`: URL to download the model from if not present locally

## Running the Service

```
python ml/predict.py
```

The service will start on `http://localhost:5001` (or the port specified in your `.env` file).

## API Endpoints

### POST /predict
Classify an image and return the predicted category.

**Request:**
- Form data with an `image` field containing the image file

**Response:**
```json
{
  "category": "waterlogging",
  "className": "Waterlogging",
  "confidence": 0.95,
  "classIndex": 4
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "message": "ML service is running",
  "model": "loaded"
}
```

## Deployment

For deployment on Render:
1. Set the build command to: `pip install -r requirements.txt`
2. Set the start command to: `python ml/predict.py`
3. Configure environment variables as needed

### Automatic Model Download

The service can automatically download the ML model if it's not present locally. This is useful for deployment scenarios where you don't want to commit large model files to the repository.

To enable this feature:

1. Upload your model file (`final_model_ResNet50.h5`) as a GitHub Release asset or to cloud storage (S3, etc.)
2. Set the `MODEL_DOWNLOAD_URL` environment variable to the download URL
3. The service will automatically download the model on first start if it's missing

### GitHub Release Option (Recommended for Public Repos)

1. In GitHub, go to your repo → Releases → Draft a new release
2. Tag version like `v1.0` and release title `model-1`
3. Attach the model file `final_model_ResNet50.h5` as a release asset and publish the release
4. After publishing, click the attached asset and copy the download URL
5. In Render, set the environment variable `MODEL_DOWNLOAD_URL` to that exact URL

### S3 Option (Recommended for Private Models)

1. Create an S3 bucket (AWS)
2. Upload `final_model_ResNet50.h5` to the bucket
3. Create a pre-signed URL (valid for some hours/days) or make the object publicly accessible
4. Set `MODEL_DOWNLOAD_URL` in Render to the pre-signed URL or public URL

## Model File Management

**Important:** Never commit large model files (`.h5`, `.pb`, `.pt`) to git repositories. They should be:
1. Added to `.gitignore`
2. Distributed separately via releases or cloud storage
3. Downloaded at runtime by the service

This prevents repository bloat and keeps deployments fast.