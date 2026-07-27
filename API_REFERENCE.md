# REST & SSE API Reference

The AI Research Assistant backend exposes a FastAPI REST and Server-Sent Events (SSE) streaming API.

---

## Base URLs

- **Local Development**: `http://localhost:8000`
- **Production (Render)**: `https://research-assistant-api.onrender.com`

---

## Endpoints Summary

| Endpoint | Method | Content-Type | Description |
|---|---|---|---|
| `/health` | `GET` | `application/json` | System health check & telemetry |
| `/agent/query` | `POST` | `application/json` | Synchronous batch query execution |
| `/agent/stream` | `POST` | `application/json` | Real-time SSE streaming query execution |
| `/docs` | `GET` | `text/html` | Interactive Swagger UI documentation |

---

## Endpoint Details

### 1. `GET /health`
Returns immediate system health, uptime, version, and active environment.

#### Request:
```bash
curl -X GET https://research-assistant-api.onrender.com/health
```

#### Response (200 OK):
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "environment": "production",
  "timestamp": "2026-07-27T18:00:00.000000",
  "uptime": "0:45:12.345678",
  "llm": "groq"
}
```

---

### 2. `POST /agent/query`
Executes an agent research request synchronously and returns the complete final payload.

#### Request:
```bash
curl -X POST https://research-assistant-api.onrender.com/agent/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is 2^10 + 5 and what is the weather in Tokyo?",
    "max_iterations": 10,
    "timeout": 30
  }'
```

#### Response (200 OK):
```json
{
  "query": "What is 2^10 + 5 and what is the weather in Tokyo?",
  "response": "2^10 + 5 equals 1029. The weather in Tokyo is currently 22°C with clear skies.",
  "tool_calls": [
    {
      "tool": "math",
      "input": {"expression": "2**10 + 5"},
      "output": {"result": 1029},
      "execution_time_ms": 15.2
    },
    {
      "tool": "weather",
      "input": {"location": "Tokyo"},
      "output": {"temperature": "22°C", "condition": "Clear"},
      "execution_time_ms": 140.8
    }
  ],
  "iterations": 2,
  "execution_time_seconds": 1.34,
  "status": "success"
}
```

---

### 3. `POST /agent/stream`
Executes an agent research request and streams Server-Sent Events (SSE) in real time.

#### Request:
```bash
curl -N -X POST https://research-assistant-api.onrender.com/agent/stream \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Find recent papers on quantum computing transformers."
  }'
```

#### Event Stream Output:
```http
HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache

event: thinking
data: {"message": "Analyzing query and formulating tool steps..."}

event: tool_start
data: {"tool": "arxiv_search", "input": {"query": "quantum computing transformers"}}

event: tool_result
data: {"tool": "arxiv_search", "output": {"papers": [...]}, "execution_time_ms": 420.1}

event: response
data: {"content": "Here are the top recent papers found on quantum computing transformers..."}

event: done
data: {"iterations": 1, "execution_time_seconds": 1.25, "tool_calls": [...]}
```
