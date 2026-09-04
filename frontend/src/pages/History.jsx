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
        if (!window.confirm("Are you sure you want to delete this analysis record?")) return;
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

    const getStatusBadge = (rec) => {
        if (!rec || !rec.recommendations) return null;
        const hasRec = rec.recommendations.length > 0;
        return (
            <span className={`status-badge ${hasRec ? 'status-connected' : ''}`}
                style={!hasRec ? { background: 'var(--surface-raised, var(--table-header-bg))', color: 'var(--text-muted)' } : {}}>
                {hasRec ? 'Recommended' : 'No New Index'}
            </span>
        );
    };

    const renderDetail = () => {
        if (!selectedHistory) return null;
        const h = selectedHistory;

        return (
            <div className="history-detail" style={{ marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div>
                        <h3 style={{ margin: 0 }}>Analysis #{h.id}</h3>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            {h.title || 'Untitled'} · {new Date(h.created_at).toLocaleString()}
                        </div>
                    </div>
                    <div className="download-actions">
                        <a href={getReportUrl(h.id, 'txt')} target="_blank" rel="noreferrer">TXT</a>
                        <a href={getReportUrl(h.id, 'docx')} target="_blank" rel="noreferrer">DOCX</a>
                        <a href={getReportUrl(h.id, 'pdf')} target="_blank" rel="noreferrer">PDF</a>
                    </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                    <h5>SQL Query</h5>
                    <pre style={{ margin: 0 }}>{h.query}</pre>
                </div>

                {h.analysis_result && (
                    <div style={{ marginBottom: '1.25rem' }}>
                        <h5>Query Analysis</h5>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {h.analysis_result.tables?.map((t, i) => (
                                <span key={i} style={{
                                    background: 'var(--accent-light)',
                                    color: 'var(--accent)',
                                    padding: '0.2rem 0.65rem',
                                    borderRadius: '9999px',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    fontFamily: 'monospace',
                                }}>
                                    {t.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {h.recommendation_result?.candidates?.length > 0 && (
                    <div style={{ marginBottom: '1.25rem' }}>
                        <h5>Candidate Indexes</h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {h.recommendation_result.candidates.map((c, i) => (
                                <div key={i} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '0.6rem 1rem',
                                    background: 'var(--surface-raised, var(--table-header-bg))',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '0.875rem',
                                }}>
                                    <code style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text-primary)' }}>
                                        {c.table}({c.columns.join(', ')})
                                    </code>
                                    <span style={{ fontWeight: 700, color: 'var(--success)' }}>Score: {c.score}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {h.recommendation_result?.recommendations?.length > 0 ? (
                    <div style={{ marginBottom: '1.25rem' }}>
                        <h5>Final Recommendation</h5>
                        {h.recommendation_result.recommendations.map((r, i) => (
                            <div key={i} style={{
                                padding: '0.85rem 1rem',
                                background: 'var(--success-light)',
                                border: '1px solid var(--success)',
                                borderLeft: '3px solid var(--success)',
                                borderRadius: 'var(--radius-sm)',
                                marginBottom: '0.5rem',
                                fontSize: '0.875rem',
                            }}>
                                <code style={{ background: 'none', border: 'none', padding: 0, color: 'var(--success)', fontWeight: 700 }}>
                                    {r.table}({r.columns.join(', ')})
                                </code>
                                <span style={{ marginLeft: '1rem', color: 'var(--text-secondary)' }}>Score: {r.score}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ marginBottom: '1.25rem', padding: '0.85rem 1rem', background: 'var(--surface-raised, var(--table-header-bg))', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        No new index recommended (existing indexes provide coverage or score below threshold).
                    </div>
                )}

                {h.explain_result && h.explain_result.success && (
                    <div style={{ marginBottom: '1.25rem' }}>
                        <h5>MySQL EXPLAIN</h5>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="explain-table" style={{ fontSize: '0.85rem' }}>
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
                                            <td><strong>{row.table || 'NULL'}</strong></td>
                                            <td>
                                                <span style={{ background: 'var(--accent-light)', color: 'var(--accent)', padding: '0.1rem 0.45rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 700, fontFamily: 'monospace' }}>
                                                    {row.type || 'NULL'}
                                                </span>
                                            </td>
                                            <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{row.possible_keys || 'NULL'}</td>
                                            <td><strong style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: row.key ? 'var(--accent)' : 'var(--text-muted)' }}>{row.key || 'NULL'}</strong></td>
                                            <td>{row.rows || 'NULL'}</td>
                                            <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{row.Extra || 'NULL'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <div className="educational-note">
                    <strong>Note:</strong> Heuristic recommendation scores reflect the project's deterministic algorithm
                    (Equality +30, JOIN +25, Range +20, ORDER BY +20, GROUP BY +15). They are independent of MySQL's
                    optimizer cost model. Actual execution timing requires physical benchmarking.
                </div>
            </div>
        );
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h2>Analysis History</h2>
                <button className="btn btn-secondary btn-sm" onClick={fetchHistoryList}>
                    ↻ Refresh
                </button>
            </div>

            {error && <div className="error-banner">{error}</div>}

            {loading && !selectedHistory ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Loading history...
                </div>
            ) : historyList.length === 0 ? (
                <div style={{
                    padding: '3rem 2rem',
                    textAlign: 'center',
                    background: 'var(--surface-raised, var(--table-header-bg))',
                    border: '1px dashed var(--border)',
                    borderRadius: 'var(--radius-md)',
                }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📋</div>
                    <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>No saved analyses yet</h3>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        Run a query in the SQL Analyzer and click "Save Analysis" to see it here.
                    </p>
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: 50 }}>ID</th>
                                <th>Date</th>
                                <th>Title</th>
                                <th>Query Preview</th>
                                <th>Status</th>
                                <th style={{ width: 140 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {historyList.map(h => (
                                <tr key={h.id} className="history-table-row">
                                    <td style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.82rem' }}>#{h.id}</td>
                                    <td style={{ fontSize: '0.82rem', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                                        {new Date(h.created_at).toLocaleString()}
                                    </td>
                                    <td style={{ fontWeight: 500 }}>{h.title || 'Untitled'}</td>
                                    <td>
                                        <code style={{ fontSize: '0.78rem', background: 'var(--surface-raised, var(--table-header-bg))', border: 'none', color: 'var(--text-secondary)', maxWidth: '220px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {h.query_preview}
                                        </code>
                                    </td>
                                    <td>
                                        {getStatusBadge(h.recommendation_result)}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                                            <button
                                                onClick={() => handleView(h.id)}
                                                className="btn btn-secondary btn-sm"
                                            >
                                                View
                                            </button>
                                            <button
                                                onClick={() => handleDelete(h.id)}
                                                className="btn btn-danger btn-sm"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {renderDetail()}
        </div>
    );
}
