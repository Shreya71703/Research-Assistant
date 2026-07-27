# Supported Models & Inference Backends

The AI Research Assistant platform uses **Groq Cloud API** for ultra-fast Llama 3 inference with native JSON mode and tool calling support.

---

## ⚡ Primary LLM Backend (Groq Cloud)

| Model Name | Model ID | Context Window | Max Output Tokens | Recommended Use |
|---|---|---|---|---|
| **Llama 3.3 70B Versatile** *(Default)* | `llama-3.3-70b-versatile` | 128,000 tokens | 8,192 tokens | High-reasoning research, complex tool routing, synthesis |
| **Llama 3.1 8B Instant** | `llama-3.1-8b-instant` | 128,000 tokens | 8,192 tokens | High-speed summarization & sub-agent execution |
| **Mixtral 8x7B Instruct** | `mixtral-8x7b-32768` | 32,768 tokens | 4,096 tokens | Alternative multi-lingual reasoning |

---

## 🛠️ Tool Calling Capabilities

The underlying `langchain-groq` interface leverages function calling specs:

- **Web Search**: Query string extraction & duckduckgo result parsing.
- **Weather API**: Coordinates & unit parsing.
- **Math Evaluator**: Mathematical expression sanitization for SymPy execution.
- **ArXiv & GitHub**: Structured paper search & repository payload extraction.

---

## 🔮 Optional Alternative Backends

The codebase is built on **LangChain & LangGraph**, allowing simple swapping of the LLM provider in `agent/graph.py`:

```python
# To switch to OpenAI GPT-4o:
from langchain_openai import ChatOpenAI
llm = ChatOpenAI(model="gpt-4o", temperature=0)

# To switch to Anthropic Claude 3.5 Sonnet:
from langchain_anthropic import ChatAnthropic
llm = ChatAnthropic(model="claude-3-5-sonnet-20240620", temperature=0)
```
