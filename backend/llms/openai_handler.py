import os
from dotenv import load_dotenv

#look at body shape of car
class OpenAIHandler:
    def __init__(self):
        # Load environment variables
        load_dotenv('.env.local')
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables")
        # OpenAI client will be initialized here later
        
    def identify_car(self, image):
        """
        Identify a car using OpenAI's vision capabilities
        This is a placeholder that will be implemented later
        """
        return "OpenAI identification not implemented yet" 