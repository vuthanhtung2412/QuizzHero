import random
import base64
import mistral_ocr

class Session(object):
    id: int
    base64Docs: list[str]
    decodedDocs: list[str]
    questions_answers: list[tuple[str, str]]
    feedbacks: list[str]
    questions_to_ask: list[str]

    def __init__(self):
        self.id = random.randint(0, 1000000000)
        self.base64Docs = []
        self.decodedDocs = []

    def add_doc(self, base64_doc: str):
        """Add a single base64 encoded document to the session"""
        self.base64Docs.append(base64_doc)
        # Decode the base64 document
        decoded_doc = mistral_ocr.process_image_to_text(base64_doc)
        self.decodedDocs.append(decoded_doc)

    def add_docs(self, base64_docs: list[str]):
        """Add multiple base64 encoded documents to the session"""
        self.base64Docs.extend(base64_docs)
        for base64_doc in base64_docs:
            decoded_doc = mistral_ocr.process_image_to_text(base64_doc)
            self.decodedDocs.append(decoded_doc)
