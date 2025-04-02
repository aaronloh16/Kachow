# app/routes/identify.py
from flask import Blueprint, request, jsonify
from app.experts.openai_expert import OpenAIHandler
from app.experts.gemini_expert import GeminiHandler

identify_bp = Blueprint('identify', __name__)

@identify_bp.route('/identify', methods=['POST', 'OPTIONS'])
def identify_car():
    if request.method == 'OPTIONS':
        return '', 200
    
    data = request.get_json()
    image_url = data.get("image_url")

    if not image_url:
        return jsonify({"error": "No image_url provided"}), 400

    gemini_handler = GeminiHandler()
    openai_handler = OpenAIHandler()
    
    result = gemini_handler.identify_car(image_url)
    #result = openai_handler.identify_car(image_url)
    print(result)

    #Aggregate results (to be done)
    return jsonify(result)
