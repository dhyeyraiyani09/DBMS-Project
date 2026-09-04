# AI Development Strategy

This project will be developed using **Google Antigravity** with AI assistance. To ensure academic integrity and deep understanding of the DBMS concepts, the following rules and workflows apply.

## 1. Allowed AI Usage
AI may assist with:
- Boilerplate code generation (React setup, FastAPI scaffolding).
- Refactoring and code cleanup.
- Documentation formatting.
- Debugging syntax errors or environment issues.
- Generating unit tests for deterministic functions.
- UI layout generation (CSS/Tailwind).
- Drafting educational explanations for the 'Learn' page.

## 2. Strict AI Limitations
- **The student must fully understand all generated code** and be able to explain it during the DA1 review.
- The core DBMS recommendation logic (heuristic scoring algorithm) must be deterministic and understandable. **AI must NOT be used to magically make the recommendation decision dynamically at runtime.**
- AI must not be used to bypass learning the core SQL parsing and execution plan analysis concepts.

## 3. AI Usage Log Format

To maintain transparency, a log of significant AI interactions will be kept in this format:

```text
Date: [YYYY-MM-DD]
Phase: [Phase Number]
Prompt: [Brief description of what was asked]
AI Tool: [e.g., Google Antigravity, Gemini]
Output: [Summary of what the AI produced]
What was accepted: [Which parts of the code/design were used]
What was modified: [What the student changed and why]
Reason: [Why AI was used - e.g., "To generate boilerplate FastApi routes"]
Testing performed: [How the generated code was verified]
```
