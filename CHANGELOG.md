# Changelog

All notable changes to the AI Research Assistant platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-07-27

### Added
- 🚀 Initial production release of AI Research Assistant.
- 🤖 **LangGraph Multi-Tool Agent**: Dynamic state machine routing queries across 7 integrated tools (`web_search`, `weather`, `news`, `math`, `arxiv`, `github`, `wikipedia`).
- ⚡ **Groq Llama 3.3 70B Integration**: Sub-second LLM inference pipeline.
- 📡 **Server-Sent Events (SSE) Streaming**: Real-time event updates for `thinking`, `tool_start`, `tool_result`, `response`, and `done`.
- 🎨 **Modern React 18 SPA**: 9 complete workspace pages:
  - `Dashboard`: Interactive statistics, telemetry area charts, system status indicators.
  - `Research Workspace`: 3-panel chat workspace with collapsible history, tool execution badges, citations timeline.
  - `Projects`: Kanban-style research tracking board with category filters.
  - `Documents`: Multi-format drag & drop dropzone with format filtering.
  - `Knowledge Base`: Vector database telemetry cards and index management.
  - `Reports`: Executive briefing generator and report exporter.
  - `Analytics`: Token consumption charts, tool execution breakdown, performance metrics.
  - `Integrations`: Tool manager with individual toggle switches.
  - `Settings`: User profile settings and Light/Dark mode switcher.
- 🌙 **System-Independent Light/Dark Theme Engine**: Built with Tailwind CSS `class` strategy and Zustand state persistence.
- ⌨️ **Universal Command Palette**: `Ctrl + K` global overlay powered by `cmdk`.
- ☁️ **Zero-Cost Cloud Deployment Configuration**: `render.yaml` (Render Free Web Service) and `vercel.json` (Vercel Global Edge) configurations.
