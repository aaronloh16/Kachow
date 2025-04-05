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
        # Initialize experts and aggregator
        gemini_handler = GeminiHandler()
        openai_handler = OpenAIHandler()
        custom_model_handler = CustomModelHandler()
        aggregator = AggregateResults()

        # First round - get initial opinions
        print("Starting first round of identification...")
        gemini_result = gemini_handler.identify_car(image_url)
        openai_result = openai_handler.identify_car(image_url)
        custom_model_result = custom_model_handler.identify_car(image_url)

        print("Gemini Result:", gemini_result)
        print("OpenAI Result:", openai_result)
        print("Custom Model Result:", custom_model_result)

        # Aggregate the expert results
        first_round_aggregated = aggregator.aggregate_experts(
            openai_result, 
            gemini_result, 
            custom_model_result
        )
        
        print("First round aggregated results:", first_round_aggregated)
        
        # Check confidence level - if not high, do a second round with blackboard approach
        if first_round_aggregated.get("confidence", "").lower() != "high":
            print("Confidence not high enough, initiating second round with blackboard approach...")
            
            # Create context for experts - what other experts thought
            openai_context = {
                "gemini": gemini_result,
                "custom_model": custom_model_result,
                "first_aggregation": first_round_aggregated
            }
            
            gemini_context = {
                "openai": openai_result,
                "custom_model": custom_model_result,
                "first_aggregation": first_round_aggregated
            }
            
            # Second round - with context
            openai_second_result = openai_handler.identify_car(image_url, openai_context)
            gemini_second_result = gemini_handler.identify_car(image_url, gemini_context)
            
            print("OpenAI Second Round Result:", openai_second_result)
            print("Gemini Second Round Result:", gemini_second_result)
            
            # Final aggregation with second round results
            final_aggregated = aggregator.aggregate_experts(
                openai_second_result,
                gemini_second_result,
                custom_model_result  # We don't reconsult the ML model
            )
            
            print("Final aggregated results:", final_aggregated)
            
            # Return all results
            return jsonify({
                "custom_model": custom_model_result,
                "openai": {
                    "first_round": openai_result,
                    "second_round": openai_second_result
                },
                "gemini": {
                    "first_round": gemini_result,
                    "second_round": gemini_second_result
                },
                "aggregated": final_aggregated,
                "process": "blackboard_two_rounds"
            })
        else:
            # Confidence was high enough in first round
            return jsonify({
                "custom_model": custom_model_result,
                "openai": openai_result,
                "gemini": gemini_result,
                "aggregated": first_round_aggregated,
                "process": "single_round"
            })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@identify_bp.route('/test', methods=['GET'])
def test():
    print("Start /test endpoint")
    return jsonify({"message": "Test endpoint reached successfully!"}), 200
