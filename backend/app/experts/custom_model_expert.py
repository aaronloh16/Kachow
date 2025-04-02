import os
import numpy as np
import tensorflow as tf
import requests
from io import BytesIO
from tensorflow.keras.models import load_model
from tensorflow.keras.utils import img_to_array, load_img

class CustomModelHandler:
    def __init__(self):
        # Make sure paths are correct relative to this script
        base_dir = os.path.dirname(__file__)
        model_path = os.path.join(base_dir, 'car_logo_identifier_model.h5')
        classes_path = os.path.join(base_dir, 'car_classes.txt')

        self.model = load_model(model_path)
        self.classes = self.load_classes(classes_path)

    def load_classes(self, filepath):
        with open(filepath, 'r') as f:
            return [line.strip() for line in f.readlines()]
    
    def identify_car(self, image_url: str):
        try:
            # Download image
            response = requests.get(image_url)
            response.raise_for_status()

            # Preprocess
            img = load_img(BytesIO(response.content), target_size=(224, 224))
            img_array = img_to_array(img)
            img_array = np.expand_dims(img_array, axis=0)

            # Predict
            predictions = self.model.predict(img_array)
            score = tf.nn.softmax(predictions[0])

            predicted_class = self.classes[np.argmax(score)]
            confidence = 100 * np.max(score)

            return {
                "make": predicted_class,
                "model": "Unknown", 
                "year": "Unknown",
                "confidence": f"{confidence:.2f}%",
                "details": f"Predicted brand based on logo with {confidence:.2f}% confidence."
            }

        except Exception as e:
            return {
                "make": "Error",
                "model": "Error",
                "year": "Unknown",
                "confidence": "none",
                "error": str(e)
            }