import random
import base64

class Session(object):
    id: int
    base64Docs: list[str]
    decodedDocs: list[str]

    def __init__(self):
        self.id = random.randint(0, 1000000000)
        self.base64Docs = []
        self.decodedDocs = []

    def add_doc(self, base64_doc: str):
        """Add a single base64 encoded document to the session"""
        self.base64Docs.append(base64_doc)
        try:
            # Decode the base64 document
            decoded_doc = base64.b64decode(base64_doc).decode('utf-8')
            self.decodedDocs.append(decoded_doc)
            print(f"Successfully added and decoded document on session {self.id}")
        except Exception as e:
            print(f"Error decoding document: {str(e)}")
            print(f"Successfully added document on session {self.id} (decoding failed)")

    def add_docs(self, base64_docs: list[str]):
        """Add multiple base64 encoded documents to the session"""
        self.base64Docs.extend(base64_docs)
        try:
            # Decode all base64 documents
            decoded_docs = [base64.b64decode(doc).decode('utf-8') for doc in base64_docs]
            self.decodedDocs.extend(decoded_docs)
            print(f"Successfully added and decoded documents on session {self.id}")
        except Exception as e:
            print(f"Error decoding documents: {str(e)}")
            print(f"Successfully added documents on session {self.id} (decoding failed)")