import os
import numpy as np
import tensorflow as tf
import requests
from io import BytesIO
from tensorflow.keras.models import load_model
from tensorflow.keras.utils import img_to_array, load_img

class CustomModelHandler:
    def __init__(self):
        self.model = load_model('car_logo_identifier_model.h5')
        self.classes = self.load_classes('car_classes.txt')

    def load_classes(self, filepath):
        classes = []
        with open(filepath) as f:
            for line in f.readlines():
                classes.append(line.strip())
        return classes
    
    def identify_car(self, image_url: str):
        try:
            response = requests.get(image_url)

            img = load_img(BytesIO(response.content), target_size=(224, 224))
            img_array = img_to_array(img)
            img_array = np.expand_dims(img_array, axis=0)

            predictions = self.model.predict(img_array)
            score = tf.nn.softmax(predictions[0])

            predicted_class = self.classes[np.argmax(score)]
            confidence = 100 * np.max(score)

            return {
                "brand": predicted_class,
                "confidence": f"{confidence:.2f}%"
            }
        except Exception as e:
            return {"error": str(e)}