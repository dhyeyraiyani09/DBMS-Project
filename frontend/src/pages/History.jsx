import React, { useState, useEffect } from 'react';
import { listHistory, getHistory, deleteHistory, getReportUrl } from '../services/historyApi';

export default function HistoryPage() {
    const [historyList, setHistoryList] = useState([]);
    const [selectedHistory, setSelectedHistory] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchHistoryList();
    }, []);

    const fetchHistoryList = async () => {
        try {
            setLoading(true);
            const data = await listHistory();
            setHistoryList(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleView = async (id) => {
        try {
            setLoading(true);
            const data = await getHistory(id);
            setSelectedHistory(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this history?")) return;
        try {
            await deleteHistory(id);
            if (selectedHistory && selectedHistory.id === id) {
                setSelectedHistory(null);
            }
            fetchHistoryList();
        } catch (err) {
            setError(err.message);
        }
    };

    const renderDetail = () => {
        if (!selectedHistory) return null;
        const h = selectedHistory;
        
        return (
            <div className="history-detail" style={{ marginTop: '2rem', padding: '1rem', borderTop: '1px solid #ddd' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>Analysis Details (ID: {h.id})</h2>
                    <div>
                        <a href={getReportUrl(h.id, 'txt')} className="btn btn-secondary" style={{ marginRight: '0.5rem' }}>TXT</a>
                        <a href={getReportUrl(h.id, 'docx')} className="btn btn-secondary" style={{ marginRight: '0.5rem' }}>DOCX</a>
                        <a href={getReportUrl(h.id, 'pdf')} className="btn btn-secondary">PDF</a>
                    </div>
                </div>
                <p><strong>Title:</strong> {h.title || 'Untitled'}</p>
                <p><strong>Date:</strong> {new Date(h.created_at).toLocaleString()}</p>
                
                <h3>1. Input SQL</h3>
                <pre>{h.query}</pre>

                <h3>2. Query Analysis</h3>
                {h.analysis_result ? (
                    <pre>{JSON.stringify(h.analysis_result.tables, null, 2)}</pre>
                ) : <p>No query analysis recorded.</p>}

                <h3>3. Candidate Indexes</h3>
                {h.recommendation_result?.candidates ? (
                    <ul>
                        {h.recommendation_result.candidates.map((c, i) => (
                            <li key={i}>{c.table}({c.columns.join(', ')}) - Score: {c.score}</li>
                        ))}
                    </ul>
                ) : <p>No candidates generated.</p>}

                <h3>4. Final Recommendation</h3>
                {h.recommendation_result?.recommendations?.length > 0 ? (
                    <ul>
                        {h.recommendation_result.recommendations.map((r, i) => (
                            <li key={i}>{r.table}({r.columns.join(', ')}) - Score: {r.score}</li>
                        ))}
                    </ul>
                ) : <p>No new index recommended.</p>}

                <h3>5. MySQL EXPLAIN</h3>
                {h.explain_result && h.explain_result.success ? (
                    <table className="explain-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th>Table</th>
                                <th>Type</th>
                                <th>Possible Keys</th>
                                <th>Key</th>
                                <th>Rows</th>
                                <th>Extra</th>
                            </tr>
                        </thead>
                        <tbody>
                            {h.explain_result.explain_rows.map((row, i) => (
                                <tr key={i}>
                                    <td>{row.table || 'NULL'}</td>
                                    <td>{row.type || 'NULL'}</td>
                                    <td>{row.possible_keys || 'NULL'}</td>
                                    <td>{row.key || 'NULL'}</td>
                                    <td>{row.rows || 'NULL'}</td>
                                    <td>{row.Extra || 'NULL'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : <p>EXPLAIN was not available for this analysis.</p>}
                
                <div className="educational-note" style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
                    <p><strong>Educational Note:</strong> Heuristic recommendation scores are distinct from the MySQL optimizer's EXPLAIN information. Actual execution timing (measured in ms) is not included unless physically benchmarked.</p>
                </div>
            </div>
        );
    };

    return (
        <div>
            <h2>Analysis History</h2>
            {error && <div className="error-message">{error}</div>}
            
            {loading && !selectedHistory ? (
                <p>Loading history...</p>
            ) : historyList.length === 0 ? (
                <p>No saved analyses yet.</p>
            ) : (
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #ccc' }}>
                            <th>ID</th>
                            <th>Date</th>
                            <th>Title</th>
                            <th>Query Preview</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {historyList.map(h => (
                            <tr key={h.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td>{h.id}</td>
                                <td>{new Date(h.created_at).toLocaleString()}</td>
                                <td>{h.title || 'Untitled'}</td>
                                <td>{h.query_preview}</td>
                                <td>
                                    <button onClick={() => handleView(h.id)} className="btn btn-primary" style={{ marginRight: '0.5rem' }}>View</button>
                                    <button onClick={() => handleDelete(h.id)} className="btn btn-danger">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {renderDetail()}
        </div>
    );
}
