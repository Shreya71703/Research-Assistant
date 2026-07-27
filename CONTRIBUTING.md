# Contributing to AI Research Assistant

Thank you for considering contributing to the AI Research Assistant platform! We welcome contributions from developers, researchers, and open-source enthusiasts.

---

## 📜 Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

---

## 🔀 Branching Strategy

We follow a Git Feature-Branch workflow:

- `main`: Production-ready branch. All releases are tagged from `main`.
- `feature/<feature-name>`: New capabilities or page modules.
- `fix/<bug-name>`: Bug fixes and security patches.
- `docs/<doc-update>`: Documentation updates.

---

## 💬 Commit Message Format

We strictly enforce **Conventional Commits**:

- `feat: add PDF text parsing tool for RAG pipeline`
- `fix: resolve light mode toggle state persistence in uiStore`
- `docs: update deployment.md with Vercel edge configuration`
- `style: harmonize dark mode slate backgrounds across AppShell`
- `refactor: optimize SSE event buffer parser in api.ts`
- `test: add unit tests for graph execution flow`

---

## 🛠️ Local Development Setup

1. **Fork and clone the repository**:
   ```bash
   git clone https://github.com/Shreya71703/Research-Assistant.git
   cd Research-Assistant
   ```

2. **Backend Setup**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env
   # Add your GROQ_API_KEY
   python -m uvicorn api.server:app --reload --port 8000
   ```

3. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npx tsc --noEmit
   npm run dev
   ```

---

## 🧪 Pull Request Guidelines

Before submitting your PR, ensure:

1. **TypeScript compilation passes** without errors:
   ```bash
   cd frontend && npx tsc --noEmit
   ```
2. **Frontend builds cleanly**:
   ```bash
   npm run build
   ```
3. **Backend runs unit tests**:
   ```bash
   pytest tests/
   ```
4. PR title follows Conventional Commits format.
5. Provide a summary of changes and attach screenshots for UI updates.
