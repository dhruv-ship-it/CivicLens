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

5. Ensure the ML model file (`final_model_ResNet50.h5`) is in the `../models` directory relative to this folder.

## Environment Variables

Create a `.env` file based on `.env.example`:

```
cp .env.example .env
```

Configure the following variables:
- `PORT`: Port to run the service on (default: 5001)
- `MODEL_PATH`: Path to the ML model file (default: ../models/final_model_ResNet50.h5)

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