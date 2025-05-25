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
        """
        Generate feedback for a user's answer by comparing it with the correct answer.

        Args:
            markdown_text (str): The original text the question was based on
            question (str): The question that was asked
            right_answer (str): The correct answer
            user_answer (str): The user's submitted answer

        Returns:
            str: Brief feedback about the user's answer
        """
        prompt = f"""Give a one-sentence personalized feedback on the answer. Use "you" and "your" to make it more personal.
        If the answer is correct, start with encouraging phrases like "Well done!", "Great job!", or "Keep going!" before giving the feedback.
        If the answer is incorrect, start with encouraging phrases like "No worries!", "Keep going!", or "You're getting there!" before explaining what was wrong and giving a hint.
        If the user doesn't know the answer, be encouraging and give a hint about where to find the answer in the text.
        If the answer is correct but too detailed, suggest how to make it more concise.

        Context:
        {markdown_text}

        Question: {question}
        Correct answer: {right_answer}
        Your answer: {user_answer}

        Keep it to one sentence and make it encouraging:"""

        messages = [
            {"role": "system", "content": "You are a supportive teacher providing personalized, encouraging feedback on answers."},
            {"role": "user", "content": prompt}
        ]

        
        chat_response = self.client.chat.complete(
            model="mistral-large-latest",
            messages=messages,
            temperature=0.7,
            max_tokens=500
        )
        
        return chat_response.choices[0].message.content
    
    def generate_follow_up_questions(self, 
                                    markdown_text: str, 
                                    previous_questions: List[str],
                                    previous_answers: List[str],
                                    previous_feedback: List[str],
                                    num_follow_ups: int = 3) -> List[str]:
        """
        Generate follow-up questions based on previous answers and user profile.

        Args:
            markdown_text (str): The original text
            previous_questions (List[str]): List of previously asked questions
            previous_answers (List[str]): List of user's answers to previous questions
            previous_feedback (List[str]): List of feedback given for previous answers
            num_follow_ups (int): Number of follow-up questions to generate

        Returns:
            List[str]: List of follow-up questions
        """
        # Create context from previous Q&A and feedback
        qa_context = "\n".join([
            f"Q: {q}\nA: {a}\nFeedback: {f}" 
            for q, a, f in zip(previous_questions, previous_answers, previous_feedback)
        ])

        prompt = f"""Based on the following context, previous questions/answers, and feedback, generate {num_follow_ups} follow-up questions.
        The questions should address the specific areas where the user needs improvement based on the feedback.
        Focus on generating questions that will help the user better understand the concepts they struggled with.

        Original text:
        {markdown_text}

        Previous Q&A and Feedback:
        {qa_context}

        Generate follow-up questions that:
        1. Address specific misconceptions or gaps identified in the feedback
        2. Build upon the user's previous answers and the feedback given
        3. Help clarify concepts that were not fully understood
        4. Are more specific and targeted based on the feedback

        Format each question as a numbered list:
        1. Question: [question text]
        2. Question: [question text]
        3. Question: [question text]"""

        messages = [
            {"role": "system", "content": "You are an educational AI that generates targeted follow-up questions based on previous answers and feedback."},
            {"role": "user", "content": prompt}
        ]

        chat_response = self.client.chat.complete(
            model="mistral-large-latest",
            messages=messages,
            temperature=0.7,
            max_tokens=1000
        )

        response_text = chat_response.choices[0].message.content
        print(response_text)

        # Parse the response and create list of questions
        follow_ups = []
        for line in response_text.split("\n"):
            line = line.strip()
            # Handle both formats: "1. Question: ..." and "Question: ..."
            if "Question:" in line:
                question = line.split("Question:", 1)[1].strip()
                # Remove any leading numbers and dots
                question = question.lstrip("123456789. ")
                if question:
                    follow_ups.append(question)

        return follow_ups

    def generate_questions(self, markdown_text: str, num_questions: int = 10) -> List[Tuple[str, str]]:
        """
        Generate questions and answers from markdown text using Mistral AI.

        Args:
            markdown_text (str): The markdown text extracted from images
            num_questions (int): Number of questions to generate (default: 5)

        Returns:
            List[Tuple[str, str]]: List of (question, answer) pairs
        """
        # Create a prompt for the AI to generate questions and answers
        prompt = f"""Based on the following text, generate {num_questions} clear and concise questions that test understanding of the content.
        Guidelines for questions:
        - Be direct and specific
        - Avoid phrases like "according to the text" or "based on the text"
        - Focus on key concepts and important details
        - Make questions self-contained and clear
        - Use active voice
        - Avoid redundant information

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

api_key = os.environ["MISTRAL_API_KEY"]
generator = QuizGenerator(api_key)

def main(input_text):
    questions,answers = generator.generate_questions(input_text)

    print(questions)
    print(answers)
    return questions
