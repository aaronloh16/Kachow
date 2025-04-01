from flask import Flask, request, jsonify
from dotenv import load_dotenv
import os

# Load environment variables from .env.local
load_dotenv('.env.local')

app = Flask(__name__)

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
        # This will be implemented later with different AI experts
        return jsonify({
            'message': 'Car identification is not yet implemented',
            'experts': {
                'openai': 'Not implemented',
                'gemini': 'Not implemented',
                'custom_model': 'Not implemented'
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)