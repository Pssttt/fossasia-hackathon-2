from presidio_analyzer import AnalyzerEngine
from presidio_anonymizer import AnonymizerEngine

_analyzer = AnalyzerEngine()
_anonymizer = AnonymizerEngine()


def redact(text: str) -> dict:
    results = _analyzer.analyze(text=text, language="en")
    anonymized = _anonymizer.anonymize(text=text, analyzer_results=results)
    entities_found = [
        {"type": r.entity_type, "start": r.start, "end": r.end}
        for r in results
    ]
    return {
        "redacted_text": anonymized.text,
        "entities_found": entities_found,
    }
