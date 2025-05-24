import os
from typing import List, Tuple
from mistralai import Mistral
from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()

class QuestionsAnswers(BaseModel):
    questions: list[str]
    answers: list[str]


class QuizGenerator:
    def __init__(self, api_key: str):
        """Initialize the QuizGenerator with Mistral API key."""
        self.client = Mistral(api_key=api_key)

    def generate_feedback(self, markdown_text: str, question: str, right_answer: str, user_answer: str) -> str:
        pass

    def generate_quiz(self, markdown_text: str, num_questions: int = 10) -> List[Tuple[str, str]]:
        """
        Generate questions and answers from markdown text using Mistral AI.

        Args:
            markdown_text (str): The markdown text extracted from images
            num_questions (int): Number of questions to generate (default: 5)

        Returns:
            List[Tuple[str, str]]: List of (question, answer) pairs
        """
        # Create a prompt for the AI to generate questions and answers
        prompt = f"""Based on the following text, generate {num_questions} relevant questions and their answers that test understanding of the content.
        Format the output as a list of strings representing question and answer pair:
        {{
            question: [question1, question2, question3, ...]
            answers: [answer1, answer2, answer3, ...]
        }}

        Text:
        {markdown_text}

        Questions and answer pairs:"""

        # Create chat messages
        messages = [
            {"role": "system", "content": "You are a teacher assistant that generates educational questions from a student lessons."},
            {"role": "user", "content": prompt},
        ]

        try:
            # Get response from Mistral AI
            chat_response = self.client.chat.parse(
                model="mistral-large-latest",
                messages=messages,
                response_format=QuestionsAnswers,
                temperature=0.7,
                max_tokens=10000
            )

            parsed_response = chat_response.choices[0].message.parsed
            questions_list = parsed_response.questions
            answers_list = parsed_response.answers

            return questions_list[:num_questions],answers_list[:num_questions]
        except Exception as e:
            print(f"An error occurred: {e}")
            return []

def main(input_text):
    api_key = os.environ["MISTRAL_API_KEY"]
    generator = QuizGenerator(api_key)

    questions,answers = generator.generate_quiz(input_text)

    print(questions)
    print(answers)
    return questions
