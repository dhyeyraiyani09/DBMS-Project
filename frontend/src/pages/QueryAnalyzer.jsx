import { useState, useEffect } from 'react';
import { getSchemas } from '../services/schemaApi';
import { analyzeQuery } from '../services/queryApi';

function QueryAnalyzer() {
    const [schemas, setSchemas] = useState([]);
    const [selectedSchema, setSelectedSchema] = useState('');
    const [query, setQuery] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [error, setError] = useState(null);

    const sampleQueries = [
        "SELECT * FROM users WHERE age > 25;",
        "SELECT id, name FROM orders WHERE user_id = 5 ORDER BY order_date DESC;",
        "SELECT u.name, o.order_date FROM users u JOIN orders o ON u.id = o.user_id WHERE u.id = 5;",
        "SELECT user_id, COUNT(*) FROM orders GROUP BY user_id HAVING COUNT(*) > 5;",
        "SELECT * FROM orders WHERE user_id = 5 AND order_date >= '2026-01-01' ORDER BY user_id ASC, order_date DESC;"
    ];

    useEffect(() => {
        getSchemas().then(setSchemas).catch(e => console.error(e));
    }, []);

    const handleAnalyze = async (e) => {
        e.preventDefault();
        setError(null);
        setAnalysis(null);
        if (!query.trim()) {
            setError("Please enter a SQL query.");
            return;
        }

        try {
            const data = await analyzeQuery(query, selectedSchema ? parseInt(selectedSchema) : null);
            setAnalysis(data);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="query-analyzer">
            <h2>SQL Query Analyzer</h2>
            
            <div className="layout">
                <div className="main-content" style={{ flex: 2 }}>
                    <form onSubmit={handleAnalyze}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label>Optional Schema Validation: </label>
                            <select value={selectedSchema} onChange={e => setSelectedSchema(e.target.value)}>
                                <option value="">None (Skip Validation)</option>
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
                            <button type="submit">Analyze Query</button>
                            <button type="button" onClick={() => {setQuery(''); setAnalysis(null); setError(null);}} style={{ background: '#7f8c8d' }}>Clear</button>
                        </div>
                    </form>

                    {error && <div className="error-banner" style={{ marginTop: '1rem' }}>{error}</div>}

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

                                <h4>Columns</h4>
                                {analysis.columns.length === 0 ? <p>None</p> : (
                                    <ul>
                                        {analysis.columns.map((c, i) => <li key={i}>{c.table ? `${c.table}.` : ''}{c.name}</li>)}
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

                                <h4>JOINs</h4>
                                {analysis.joins.length === 0 ? <p>None</p> : (
                                    <ul>
                                        {analysis.joins.map((j, i) => (
                                            <li key={i}>
                                                {j.join_type} {j.table} {j.alias ? `(${j.alias})` : ''} 
                                                {j.conditions.length > 0 && ` ON ${j.conditions[0].left} ${j.conditions[0].operator} ${j.conditions[0].right}`}
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                <h4>ORDER BY</h4>
                                {analysis.order_by.length === 0 ? <p>None</p> : (
                                    <ul>
                                        {analysis.order_by.map((o, i) => (
                                            <li key={i}>
                                                {o.sequence}. {o.table ? `${o.table}.` : ''}{o.column} <strong>{o.direction}</strong>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                <h4>GROUP BY</h4>
                                {analysis.group_by.length === 0 ? <p>None</p> : (
                                    <ul>
                                        {analysis.group_by.map((g, i) => (
                                            <li key={i}>{g.sequence}. {g.table ? `${g.table}.` : ''}{g.column}</li>
                                        ))}
                                    </ul>
                                )}
                                
                                <h4>HAVING</h4>
                                {analysis.having.length === 0 ? <p>None</p> : (
                                    <ul>
                                        {analysis.having.map((h, i) => (
                                            <li key={i}><code>{h.expression_raw}</code></li>
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
