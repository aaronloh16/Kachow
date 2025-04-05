import os
import re
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
            prompt = """
            You are a car recognition expert in a car identification app.
            Analyze this image and provide a structured JSON response.

            Return a JSON object with the following keys ONLY:
            - make: the car's manufacturer
            - model: the specific car model
            - year: estimated year or generation
            - confidence: high, medium, or low
            - details: a short sentence explaining your reasoning

            Respond ONLY in this JSON format. No explanation outside of it.
            """
            
            response = self.model.generate_content([prompt, {'mime_type': 'image/jpeg', 'url': image_url}])
            
            # Extract the text from the response
            response_text = response.text
            
            # Simple regex to extract JSON - handles both code blocks and plain JSON
            json_match = re.search(r'```(?:json)?\s*({.*?})\s*```|({.*})', response_text, re.DOTALL)
            
            if json_match:
                json_str = json_match.group(1) or json_match.group(2)
            else:
                json_str = response_text.strip()

            try:
                return json.loads(json_str)
            except json.JSONDecodeError:
                return {"make": "Unknown", "model": "Unknown", "year": "Unknown", 
                        "confidence": "low", "details": "Failed to parse response",
                        "raw_text": response_text}

        except Exception as e:
            return {"make": "Error", "model": "Error", "year": "Unknown", 
                    "confidence": "none", "error": str(e)}
            
    def identify_car_with_context(self, image_url, context):
        """Car identification with context from other experts (blackboard approach)"""
        try:
            prompt = f"""
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

            Respond ONLY in this JSON format. No explanation outside of it.
            """
            
            response = self.model.generate_content([prompt, {'mime_type': 'image/jpeg', 'url': image_url}])
            
            # Extract the text from the response
            response_text = response.text
            
            # Simple regex to extract JSON - handles both code blocks and plain JSON
            json_match = re.search(r'```(?:json)?\s*({.*?})\s*```|({.*})', response_text, re.DOTALL)
            
            if json_match:
                json_str = json_match.group(1) or json_match.group(2)
            else:
                json_str = response_text.strip()

            try:
                return json.loads(json_str)
            except json.JSONDecodeError:
                return {"make": "Unknown", "model": "Unknown", "year": "Unknown", 
                        "confidence": "low", "details": "Failed to parse response",
                        "raw_text": response_text}

        except Exception as e:
            return {"make": "Error", "model": "Error", "year": "Unknown", 
                    "confidence": "none", "error": str(e)}
