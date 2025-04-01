# Car Identification Backend

A Flask backend for car identification using multiple AI experts.

## Setup

1. Create a virtual environment:

   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:

   ```
   pip install -r requirements.txt
   ```

3. Create a `.env.local` file with your API keys (as needed):
   ```
   OPENAI_API_KEY=your_openai_key_here
   GEMINI_API_KEY=your_gemini_key_here
   ```

## Running the Server

Start the Flask development server:

```
python app.py
```

The server will run at http://127.0.0.1:5000/

## Endpoints

- `GET /health` - Health check endpoint
- `POST /identify` - Car identification endpoint (accepts an image file)

## Structure

- `app.py` - Main Flask application
- `llms/` - AI model handlers
  - `openai_handler.py` - OpenAI integration (to be implemented)
  - `gemini_handler.py` - Google Gemini integration (to be implemented)
  - `custom_model_handler.py` - Custom ML model integration (to be implemented)
- `utils/` - Utility functions
  - `image_processing.py` - Image processing utilities
