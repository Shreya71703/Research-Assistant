# Engineering Roadmap

This document outlines the planned feature additions, performance milestones, and architectural evolution for the AI Research Assistant.

---

## 🎯 Near-Term Milestones (v1.1 - v1.2)

- [ ] **Managed Vector Database Integration**
  - Integrate Qdrant Cloud Free Tier / Pinecone Free to replace ephemeral local ChromaDB.
- [ ] **Multi-Document RAG Upload Engine**
  - Add native PyPDF2 / pdfplumber server-side document chunking and vector storage.
- [ ] **User Authentication & Session Cloud Sync**
  - Implement Supabase / Clerk authentication for multi-device research synchronization.
- [ ] **PDF Briefing Export Engine**
  - Add client-side PDF document generation from formatted Markdown research reports.

---

## 🚀 Mid-Term Milestones (v1.3 - v2.0)

- [ ] **Autonomous Multi-Agent Swarm Collaboration**
  - Introduce parallel specialist agents (Researcher, Writer, Analyst, Fact-Checker) communicating over a shared bus.
- [ ] **Voice Research Assistant**
  - Integrate Web Speech API and Whisper for voice-to-text research querying.
- [ ] **Code Sandbox Execution**
  - Integrate Pyodide / E2B sandbox for safe Python execution of mathematical data analysis.

---

## 🌐 Long-Term Milestones (v2.0+)

- [ ] **Self-Hosting Helm & Docker Compose Pack**
  - Single-command local deployment bundle with PostgreSQL, ChromaDB, and Local LLM (Ollama) support.
- [ ] **Browser Extension Companion**
  - Chrome / Firefox extension to send active web pages directly into the Knowledge Base.
