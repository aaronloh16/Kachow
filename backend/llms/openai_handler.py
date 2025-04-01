from dotenv import load_dotenv
from openai import OpenAI
import os
from pathlib import Path

load_dotenv()

import os
import base64
from flask import jsonify
from openai import OpenAI

def encode_image(image_path):
    """Convert an image file to a base64-encoded string."""
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")

def gpt4o_identification(image_path):
    """Identify a car's make and model using GPT-4o."""
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    encoded_image = encode_image(image_path)

    message_content = [
        {"type": "text", "text": (
            "Please identify the car in this image. Provide the make and model in JSON format as follows:\n"
            "{\n"
            '    "make": "Car manufacturer",\n'
            '    "model": "Car model"\n'
            "}"
        )},
        {"type": "image_url", "image_url": {"url": f"data:image/jpg;base64,{encoded_image}"}}
    ]

    response = client.chat.completions.create(
        model="gpt-4o",
        max_tokens=300,
        messages=[{"role": "user", "content": message_content}]
    )

    return jsonify(response.choices[0].message.content)

if __name__ == "__main__":
    # Example usage
    image_path = Path("/mnt/c/swe3/3A04/carpics/FordVan.jpg")
    result = gpt4o_identification(image_path)
    print(result)

