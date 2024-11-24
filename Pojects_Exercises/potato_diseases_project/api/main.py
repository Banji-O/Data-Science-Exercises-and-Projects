from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import uvicorn  # To run the FastAPI app
import numpy as np
from io import BytesIO
from PIL import Image
import tensorflow as tf  # For TensorFlow operations

# Initialize the FastAPI app
app = FastAPI()

# Configure CORS to allow requests from specified origins
origins = [
    'http://localhost',
    'http://localhost:3000',
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allowed origins for cross-origin requests
    allow_credentials=True,  # Allow cookies and credentials
    allow_methods=['*'],  # Allow all HTTP methods
    allow_headers=['*'],  # Allow all headers
)

# Load the pre-trained TensorFlow model
MODEL = tf.keras.models.load_model('../saved_models/1.keras')

# Define the class names for predictions
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
    return np.array(Image.open(BytesIO(data)))

@app.post('/predict')
async def predict(file: UploadFile = File(...)):
    """
    Accepts an uploaded image file, processes it, 
    and returns the predicted class and confidence score.
    
    :param file: Uploaded image file.
    :return: Predicted class and confidence.
    """
    try:
        # Read the uploaded image file and convert it to a NumPy array
        image = read_file_as_image(await file.read())

        # Expand dimensions to create a batch of size 1
        img_batch = np.expand_dims(image, axis=0)

        # Make predictions using the loaded model
        predictions = MODEL.predict(img_batch)

        # Get the predicted class and confidence score
        predicted_class = CLASS_NAMES[np.argmax(predictions[0])]
        confidence = np.max(predictions[0])

        return {
            'class': predicted_class,
            'confidence': float(confidence)
        }
    except Exception as e:
        # Handle errors and return a meaningful response
        return {'error': str(e)}

# Entry point to run the app
if __name__ == '__main__':
    uvicorn.run(app, host='localhost', port=3000)
