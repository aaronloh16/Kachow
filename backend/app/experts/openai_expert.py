import os
from openai import OpenAI
import re
from dotenv import load_dotenv
import json

class OpenAIHandler:
    def __init__(self):
        load_dotenv('.env.local')
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables")

        self.client = OpenAI(api_key=api_key)
    
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
            response = self.client.chat.completions.create(model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": (
                                "You are a car recognition expert in a car identification app. "
                                "Analyze this image and provide a structured JSON response.\n\n"
                                "Return a JSON object with the following keys ONLY:\n"
                                "- make: the car's manufacturer\n"
                                "- model: the specific car model\n"
                                "- year: estimated year or generation\n"
                                "- confidence: high, medium, or low\n"
                                "- details: a short sentence explaining your reasoning\n\n"
                                "Respond ONLY in this JSON format. No explanation outside of it."
                            )
                        },
                        {"type": "image_url", "image_url": {"url": image_url}}
                    ]
                }
            ],
            max_tokens=400)

            raw = response.choices[0].message.content
            
            cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw.strip(), flags=re.IGNORECASE)

            try:
                return json.loads(cleaned)
            except json.JSONDecodeError:
                return {"raw_text": raw, "note": "Failed to parse JSON"}

        except Exception as e:
            return {"make": "Error", "model": "Error", "year": "Unknown", "confidence": "none", "error": str(e)}
            
    def identify_car_with_context(self, image_url, context):
        """Car identification with context from other experts (blackboard approach)"""
        try:
            response = self.client.chat.completions.create(model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": (
                                "You are an expert car identifier in a blackboard AI system. "
                                "Other AI experts have already analyzed this image and provided their opinions. "
                                f"Here's what they identified:\n\n{json.dumps(context, indent=2)}\n\n"
                                "Now I want you to analyze the image again, considering this information. "
                                "You should form your own expert opinion, but take into account what others have observed.\n\n"
                                "Return a JSON object with the following keys ONLY:\n"
                                "- make: the car's manufacturer\n"
                                "- model: the specific car model\n"
                                "- year: estimated year or generation\n"
                                "- confidence: high, medium, or low\n"
                                "- details: a short sentence explaining your reasoning, and mention if/why you disagree with others\n\n"
                                "Respond ONLY in this JSON format. No explanation outside of it."
                            )
                        },
                        {"type": "image_url", "image_url": {"url": image_url}}
                    ]
                }
            ],
            max_tokens=400)

            raw = response.choices[0].message.content
            
            cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw.strip(), flags=re.IGNORECASE)

            try:
                return json.loads(cleaned)
            except json.JSONDecodeError:
                return {"raw_text": raw, "note": "Failed to parse JSON"}

        except Exception as e:
            return {"make": "Error", "model": "Error", "year": "Unknown", "confidence": "none", "error": str(e)}
