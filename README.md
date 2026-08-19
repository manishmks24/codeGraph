# CodeGraph AI 🏛️
### Enterprise Codebase Knowledge Graph & Architectural Copilot Engine

> **Polyglot AST Static Analysis (Java, TypeScript, Python) + Topological Graph Engine + Gemini AI Copilot + React Flow + Monaco Diff Editor**

---

## 🌟 Overview

**CodeGraph AI** is an intelligent developer platform designed for large-scale multi-service codebases. Rather than treating code as plain text, CodeGraph performs **Abstract Syntax Tree (AST) static analysis**, indexes symbols and call relationships into a **Topological Knowledge Graph**, and equips Generative AI agents (Google Gemini) with active **Project Skills (`SKILL.md`)** to compute blast radiuses, detect architectural violations, trace request flows, and generate safe refactoring diffs.

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                   CodeGraph AI Platform                                  │
├─────────────────────────┬───────────────────────────────┬────────────────────────────────┤
│    Polyglot AST Engine  │      Graph Analysis Engine    │      AI Copilot Engine         │
│ (Java, TS/JS, Python)   │   (BFS/DFS Blast Radius)      │ (Google Gemini + SKILL.md)     │
└─────────────────────────┴───────────────────────────────┴────────────────────────────────┘
```

---

## 🚀 Key Features

1. **Polyglot AST Code Ingestion (`com.archlens.parser`):**
   - **Java / Spring Boot**: RestControllers, Services, Repositories, JPA Entities, Kafka/Event Listeners.
   - **TypeScript / JavaScript**: React components, Next.js route handlers (`export async function GET/POST`), Express routes, hooks, and services.
   - **Python**: FastAPI route decorators, Flask routes, SQLAlchemy entities, service classes, and module imports.
   - **Dynamic Ingestion**: Paste any public **GitHub Repo URL** or drag & drop a **ZIP archive**.

2. **Topological Knowledge Graph Engine (`com.archlens.graph`):**
   - **Change Impact Zone (Blast Radius):** Traces incoming dependencies up to $N$ hops to simulate what breaks before you touch code.
   - **Cycle Detection (DFS Traversal):** Detects circular dependency loops (e.g., `OrderService ➔ PaymentService ➔ OrderService`).
   - **Layer Rule Validation:** Flags Clean Architecture violations (e.g., Controller bypassing Service to directly call Repository).

3. **Autonomous Project Architectural Skill (`SKILL.md`):**
   - Synthesizes living architectural rules, invariants, and layer boundaries tailored to your codebase.
   - 1-click exportable for Cursor, Gemini, Claude, and Antigravity agents.

4. **AI Copilot with Google Gemini (BYOK):**
   - Connect your free Google AI Studio API key.
   - Dynamic model discovery with multi-model fallback (`gemini-2.0-flash`, `gemini-1.5-flash-latest`, `gemini-1.5-pro`).
   - Natural language Q&A targeting components from the active imported project.

5. **Modern Interactive UI (`frontend/`):**
   - **Code Map (React Flow):** Color-coded nodes, custom layouts, animated blast zone highlights.
   - **Request Flows:** Trace end-to-end data paths from incoming HTTP triggers to database IO.
   - **Monaco Diff Viewer:** Side-by-side refactoring diff preview.
   - **Light & Dark Theme:** High-contrast aesthetic with 1-click toggle.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend** | Java 21, Spring Boot 3.3.2, JavaParser 3.25, Jackson |
| **Graph & Analysis** | In-Memory Topological Knowledge Graph, BFS/DFS Traversal Engine |
| **AI Layer** | Google Gemini REST API Client (BYOK), Multi-Model Discovery & Fallback Cascade |
| **Frontend** | React 18, Vite, TypeScript, React Flow (`@xyflow/react`), Monaco Editor, Tailwind CSS, Lucide Icons |
| **Deployment** | Vercel (Frontend), Docker (Multi-stage), Standalone Single-Artifact JAR |

---

## 🏃 Running Locally

### 1. Backend (Spring Boot):
```bash
cd backend
./mvnw spring-boot:run
```
*(Runs on `http://localhost:8080`)*

### 2. Frontend (Vite Dev Server):
```bash
cd frontend
npm install
npm run dev
```
*(Runs on `http://localhost:3000`)*

---

## 🚀 Deployment

### Option A: Deploy Frontend on Vercel
1. Import this repository into [Vercel](https://vercel.com).
2. Set Framework to **Vite**, Root Directory to **`frontend`** (or leave as root `/`).
3. Add Environment Variable: `VITE_API_BASE_URL=https://your-backend-url.up.railway.app/api`.
4. Click **Deploy**!

### Option B: Deploy with Docker (All-in-One)
```bash
docker compose up --build -d
```
*(Runs single port on `http://localhost:8080`)*

---

## 📄 License & Author

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

**Author**: **Manish Kumar Sahu**  
Built with ❤️ for software architects and developers.

