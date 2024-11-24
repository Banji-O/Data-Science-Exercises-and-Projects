from google.cloud import storage  # Import Google Cloud Storage for file handling
import tensorflow as tf  # Import TensorFlow for model handling and prediction
from PIL import Image  # Import Pillow for image processing
import numpy as np  # Import NumPy for numerical operations

# Constants
BUCKET_NAME = 'potato_disease_bucket'  # Google Cloud Storage bucket name
CLASS_NAMES = ['Early Blight', 'Late Blight', 'Healthy']  # Classes for prediction
MODEL_PATH = '/tmp/potatoes.h5'  # Temporary local path to store the model

model = None  # Placeholder for the model

def download_blob(bucket_name, source_blob_name, destination_file_name):
    """
    Downloads a blob (file) from a Google Cloud Storage bucket.
    """
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(source_blob_name)
    blob.download_to_filename(destination_file_name)
    print(f'Model downloaded to {destination_file_name}')

def predict(request):
    """
    Predicts the class of the uploaded image using the pre-trained model.
    """
    global model  # Use the global model variable

    # Load the model if not already loaded
    if model is None:
        print('Loading model...')
        download_blob(BUCKET_NAME, 'models/potato_h5_model.h5', MODEL_PATH)
        model = tf.keras.models.load_model(MODEL_PATH)
        print('Model successfully loaded.')

    try:
        # Read and preprocess the uploaded image
        image = request.files['file']  # Get the uploaded file
        image = Image.open(image).convert("RGB").resize((256, 256))  # Convert to RGB and resize
        image = np.array(image) / 255.0  # Normalize pixel values
        img_array = tf.expand_dims(image, 0)  # Add batch dimension

        # Make predictions
        predictions = model.predict(img_array)
        predicted_class = CLASS_NAMES[np.argmax(predictions[0])]  # Get class with highest confidence
        confidence = round(100 * np.max(predictions[0]), 2)  # Calculate confidence as a percentage

        # Return result
        return {'class': predicted_class, 'confidence': confidence}

    except Exception as e:
        # Handle errors gracefully
        print(f"Error during prediction: {str(e)}")
        return {'error': 'An error occurred during prediction. Please try again.'}
