from typing import List, Tuple
from mistralai.client import MistralClient
import os

class QuizGenerator:
    def __init__(self, api_key: str):
        """Initialize the QuizGenerator with Mistral API key."""
        self.client = MistralClient(api_key=api_key)

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
            chat_response = self.client.chat(
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

def main():
    api_key = ""
    generator = QuizGenerator(api_key)

    sample_text = """
    # Introduction to Computer Science
    Computer Science is the study of computers and computational systems. Unlike electrical and computer engineers, computer scientists deal mostly with software and software systems, including their theory, design, development, and application.

    ## History of Computer Science

    The origins of computer science date back to as early as the 1940s, when the first electronic digital computers were developed. Pioneers like Alan Turing laid the theoretical foundations for the field with concepts such as the Turing machine, which formalized the notion of an algorithm.

    ## Key Concepts in Computer Science

    ### Algorithms
    An algorithm is a step-by-step procedure for calculations. Algorithms are used for calculation, data processing, and automated reasoning. Understanding algorithms is crucial for solving complex problems efficiently.

    ### Data Structures
    Data structures are ways of organizing and storing data in a computer so that it can be accessed and modified efficiently. Common data structures include arrays, linked lists, stacks, queues, trees, and graphs.

    ### Programming Languages
    Programming languages are formal languages comprising a set of instructions that produce various kinds of output. They are used in computer programming to implement algorithms. Popular programming languages include Python, Java, C++, and JavaScript.

    ## Applications of Computer Science

    Computer Science has a wide range of applications, including:

    - **Artificial Intelligence (AI)**: The simulation of human intelligence in machines that are programmed to think and learn.
    - **Cybersecurity**: The practice of protecting systems, networks, and programs from digital attacks.
    - **Software Engineering**: The application of engineering principles to the design, development, testing, and maintenance of software.
    - **Data Science**: An interdisciplinary field that uses scientific methods, processes, algorithms, and systems to extract knowledge and insights from structured and unstructured data.

    ## Future Trends in Computer Science

    The field of computer science is continually evolving. Some of the future trends include:

    - **Quantum Computing**: Utilizing the principles of quantum mechanics to perform computations.
    - **Internet of Things (IoT)**: The network of physical objects embedded with sensors, software, and other technologies to connect and exchange data with other devices and systems over the internet.
    - **Blockchain Technology**: A decentralized digital ledger that records transactions across many computers so that the record cannot be altered retroactively without the alteration of all subsequent blocks.

    Computer Science is a dynamic and rapidly evolving field that continues to shape the future of technology and innovation.
    """

    qa_pairs = generator.generate_quiz(sample_text)
    quiz_strings = []

    for i, (question, answer) in enumerate(qa_pairs, 1):
        quiz_strings.append(f"Question {i}: {question}\n")
        quiz_strings.append(f"Answer {i}: {answer}\n\n")

    print(quiz_strings)
    return quiz_strings

if __name__ == "__main__":
    quiz = main()
    for item in quiz:
        print(item)
