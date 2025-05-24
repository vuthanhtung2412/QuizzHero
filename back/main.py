from typing import Union, List, Dict
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from quiz_generator import QuizGenerator
from sessions import Session

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Quiz Generator API",
    description="A FastAPI server for generating quizzes from text content",
    version="1.0.0"
)


# Add CORS middleware to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize quiz generator
try:
    api_key = os.getenv("MISTRAL_API_KEY")
    if not api_key:
        print("Warning: MISTRAL_API_KEY not found in environment variables")
        quiz_generator = None
    else:
        quiz_generator = QuizGenerator(api_key)
except Exception as e:
    print(f"Error initializing quiz generator: {e}")
    quiz_generator = None

sessions: dict[int, Session] = {}

@app.get("/", response_model=Dict[str, str])
def read_root():
    """Root endpoint returning API information"""
    return {
        "message": "Quiz Generator API",
        "version": "1.0.0",
        "docs": "/docs"
    }

class HealthResponse(BaseModel):
    status: str
    message: str
@app.get("/health", response_model=HealthResponse)
def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        message="Quiz Generator API is running"
    )

class SessionResponse(BaseModel):
    session_id: int
@app.post("/session", response_model=SessionResponse)
def session():
    """
    Creates a new session for the user, answers with the id
    """
    new_session = Session()
    sessions[new_session.id] = new_session
    return SessionResponse(session_id=new_session.id)

class SessionDocRequest(BaseModel):
    base64_docs: list[str]
class SessionDocResponse(BaseModel):
    success: bool
@app.post("/session/{id}/doc", response_model=SessionDocResponse)
def add_session_doc(id: int, request: SessionDocRequest, response_model=SessionDocResponse):
    """
    Add base64 encoded images to an existing session

    Args:
        id: Session ID
        request: SessionDocRequest containing list of base64 encoded documents

    Returns:
        SessionDocResponse indicating success or failure
    """
    # Check if session exists
    if id not in sessions:
        raise HTTPException(
            status_code=404,
            detail=f"Session with id {id} not found"
        )

    # Validate that we have documents to add
    if not request.base64_docs:
        raise HTTPException(
            status_code=400,
            detail="No documents provided. base64_docs cannot be empty."
        )

    # Validate base64 format (basic validation)
    for i, doc in enumerate(request.base64_docs):
        if not doc or not isinstance(doc, str):
            raise HTTPException(
                status_code=400,
                detail=f"Document at index {i} is invalid. Must be a non-empty string."
            )

        # Basic base64 validation - check if it looks like base64
        if not doc.replace('+', '').replace('/', '').replace('=', '').isalnum():
            raise HTTPException(
                status_code=400,
                detail=f"Document at index {i} does not appear to be valid base64 encoded data."
            )

    try:
        # Add documents to the session
        session = sessions[id]
        session.add_docs(request.base64_docs)

        return SessionDocResponse(success=True)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error adding documents to session: {str(e)}"
        )

class SessionQuestionResponse(BaseModel):
    question: str
@app.get("/session/{id}/question", response_model=SessionQuestionResponse)
def get_session_question():
    """
    get next question for the quizz
    """
    if id not in sessions:
        raise HTTPException(
            status_code=404,
            detail=f"Session with id {id} not found"
        )
    session = sessions[id]
    return SessionQuestionResponse(question=session.generate_next_question())

class SessionAnswerRequest(BaseModel):
    user_answer: str
class SessionAnswerResponse(BaseModel):
    response: str
@app.post("/session/{id}/answer", response_model=SessionAnswerResponse)
def post_session_answer(request: SessionAnswerRequest, response_model=SessionAnswerResponse):
    """
    answer to the first question from the quizz
    """
    if id not in sessions:
        raise HTTPException(
            status_code=404,
            detail=f"Session with id {id} not found"
        )
    session = sessions[id]
    return SessionQuestionResponse(question=session.generate_feedback(request.user_answer))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
