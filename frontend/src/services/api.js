const API_URL = 'http://127.0.0.1:8000/api';

export const checkBackendHealth = async () => {
    try {
        const response = await fetch(`${API_URL}/health`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error("Backend health check failed:", error);
        return { status: "error", message: error.message };
    }
};
