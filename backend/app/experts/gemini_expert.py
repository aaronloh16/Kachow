import os
import json
import requests
from dotenv import load_dotenv
from google import generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold

class GeminiHandler:
    def __init__(self):
        load_dotenv('.env.local')

        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")

        genai.configure(api_key=api_key)

        self.model = genai.GenerativeModel(
            model_name="gemini-2.0-flash-lite",
            safety_settings={
                HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
            }
        )

    def identify_car(self, image_url: str) -> dict:
        try:
            # Download image as bytes
            response = requests.get(image_url)
            image_bytes = response.content

            prompt_text = """
            Examine this car image and identify:
            1. The make (manufacturer) of the car
            2. The specific model
            3. The approximate year or generation
            4. Your confidence level in this identification (high, medium, or low)

            Focus mainly on the grills, headlights, and overall body shape.

            Respond in JSON format with the following structure:
            {
                "make": "Make of car",
                "model": "Model of car",
                "year": "Year or generation",
                "confidence": "high/medium/low",
                "details": "Brief explanation of your identification"
            }
            """

            # Pass image as inline bytes
            result = self.model.generate_content(
                contents=[
                    {
                        "role": "user",
                        "parts": [
                            {"text": prompt_text},
                            {
                                "inline_data": {
                                    "mime_type": "image/jpeg",
                                    "data": image_bytes
                                }
                            }
                        ]
                    }
                ],
                generation_config={
                    "temperature": 0.2,
                    "top_p": 0.95,
                    "max_output_tokens": 1024,
                }
            )

            raw = result.text
            json_start = raw.find('{')
            json_end = raw.rfind('}') + 1

            if json_start >= 0 and json_end > json_start:
                return json.loads(raw[json_start:json_end])
            else:
                return {
                    "make": "Unknown",
                    "model": "Unknown",
                    "year": "Unknown",
                    "confidence": "low",
                    "details": raw,
                    "note": "Response was not in expected JSON format"
                }

        except Exception as e:
            return {
                "make": "Error",
                "model": "Error",
                "year": "Unknown",
                "confidence": "none",
                "error": str(e)
            }
