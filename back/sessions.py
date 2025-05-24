import random

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
        # TODO: DECODE DOC AND ADD IT TO THE LIST OF DECODED DOCS
        print(f"Successfully added document on session {self.id}")

    def add_docs(self, base64_docs: list[str]):
        """Add multiple base64 encoded documents to the session"""
        self.base64Docs.extend(base64_docs)
        # TODO: DECODE DOCS AND ADD THEM TO THE LIST OF DECODED DOCS
        print(f"Successfully added documents on session {self.id}")
