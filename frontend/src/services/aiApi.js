const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const askAITutor = async (action, question, context) => {
    const res = await fetch(`${BASE_URL}/ai/tutor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action,
            question,
            query_analysis: context?.analysis,
            recommendation: context?.recommendation,
            explain: context?.explain,
            schema_metadata: context?.schema
        })
    });
    
    if (!res.ok) throw new Error((await res.json()).detail || 'Failed to communicate with AI Tutor.');
    return res.json();
};
