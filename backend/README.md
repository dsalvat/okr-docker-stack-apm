# OKR Evaluator — Backend (FastAPI)

## Local
```bash
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # edita DATABASE_URL i OPENAI_API_KEY
alembic upgrade head   # crea taules
uvicorn app.main:app --reload --port 8000
```
API: http://localhost:8000/docs
