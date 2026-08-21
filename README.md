# CodeGraph AI 🏛️
### Enterprise Codebase Knowledge Graph, Blast Radius & Architectural Copilot Engine

[![Architecture: Verified with CodeGraph](https://img.shields.io/badge/Architecture-CodeGraph%20Verified-059669?style=for-the-badge&logo=diagram-next&logoColor=white)](https://code-graph-green.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![GitHub Action](https://img.shields.io/badge/GitHub%20Action-PR%20Blast%20Radius-emerald?style=for-the-badge&logo=githubactions&logoColor=white)](.github/workflows/codegraph-pr-review.yml)

> **Polyglot AST Static Analysis (Java, TypeScript, Python) + Topological Knowledge Graph + Gemini AI Copilot + 1-Click Mermaid/C4 Export + GitHub PR Reviewer**

🌐 **Live Web Application**: [https://code-graph-green.vercel.app](https://code-graph-green.vercel.app)

---

## 🌟 Overview

**CodeGraph AI** is an intelligent developer platform designed for large-scale multi-service codebases. Rather than treating code as plain text, CodeGraph performs **Abstract Syntax Tree (AST) static analysis**, indexes symbols and call relationships into a **Topological Knowledge Graph**, and equips Generative AI agents (Google Gemini) with active **Project Skills (`SKILL.md`)** to compute blast radiuses, detect architectural violations, trace request flows, and generate safe refactoring diffs.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                          CodeGraph AI Platform                                         │
├──────────────────────────┬───────────────────────────────┬─────────────────────────────────────────────┤
│   Polyglot AST Engine    │     Graph Analysis Engine     │              Developer Tools                │
│  (Java, TS/JS, Python)   │   (BFS/DFS Blast Radius)      │  (Gemini Copilot, Mermaid, GitHub Action)   │
└──────────────────────────┴───────────────────────────────┴─────────────────────────────────────────────┘
```

---

## 🚀 Key Features

1. **Polyglot AST Code Ingestion (`com.archlens.parser`):**
   - **Java / Spring Boot**: RestControllers, Services, Repositories, JPA Entities, Kafka/Event Listeners.
   - **TypeScript / JavaScript**: React components, Next.js App Router handlers (`POST/GET`), Express routes, hooks, and Prisma/ORM models.
   - **Python**: FastAPI APIRouters, Flask routes, SQLAlchemy entities, RAG vector store repositories, and service classes.
   - **Zero-Config Instant Demos**: 1-click exploration of **Spring Boot E-Commerce**, **Next.js Fullstack**, and **FastAPI AI Agent** sample architectures.
   - **Dynamic Ingestion**: Paste any public **GitHub Repo URL** or drag & drop a **ZIP archive**.

2. **Topological Knowledge Graph Engine (`com.archlens.graph`):**
   - **Change Impact Zone (Blast Radius):** Traces incoming dependencies up to $N$ hops to simulate what breaks before you touch code.
   - **Cycle Detection (DFS Traversal):** Detects circular dependency loops (e.g., `OrderService ➔ PaymentService ➔ OrderService`).
   - **Custom Architecture Rules Linter:** Define and enforce strict layer boundary invariants (`.archrules.json`).

3. **1-Click Architecture & AI Guardrails Export:**
   - **Mermaid.js Flowchart**: Subgraphs grouped by layer with color-coded styling classes.
   - **C4 Architecture Model**: Comprehensive markdown system context & component catalog.
   - **AI Coding Guardrails (`.cursorrules` / `GEMINI.md` / `SKILL.md`)**: Constrains Cursor and AI coding agents from violating codebase architecture.

4. **Automated GitHub PR Blast Radius Action (`action.yml`):**
   - Drops directly into `.github/workflows/` to automatically comment on pull requests with simulated blast radius, affected endpoints, and risk score.

5. **AI Copilot with Google Gemini (BYOK):**
   - Connect your free Google AI Studio API key.
   - Dynamic model discovery with multi-model fallback (`gemini-2.0-flash`, `gemini-1.5-flash-latest`, `gemini-1.5-pro`).
   - Natural language Q&A and 1-click refactoring targeting components from the active imported project.

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

