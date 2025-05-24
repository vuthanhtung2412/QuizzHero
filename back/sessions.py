import random
import base64
import mistral_ocr
from typing import TypedDict, Optional
from dataclasses import dataclass
from quiz_generator import QuizGenerator

class Question(TypedDict):
    question: str
    right_answer: str

class AnsweredQuestion(TypedDict):
    question: str
    right_answer: str
    user_answer: str
    feedback: str

class Session(object):
    generator: QuizGenerator
    id: int
    base64_docs: list[str]
    decoded_docs: list[str]
    concatenated_docs: str
    questions_to_ask: list[Question]
    answers_with_feedbacks: list[AnsweredQuestion]

    def __init__(self, generator: QuizGenerator):
        self.generator = QuizGenerator
        self.id = random.randint(0, 1000000000)
        self.base64_docs = []
        self.decoded_docs = []

    def add_doc(self, base64_doc: str):
        """Add a single base64 encoded document to the session"""
        self.base64_docs.append(base64_doc)
        # Decode the base64 document
        decoded_doc = mistral_ocr.process_image_to_text(base64_doc)
        self.decoded_docs.append(decoded_doc)

    def add_docs(self, base64_docs: list[str]):
        """Add multiple base64 encoded documents to the session"""
        self.base64_docs.extend(base64_docs)
        for base64_doc in base64_docs:
            decoded_doc = mistral_ocr.process_image_to_text(base64_doc)
            self.decoded_docs.append(decoded_doc)

    def generate_next_question(self) -> str:
        if self.questions_to_ask:
            return self.questions_to_ask[0]

        if not self.concatenated_docs:
            self.concatenated_docs = ""
            for (i, doc) in enumerate(self.decoded_docs):
                self.concatenated_docs + f"""
Page {i+1}:
{doc}

"""
        questions_answers = self.generator.generate_questions(self.concatenated_docs, 5)
        for question, answer in questions_answers:
            typedQuestion: Question = {
                question: question,
                answer: answer
            }
            self.questions_to_ask.append(typedQuestion)

        return self.questions_to_ask[0]["question"]

    def generate_feedback(self, user_answer):
        current_question = self.questions_to_ask[0]
        feedback = self.generator.generate_feedback(self.concatenated_docs, current_question["question"], current_question["right_answer"], user_answer)
        answered_question: AnsweredQuestion = {
            "feedback": feedback,
            "question": current_question["question"],
            "right_answer": current_question["right_answer"],
            "user_answer": user_answer
        }
        self.answers_with_feedbacks.append(answered_question)
        self.questions_to_ask.pop(0)
        return answered_question["feedback"]
