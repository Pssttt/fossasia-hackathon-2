from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import shield
import groom

app = FastAPI(title="PromptShield API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TextRequest(BaseModel):
    text: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/shield")
def shield_endpoint(body: TextRequest):
    return shield.redact(body.text)


@app.post("/analyze")
def analyze_endpoint(body: TextRequest):
    return groom.analyze(body.text)
