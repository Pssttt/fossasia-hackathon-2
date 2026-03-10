# PromptShield + AIGroomDetect

> "We didn't build a product you have to trust — we built a system you can verify."

A privacy-first AI safety tool for young users. Protects both directions of AI conversations: redacting sensitive data before it leaves your device, and flagging manipulative content before it reaches you.

## What it does

- **PromptShield** — Intercepts and redacts PII (names, emails, phone numbers, etc.) from your prompts before they reach any AI chatbot. All detection runs locally using Microsoft Presidio + spaCy. Nothing is sent to the cloud.
- **AIGroomDetect** — Analyzes AI and chat responses for grooming and manipulation patterns in real time, flagging suspicious content with a confidence score before you read it.

## Why open source?

All inference runs locally — no data ever leaves your device. Because the models and detection rules are open source and auditable, anyone can inspect what's being flagged and why. The community can improve threat patterns, add new entity types, and adapt the tool for different languages and contexts. Trust through transparency, not through promises.

## Stack

- **Frontend**: React + Vite
- **Backend**: Python FastAPI
- **PII Redaction**: Microsoft Presidio + spaCy (`en_core_web_lg`)
- **Manipulation Detection**: HuggingFace Transformers (`unitary/toxic-bert`)
- **All inference**: local, no external API calls

## Running locally

### Backend

```bash
cd backend
pip install -r requirements.txt
python -m spacy download en_core_web_lg
uvicorn main:app --reload --port 8000
```

> **Note**: First run downloads the `unitary/toxic-bert` model (~430MB) to `~/.cache/huggingface/`. This happens once.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## How it works

1. User types a prompt in the chat UI
2. **PromptShield** sends the text to `/api/shield` — Presidio detects and redacts PII locally
3. The redacted version is shown in the chat with a badge listing what was removed
4. A mock AI reply is generated (rotate through canned responses for demo)
5. **AIGroomDetect** sends the reply to `/api/analyze` — toxic-bert classifies it locally
6. If flagged, a warning banner appears below the message with the reason and confidence score

## Built for

**ExpressVPN x FOSSASIA Hackathon** — "Secure by Design: Privacy-First Digital Safety for Young Users"
