import os
import io
import numpy as np
from flask import Flask, request, jsonify
import tensorflow as tf

# Disable GPU if needed (can help with some compatibility issues)
tf.config.set_visible_devices([], 'GPU')

# Initialize Flask app
app = Flask(__name__)

# Load the model once at startup
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'models', 'final_model_ResNet50.h5')
model = None

# Class mapping (from your notebook)
CLASS_MAPPING = {
    0: 'Broken Missing Streetlight',
    1: 'Garbages',
    2: 'Others',
    3: 'Potholes',
    4: 'Waterlogging'
}

# Map to database categories
CATEGORY_MAPPING = {
    'Broken Missing Streetlight': 'streetlight',
    'Garbages': 'garbages',
    'Others': 'others',
    'Potholes': 'potholes',
    'Waterlogging': 'waterlogging'
}

def load_model_once():
    """Load the model once when the service starts"""
    global model
    if model is None:
        print("Loading model...")
        try:
            # Try the standard approach first
            import keras
            model = keras.models.load_model(MODEL_PATH, compile=False)
            print("Model loaded successfully with standard approach!")
        except Exception as e1:
            print(f"Standard model loading failed: {e1}")
            try:
                # Fallback: Try to reconstruct the model architecture and load weights
                print("Trying fallback approach: reconstructing model architecture...")
                
                # Import required modules
                from keras.applications import ResNet50
                from keras.layers import Dense, GlobalAveragePooling2D, Dropout
                from keras.models import Model
                
                # Recreate the model architecture (based on your notebook)
                base_model = ResNet50(
                    include_top=False,
                    weights='imagenet',
                    input_shape=(224, 224, 3)
                )
                
                # Add the custom layers from your notebook
                x = GlobalAveragePooling2D()(base_model.output)
                x = Dense(256, activation='relu')(x)
                x = Dropout(0.4)(x)
                output = Dense(5, activation='softmax')(x)  # 5 classes
                
                # Create the model
                reconstructed_model = Model(inputs=base_model.input, outputs=output)
                
                # Load only the weights
                reconstructed_model.load_weights(MODEL_PATH, by_name=True, skip_mismatch=True)
                
                model = reconstructed_model
                print("Model loaded successfully with reconstruction approach!")
            except Exception as e2:
                print(f"Reconstruction approach also failed: {e2}")
                import traceback
                traceback.print_exc()
                # Set model to None so we know it failed to load
                model = None
    return model

def preprocess_image(img_bytes):
    """Preprocess image for ResNet50 model"""
    import tempfile
    from PIL import Image
    
    # Create a temporary file to work with PIL
    with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
        tmp.write(img_bytes)
        tmp_path = tmp.name
    
    try:
        # Open image from temporary file
        img = Image.open(tmp_path)
        
        # Convert to RGB if needed
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Resize to 224x224 (ResNet50 input size)
        img = img.resize((224, 224))
        
        # Import keras preprocessing dynamically
        import keras
        # Convert to array using Keras
        img_array = keras.preprocessing.image.img_to_array(img)
        
        # Expand dimensions to match model input (1, 224, 224, 3)
        img_array = np.expand_dims(img_array, axis=0)
        
        # Apply ResNet50 preprocessing
        img_array = keras.applications.resnet50.preprocess_input(img_array)
        
        return img_array
    finally:
        # Clean up temporary file
        os.unlink(tmp_path)

@app.route('/predict', methods=['POST'])
def predict():
    """Predict category from uploaded image"""
    try:
        # Check if image file is present
        if 'image' not in request.files:
            print("No image file found in request")
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        print(f"Received image file: {file.filename}, size: {len(file.read())} bytes")
        file.seek(0)  # Reset file pointer after reading length
        
        # Read image bytes
        img_bytes = file.read()
        print(f"Image bytes length: {len(img_bytes)}")
        
        # Preprocess image
        processed_img = preprocess_image(img_bytes)
        print(f"Processed image shape: {processed_img.shape}")
        
        # Load model if not already loaded
        model_instance = load_model_once()
        
        # Make sure model is loaded
        if model_instance is None:
            print("Model is not loaded")
            return jsonify({'error': 'Model not loaded - service may be misconfigured'}), 500
        
        # Make prediction
        print("Making prediction...")
        predictions = model_instance.predict(processed_img)
        print(f"Predictions shape: {predictions.shape}")
        print(f"Predictions: {predictions}")
        
        # Get predicted class index
        predicted_class_idx = int(np.argmax(predictions[0]))
        print(f"Predicted class index: {predicted_class_idx}")
        
        # Get confidence score
        confidence = float(predictions[0][predicted_class_idx])
        print(f"Confidence: {confidence}")
        
        # Map to class name
        class_name = CLASS_MAPPING.get(predicted_class_idx, 'Unknown')
        print(f"Class name: {class_name}")
        
        # Map to database category
        category = CATEGORY_MAPPING.get(class_name, 'others')
        print(f"Database category: {category}")
        
        result = {
            'category': category,
            'className': class_name,
            'confidence': confidence,
            'classIndex': predicted_class_idx
        }
        print(f"Returning result: {result}")
        
        return jsonify(result)
        
    except Exception as e:
        print(f"Error in prediction: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    # Try to load model to check health
    try:
        model_instance = load_model_once()
        if model_instance is not None:
            return jsonify({'status': 'healthy', 'message': 'ML service is running', 'model': 'loaded'})
        else:
            return jsonify({'status': 'degraded', 'message': 'ML service is running but model not loaded', 'model': 'not loaded'})
    except Exception as e:
        return jsonify({'status': 'unhealthy', 'message': f'ML service error: {str(e)}', 'model': 'error'})

if __name__ == '__main__':
    # Load model on startup
    load_model_once()
    
    # Run the app
    app.run(host='0.0.0.0', port=5001, debug=False)