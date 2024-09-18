import numpy as np
import pywt
import cv2

def w2d(img, mode='haar', level=1):
    # Convert to grayscale and normalize
    imArray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY) / 255.0
    
    # Perform wavelet decomposition
    coeffs = pywt.wavedec2(imArray, mode, level=level)
    
    # Zero out approximation coefficients
    coeffs[0] *= 0
    
    # Reconstruct the image and scale back to 255
    imArray_H = pywt.waverec2(coeffs, mode) * 255
    return np.uint8(imArray_H) 

