from flask import Flask, request, jsonify
from dotenv import load_dotenv
import os
from llms.gemini_handler import GeminiHandler
from utils.image_processing import process_image

# Load environment variables from .env.local
load_dotenv('.env.local')

app = Flask(__name__)

# Initialize AI handlers
gemini_handler = GeminiHandler()

@app.route('/health', methods=['GET'])
def health_check():
    """
    Simple health check endpoint
    """
    return jsonify({'status': 'ok'})

@app.route('/identify', methods=['POST'])
def identify_car():
    """
    Endpoint to identify a car based on an image
    To be implemented with multiple AI experts
    """
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    image_file = request.files['image']
    if image_file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        # Process the image
        processed_image = process_image(image_file)
        
        # Get predictions from Gemini (other models to be implemented later)
        gemini_result = gemini_handler.identify_car(processed_image)
        
        return jsonify({
            'message': 'Car identification using Gemini model',
            'experts': {
                'openai': 'Not implemented',
                'gemini': gemini_result,
                'custom_model': 'Not implemented'
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)