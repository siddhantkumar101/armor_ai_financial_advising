# 🛡️ Armor – Financial Conversation Intelligence System

Convert multilingual (Hindi / English / Hinglish) audio conversations into structured financial insights using **OpenAI Whisper + GPT**.

---

## 📁 Project Structure

```
armor_ai/
├── backend/
│   ├── main.py                  # FastAPI entry point
│   ├── config.py                # Env-based config
│   ├── models/
│   │   └── conversation.py      # Pydantic schemas
│   ├── routes/
│   │   ├── transcribe.py        # POST /api/transcribe
│   │   ├── process.py           # POST /api/process
│   │   └── history.py           # GET  /api/history
│   ├── services/
│   │   ├── transcription.py     # Whisper API
│   │   ├── nlp.py               # Keyword-based financial detection
│   │   ├── llm.py               # GPT entity extraction + analysis
│   │   └── storage.py           # SQLite persistence
│   └── utils/
│       └── helpers.py           # File upload helper
├── frontend/
│   ├── index.html               # UI
│   ├── style.css                # Dark-theme styles
│   └── app.js                   # MediaRecorder + fetch logic
├── data/                        # Auto-created (DB + uploads)
├── .env.example
├── requirements.txt
└── README.md
```

---

## ⚡ Quick Setup (5 minutes)

### 1. Clone / enter the project
```bash
cd armor_ai
```

### 2. Create virtual environment
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Add your OpenAI API key
```bash
# Copy the example file
cp .env.example .env        # macOS/Linux
copy .env.example .env      # Windows

# Then open .env and replace YOUR_OPENAI_API_KEY_HERE with your real key
```
Get your key at: https://platform.openai.com/api-keys

### 5. Run the server
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 6. Open the app
Navigate to **http://localhost:8000** in your browser.

API docs (Swagger UI): **http://localhost:8000/docs**

---

## 🔄 Data Flow

```
Browser (MediaRecorder API)
    │
    ▼ POST /api/transcribe  [audio file]
FastAPI → Whisper API
    │  ← transcript + language
    ▼
    ▼ POST /api/process  [transcript text]
Keyword NLP (nlp.py)  →  is_financial? + confidence
    +
GPT-4o-mini (llm.py)  →  entities + summary + decision + risk + sentiment
    │
    ▼
SQLite (storage.py)   →  saved with timestamp
    │
    ▼ JSON response
Frontend renders:
  • Transcript box
  • Financial badges (risk, sentiment, confidence)
  • Entity chips (EMI, SIP, Loan, Amounts, Banks…)
  • Summary + Decision
  • History list (auto-refreshes)
```

---

## 🌐 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/transcribe` | Upload audio → get transcript |
| POST | `/api/process` | Send transcript → get financial analysis |
| GET  | `/api/history?limit=20` | Fetch conversation history |
| GET  | `/health` | Health check |

### POST /api/transcribe
- **Body**: `multipart/form-data` with `file` field (audio/webm, wav, mp4, etc.)
- **Response**: `{ transcript, language_detected, duration_seconds }`

### POST /api/process
- **Body**: `{ "transcript": "..." }`
- **Response**:
```json
{
  "is_financial": true,
  "entities": {
    "emi": "5000 rupaye per month",
    "sip": null,
    "loan": "home loan 20 lakh",
    "amounts": ["20 lakh", "5000"],
    "banks": ["SBI"],
    "investment_types": [],
    "time_periods": ["20 years"]
  },
  "summary": "The speaker is discussing a home loan...",
  "decision": "Take a home loan of 20 lakh from SBI",
  "risk_level": "medium",
  "sentiment": "positive",
  "confidence_score": 0.75
}
```

---

## 📋 Requirements

- Python 3.10+
- OpenAI API key (Whisper + GPT access)
- Modern browser (Chrome / Firefox / Edge) for MediaRecorder API

---

## 🎯 Bonus Features Implemented

- ✅ Sentiment analysis (positive / negative / neutral)
- ✅ Risk scoring (low / medium / high)
- ✅ Confidence score for financial detection
- ✅ Regex-based amount extraction (merges with LLM amounts)
- ✅ Hindi + Hinglish keyword dictionary (100+ terms)
- ✅ Audio visualizer animation during recording
- ✅ Click-to-expand history items
- ✅ Toast notifications for all actions
- ✅ Language detection badge from Whisper
