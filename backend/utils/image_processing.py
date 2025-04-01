from PIL import Image

def process_image(image_file):
    """
    Process the uploaded image file.
    Returns a processed image that can be used by the AI models.
    
    This is a minimal implementation that will be expanded later.
    """
    # Read the image
    image = Image.open(image_file)
    
    # Convert to RGB if necessary
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    return image 