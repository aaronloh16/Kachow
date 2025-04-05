# app/routes/identify.py
from flask import Blueprint, request, jsonify
from app.experts.openai_expert import OpenAIHandler
from app.experts.gemini_expert import GeminiHandler
from app.experts.custom_model_expert import CustomModelHandler

identify_bp = Blueprint('identify', __name__)

@identify_bp.route('/identify', methods=['POST', 'OPTIONS'])
def identify_car():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    image_url = data.get("image_url")

    if not image_url:
        return jsonify({"error": "No image_url provided"}), 400

    try:
        gemini_handler = GeminiHandler()
        openai_handler = OpenAIHandler()
        custom_model_handler = CustomModelHandler()

        gemini_result = gemini_handler.identify_car(image_url)
        #openai_result = openai_handler.identify_car(image_url)
        custom_model_result = custom_model_handler.identify_car(image_url)

        print("Gemini Result:", gemini_result)
        #print("OpenAI Result:", openai_result)
        print("Custom Model Result:", custom_model_result)

        # TODO: Aggregate results here and return
        # sample data looks like : 
        # {"custom_model": {"confidence": "12.45%", "details": "Predicted brand based on logo with 12.45% confidence.", "make": "Ford", "model": "Unknown", "year": "Unknown"},
        # "gemini": {"confidence": "high", "details": "The grille shape, headlight design, and overall body shape are characteristic of the second-generation Ford Transit Custom. The aftermarket modifications, such as the front bumper and wheels, are common for this model.", "make": "Ford", "model": "Transit Custom", "year": "2018-2023 (Second Generation)"}, 
        # "openai": {"confidence": "high", "details": "The front grille and headlights are characteristic of the Ford Transit Custom model updated around 2018.", "make": "Ford", "model": "Transit Custom", "year": "2018"}
        # }   

        return jsonify({
            "custom_model": custom_model_result,
            #"openai": openai_result,
            "gemini": gemini_result,
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@identify_bp.route('/test', methods=['GET'])
def test():
    print("Start /test endpoint")
    return jsonify({"message": "Test endpoint reached successfully!"}), 200
