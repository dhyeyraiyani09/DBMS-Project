import { API_URL } from './schemaApi';

export const explainQuery = async (query) => {
    const res = await fetch(`${API_URL}/explain/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
    });
    if (!res.ok) {
        const errorText = await res.text();
        let errorMessage = 'Failed to fetch EXPLAIN plan';
        try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.detail || errorMessage;
        } catch (e) {}
        throw new Error(errorMessage);
    }
    return res.json();
};
