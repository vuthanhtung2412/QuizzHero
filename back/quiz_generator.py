import os
from typing import List, Tuple
from mistralai import Mistral
from dotenv import load_dotenv

load_dotenv()

class QuizGenerator:
    def __init__(self, api_key: str):
        """Initialize the QuizGenerator with Mistral API key."""
        self.client = Mistral(api_key=api_key)

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
        Format each question and answer pair as:
        Q: [question]
        A: [answer]

        Text:
        {markdown_text}

        Questions and Answers:"""

        # Create chat messages
        messages = [
            {"role": "system", "content": "You are a helpful assistant that generates educational questions and answers from text."},
            {"role": "user", "content": prompt},
        ]

        try:
            # Get response from Mistral AI
            chat_response = self.client.chat.complete(
                model="mistral-large-latest",
                messages=messages,
                temperature=0.7,
                max_tokens=1000
            )

            # Extract questions and answers from the response
            response_text = chat_response.choices[0].message.content
            qa_pairs = []

            # Split the response into Q&A pairs
            current_question = None
            for line in response_text.split('\n'):
                line = line.strip()
                if line.startswith('Q:'):
                    current_question = line[2:].strip()
                elif line.startswith('A:') and current_question:
                    answer = line[2:].strip()
                    qa_pairs.append((current_question, answer))
                    current_question = None

            return qa_pairs[:num_questions]
        except Exception as e:
            print(f"An error occurred: {e}")
            return []

def main(input_text):
    api_key = os.environ["MISTRAL_API_KEY"]
    generator = QuizGenerator(api_key)

    qa_pairs = generator.generate_quiz(input_text)
    quiz_strings = []

    for i, (question, answer) in enumerate(qa_pairs, 1):
        quiz_strings.append(f"Question {i}: {question}\n")
        quiz_strings.append(f"Answer {i}: {answer}\n\n")

    return quiz_strings