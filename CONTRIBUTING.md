# Contributing to PromptShield + AIGroomDetect

Thank you for your interest in contributing! This project is open source and community-driven — contributions of all kinds are welcome.

---

## Ways to Contribute

- **Add grooming/manipulation patterns** — improve detection coverage in `backend/groom.py`
- **Add new PII entity types** — extend Presidio recognizers in `backend/shield.py`
- **Support more languages** — spaCy and Presidio support multiple languages
- **Support more browsers** — port the extension to Firefox (Manifest V2/V3)
- **Improve the UI** — frontend demo in `frontend/`
- **Report false positives/negatives** — open an issue with the example text
- **Documentation** — fix typos, improve clarity, add translations

---

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/expresshackathon.git
   cd expresshackathon
   ```
3. Set up the backend (see [README.md](./README.md#installation--setup))
4. Create a new branch:
   ```bash
   git checkout -b feat/your-feature-name
   ```
5. Make your changes
6. Test locally
7. Open a pull request

---

## Adding Grooming Patterns

The pattern list lives in `backend/groom.py` under `_GROOMING_PATTERNS`. Each entry is a tuple of `(regex_pattern, human_readable_reason)`:

```python
(r"your pattern here", "Reason shown to user"),
```

Guidelines:
- Patterns should be specific enough to avoid false positives
- Use case-insensitive matching (the text is lowercased before matching)
- Include the reason string in plain language suitable for a young user's parent
- Test your pattern against both positive and negative examples before submitting

---

## Code Style

- Python: follow [PEP 8](https://peps.python.org/pep-0008/), no external formatter required
- JavaScript: 2-space indent, single quotes
- Keep functions small and focused
- No unnecessary dependencies

---

## Reporting Issues

Open an issue on GitHub with:
- A clear description of the problem
- Steps to reproduce
- Expected vs actual behaviour
- Your OS and Python/Node version

For false positives or missed detections, include the example text (anonymised if needed).

---

## Code of Conduct

Be respectful. This project deals with sensitive topics (child safety, abuse patterns). Contributions should be made in good faith and with the safety of young users as the priority.

---

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
