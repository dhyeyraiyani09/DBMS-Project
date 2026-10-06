import { API_URL } from './schemaApi'; // Or define it again

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const analyzeQuery = async (query, schemaId = null) => {
    const res = await fetch(`${BASE_URL}/queries/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, schema_id: schemaId })
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Failed to analyze query');
    return res.json();
};
