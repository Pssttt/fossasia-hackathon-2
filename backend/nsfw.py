import io
import logging
import os
import tempfile
from concurrent.futures import ThreadPoolExecutor
from typing import Any

import cv2
from nudenet import NudeDetector
from PIL import Image
from transformers import pipeline

logger = logging.getLogger("nsfw")

logger.info("Loading NudeDetector model...")
_detector = NudeDetector()
logger.info("NudeDetector loaded")

logger.info("Loading Falconsai NSFW classifier...")
_classifier = pipeline(
    "image-classification",
    model="Falconsai/nsfw_image_detection",
    device=-1,
)
logger.info("Falconsai classifier loaded")

_executor = ThreadPoolExecutor(max_workers=2)

_NUDENET_CLASSES = {
    "ANUS_EXPOSED",
    "BUTTOCKS_EXPOSED",
    "FEMALE_BREAST_EXPOSED",
    "FEMALE_GENITALIA_EXPOSED",
    "MALE_GENITALIA_EXPOSED",
}
_NUDENET_THRESHOLD = 0.6
_FALCONSAI_UNSAFE = {"nsfw"}


def _run_nudenet(image_bytes: bytes, suffix: str) -> dict[str, Any]:
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(image_bytes)
            tmp_path = tmp.name

        mat = cv2.imread(tmp_path)
        if mat is None:
            raise ValueError("Image could not be decoded")

        detections = _detector.detect(tmp_path)
        findings = [
            d for d in detections
            if d.get("class") in _NUDENET_CLASSES and float(d.get("score", 0.0)) >= _NUDENET_THRESHOLD
        ]
        return {
            "is_explicit_nudity": len(findings) > 0,
            "findings": findings,
        }
    finally:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except OSError:
                pass


def _run_falconsai(image_bytes: bytes) -> dict[str, Any]:
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image.resize((224, 224), Image.BILINEAR)
    results = _classifier(image)
    top = max(results, key=lambda x: x["score"])
    return {
        "is_nsfw": top["label"] in _FALCONSAI_UNSAFE,
        "top_label": top["label"],
        "scores": {r["label"]: round(r["score"], 4) for r in results},
    }


def check(image_bytes: bytes, suffix: str = ".jpg") -> dict[str, Any]:
    nudenet_future = _executor.submit(_run_nudenet, image_bytes, suffix)
    falconsai_future = _executor.submit(_run_falconsai, image_bytes)
    nudenet_result = nudenet_future.result()
    falconsai_result = falconsai_future.result()

    safe_for_children = (
        not nudenet_result["is_explicit_nudity"] and not falconsai_result["is_nsfw"]
    )

    return {
        "safe_for_children": safe_for_children,
        "is_nsfw": not safe_for_children,
        "nudenet": nudenet_result,
        "falconsai": falconsai_result,
    }
