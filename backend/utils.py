import cv2
import numpy as np
from PIL import Image

def preprocess_and_segment(image: Image.Image):
    """
    Takes a PIL image (handwriting), returns list of digit crops.
    """
    # Convert to grayscale
    img = image.convert("L")
    img = np.array(img)

    # Invert: white bg, black digits
    img = 255 - img

    # Threshold
    _, thresh = cv2.threshold(img, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # Find contours (digits)
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    digits = []
    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)
        if w > 10 and h > 10:  # filter noise
            digit = thresh[y:y+h, x:x+w]
            digit = cv2.resize(digit, (28, 28))
            digit = digit.astype("float32") / 255.0
            digit = np.expand_dims(digit, axis=0)  # channel
            digits.append((x, digit))

    # Sort by x (left to right)
    digits = sorted(digits, key=lambda d: d[0])
    return [d[1] for d in digits]
