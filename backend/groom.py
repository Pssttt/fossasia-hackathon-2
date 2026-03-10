import re
from transformers import pipeline

_classifier = pipeline("text-classification", model="unitary/toxic-bert")

_TOXICITY_THRESHOLD = 0.5

# Grooming-specific patterns (rule-based layer)
_GROOMING_PATTERNS = [
    (r"don.?t tell (your )?(parents|mom|dad|family|anyone)", "Attempts to isolate from family"),
    (r"keep (this|it|our|a) secret", "Requests secrecy"),
    (r"our (little )?secret", "Requests secrecy"),
    (r"mature for your age", "Inappropriate age-related flattery"),
    (r"special.{0,20}(person|one|relationship|bond|connection)", "Inappropriate special relationship language"),
    (r"(love|care).{0,30}(more than anyone|special way)", "Inappropriate expressions of affection"),
    (r"(no ?one|nobody).{0,20}understand(s)? you like", "Isolation language"),
    (r"trust me more than", "Undermining other relationships"),
    (r"between (just )?us", "Secrecy / isolation language"),
    (r"don.?t tell (anyone|anybody)", "Requests secrecy"),
]


def _check_patterns(text: str):
    lower = text.lower()
    for pattern, reason in _GROOMING_PATTERNS:
        if re.search(pattern, lower):
            return reason
    return None


def analyze(text: str) -> dict:
    # Rule-based check first
    pattern_reason = _check_patterns(text)
    if pattern_reason:
        return {
            "flagged": True,
            "label": "grooming",
            "score": 1.0,
            "reason": pattern_reason,
        }

    # ML-based toxicity check
    result = _classifier(text)[0]
    label: str = result["label"].lower()
    score: float = result["score"]
    flagged = score > _TOXICITY_THRESHOLD
    return {
        "flagged": flagged,
        "label": label,
        "score": round(score, 4),
        "reason": "Toxic content detected" if flagged else None,
    }
