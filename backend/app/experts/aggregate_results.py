import os
from openai import OpenAI
import re
from dotenv import load_dotenv
import json

class AggregateResults:
    def __init__(self):
        load_dotenv('.env.local')
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables")

        self.client = OpenAI(api_key=api_key)
    
    def aggregate_experts(self, openai_result, gemini_result, custom_model_result):
        """
        Combine the results from multiple experts, weighing the ML expert with less confidence
        """
        try:
            prompt = f"""
You are an expert car identification system. You've received identification results from three AI experts:

1. OpenAI Expert (High confidence, strong generalist):
{json.dumps(openai_result, indent=2)}

2. Gemini Expert (High confidence, good with visual details):
{json.dumps(gemini_result, indent=2)}

3. Custom ML Model (Lower confidence, specialized in logos):
{json.dumps(custom_model_result, indent=2)}

Analyze these results and provide a final determination. 
- Give more weight to OpenAI and Gemini experts, as they tend to be more accurate.
- The custom ML model should be considered but weighted less in your decision.
- If there's agreement between OpenAI and Gemini, that should generally be your answer.
- If there's disagreement, use your judgment based on the confidence levels and details provided.

Return a JSON object with these keys:
- make: the final determination of the car's manufacturer
- model: the final determination of the car model
- year: the estimated year or generation
- confidence: your overall confidence (high, medium, low)
- details: a brief explanation of your reasoning, mentioning which experts agreed

Respond ONLY with valid JSON. No markdown, no text outside of JSON.
"""

            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=400
            )

            raw = response.choices[0].message.content
            cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw.strip(), flags=re.IGNORECASE)

            try:
                aggregated_result = json.loads(cleaned)
                # Add the original expert results for reference
                aggregated_result["expert_results"] = {
                    "openai": openai_result,
                    "gemini": gemini_result,
                    "custom_model": custom_model_result
                }
                return aggregated_result
            except json.JSONDecodeError:
                return {
                    "make": "Aggregation Error",
                    "model": "Unknown",
                    "year": "Unknown",
                    "confidence": "low",
                    "details": "Failed to parse aggregation result",
                    "raw_response": raw,
                    "expert_results": {
                        "openai": openai_result,
                        "gemini": gemini_result,
                        "custom_model": custom_model_result
                    }
                }

        except Exception as e:
            return {
                "make": "Error",
                "model": "Error",
                "year": "Unknown",
                "confidence": "none",
                "error": str(e),
                "expert_results": {
                    "openai": openai_result,
                    "gemini": gemini_result,
                    "custom_model": custom_model_result
                }
            }
    
   