# app/routes/identify.py
from flask import Blueprint, request, jsonify
from app.experts.openai_expert import OpenAIHandler
from app.experts.gemini_expert import GeminiHandler
from app.experts.custom_model_expert import CustomModelHandler
from app.experts.aggregate_results import AggregateResults

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
        aggregator = AggregateResults()

        gemini_result = gemini_handler.identify_car(image_url)
        openai_result = openai_handler.identify_car(image_url)
        custom_model_result = custom_model_handler.identify_car(image_url)

        print("Gemini Result:", gemini_result)
        print("OpenAI Result:", openai_result)
        print("Custom Model Result:", custom_model_result)

        # Aggregate the expert results
        aggregated_result = aggregator.aggregate_experts(
            openai_result, 
            gemini_result, 
            custom_model_result
        )

        print("Aggregated results", aggregated_result)

        return jsonify({
            "custom_model": custom_model_result,
            "openai": openai_result,
            "gemini": gemini_result,
            "aggregated": aggregated_result
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@identify_bp.route('/test', methods=['GET'])
def test():
    print("Start /test endpoint")
    return jsonify({"message": "Test endpoint reached successfully!"}), 200
