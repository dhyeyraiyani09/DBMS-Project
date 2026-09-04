# Phase 9 Implementation

## 1. Objective
Add an AI Tutor and Innovation layer (Phase 9) seamlessly on top of the deterministic recommendation pipeline. The AI acts exclusively as an educational assistant and never replaces or manipulates the core scoring algorithm.

## 2. Architecture
- `backend/services/ai_tutor.py`: A decoupled AI provider adapter that maps structured HTTP requests natively.
- `backend/routers/ai_router.py`: Handles validation and exposure of the `/api/ai/tutor` endpoint.
- `frontend/src/components/AITutor/AITutor.jsx`: A self-contained, theme-aware React panel mapped to the Simulation pipeline view providing 6 distinct operational queries.

## 3. AI Provider Configuration
- Targets the `gemini-1.5-flash` model endpoint using standard Python `httpx` async calls.
- Driven by `GEMINI_API_KEY` stored entirely inside backend environment scopes (`.env.example` created). 
- Completely hides provider credentials from frontend bundles preventing key leaks securely.

## 4. AI Unavailable Fallback
- Safely degrades into deterministic offline explanations when `GEMINI_API_KEY` is not detected.
- Exposes strict disclaimers indicating "AI unavailable — showing built-in explanation" resolving natively avoiding 500 error loops.

## 5. Grounding & Deterministic Protection
- The engine serializes the `analysis`, `recommendations`, and `explain` properties mapping them tightly inside the AI prompt.
- Explicit System Rules prohibit altering deterministic scores, executing queries, or inventing missing EXPLAIN factors gracefully.

## 6. Innovation Feature (Learning Insight)
- Discovers a 2-3 sentence micro-insight natively linking the parsed SQL properties against the structural scoring logic smoothly.

## 7. Speech / Read Aloud
- Implemented via `window.speechSynthesis` natively avoiding paid third-party translation endpoints. Stops on toggle or unmount smoothly.

## 8. Security
- Payload constraints reject questions over 500 characters blocking LLM exhaustion attacks natively.
- Pydantic naturally blocks unauthorized keys cleanly.
- Strict REST API mapping ensures the AI engine possesses zero OS execution capabilities safely.

## 9. Testing & Visuals
- Backend unit tests (`test_ai_tutor.py`) validate expected structural layouts successfully.
- Light/Dark mode correctly passes `--var` properties into `.ai-tutor-panel` seamlessly preventing visual breakage loops.
- `AITutor` UI shrinks gracefully via Grid layouts accommodating Mobile breakpoints smoothly.
