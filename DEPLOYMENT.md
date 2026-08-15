# 🚀 CodeGraph AI — Deployment Guide

This guide covers deploying **CodeGraph AI** to **Vercel** (Frontend) as well as Docker, Railway, Render, and Cloud Run.

---

## ⚡ Option 1: Deploy Frontend on Vercel (Recommended)

Vercel is the fastest way to host the interactive **CodeGraph AI** web app:

### Step 1: Import Your Repository on Vercel
1. Go to [vercel.com](https://vercel.com) and click **"Add New..." ➔ "Project"**.
2. Select your GitHub repository.

### Step 2: Configure Project Settings on Vercel
* **Framework Preset**: `Vite`
* **Root Directory**: `frontend` *(or leave as root `/` — `vercel.json` will automatically detect it)*
* **Build Command**: `npm run build`
* **Output Directory**: `dist`

### Step 3: Add Environment Variable (Backend Connection)
Under **Settings ➔ Environment Variables**, add:
* **`VITE_API_BASE_URL`**: `https://your-backend-service.up.railway.app/api` *(or your Render / Cloud Run / VPS API URL)*

Click **Deploy**! 🚀

---

## ☕ Where to Host the Java / Spring Boot Backend (Free & Easy)

Since Vercel specializes in Node.js/Edge frontend runtimes, host the Java backend on any of these free/instant container hosts:

### Option A: 1-Click Deploy on Railway (Fastest)
1. Go to [railway.app](https://railway.app) and create a **New Project**.
2. Select **Deploy from GitHub Repo**.
3. Choose the `backend` folder (or use the root `Dockerfile`).
4. Railway will automatically build and assign a public HTTPS domain like `https://codegraph-production.up.railway.app`.
5. Paste `https://codegraph-production.up.railway.app/api` into your Vercel `VITE_API_BASE_URL`.

---

### Option B: Deploy on Render
1. Go to [render.com](https://render.com) and click **New ➔ Web Service**.
2. Connect your repo and select **Docker** runtime.
3. Render builds the Docker container and exposes a public URL.

---

## 🐳 Option 2: All-in-One Docker Deployment (Frontend + Backend on 1 Port)

If you prefer hosting **everything together** on a single server or cloud container:

### 1-Command Local or Server Run:
```bash
docker compose up --build -d
```
> Opens at **`http://localhost:8080`**

### Build Docker Image Manually:
```bash
docker build -t codegraph-ai:latest .
docker run -d -p 8080:8080 --name codegraph codegraph-ai:latest
```

---

## 🖥️ Option 3: Standalone Single JAR (Windows / Linux VPS)

```cmd
# 1. Build Single Executable JAR
build-all.bat   # (or ./build-all.sh on Linux)

# 2. Run the JAR
start-production.bat
```

---

## 🔒 Environment Variables Reference

| Variable | Scope | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Frontend (Vercel) | Backend API endpoint URL (e.g. `https://api.domain.com/api`). |
| `PORT` | Backend | HTTP port the Spring Boot server listens on (default: `8080`). |
| `SPRING_PROFILES_ACTIVE`| Backend | Spring active profile (default: `production`). |
| `ALLOWED_ORIGINS` | Backend | CORS allowed domains (default: `*`). |
