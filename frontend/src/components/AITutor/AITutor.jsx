import React, { useState, useEffect, useRef } from 'react';
import { askAITutor } from '../../services/aiApi';
import './AITutor.css';

export default function AITutor({ context }) {
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [customQuestion, setCustomQuestion] = useState("");
    const [isSpeaking, setIsSpeaking] = useState(false);
    const synthRef = useRef(window.speechSynthesis);

    useEffect(() => {
        // Stop speech when component unmounts or text changes
        return () => {
            if (synthRef.current) {
                synthRef.current.cancel();
            }
        };
    }, []);

    const handleAction = async (action, question = null) => {
        setLoading(true);
        setError(null);
        setResponse(null);
        if (synthRef.current) synthRef.current.cancel();
        setIsSpeaking(false);

        try {
            const data = await askAITutor(action, question, context);
            if (data.success) {
                setResponse(data);
            } else {
                setError(data.error || "AI Tutor is currently unavailable.");
                // If it's a built-in fallback response mapped to an error payload, show it gracefully
                if (data.answer) {
                    setResponse(data);
                    setError(null);
                }
            }
        } catch (err) {
            setError(err.message || "Failed to connect to AI service.");
        } finally {
            setLoading(false);
        }
    };

    const handleSpeak = () => {
        if (!response || !response.answer || !synthRef.current) return;
        
        if (isSpeaking) {
            synthRef.current.cancel();
            setIsSpeaking(false);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(response.answer);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        
        setIsSpeaking(true);
        synthRef.current.speak(utterance);
    };

    return (
        <div className="ai-tutor-panel">
            <div className="ai-tutor-header">
                <h3><span className="ai-badge">AI Tutor</span> Educational Assistant</h3>
            </div>

            <div className="ai-actions">
                <button 
                    className="ai-action-btn" 
                    onClick={() => handleAction('explain_recommendation')}
                    disabled={loading || !context?.recommendation}
                >
                    Explain Recommendation
                </button>
                <button 
                    className="ai-action-btn" 
                    onClick={() => handleAction('explain_explain')}
                    disabled={loading || !context?.explain}
                >
                    Explain EXPLAIN
                </button>
                <button 
                    className="ai-action-btn" 
                    onClick={() => handleAction('learning_insight')}
                    disabled={loading || !context?.recommendation}
                >
                    Learning Insight
                </button>
                <button 
                    className="ai-action-btn" 
                    onClick={() => handleAction('quiz_me')}
                    disabled={loading}
                >
                    Quiz Me
                </button>
                <button 
                    className="ai-action-btn" 
                    onClick={() => handleAction('why_not_this_index')}
                    disabled={loading || !context?.recommendation}
                >
                    Why Not Another Index?
                </button>
            </div>

            <div className="ai-input-group">
                <input 
                    type="text" 
                    placeholder="Ask a specific question about database indexing..."
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    disabled={loading}
                    onKeyDown={(e) => e.key === 'Enter' && customQuestion.trim() && handleAction('teach_me', customQuestion)}
                />
                <button 
                    onClick={() => handleAction('teach_me', customQuestion)}
                    disabled={loading || !customQuestion.trim()}
                >
                    Ask AI
                </button>
            </div>

            {loading && (
                <div className="ai-loading">
                    <span>AI Tutor is thinking...</span>
                </div>
            )}

            {error && !loading && (
                <div className="ai-error">
                    {error}
                </div>
            )}

            {response && response.answer && !loading && !error && (
                <div>
                    <span className="ai-provider-note">
                        {response.provider === 'fallback' 
                            ? "AI unavailable — showing built-in explanation" 
                            : "AI-generated educational interpretation"}
                    </span>
                    <div className="ai-response-area">
                        {synthRef.current && (
                            <div className="speech-controls">
                                <button className="speech-btn" onClick={handleSpeak} aria-label={isSpeaking ? "Stop reading" : "Read aloud"}>
                                    {isSpeaking ? '⏹ Stop' : '▶ Read Aloud'}
                                </button>
                            </div>
                        )}
                        {response.answer}
                    </div>
                </div>
            )}
        </div>
    );
}
