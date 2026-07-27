# Production & Local Troubleshooting Guide

This guide covers resolution steps for common issues encountered during local development or production deployment.

---

## 🔍 Common Issues & Fixes

### 1. Light Mode / Dark Mode Toggle Is Stuck
- **Symptom**: Clicking Light Mode does not switch theme from Dark Mode.
- **Cause**: Missing `darkMode: ['class']` configuration in `tailwind.config.ts`.
- **Solution**: Ensure `tailwind.config.ts` includes `darkMode: ['class']`. Verify `uiStore.ts` removes `'dark'` from `document.documentElement.classList`.

### 2. CORS Error on Vercel (`Access-Control-Allow-Origin`)
- **Symptom**: Browser blocks requests to `https://research-assistant-api.onrender.com`.
- **Cause**: Backend CORS middleware lacks the Vercel domain.
- **Solution**: Set `CORS_ORIGINS=https://research-assistant.vercel.app` in Render environment variables.

### 3. Server-Sent Events (SSE) Stream Interrupted
- **Symptom**: Stream stops unexpectedly or buffers tokens in batch.
- **Cause**: Proxy buffering or missing SSE buffer parsing.
- **Solution**: Ensure `api/server.py` returns header `Content-Type: text/event-stream` and disables proxy buffering.

### 4. Render Cold Start Delay
- **Symptom**: The first request after 15 minutes takes 30-50 seconds to respond.
- **Cause**: Render Free tier spins down web services after 15 minutes of inactivity.
- **Solution**: Set up a free uptime monitor (e.g. UptimeRobot or Cron) to ping `https://research-assistant-api.onrender.com/health` every 10 minutes.
