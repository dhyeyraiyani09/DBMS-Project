import React from 'react';

// STEP 0
export const StepSQLQuery = ({ query }) => (
    <div className="step-container fade-in">
        <h4>Input Query</h4>
        <div className="code-panel">
            <code>{query}</code>
        </div>
        <p className="step-explanation">
            This is the raw SQL query submitted by the user. In the next step, the engine will parse this string into a structured Abstract Syntax Tree (AST).
        </p>
    </div>
);

// STEP 1
export const StepParseQuery = ({ analysis }) => (
    <div className="step-container fade-in">
        <h4>AST Parsing</h4>
        <div className="parsed-summary">
            <p><strong>Query Type:</strong> {analysis.query_type}</p>
            <p><strong>Tables Detected:</strong> {analysis.tables.map(t => t.name).join(', ') || 'None'}</p>
            <p><strong>Columns Referenced:</strong> {analysis.columns.map(c => c.name).join(', ') || 'None'}</p>
        </div>
        <p className="step-explanation">
            The parser dynamically breaks the query down into distinct elements, allowing the engine to analyze intent without executing the query against the real database.
        </p>
    </div>
);

// STEP 2
export const StepDetectOperations = ({ analysis }) => {
    return (
        <div className="step-container fade-in">
            <h4>Clause Detection</h4>
            <div className="operations-grid">
                {analysis.where_conditions.length > 0 && (
                    <div className="op-card">
                        <h5>WHERE Clauses</h5>
                        <ul>
                            {analysis.where_conditions.map((w, i) => (
                                <li key={i}><code>{w.expression_raw}</code> ({w.classification})</li>
                            ))}
                        </ul>
                    </div>
                )}
                {analysis.joins.length > 0 && (
                    <div className="op-card">
                        <h5>JOIN Clauses</h5>
                        <ul>
                            {analysis.joins.map((j, i) => (
                                <li key={i}>{j.join_type} on {j.table}</li>
                            ))}
                        </ul>
                    </div>
                )}
                {analysis.order_by.length > 0 && (
                    <div className="op-card">
                        <h5>ORDER BY Clauses</h5>
                        <ul>
                            {analysis.order_by.map((o, i) => (
                                <li key={i}>{o.column} ({o.direction})</li>
                            ))}
                        </ul>
                    </div>
                )}
                {analysis.group_by.length > 0 && (
                    <div className="op-card">
                        <h5>GROUP BY Clauses</h5>
                        <ul>
                            {analysis.group_by.map((g, i) => (
                                <li key={i}>{g.column}</li>
                            ))}
                        </ul>
                    </div>
                )}
                
                {analysis.where_conditions.length === 0 && analysis.joins.length === 0 && analysis.order_by.length === 0 && analysis.group_by.length === 0 && (
                    <p>No indexable clauses detected (like WHERE, JOIN, ORDER BY).</p>
                )}
            </div>
        </div>
    );
};

// STEP 3
export const StepGenerateCandidates = ({ recommendations }) => {
    const allCands = recommendations.candidates;
    return (
        <div className="step-container fade-in">
            <h4>Generated Candidate Indexes</h4>
            <div className="candidates-list">
                {allCands.length === 0 ? <p>No candidates generated.</p> : (
                    allCands.map((c, i) => (
                        <div key={i} className="candidate-card">
                            <h5>{c.table} ({c.columns.join(', ')})</h5>
                        </div>
                    ))
                )}
            </div>
            <p className="step-explanation">
                Candidates are formed by grouping columns extracted from the detected operations.
            </p>
        </div>
    );
};

// STEP 4
export const StepCheckExisting = ({ recommendations, schema }) => {
    const existingConflicts = recommendations.candidates.filter(c => c.existing_index_conflict);
    return (
        <div className="step-container fade-in">
            <h4>Existing Index Validation</h4>
            <div className="validation-grid">
                <div className="schema-indexes">
                    <h5>Current Schema Indexes</h5>
                    {schema?.tables.map(t => (
                        <div key={t.name} style={{marginBottom: '0.5rem'}}>
                            <strong>{t.name}:</strong>
                            <ul style={{margin: '0.25rem 0'}}>
                                <li>PK ({t.columns.filter(c => c.is_primary_key).map(c => c.name).join(', ')})</li>
                                {t.indexes.map(idx => (
                                    <li key={idx.name}>{idx.name}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="conflicts">
                    <h5>Redundancy Checks</h5>
                    {existingConflicts.length === 0 ? <p>No candidates conflict with existing indexes.</p> : (
                        existingConflicts.map((c, i) => (
                            <div key={i} className="conflict-card">
                                <strong>Candidate:</strong> {c.table}({c.columns.join(', ')}) <br/>
                                <strong>Status:</strong> <span className="status-badge error">{c.status}</span>
                                <ul>
                                    {c.factors.filter(f => f.points < 0 && (f.category.includes('EXISTING') || f.category.includes('COVERED') || f.category.includes('REDUNDANT'))).map((f, j) => (
                                        <li key={j}>{f.reason}</li>
                                    ))}
                                </ul>
                            </div>
                        ))
                    )}
                </div>
            </div>
            <div className="educational-note">
                <strong>Left-Prefix Rule:</strong> If an existing index is <code>(user_id, order_date)</code>, it fully covers a query filtering only on the leading prefix <code>user_id</code>. Recommending a separate <code>(user_id)</code> index is redundant. However, it does NOT cover a query filtering only on <code>order_date</code>.
            </div>
        </div>
    );
};

// STEP 5
export const StepScoreCandidates = ({ recommendations }) => {
    return (
        <div className="step-container fade-in">
            <h4>Heuristic Scoring</h4>
            <div className="scoring-list">
                {recommendations.candidates.length === 0 ? <p>No candidates to score.</p> : (
                    recommendations.candidates.map((c, i) => (
                        <div key={i} className="score-card">
                            <div className="score-header">
                                <h5>{c.table}({c.columns.join(', ')})</h5>
                                <div className="score-circle">{c.score}</div>
                            </div>
                            <ul className="factor-list">
                                {c.factors.map((f, j) => (
                                    <li key={j} className={f.points >= 0 ? 'positive' : 'negative'}>
                                        <span className="points">{f.points > 0 ? '+' : ''}{f.points}</span> 
                                        <span className="reason">{f.reason}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// STEP 6
export const StepRankCandidates = ({ recommendations }) => {
    const sorted = [...recommendations.candidates].sort((a, b) => b.score - a.score);
    return (
        <div className="step-container fade-in">
            <h4>Candidate Ranking</h4>
            <p>Threshold for Recommendation: <strong>30 points</strong></p>
            <table className="ranking-table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Candidate</th>
                        <th>Score</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {sorted.length === 0 ? <tr><td colSpan="4">No candidates</td></tr> : (
                        sorted.map((c, i) => (
                            <tr key={i} className={c.status === 'RECOMMENDED' ? 'row-recommended' : 'row-other'}>
                                <td>#{i + 1}</td>
                                <td>{c.table}({c.columns.join(', ')})</td>
                                <td>{c.score}</td>
                                <td>{c.status}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

// STEP 7
export const StepEducationalDeepDive = ({ recommendations, analysis }) => {
    const compositeCand = recommendations.candidates.find(c => c.columns.length > 1);
    
    return (
        <div className="step-container fade-in educational-deep-dive">
            <h4>Educational Deep Dive</h4>
            
            <div className="deep-dive-grid">
                {compositeCand ? (
                    <div className="composite-explainer panel">
                        <h5>Composite Index Ordering Rule</h5>
                        <p>For candidate <strong>{compositeCand.columns.join(', ')}</strong>, notice the strict column sequence:</p>
                        <div className="composite-diagram">
                            <div className="box eq">1. Equality Predicates</div>
                            <div className="arrow">↓</div>
                            <div className="box order">2. Sorting / Grouping</div>
                            <div className="arrow">↓</div>
                            <div className="box range">3. Range Predicates</div>
                        </div>
                        <p className="caption">This order perfectly maps to how B-trees efficiently traverse nodes sequentially.</p>
                    </div>
                ) : (
                    <div className="composite-explainer panel">
                        <h5>Composite Index Ordering Rule</h5>
                        <p>No multi-column index was recommended. When they are, they follow:</p>
                        <div className="composite-diagram">
                            <div className="box eq">1. Equality</div>
                            <div className="arrow">↓</div>
                            <div className="box order">2. Order/Group</div>
                            <div className="arrow">↓</div>
                            <div className="box range">3. Range</div>
                        </div>
                    </div>
                )}

                <div className="btree-conceptual panel">
                    <h5>Conceptual B-Tree Representation</h5>
                    <pre className="btree-art">
{`                 [50]
                /    \\
             [25]    [75]
             /  \\    /  \\
           [10] [40][60] [90]`}
                    </pre>
                    <p className="caption"><strong>Note:</strong> This is an educational visualization showing how an index reduces a full table scan into logarithmic lookup times. It is not the actual physical structure inside MySQL.</p>
                </div>
            </div>
        </div>
    );
};

// STEP 8
export const StepFinalRecommendation = ({ recommendations }) => {
    return (
        <div className="step-container fade-in">
            <h4>Final Recommendation</h4>
            {recommendations.recommendations.length > 0 ? (
                <div className="final-recommendation success">
                    <h3>✅ Recommended</h3>
                    {recommendations.recommendations.map((r, i) => (
                        <div key={i} className="final-card">
                            <h4>{r.table} ({r.columns.join(', ')})</h4>
                            <p><strong>Score:</strong> {r.score}</p>
                            <ul>
                                {r.factors.filter(f => f.points > 0).map((f, j) => (
                                    <li key={j}>{f.reason}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="final-recommendation neutral">
                    <h3>No New Index Recommended</h3>
                    <p>Existing indexes already provide appropriate coverage or candidate scores did not meet the recommendation threshold.</p>
                </div>
            )}
        </div>
    );
};

// STEP 9
export const StepExplainPlan = ({ explainData, explainError }) => {
    return (
        <div className="step-container fade-in">
            <h4>MySQL Optimizer EXPLAIN Plan</h4>
            <div className="explain-panel">
                <p className="educational-note">
                    <strong>Note:</strong> While the previous step ("Recommendation") answers "What index does our deterministic engine suggest?", 
                    this step answers "What is MySQL's actual optimizer doing for this query?". They are related but distinct.
                </p>
                
                {explainError ? (
                    <div className="status-badge error" style={{padding: '1rem', marginTop: '1rem'}}>
                        <strong>EXPLAIN Failed:</strong> {explainError}
                    </div>
                ) : !explainData || !explainData.explain_rows || explainData.explain_rows.length === 0 ? (
                    <p>Loading or no EXPLAIN data available.</p>
                ) : (
                    <div style={{overflowX: 'auto'}}>
                        <table className="ranking-table explain-table" style={{marginTop: '1rem', fontSize: '0.85rem'}}>
                            <thead>
                                <tr>
                                    <th>Table</th>
                                    <th>Access Type</th>
                                    <th>Possible Keys</th>
                                    <th>Chosen Key</th>
                                    <th>Rows</th>
                                    <th>Extra</th>
                                </tr>
                            </thead>
                            <tbody>
                                {explainData.explain_rows.map((row, i) => (
                                    <tr key={i}>
                                        <td><strong>{row.table}</strong></td>
                                        <td>
                                            <span style={{ 
                                                background: 'var(--accent-light)', 
                                                color: 'var(--accent)', 
                                                padding: '0.1rem 0.45rem', 
                                                borderRadius: '9999px', 
                                                fontSize: '0.78rem', 
                                                fontWeight: 700, 
                                                fontFamily: 'monospace' 
                                            }}>
                                                {row.type}
                                            </span>
                                        </td>
                                        <td>{row.possible_keys || 'NULL'}</td>
                                        <td><strong>{row.key || 'NULL'}</strong></td>
                                        <td>{row.rows}</td>
                                        <td>{row.Extra}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        <div className="educational-note" style={{marginTop: '1rem', background: 'var(--bg-secondary)', borderLeft: '4px solid var(--accent)'}}>
                            <strong>possible_keys:</strong> Indexes MySQL could potentially use.<br/>
                            <strong>key:</strong> The index MySQL actually selected for the plan.
                        </div>
                        
                        <h5 style={{marginTop: '2rem'}}>Plan Interpretation</h5>
                        <div className="operations-grid">
                            {explainData.explain_rows.map((row, i) => (
                                <div key={i} className="op-card">
                                    <strong>{row.table}</strong>
                                    <p style={{margin: '0.5rem 0', color: 'var(--text-secondary)'}}>{row.interpretation || 'No specific interpretation available.'}</p>
                                    {row.type === 'ALL' && !row.key && (
                                        <p style={{fontSize: '0.8rem', color: 'var(--danger)'}}>
                                            MySQL is currently not using an index here. Applying the recommended index may provide the optimizer with a faster access path.
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <div className="educational-note" style={{marginTop: '1.5rem', borderLeftColor: 'var(--warning)', background: 'var(--warning-light)', color: 'var(--text-primary)'}}>
                <strong>Performance Timing:</strong> Actual execution timing (measured in ms) is not implemented in this simulator phase to prevent unsafe execution of arbitrary queries. EXPLAIN plan analysis allows safe optimizer projection without risking database locks.
            </div>
        </div>
    );
};
