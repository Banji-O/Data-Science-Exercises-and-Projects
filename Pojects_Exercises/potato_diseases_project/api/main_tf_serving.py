from fastapi import FastAPI, File, UploadFile
import uvicorn  # To run the FastAPI app
import numpy as np
from io import BytesIO
from PIL import Image
import tensorflow as tf  # For TensorFlow operations
import requests  # To send HTTP requests

# Initialize the FastAPI app
app = FastAPI()

# Endpoint URL for model prediction
MODEL_ENDPOINT = 'http://localhost:8080/potato_diseases_project/saved_models:predict'

# Class names for prediction
CLASS_NAMES = ['Early Blight', 'Late Blight', 'Healthy']

@app.get('/ping')
async def ping():
    """
    Health check endpoint.
    Returns a simple message confirming the app is running.
    """
    return {'message': 'Hello, I am alive'}

def read_file_as_image(data: bytes) -> np.ndarray:
    """
    Reads raw image bytes and converts them to a NumPy array.
    
    :param data: Raw image bytes.
    :return: Image as a NumPy array.
    """
    image = np.array(Image.open(BytesIO(data)))
    return image

@app.post('/predict')
async def predict(file: UploadFile = File(...)):
    """
    Accepts an uploaded image file, sends it to the ML model for prediction, 
    and returns the predicted class and confidence score.
    
    :param file: Uploaded image file.
    :return: Predicted class and confidence.
    """
    try:
        # Read the uploaded file and convert it to a NumPy array
        image = read_file_as_image(await file.read())

        # Prepare the image for batch processing
        img_batch = np.expand_dims(image, axis=0)

        # Format data as JSON for the model API
        json_data = {
            'instances': img_batch.tolist()
        }

        # Send the image to the ML model endpoint
        response = requests.post(MODEL_ENDPOINT, json=json_data)
        response.raise_for_status()  # Raise an error for failed requests

        # Parse the response and extract predictions
        predictions = np.array(response.json()['predictions'][0])
        predicted_class = CLASS_NAMES[np.argmax(predictions)]  # Get the class with the highest score
        confidence = np.max(predictions)  # Get the highest confidence score

        return {
            'class': predicted_class,
            'confidence': float(confidence)
        }
    except Exception as e:
        # Handle errors and return a meaningful response
        return {'error': str(e)}

# Entry point for running the app
if __name__ == '__main__':
    uvicorn.run(app, host='localhost', port=3000)