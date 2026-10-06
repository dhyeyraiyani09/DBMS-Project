import { useState, useEffect } from 'react';
import { getSchemas, getSchema } from '../services/schemaApi';
import { analyzeQuery } from '../services/queryApi';
import { getRecommendations } from '../services/recommendationApi';
import { explainQuery } from '../services/explainApi';
import { saveHistory } from '../services/historyApi';
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

    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const sampleQueries = [
        { label: "PK Lookup", sql: "SELECT * FROM users WHERE id = 3;" },
        { label: "Range Query", sql: "SELECT * FROM users WHERE age > 25;" },
        { label: "Composite + Order", sql: "SELECT id, name FROM orders WHERE user_id = 5 ORDER BY order_date DESC;" },
        { label: "JOIN Query", sql: "SELECT u.name, o.order_date FROM users u JOIN orders o ON u.id = o.user_id WHERE u.id = 5;" },
        { label: "Low Selectivity", sql: "SELECT * FROM users WHERE is_active = TRUE;" },
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
        setSaveSuccess(false);
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
                const expData = await explainQuery(query, schemaId);
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

    const handleSaveHistory = async () => {
        try {
            setIsSaving(true);
            const payload = {
                title: "Saved SQL Analysis",
                schema_id: selectedSchema ? parseInt(selectedSchema) : null,
                query: query,
                analysis_result: analysis,
                recommendation_result: recommendations,
                explain_result: explainData ? explainData : (explainError ? { success: false, error: explainError } : null)
            };
            await saveHistory(payload);
            setSaveSuccess(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="query-analyzer">
            <h2>SQL Query Analyzer &amp; Index Simulation</h2>

            {!isSimulating ? (
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    {/* Main form column */}
                    <div style={{ flex: 2, minWidth: 0 }}>
                        <form onSubmit={handleAnalyze}>
                            {/* Schema selector */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label htmlFor="schema-select">Schema for Recommendations</label>
                                <select
                                    id="schema-select"
                                    value={selectedSchema}
                                    onChange={e => setSelectedSchema(e.target.value)}
                                    style={{ width: '100%' }}
                                >
                                    <option value="">Select a schema...</option>
                                    {schemas.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>

                            {/* SQL textarea — styled as code editor */}
                            <div style={{ marginBottom: '0.75rem' }}>
                                <label htmlFor="sql-input">SQL Query</label>
                                <textarea
                                    id="sql-input"
                                    value={query}
                                    onChange={e => setQuery(e.target.value)}
                                    placeholder="-- Enter SQL query here, e.g.:&#10;SELECT * FROM users WHERE age > 25;"
                                    rows={7}
                                    style={{
                                        width: '100%',
                                        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                                        fontSize: '0.9rem',
                                        lineHeight: '1.7',
                                        background: 'var(--code-bg)',
                                        color: 'var(--code-text)',
                                        border: '1px solid var(--code-border)',
                                        borderRadius: 'var(--radius-md)',
                                        padding: '1rem 1.25rem',
                                        boxSizing: 'border-box',
                                        resize: 'vertical',
                                        outline: 'none',
                                        boxShadow: 'var(--shadow-sm)',
                                        transition: 'border-color 0.15s, box-shadow 0.15s',
                                    }}
                                    onFocus={e => {
                                        e.target.style.borderColor = 'var(--accent)';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.15)';
                                    }}
                                    onBlur={e => {
                                        e.target.style.borderColor = 'var(--code-border)';
                                        e.target.style.boxShadow = 'var(--shadow-sm)';
                                    }}
                                />
                            </div>

                            {/* Action buttons */}
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                                    {isLoading ? '⏳ Analyzing...' : '🔍 Analyze Query'}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setQuery('');
                                        setAnalysis(null);
                                        setRecommendations(null);
                                        setError(null);
                                        setSaveSuccess(false);
                                    }}
                                >
                                    Clear
                                </button>
                            </div>
                        </form>

                        {/* Error display */}
                        {error && (
                            <div className="error-banner" style={{ marginTop: '1rem' }}>
                                {error}
                            </div>
                        )}

                        {/* Analysis complete — ready for simulation */}
                        {analysis && recommendations && schemaData && (
                            <div style={{
                                marginTop: '1.5rem',
                                padding: '1.5rem',
                                background: 'var(--accent-light)',
                                border: '1px solid var(--accent)',
                                borderLeft: '4px solid var(--accent)',
                                borderRadius: 'var(--radius-md)',
                            }}>
                                <h3 style={{ color: 'var(--accent)', marginTop: 0, marginBottom: '0.5rem' }}>
                                    ✓ Analysis Complete
                                </h3>
                                <p style={{ margin: '0 0 1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                    The engine has analyzed your query and generated index recommendations. Start the interactive simulation to walk through all 10 stages.
                                </p>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    <button
                                        onClick={handleStartSimulation}
                                        className="btn btn-primary btn-lg"
                                    >
                                        ▶ Start Interactive Simulation
                                    </button>
                                    <button
                                        onClick={handleSaveHistory}
                                        disabled={isSaving || saveSuccess}
                                        className={`btn btn-lg ${saveSuccess ? 'btn-success' : 'btn-secondary'}`}
                                    >
                                        {isSaving ? '⏳ Saving...' : (saveSuccess ? '✓ Saved to History' : '💾 Save Analysis')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sample queries sidebar */}
                    <div style={{ flex: 1, minWidth: 220, maxWidth: 320 }}>
                        <div style={{
                            background: 'var(--surface-raised, var(--table-header-bg))',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                            overflow: 'hidden',
                        }}>
                            <div style={{
                                padding: '0.65rem 1rem',
                                borderBottom: '1px solid var(--border)',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.07em',
                                color: 'var(--text-muted)',
                            }}>
                                Sample Queries
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {sampleQueries.map((sq, idx) => (
                                    <li key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <button
                                            onClick={() => setQuery(sq.sql)}
                                            style={{
                                                display: 'block',
                                                width: '100%',
                                                textAlign: 'left',
                                                background: 'transparent',
                                                border: 'none',
                                                padding: '0.7rem 1rem',
                                                cursor: 'pointer',
                                                transition: 'background 0.15s',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'var(--sidebar-hover)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <div style={{
                                                fontSize: '0.72rem',
                                                fontWeight: 700,
                                                color: 'var(--accent)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.04em',
                                                marginBottom: '0.2rem',
                                            }}>
                                                {sq.label}
                                            </div>
                                            <code style={{
                                                fontSize: '0.76rem',
                                                display: 'block',
                                                color: 'var(--text-secondary)',
                                                background: 'transparent',
                                                border: 'none',
                                                padding: 0,
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                fontFamily: "'JetBrains Mono', monospace",
                                            }}>
                                                {sq.sql}
                                            </code>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
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
