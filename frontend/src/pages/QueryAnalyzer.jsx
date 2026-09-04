import { useState, useEffect } from 'react';
import { getSchemas } from '../services/schemaApi';
import { analyzeQuery } from '../services/queryApi';
import { getRecommendations } from '../services/recommendationApi';

function QueryAnalyzer() {
    const [schemas, setSchemas] = useState([]);
    const [selectedSchema, setSelectedSchema] = useState('');
    const [query, setQuery] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [recommendations, setRecommendations] = useState(null);
    const [error, setError] = useState(null);

    const sampleQueries = [
        "SELECT * FROM users WHERE age > 25;",
        "SELECT id, name FROM orders WHERE user_id = 5 ORDER BY order_date DESC;",
        "SELECT u.name, o.order_date FROM users u JOIN orders o ON u.id = o.user_id WHERE u.id = 5;",
        "SELECT * FROM orders WHERE user_id = 5 AND order_date >= '2026-01-01' ORDER BY order_date DESC;",
        "SELECT * FROM users WHERE is_active = TRUE;"
    ];

    useEffect(() => {
        getSchemas().then(setSchemas).catch(e => console.error(e));
    }, []);

    const handleAnalyze = async (e) => {
        e.preventDefault();
        setError(null);
        setAnalysis(null);
        setRecommendations(null);
        if (!query.trim()) {
            setError("Please enter a SQL query.");
            return;
        }

        try {
            const schemaId = selectedSchema ? parseInt(selectedSchema) : null;
            const data = await analyzeQuery(query, schemaId);
            setAnalysis(data);
            
            if (schemaId) {
                try {
                    const recData = await getRecommendations(query, schemaId);
                    setRecommendations(recData);
                } catch (recErr) {
                    setError("Analyzer worked, but Recommendation Engine failed: " + recErr.message);
                }
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="query-analyzer">
            <h2>SQL Query Analyzer & Index Recommender</h2>
            
            <div className="layout">
                <div className="main-content" style={{ flex: 2 }}>
                    <form onSubmit={handleAnalyze}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label>Required Schema for Recommendations: </label>
                            <select value={selectedSchema} onChange={e => setSelectedSchema(e.target.value)}>
                                <option value="">Select a Schema...</option>
                                {schemas.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        
                        <textarea
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Enter SQL query here..."
                            rows="6"
                            style={{ width: '100%', padding: '0.5rem', fontFamily: 'monospace' }}
                        />
                        
                        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
                            <button type="submit">Analyze & Recommend</button>
                            <button type="button" onClick={() => {setQuery(''); setAnalysis(null); setRecommendations(null); setError(null);}} style={{ background: '#7f8c8d' }}>Clear</button>
                        </div>
                    </form>

                    {error && <div className="error-banner" style={{ marginTop: '1rem' }}>{error}</div>}

                    {recommendations && (
                        <div className="recommendations" style={{ marginTop: '2rem' }}>
                            <h3>INDEX RECOMMENDATIONS</h3>
                            <p><em>Recommendations are generated using a deterministic educational heuristic. They are not guaranteed performance predictions.</em></p>
                            
                            <h4>Recommended Indexes</h4>
                            {recommendations.recommendations.length === 0 ? <p>No new indexes recommended.</p> : (
                                recommendations.recommendations.map((r, i) => (
                                    <div key={i} style={{ background: '#d4edda', border: '1px solid #c3e6cb', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
                                        <h5 style={{ margin: '0 0 0.5rem 0', color: '#155724' }}>{r.table} ({r.columns.join(', ')})</h5>
                                        <p style={{ margin: '0 0 0.5rem 0' }}><strong>Score:</strong> {r.score} / 100</p>
                                        <p style={{ margin: '0 0 0.5rem 0' }}><strong>Why?</strong></p>
                                        <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                                            {r.factors.map((f, j) => (
                                                <li key={j}>{f.points > 0 ? '+' : ''}{f.points} {f.reason}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))
                            )}

                            <h4>Other Candidates & Existing Indexes</h4>
                            {recommendations.candidates.filter(c => c.status !== 'RECOMMENDED').length === 0 ? <p>None</p> : (
                                recommendations.candidates.filter(c => c.status !== 'RECOMMENDED').map((c, i) => (
                                    <div key={i} style={{ background: '#f8d7da', border: '1px solid #f5c6cb', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
                                        <h5 style={{ margin: '0 0 0.5rem 0', color: '#721c24' }}>{c.table} ({c.columns.join(', ')})</h5>
                                        <p style={{ margin: '0 0 0.5rem 0' }}><strong>Status:</strong> {c.status}</p>
                                        <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                                            {c.factors.map((f, j) => (
                                                <li key={j}>{f.points > 0 ? '+' : ''}{f.points} {f.reason}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {analysis && (
                        <div className="analysis-result" style={{ marginTop: '2rem' }}>
                            <h3>Analysis Result</h3>
                            <div style={{ background: '#ecf0f1', padding: '1rem', borderRadius: '4px' }}>
                                <p><strong>Query Type:</strong> {analysis.query_type}</p>
                                
                                <h4>Tables</h4>
                                {analysis.tables.length === 0 ? <p>None</p> : (
                                    <ul>
                                        {analysis.tables.map((t, i) => <li key={i}>{t.name} {t.alias ? `(alias: ${t.alias})` : ''}</li>)}
                                    </ul>
                                )}

                                <h4>WHERE Conditions</h4>
                                {analysis.where_conditions.length === 0 ? <p>None</p> : (
                                    <ul>
                                        {analysis.where_conditions.map((w, i) => (
                                            <li key={i}>
                                                <code>{w.expression_raw}</code> (<strong>{w.classification}</strong>)
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="sidebar" style={{ flex: 1 }}>
                    <h3>Sample Queries</h3>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {sampleQueries.map((sq, idx) => (
                            <li key={idx} style={{ marginBottom: '1rem' }}>
                                <button 
                                    onClick={() => setQuery(sq)}
                                    style={{ textAlign: 'left', width: '100%', background: '#fff', border: '1px solid #ccc', padding: '0.5rem', cursor: 'pointer' }}
                                >
                                    <code>{sq}</code>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default QueryAnalyzer;
