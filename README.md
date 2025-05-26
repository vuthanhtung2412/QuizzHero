# QuizzHero Learning App

In this project, we created a webapp where students can take pictures of their handwritten notes or pages from the book.
The AI will capture and process the information and creates several questions based on the input.
The student can answer the questions via voice and the AI will give feedback whether the answer is wrong or correct also with voice.
The idea is that the conversation between the AI and the student should be conversational like the student is talking to a tutor.
The AI tries to keep the student motivated to keep going.
After finishing all the questions, the user will receive a precise summarization / report. The AI will respond e.g. on which aspects the student should focus on. 

# SHORT DEMO

https://github.com/user-attachments/assets/9caaae37-543f-4f02-986a-2b1385a4813d

# Used Tools
- Backend: FastAPI
- Frontend: NextJS
- Voice: Elevenlabs
- AI: Mistral

# Features

- Understand taken notes
- Generate Quizz
- Answer evaluation
- Follow up question for lacking knowledge
  
# Set up 

## Set Mistral and Elevenlabs API keys

``` bash
export MISTRAL_API_KEY=
export ELEVENLABS_API_KEY=
```

## Set up env

``` bash
cd back
python3 -m venv venv
./venv/bin/activate
pip install -r requirements.txt
cd ../front
pnpm i
```

## Run app

``` bash
# Frontend
pnpm dev
# Backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

# FULL DEMO

https://github.com/user-attachments/assets/9b37fa21-c1d2-4bda-818c-b2ecf9a7b30d
