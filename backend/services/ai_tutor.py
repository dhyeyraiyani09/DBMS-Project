import os
import json
import httpx
from typing import Dict, Any

class AITutorService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
        
    async def process_request(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        action = request_data.get("action")
        question = request_data.get("question")
        
        # Validation
        valid_actions = ["explain_recommendation", "explain_explain", "teach_me", "why_not_this_index", "quiz_me", "learning_insight"]
        if action not in valid_actions:
            return {
                "success": False,
                "action": action,
                "provider": "unknown",
                "grounded": False,
                "error": "Invalid AI Tutor action."
            }
            
        if not self.api_key:
            return self._get_fallback_response(action)
            
        prompt = self._build_prompt(request_data)
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.endpoint}?key={self.api_key}",
                    json={
                        "contents": [{"parts": [{"text": prompt}]}],
                        "generationConfig": {
                            "temperature": 0.2,
                            "maxOutputTokens": 800
                        }
                    },
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    answer = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                    
                    return {
                        "success": True,
                        "answer": answer.strip(),
                        "action": action,
                        "provider": "gemini",
                        "grounded": True,
                        "error": None
                    }
                else:
                    return {
                        "success": False,
                        "answer": None,
                        "action": action,
                        "provider": "gemini",
                        "grounded": False,
                        "error": "AI Tutor is currently unavailable. Provider error."
                    }
        except Exception as e:
            return {
                "success": False,
                "answer": None,
                "action": action,
                "provider": "gemini",
                "grounded": False,
                "error": f"AI Tutor is currently unavailable. Network failure: {str(e)}"
            }
            
    def _build_prompt(self, request: Dict[str, Any]) -> str:
        action = request.get("action")
        context_str = json.dumps({
            "query_analysis": request.get("query_analysis"),
            "recommendation": request.get("recommendation"),
            "explain": request.get("explain")
        }, indent=2)
        
        system_rules = """
You are an educational DBMS indexing tutor.
The deterministic Index Recommendation Engine is the source of truth.
Never invent recommendation scores. Never invent candidate indexes. Never modify the recommendation.
Never claim an index was used unless EXPLAIN.key confirms it. Never claim possible_keys means an index was used.
Never claim exact performance improvement without measured evidence. Never invent schema information.
Never execute SQL. Never create or modify database indexes.
If information is unavailable, explicitly say that it is unavailable.
Clearly distinguish heuristic recommendation from MySQL EXPLAIN results.
Explain concepts at a student-friendly level.
Use concise, structured formatting.
"""

        if action == "explain_recommendation":
            return f"{system_rules}\nACTION: Explain Recommendation.\nCONTEXT:\n{context_str}\nExplain what the query does, why the index was generated (or not), the score breakdown, and explicitly state that this is a deterministic heuristic, not a guaranteed runtime optimization."
        elif action == "explain_explain":
            return f"{system_rules}\nACTION: Explain EXPLAIN.\nCONTEXT:\n{context_str}\nExplain the 'type', 'possible_keys', 'key', 'rows', and 'Extra' fields from the provided EXPLAIN result. Distinguish possible_keys from key."
        elif action == "learning_insight":
            return f"{system_rules}\nACTION: Learning Insight.\nCONTEXT:\n{context_str}\nProvide a concise 2-3 sentence educational insight based directly on the query filtering/sorting and the resulting recommendation."
        elif action == "teach_me":
            q = request.get("question", "Teach me about database indexing based on this query.")
            return f"{system_rules}\nACTION: Teach Me.\nCONTEXT:\n{context_str}\nUSER QUESTION: {q}\nProvide an educational answer."
        elif action == "why_not_this_index":
            q = request.get("question", "Why wasn't my expected index chosen?")
            return f"{system_rules}\nACTION: Why Not This Index.\nCONTEXT:\n{context_str}\nUSER QUESTION: {q}\nExplain using the candidate lists and deterministic score factors."
        elif action == "quiz_me":
            return f"{system_rules}\nACTION: Quiz Me.\nCONTEXT:\n{context_str}\nAsk exactly one educational multiple-choice question related to the concepts demonstrated by the current query or recommendation. Provide the correct answer and an explanation hidden below."
        
        return system_rules

    def _get_fallback_response(self, action: str) -> Dict[str, Any]:
        msg = "AI unavailable \u2014 showing built-in explanation.\n\n"
        
        if action == "explain_recommendation":
            msg += "The deterministic engine analyzes your query's WHERE, JOIN, and ORDER BY clauses. It assigns heuristic points (e.g., exact match = 10, range = 5) to possible index columns. It recommends the highest-scoring candidate if it beats a minimum threshold and isn't redundant."
        elif action == "explain_explain":
            msg += "MySQL EXPLAIN shows the physical execution path. 'type' indicates speed (const > ref > range > ALL). 'possible_keys' shows what MySQL considered, while 'key' shows the final choice. 'rows' is an estimate."
        elif action == "learning_insight":
            msg += "Learning Insight: Indexes are ordered left-to-right. Equality predicates usually benefit most from being the leftmost prefix of a composite index."
        else:
            msg += "Fallback explanation: The engine evaluated your query structure to deterministically map B-Tree capabilities. Please configure an AI Provider API key for dynamic educational responses."
            
        return {
            "success": True,
            "answer": msg,
            "action": action,
            "provider": "fallback",
            "grounded": True,
            "error": None
        }
