import os
import base64
from mistralai import Mistral
from dotenv import load_dotenv
import quiz_generator
load_dotenv()

def process_image_to_text(image_path: str) -> str:
    """
    Process an image file and extract text using Mistral OCR.
    
    Args:
        image_path (str): Path to the image file
        
    Returns:
        str: Extracted text from the image
    """
    api_key = os.environ["MISTRAL_API_KEY"]
    client = Mistral(api_key=api_key)
    
    # Read the image file and encode it in base64
    with open(image_path, "rb") as image_file:
        encoded_image = base64.b64encode(image_file.read()).decode('utf-8')
        print("Image encoded successfully")

    # Use the base64-encoded image in the request
    ocr_response = client.ocr.process(
        model="mistral-ocr-latest",
        document={
            "type": "image_url",
            "image_url": f"data:image/webp;base64,{encoded_image}"
        },
        include_image_base64=True
    )
    
    # Extract markdown text from the OCR response
    extracted_text = ""
    if hasattr(ocr_response, 'pages'):
        for page in ocr_response.pages:
            if hasattr(page, 'markdown'):
                extracted_text += page.markdown + "\n"
    