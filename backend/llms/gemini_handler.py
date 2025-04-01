import os
import base64
import json
from io import BytesIO
from dotenv import load_dotenv
from google import generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold

class GeminiHandler:
    def __init__(self):
        # Load environment variables
        load_dotenv('.env.local')
        
        # Use API key instead of Vertex AI
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        # Configure with API key
        genai.configure(api_key=api_key)
        
        # Use the flash-lite model as it's the cheapest
        self.model_name = "gemini-2.0-flash-lite"
        self.model = genai.GenerativeModel(
            self.model_name,
            # Set safety settings to be less restrictive
            safety_settings={
                HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
            }
        )
        
    def identify_car(self, image):
        """
        Identify a car using Google's Gemini model
        
        Args:
            image: PIL Image object of the car
            
        Returns:
            dict: Identification results with make, model, year, and confidence
        """
        try:
            # Convert PIL Image to bytes
            img_byte_array = BytesIO()
            image.save(img_byte_array, format='JPEG')
            img_byte_array.seek(0)
            
            # Create prompt with more detailed instructions
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
            
            # Generate content with the image and prompt
            response = self.model.generate_content(
                [prompt_text, image],
                generation_config={
                    "temperature": 0.2,
                    "top_p": 0.95,
                    "max_output_tokens": 1024,
                }
            )
            
            # Process and format the response
            try:
                # Try to extract JSON from the response text
                response_text = response.text
                # Find JSON content if it's embedded in other text
                json_start = response_text.find('{')
                json_end = response_text.rfind('}') + 1
                
                if json_start >= 0 and json_end > json_start:
                    json_str = response_text[json_start:json_end]
                    result = json.loads(json_str)
                    return result
                else:
                    # If no JSON found, return the full text in a structured format
                    return {
                        "make": "Unknown",
                        "model": "Unknown",
                        "year": "Unknown",
                        "confidence": "low",
                        "details": response_text,
                        "note": "Response was not in expected JSON format"
                    }
            except json.JSONDecodeError:
                # If JSON parsing fails, return the raw text in a structured format
                return {
                    "make": "Unknown",
                    "model": "Unknown",
                    "year": "Unknown",
                    "confidence": "low",
                    "details": response.text,
                    "note": "Response was not in expected JSON format"
                }
            
        except Exception as e:
            error_message = str(e)
            print(f"Error in Gemini identification: {error_message}")
            return {
                "make": "Error",
                "model": "Error",
                "year": "Unknown",
                "confidence": "none",
                "error": error_message
            } 