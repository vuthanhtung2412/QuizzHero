cd back
# Uncomment if needed
# python3 -m venv venv
# ./venv/bin/activate
# pip install -r requirements.txt

uvicorn main:app --host 0.0.0.0 --port 8000
