import os
import base64
from mistralai import Mistral
from dotenv import load_dotenv
from concurrent.futures import ThreadPoolExecutor, as_completed
load_dotenv()

def process_image_to_text(base64_image: str) -> str:
    """
    Process a base64 encoded image and extract text using Mistral OCR.

    Args:
        base64_image (str): Base64 encoded image string

    Returns:
        str: Extracted text from the image
    """
    
    api_key = os.environ["MISTRAL_API_KEY"]
    client = Mistral(api_key=api_key)

    # Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
    if ',' in base64_image:
        base64_image = base64_image.split(',')[1]

    print("Processing base64 image with Mistral OCR")

    # Use the base64-encoded image in the request
    ocr_response = client.ocr.process(
        model="mistral-ocr-latest",
        document={
            "type": "image_url",
            "image_url": f"data:image/jpeg;base64,{base64_image}"
        },
        include_image_base64=True
    )

    # Extract markdown text from the OCR response
    extracted_text = ""
    if hasattr(ocr_response, 'pages'):
        for page in ocr_response.pages:
            if hasattr(page, 'markdown'):
                extracted_text += page.markdown + "\n"

    result = extracted_text.strip()
    print(f"OCR processing completed, extracted {len(result)} characters")
    return result
    
def process_multiple_images(image_paths: list[str], max_workers: int = 4) -> dict[str, str]:
    """
    Process multiple images in parallel using ThreadPoolExecutor.
    
    Args:
        image_paths (list[str]): List of paths to image files
        max_workers (int): Maximum number of worker threads (default: 4)
        
    Returns:
        dict[str, str]: Dictionary mapping image paths to their extracted text
    """
    results = {}
    
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        future_to_path = {
            executor.submit(process_image_to_text, image_path): image_path 
            for image_path in image_paths
        }
        
        # Process completed futures as they come in
        for future in as_completed(future_to_path):
            image_path = future_to_path[future]
            try:
                extracted_text = future.result()
                results[image_path] = extracted_text
            except Exception as e:
                print(f"Error processing {image_path}: {str(e)}")
                results[image_path] = ""
    return results 

def process_image_file_to_text(image_path: str) -> str:
    """
    Process an image file and extract text using Mistral OCR.

    Args:
        image_path (str): Path to the image file

    Returns:
        str: Extracted text from the image
    """
    # Read the image file and encode it in base64
    with open(image_path, "rb") as image_file:
        encoded_image = base64.b64encode(image_file.read()).decode('utf-8')
        print("Image file encoded successfully")

    # Use the existing base64 processing function
    return process_image_to_text(encoded_image)
