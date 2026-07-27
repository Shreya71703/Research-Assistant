# Quick Setup Guide

## Prerequisites

- Python 3.10+
- Docker & Docker Compose (optional, for containerized setup)
- An LLM API key (Groq or OpenAI)

## Option 1: Local Setup (Fastest)

### 1. Clone & Install

```bash
git clone https://github.com/Shreya71703/research-assistant-agent.git
cd research-assistant-agent

python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

pip install -r requirements.txt
```

### 2. Get API Keys

**Groq (Recommended - Free, Fast):**
- Go to https://console.groq.com
- Sign up (free tier)
- Generate API key
- Copy to `.env`

**OpenAI (Alternative):**
- Go to https://platform.openai.com/api/keys
- Generate key
- Copy to `.env`

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your key:
```
GROQ_API_KEY=gsk_xxxxxx
# or
OPENAI_API_KEY=sk_xxxxxx
```

### 4. Test the Agent

**Via CLI:**
```bash
python main.py "What is the weather in London?"
python main.py "Calculate 2^10 and search for AI news"
```

**Via API Server:**
```bash
python -m uvicorn api.server:app --reload
# Open http://localhost:8000/docs
# Click "Try it out" on POST /agent/query
# Paste a query like: "Weather in Tokyo"
```

## Option 2: Docker Setup

### 1. Configure

```bash
cp .env.example .env
# Edit .env with your API key
```

### 2. Run

```bash
docker compose up --build
```

Server runs on http://localhost:8000

### 3. Test

```bash
curl -X POST http://localhost:8000/agent/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What is 2 + 2?"}'
```

## Testing

```bash
pytest -v tests/
pytest --cov=agent --cov=api tests/  # With coverage
```

## Troubleshooting

### "API key not found"
- Ensure `.env` file exists in project root
- Check `.env` has `GROQ_API_KEY=` or `OPENAI_API_KEY=`
- No quotes around key value

### "Tool timed out"
- Increase `timeout` parameter in query
- Check internet connection
- API rate limit? Wait and retry

### "ModuleNotFoundError"
- Ensure virtual environment is activated
- Run `pip install -r requirements.txt` again

## Next Steps

1. **Customize tools:** Edit `agent/tools.py` to add new tools (ArXiv, GitHub, etc.)
2. **Deploy:** Push to GitHub, connect to Render or Railway for free hosting
3. **Add to resume:** Link the GitHub repo in your projects section

## Resume Bullet Point

> Designed and deployed a **tool-using LLM agent** using LangGraph that orchestrates 4 external APIs (web search, weather, news, calculator) with sub-second latency per tool call. Built FastAPI backend with structured error handling, async orchestration, and observability. Demonstrates core agent patterns: tool calling, state management, and response synthesis.

---

Questions? Check the full README.md
