# PromptShield + AIGroomDetect

> "We didn't build a product you have to trust — we built a system you can verify."

A privacy-first AI safety tool for young users. Protects both directions of AI conversations and browsing — redacting sensitive data before it leaves your device, flagging manipulative content, and blurring unsafe images. All inference runs **locally, on-device, with no cloud calls**.

---

## Features

| Feature | What it does |
|---|---|
| **PromptShield** | Intercepts text before it's sent to AI chatbots and redacts PII (names, emails, phone numbers, etc.) |
| **AIGroomDetect** | Analyzes AI/chat responses for grooming and manipulation patterns in real time |
| **NSFW Image Blur** | Scans all images on any webpage and blurs unsafe content with a parental unlock system |

---

## Tech Stack

### Backend
| Component | Technology |
|---|---|
| API framework | [FastAPI](https://fastapi.tiangolo.com/) |
| Runtime | Python 3.12 |
| Server | Uvicorn |

### Models
| Model | Purpose |
|---|---|
| [`en_core_web_lg`](https://spacy.io/models/en#en_core_web_lg) (spaCy) | NER for PII entity detection |
| [Microsoft Presidio](https://microsoft.github.io/presidio/) | PII analysis + anonymization engine |
| [`unitary/toxic-bert`](https://huggingface.co/unitary/toxic-bert) | Toxicity / manipulation detection |
| [`NudeNet`](https://github.com/notAI-tech/NudeNet) | Explicit nudity detection in images |
| [`Falconsai/nsfw_image_detection`](https://huggingface.co/Falconsai/nsfw_image_detection) | Broader NSFW image classification |

### Extension
| Component | Technology |
|---|---|
| Browser extension | Chrome Manifest V3 |
| Content script | Vanilla JavaScript |
| Background worker | Service Worker |

### Frontend (demo UI)
| Component | Technology |
|---|---|
| Framework | React 18 |
| Build tool | Vite |

---

## How It Works

### PromptShield (text output)
1. User types a message in ChatGPT or Gemini
2. Extension intercepts the Enter key before submission
3. Text is sent to `POST /shield` — Presidio + spaCy scans for PII locally
4. Redacted text replaces the original in the input box
5. A toast notification shows what was removed (e.g. "🔒 Redacted: Person, Email Address")
6. ChatGPT receives only the redacted version — your real info never leaves your device

### AIGroomDetect (text input)
1. AI response appears in the chat
2. Extension detects the new message via MutationObserver
3. Text is sent to `POST /analyze` — checked against grooming pattern rules + toxic-bert
4. If flagged, a red warning banner appears: "⚠ Warning: [reason] (X% confidence)"

### NSFW Image Blur
1. All images on the page are blurred immediately via CSS injection
2. Images are collected and sent to `POST /check` via the background service worker
3. Each image is scanned by NudeNet + Falconsai in parallel
4. Safe images → unblurred + ✓ SFW badge
5. Unsafe images → stay blurred + overlay message + parental password unlock

---

## Project Structure

```
expresshackathon/
├── backend/
│   ├── main.py              # FastAPI app — all routes
│   ├── shield.py            # Presidio PII redaction
│   ├── groom.py             # Grooming pattern rules + toxic-bert
│   ├── nsfw.py              # NudeNet + Falconsai NSFW detection
│   └── requirements.txt
├── extension/
│   ├── manifest.json        # Chrome MV3 config
│   ├── content.js           # Text interception + image blur logic
│   ├── background.js        # Image batching + /check calls
│   ├── popup.html           # Extension popup UI
│   └── popup.js             # Popup logic + parental password
├── frontend/                # Demo chat UI (React + Vite)
│   └── src/
│       ├── App.jsx
│       ├── api.js
│       └── components/
├── LICENSE
└── README.md
```

---

## Installation & Setup

### Prerequisites
- Python 3.12
- Node.js 18+
- Google Chrome
- ~2GB disk space (model downloads)

### 1. Backend

```bash
cd backend

# Create and activate virtual environment
python3.12 -m venv venv
source venv/bin/activate        # macOS/Linux
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt
pip install packaging            # required for spaCy on some setups

# Download spaCy language model
python -m spacy download en_core_web_lg

# Start the server
uvicorn main:app --reload --port 8000
```

> **First run note:** `unitary/toxic-bert` (~430MB) and `Falconsai/nsfw_image_detection` (~270MB) are downloaded automatically from HuggingFace on first startup and cached in `~/.cache/huggingface/`.

### 2. Chrome Extension

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `extension/` folder

The extension is now active on all websites.

**Set parental password:**
Click the extension icon → enter a password under "Parental control password" → Save.
Default password is `1234` if none is set.

### 3. Frontend (optional demo UI)

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/shield` | Redact PII from text |
| `POST` | `/analyze` | Detect grooming/manipulation in text |
| `POST` | `/check` | NSFW image classification |

### Example requests

```bash
# PII redaction
curl -X POST http://localhost:8000/shield \
  -H "Content-Type: application/json" \
  -d '{"text": "Hi, my name is John and my email is john@gmail.com"}'

# Grooming detection
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "Don'\''t tell your parents about us, you'\''re so special"}'
```

---

## Why Open Source?

All models run locally — no data is sent to any server. The grooming detection rules are plain regex patterns that anyone can read, audit, and improve. The open source model means:

- Parents and educators can verify exactly what is being flagged
- Communities can contribute new threat patterns and language support
- No vendor lock-in or trust required — inspect the code yourself

---

## Built For

**ExpressVPN x FOSSASIA Hackathon** — *"Secure by Design: Privacy-First Digital Safety for Young Users"*
