# Zero-Cost Production Deployment Guide ($0 / month)

This guide provides complete instructions to deploy the AI Research Assistant to production for **$0/month** without entering a credit card.

---

## 🏗️ Architecture Stack

- **Frontend Hosting**: Vercel Global Edge Network ([https://vercel.com](https://vercel.com))
- **Backend Hosting**: Render Free Web Service ([https://render.com](https://render.com))
- **Database**: Neon Serverless PostgreSQL ([https://neon.tech](https://neon.tech))
- **Vector DB**: Persistent storage directory (`./agent/chroma_db`)
- **LLM Engine**: Groq Cloud API ([https://console.groq.com](https://console.groq.com))

---

## ⚡ Step-by-Step Instructions

### Step 1: Deploy Backend to Render
1. Push repository to GitHub.
2. Sign up on **Render.com** and click **New +** → **Web Service**.
3. Select your repository. Render automatically reads `render.yaml`.
4. Add **Environment Variables**:
   - `GROQ_API_KEY`: *<your-groq-api-key>*
   - `ENVIRONMENT`: `production`
   - `CORS_ORIGINS`: `https://research-assistant.vercel.app`
5. Click **Create Web Service**. Render deploys your backend to `https://research-assistant-api.onrender.com`.

### Step 2: Deploy Frontend to Vercel
1. Sign up on **Vercel.com** and click **Add New Project**.
2. Select your GitHub repository.
3. Set **Framework Preset** to `Vite`.
4. Set **Root Directory** to `frontend`.
5. Add **Environment Variable**:
   - `VITE_API_URL`: `https://research-assistant-api.onrender.com`
6. Click **Deploy**. Vercel deploys your frontend to `https://research-assistant.vercel.app`.

---

## 🐳 Alternative Docker Deployment

You can also run the entire stack locally or on any VPS using Docker:

```bash
# Build Docker image
docker build -t ai-research-assistant .

# Run container
docker run -d -p 8000:8000 -e GROQ_API_KEY="your_key" ai-research-assistant
```
