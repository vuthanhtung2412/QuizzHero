# Quiz Generator Backend API

A FastAPI-based backend server that generates quizzes from text content using Mistral AI.

## Features

- **Quiz Generation**: Generate questions and answers from any text content
- **RESTful API**: Clean REST endpoints with proper HTTP status codes
- **CORS Support**: Configured for frontend integration
- **Input Validation**: Pydantic models for request/response validation
- **Error Handling**: Comprehensive error handling with meaningful messages
- **Health Check**: Endpoint for monitoring server status
- **Interactive Documentation**: Auto-generated API docs with Swagger UI

## API Endpoints

### Core Endpoints

- `GET /` - API information and version
- `GET /health` - Health check endpoint
- `POST /generate-quiz` - Generate quiz from text content
- `GET /sample-quiz` - Get sample quiz for testing
- `GET /docs` - Interactive API documentation (Swagger UI)

### Legacy Endpoints

- `GET /items/{item_id}` - Legacy endpoint for compatibility

## Setup and Installation

### Prerequisites

- Python 3.8+
- Mistral AI API key

### Installation

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.template .env
   # Edit .env and add your Mistral API key
   MISTRAL_API_KEY=your_actual_api_key_here
   ```

3. **Run the server:**
   ```bash
   # Development mode
   uvicorn main:app --reload --host 0.0.0.0 --port 8000

   # Or run directly
   python main.py
   ```

4. **Access the API:**
   - API Base URL: `http://localhost:8000`
   - Interactive Docs: `http://localhost:8000/docs`
   - Health Check: `http://localhost:8000/health`

## Usage Examples

### Generate Quiz

**Request:**
```bash
curl -X POST "http://localhost:8000/generate-quiz" \
     -H "Content-Type: application/json" \
     -d '{
       "text": "Python is a programming language. It was created by Guido van Rossum.",
       "num_questions": 3
     }'
```

**Response:**
```json
{
  "questions": [
    {
      "id": "1",
      "question": "Who created Python?",
      "answer": "Guido van Rossum"
    },
    {
      "id": "2",
      "question": "What type of language is Python?",
      "answer": "A programming language"
    }
  ],
  "total_questions": 2
}
```

### Health Check

**Request:**
```bash
curl http://localhost:8000/health
```

**Response:**
```json
{
  "status": "healthy",
  "message": "Quiz Generator API is running"
}
```

## API Schema

### QuizRequest
```json
{
  "text": "string (required)",
  "num_questions": "integer (optional, default: 5, max: 20)"
}
```

### QuizResponse
```json
{
  "questions": [
    {
      "id": "string",
      "question": "string",
      "answer": "string"
    }
  ],
  "total_questions": "integer"
}
```

## Dependencies

- **fastapi**: Web framework for building APIs
- **uvicorn**: ASGI server for running FastAPI
- **pydantic**: Data validation using Python type annotations
- **mistralai**: Mistral AI client for quiz generation
- **python-dotenv**: Environment variable management
- **requests**: HTTP library for API calls

## Development

### Running in Development Mode

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Testing the API

1. Visit `http://localhost:8000/docs` for interactive API documentation
2. Use the `/sample-quiz` endpoint to test without requiring API keys
3. Test quiz generation with the `/generate-quiz` endpoint

### Environment Variables

- `MISTRAL_API_KEY`: Your Mistral AI API key (required for quiz generation)

## Error Handling

The API returns appropriate HTTP status codes:

- `200`: Success
- `400`: Bad Request (invalid input)
- `500`: Internal Server Error (API issues, missing configuration)

Error responses include descriptive messages to help with debugging.

## Production Deployment

For production deployment:

1. Set `allow_origins` in CORS middleware to specific domains
2. Use environment variables for configuration
3. Set up proper logging
4. Use a production ASGI server like Gunicorn with Uvicorn workers
5. Implement rate limiting and authentication as needed

## Version

Current version: 1.0.0


Run app with uvicorn main:app --host 0.0.0.0 --port 8000
