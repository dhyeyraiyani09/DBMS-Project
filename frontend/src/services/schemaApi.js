const API_URL = 'http://127.0.0.1:8000/api';

export const getSchemas = async () => {
    const res = await fetch(`${API_URL}/schemas/`);
    if (!res.ok) throw new Error('Failed to fetch schemas');
    return res.json();
};

export const createSchema = async (data) => {
    const res = await fetch(`${API_URL}/schemas/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};

export const getSchema = async (id) => {
    const res = await fetch(`${API_URL}/schemas/${id}`);
    if (!res.ok) throw new Error('Failed to fetch schema');
    return res.json();
};

export const createTable = async (schemaId, data) => {
    const res = await fetch(`${API_URL}/schemas/${schemaId}/tables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};

export const createColumn = async (tableId, data) => {
    const res = await fetch(`${API_URL}/schemas/tables/${tableId}/columns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};

export const createForeignKey = async (tableId, data) => {
    const res = await fetch(`${API_URL}/schemas/tables/${tableId}/foreign-keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};

export const createIndex = async (tableId, data) => {
    const res = await fetch(`${API_URL}/schemas/tables/${tableId}/indexes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};
