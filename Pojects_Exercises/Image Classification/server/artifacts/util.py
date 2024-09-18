import joblib
import json
import numpy as np
import base64
import cv2
from wavelet import w2d


__class_name_to_number = {}
__class_number_to_name = {}

__model = None



def classify_image(image_base64_data, file_path = None):
    images = get_cropped_image_if_2_eyes(file_path, image_base64_data)
    
    result = []
    
    for image in images:
        scalled_raw_image = cv2.resize(image, (32, 32))
        image_haar = w2d(image, 'db1', 5)
        scalled_image_haar = cv2.resize(image_haar, (32, 32))
        combined_image = np.vstack((scalled_raw_image.reshape(32 * 32 * 3, 1), scalled_image_haar.reshape(32 * 32, 1)))

        len_image_array = ((32 * 32 * 3) + 32 * 32)
        
        final = combined_image.reshape(1, len_image_array).astype(float)
        
        result.append({
            'Prediction': class_number_to_name(__model.predict(final)[0]),
            'classification_probability': np.round(__model.predict_proba(final) * 100, 2).tolist()[0],
            'classification_dictionary': __class_name_to_number
            })        
        
    return result
        

def load_saved_artifacts():
    print('loading saved artifacts...started')
    global __class_name_to_number
    global __class_number_to_name
    
    with open(r'C:\Users\Banji\image_classification\server\artifacts\image_classification_dictionary.json', 'r') as f:
        __class_name_to_number = json.load(f)
        __class_number_to_name = {v:k for k, v in __class_name_to_number.items()}
        
        global __model
        if __model is None:
            with open(r'C:\Users\Banji\image_classification\server\artifacts\image_classification_model.pkl', 'rb') as f:
                __model = joblib.load(f)
        print('loading saved artifacts...done')


def class_number_to_name(class_num):
    return __class_number_to_name[class_num]


def get_cv2_image_from_base64_string(b64str):
    encoded_data = b64str.split(',')[1]
    nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return image


def get_cropped_image_if_2_eyes(image_path, image_base64_data):
    face_cascade = cv2.CascadeClassifier(r'C:\Users\Banji\image_classification\model\opencv\haarcascades\haarcascade_frontalface_default.xml')
    # To detect the eyes
    eye_cascade = cv2.CascadeClassifier(r'C:\Users\Banji\image_classification\model\opencv\haarcascades\haarcascade_eye.xml')

    if image_path:
        image = cv2.imread(image_path)
    else:
        image = get_cv2_image_from_base64_string(image_base64_data)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    # To detect multiple faces
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)
    
    cropped_faces = []
    for x,y,w,h in faces:
        roi_gray = gray[y:y+h, x:x+w]
        roi_color = image[y:y+h, x:x+w]
        eyes = eye_cascade.detectMultiScale(roi_gray)
        if len(eyes) >= 2:
            cropped_faces.append(roi_color)
    return cropped_faces
        


def get_64_test_image_messi():
    with open('messi_base64.txt') as f:
        return f.read()


if __name__ == '__main__':
    load_saved_artifacts()
    print('messi', classify_image(get_64_test_image_messi(), None))
    print('messi', classify_image(None, r'C:\Users\Banji\image_classification\server\artifacts\test_image\avatar-leomessi.png'))
    print('maria', classify_image(None, r'C:\Users\Banji\image_classification\server\artifacts\test_image\images - 2024-09-11T063340.437.jpg'))
    print('maria', classify_image(None, r'C:\Users\Banji\image_classification\server\artifacts\test_image\images - 2024-09-11T063605.998.jpg'))
    print('putin', classify_image(None, r'C:\Users\Banji\image_classification\server\artifacts\test_image\images - 2024-09-11T064728.546.jpg'))
    print('putin', classify_image(None, r'C:\Users\Banji\image_classification\server\artifacts\test_image\images - 2024-09-11T064840.401.jpg'))
    print('kamala', classify_image(None, r'C:\Users\Banji\image_classification\server\artifacts\test_image\images - 2024-09-11T075425.090.jpg'))
    print('kamala', classify_image(None, r'C:\Users\Banji\image_classification\server\artifacts\test_image\images - 2024-09-11T075719.220.jpg'))
    print('beyonce', classify_image(None, r'C:\Users\Banji\image_classification\server\artifacts\test_image\images - 2024-09-13T102930.994.jpg'))
    print('beyonce', classify_image(None, r'C:\Users\Banji\image_classification\server\artifacts\test_image\images - 2024-09-13T102923.246.jpg'))