# MedAssist — Complete Setup & Deployment Guide

Overview

MedAssist is an AI-powered medical report intelligence platform designed to simplify the way users interact with healthcare reports and medical data. Instead of manually reading lengthy diagnostic documents filled with medical terminology, MedAssist helps users upload reports, analyze them using artificial intelligence, and receive simplified insights in a clean and interactive interface.

The project combines modern web technologies with machine learning and natural language processing to create a smart healthcare assistant capable of understanding medical reports, extracting important health information, and helping users gain better clarity about their health conditions.

This project was built with the goal of making healthcare information more accessible, understandable, and interactive for everyday users.
> Stack: React + Vite + FastAPI + PostgreSQL + Groq/Llama3 + LangChain + FAISS

---

## Project Structure

```
medassist/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py          # Settings from .env
│   │   │   ├── database.py        # SQLAlchemy engine + session
│   │   │   └── security.py        # JWT + bcrypt + auth deps
│   │   ├── models/
│   │   │   └── models.py          # All ORM models (User, Report, Analysis…)
│   │   ├── schemas/
│   │   │   └── schemas.py         # Pydantic request/response models
│   │   ├── routers/
│   │   │   ├── auth.py            # /api/auth/*
│   │   │   ├── reports.py         # /api/reports/*
│   │   │   ├── chatbot.py         # /api/chatbot/*
│   │   │   ├── doctor.py          # /api/doctor/*
│   │   │   └── admin.py           # /api/admin/*
│   │   ├── services/
│   │   │   ├── ocr_service.py     # PDF/image → text → structured params
│   │   │   ├── ai_service.py      # Groq/Llama3 analysis engine
│   │   │   └── rag_service.py     # LangChain + FAISS chatbot
│   │   └── main.py                # FastAPI app factory
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.js          # Axios + JWT interceptors
│   │   │   └── services.js        # All API call functions
│   │   ├── store/
│   │   │   └── authStore.js       # Zustand auth state
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   ├── AppLayout.jsx  # Sidebar + Outlet shell
│   │   │   │   └── Sidebar.jsx    # Role-based nav
│   │   │   └── common/
│   │   │       └── index.jsx      # StatCard, Badge, PageHeader, etc.
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── patient/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── MyReports.jsx
│   │   │   │   ├── AIAnalysis.jsx
│   │   │   │   ├── ChatAssistant.jsx
│   │   │   │   ├── HealthTrends.jsx
│   │   │   │   └── Appointments.jsx
│   │   │   ├── doctor/
│   │   │   │   ├── DoctorDashboard.jsx
│   │   │   │   └── PendingReports.jsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── ManageUsers.jsx
│   │   │       └── ManageHospitals.jsx
│   │   ├── App.jsx                # Router with protected routes
│   │   ├── main.jsx
│   │   └── index.css              # Tailwind + component classes
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
│
├── docker-compose.yml
└── README.md
```

---

## Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- **PostgreSQL** 14+ (local or Neon cloud)
- **Tesseract OCR** installed on OS
- **Groq API key** (free at console.groq.com)

### Install Tesseract

```bash
# Ubuntu/Debian
sudo apt-get install tesseract-ocr tesseract-ocr-eng poppler-utils

# macOS
brew install tesseract poppler

# Windows
# Download installer from: https://github.com/UB-Mannheim/tesseract/wiki
```

---

## Option A: Docker Compose (Easiest)

```bash
# 1. Clone and navigate
git clone <repo> && cd medassist

# 2. Set your Groq API key
export GROQ_API_KEY=gsk_your_key_here

# 3. Start everything
docker compose up --build

# Access:
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

---

## Option B: Manual Local Setup

### Backend

```bash
cd medassist/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env — set DATABASE_URL, SECRET_KEY, GROQ_API_KEY

# Create database tables (auto on startup, or run Alembic)
# Tables are created automatically on first startup via Base.metadata.create_all

# Start the server
uvicorn app.main:app --reload --port 8000

# API docs available at: http://localhost:8000/docs
```

### Frontend

```bash
cd medassist/frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Set: VITE_API_BASE_URL=http://localhost:8000

# Start dev server
npm run dev

# Open: http://localhost:5173
```

---

## Environment Variables

### Backend (.env)

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `SECRET_KEY` | JWT signing secret (32+ chars) | `super-secret-key-here` |
| `GROQ_API_KEY` | Groq API key | `gsk_...` |
| `GROQ_MODEL` | Llama model to use | `llama3-70b-8192` |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:5173` |
| `UPLOAD_DIR` | Local file storage path | `./uploads` |

### Frontend (.env.local)

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend URL |

---

## Production Deployment

### Frontend → Vercel

```bash
cd frontend
npm run build

# Using Vercel CLI
npx vercel --prod

# Environment variable to set in Vercel dashboard:
# VITE_API_BASE_URL = https://your-backend.onrender.com
```

### Backend → Render

1. Create a new **Web Service** on render.com
2. Connect your GitHub repo, set root to `backend/`
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add all environment variables from `.env.example`

### Database → Neon PostgreSQL

1. Create project at neon.tech
2. Copy connection string
3. Set as `DATABASE_URL` in Render environment variables

---

## Key Architecture Decisions

| Decision | Rationale |
|---|---|
| Background tasks for OCR+AI | Keeps upload endpoint fast; analysis runs async |
| FAISS in-memory vector store | Zero infra cost; can swap to Chroma/Pinecone for prod |
| Rule-based abnormality detection | Prevents AI hallucination on medical values |
| Role-based JWT claims | Single token encodes patient/doctor/admin access |
| SQLAlchemy ORM | Type-safe, migration-ready, works with Alembic |
| Zustand over Redux | Minimal boilerplate, built-in persistence |
