import { API_URL } from './schemaApi';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const getRecommendations = async (query, schemaId) => {
    const res = await fetch(`${BASE_URL}/recommendations/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, schema_id: schemaId })
    });
    if (!res.ok) {
        let errStr = 'Failed to get recommendations';
        try {
            const data = await res.json();
            errStr = data.detail || errStr;
        } catch (e) {}
        throw new Error(errStr);
    }
    return res.json();
};
