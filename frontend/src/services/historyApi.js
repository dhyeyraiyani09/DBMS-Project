import { API_URL } from './schemaApi';

export const saveHistory = async (historyData) => {
    const response = await fetch(`${API_URL}/history/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(historyData)
    });
    if (!response.ok) {
        throw new Error('Failed to save history');
    }
    return await response.json();
};

export const listHistory = async () => {
    const response = await fetch(`${API_URL}/history/`);
    if (!response.ok) {
        throw new Error('Failed to fetch history list');
    }
    return await response.json();
};

export const getHistory = async (id) => {
    const response = await fetch(`${API_URL}/history/${id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch history details');
    }
    return await response.json();
};

export const deleteHistory = async (id) => {
    const response = await fetch(`${API_URL}/history/${id}`, {
        method: 'DELETE'
    });
    if (!response.ok) {
        throw new Error('Failed to delete history');
    }
    return await response.json();
};

export const getReportUrl = (id, format) => {
    return `${API_URL}/history/${id}/report?format=${format}`;
};
