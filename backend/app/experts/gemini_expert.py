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

    def identify_car(self, image_url, context=None):
        """
        Identify a car from an image URL, with optional context from other experts
        """
        if context:
            return self.identify_car_with_context(image_url, context)
        else:
            return self.identify_car_initial(image_url)
        
    def identify_car_initial(self, image_url):
        """Initial car identification without context from other experts"""
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
            
    def identify_car_with_context(self, image_url, context):
        """Car identification with context from other experts (blackboard approach)"""
        try:
            # Download image as bytes
            response = requests.get(image_url)
            image_bytes = response.content

            prompt_text = f"""
            You are an expert car identifier in a blackboard AI system.
            Other AI experts have already analyzed this image and provided their opinions.
            Here's what they identified:

            {json.dumps(context, indent=2)}

            Now I want you to analyze the image again, considering this information.
            You should form your own expert opinion, but take into account what others have observed.

            Return a JSON object with the following keys ONLY:
            - make: the car's manufacturer
            - model: the specific car model
            - year: estimated year or generation
            - confidence: high, medium, or low
            - details: a short sentence explaining your reasoning, and mention if/why you disagree with others

            Respond ONLY in this JSON format with no additional text.
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
