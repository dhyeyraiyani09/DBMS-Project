import { useState, useEffect } from 'react';
import { getSchemas, getSchema } from '../services/schemaApi';
import { analyzeQuery } from '../services/queryApi';
import { getRecommendations } from '../services/recommendationApi';
import { explainQuery } from '../services/explainApi';
import SimulationPipeline from '../components/Simulation/SimulationPipeline';

function QueryAnalyzer() {
    const [schemas, setSchemas] = useState([]);
    const [selectedSchema, setSelectedSchema] = useState('');
    const [query, setQuery] = useState('');
    
    // State for Simulation
    const [isSimulating, setIsSimulating] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [recommendations, setRecommendations] = useState(null);
    const [schemaData, setSchemaData] = useState(null);
    const [explainData, setExplainData] = useState(null);
    const [explainError, setExplainError] = useState(null);

    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

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
        setSchemaData(null);
        setExplainData(null);
        setExplainError(null);

        setIsSimulating(false);
        setIsLoading(true);

        if (!query.trim()) {
            setError("Please enter a SQL query.");
            setIsLoading(false);
            return;
        }

        try {
            const schemaId = selectedSchema ? parseInt(selectedSchema) : null;
            if (!schemaId) {
                throw new Error("A schema must be selected for full recommendations and simulation.");
            }

            const [analysisData, recData, fullSchema] = await Promise.all([
                analyzeQuery(query, schemaId),
                getRecommendations(query, schemaId),
                getSchema(schemaId)
            ]);
            
            setAnalysis(analysisData);
            setRecommendations(recData);
            setSchemaData(fullSchema);
            
            try {
                const expData = await explainQuery(query);
                setExplainData(expData);
            } catch (expErr) {
                setExplainError(expErr.message);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartSimulation = () => {
        setIsSimulating(true);
    };

    return (
        <div className="query-analyzer">
            <h2>SQL Query Analyzer & Index Simulation</h2>
            
            {!isSimulating ? (
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
                                <button type="submit" disabled={isLoading}>{isLoading ? 'Analyzing...' : 'Analyze Query'}</button>
                                <button type="button" onClick={() => {setQuery(''); setAnalysis(null); setRecommendations(null); setError(null);}} style={{ background: '#7f8c8d' }}>Clear</button>
                            </div>
                        </form>

                        {error && <div className="error-banner" style={{ marginTop: '1rem', background: '#f8d7da', padding: '1rem', borderRadius: '4px', color: '#721c24' }}>{error}</div>}

                        {analysis && recommendations && schemaData && (
                            <div className="ready-banner" style={{ marginTop: '2rem', padding: '2rem', background: '#d1ecf1', borderRadius: '6px', textAlign: 'center' }}>
                                <h3 style={{ color: '#0c5460', marginTop: 0 }}>Analysis Complete!</h3>
                                <p style={{ color: '#0c5460' }}>The engine has analyzed your query and generated index recommendations.</p>
                                <button 
                                    onClick={handleStartSimulation}
                                    style={{ background: '#0c5460', color: 'white', border: 'none', padding: '0.75rem 1.5rem', fontSize: '1.1rem', borderRadius: '4px', cursor: 'pointer', marginTop: '1rem' }}
                                >
                                    Start Interactive Simulation
                                </button>
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
            ) : (
                <SimulationPipeline 
                    query={query}
                    analysis={analysis}
                    recommendations={recommendations}
                    schemaData={schemaData}
                    explainData={explainData}
                    explainError={explainError}

                    onReset={() => setIsSimulating(false)}
                />
            )}
        </div>
    );
}

export default QueryAnalyzer;
