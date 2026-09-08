import React from 'react';

const SectionIcon = ({ icon }) => (
    <span className="help-section-icon">{icon}</span>
);

const Step = ({ n, label, desc }) => (
    <div className="help-step">
        <div className="help-step-num">{n}</div>
        <div className="help-step-body">
            <strong>{label}</strong>
            {desc && <span> — {desc}</span>}
        </div>
    </div>
);

const AccessBadge = ({ type, color }) => (
    <span className="help-access-badge" data-speed={color}>{type}</span>
);

export default function HelpPage() {
    return (
        <div className="help-page">
            <div className="help-hero">
                <h2>User Manual &amp; Help</h2>
                <p>Everything you need to use the Index Recommendation Engine effectively.</p>
            </div>

            <div className="help-toc">
                {[
                    '1. Getting Started', '2. Simulator', '3. Query Analysis',
                    '4. Recommendations', '5. Simulation Controls', '6. MySQL EXPLAIN',
                    '7. History', '8. Reports', '9. Light / Dark', '10. Troubleshooting'
                ].map((item, i) => (
                    <span key={i} className="help-toc-item">{item}</span>
                ))}
            </div>

            <section className="help-section">
                <h3><SectionIcon icon="🚀" /> 1. Getting Started</h3>
                <p>
                    The <strong>Index Recommendation Engine</strong> is an interactive educational tool that analyzes
                    SQL queries, checks your database schema, and deterministically recommends indexes
                    that could speed up query execution.
                </p>
                <div className="help-flow">
                    {['Create Schema', 'Define Tables', 'Enter SQL', 'Analyze', 'Simulate', 'Review'].map((s, i, arr) => (
                        <React.Fragment key={s}>
                            <span className="help-flow-step">{s}</span>
                            {i < arr.length - 1 && <span className="help-flow-arrow">→</span>}
                        </React.Fragment>
                    ))}
                </div>
            </section>

            <section className="help-section">
                <h3><SectionIcon icon="⬡" /> 2. Simulator</h3>
                <Step n="1" label="Select Schema" desc="Choose your active schema from the dropdown (create one in Schema Management first)." />
                <Step n="2" label="Enter SQL" desc="Type or paste a SELECT query into the editor. Use the sample queries for quick tests." />
                <Step n="3" label="Analyze Query" desc="Click the Analyze button to run AST parsing and index scoring." />
                <Step n="4" label="Start Simulation" desc="Walk through all 10 pipeline steps interactively once analysis is complete." />
            </section>

            <section className="help-section">
                <h3><SectionIcon icon="🔍" /> 3. Query Analysis</h3>
                <p>The engine extracts the following from your query:</p>
                <div className="help-clause-grid">
                    {[
                        { clause: 'WHERE', icon: '🎯', desc: 'Equality and range filters — primary index candidates.' },
                        { clause: 'JOIN', icon: '🔗', desc: 'Foreign key links between tables.' },
                        { clause: 'ORDER BY', icon: '↕', desc: 'Sorting columns — appended to composite index.' },
                        { clause: 'GROUP BY', icon: '📊', desc: 'Grouping columns — similar to ORDER BY optimization.' },
                    ].map(c => (
                        <div key={c.clause} className="help-clause-card">
                            <span className="help-clause-icon">{c.icon}</span>
                            <code className="help-clause-name">{c.clause}</code>
                            <p>{c.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="help-section">
                <h3><SectionIcon icon="⚡" /> 4. Recommendation Results</h3>
                <p>The engine uses a <strong>deterministic scoring system</strong>:</p>
                <div className="help-score-table">
                    <div className="help-score-row header">
                        <span>Factor</span><span>Points</span>
                    </div>
                    {[
                        ['Equality / exact WHERE match', '+30'],
                        ['JOIN condition', '+25'],
                        ['Range condition (>, <, BETWEEN)', '+20'],
                        ['ORDER BY clause', '+20'],
                        ['GROUP BY clause', '+15'],
                    ].map(([label, pts]) => (
                        <div className="help-score-row" key={label}>
                            <span>{label}</span>
                            <span className="help-score-pts">{pts}</span>
                        </div>
                    ))}
                </div>
                <div className="help-sub-desc">
                    <p><strong>Composite Index Ordering:</strong> Columns are ordered deterministically by rule of thumb: Equality &rarr; JOIN &rarr; Sorting/Grouping &rarr; Range.</p>
                    <p><strong>Existing/Redundant Indexes:</strong> The engine penalizes exact existing indexes (-100 pts) and redundant leftmost-prefix indexes (-30 pts) to prevent schema clutter.</p>
                </div>
                <div className="educational-note">
                    <strong>Note:</strong> These are project heuristic scores — not MySQL optimizer costs. They guide index design decisions, not runtime guarantees.
                </div>
            </section>

            <section className="help-section">
                <h3><SectionIcon icon="▶" /> 5. Simulation Controls</h3>
                <div className="help-controls-row">
                    {[
                        { key: 'Auto Play', desc: 'Advances every 2.5s automatically' },
                        { key: 'Next →', desc: 'Go to the next step manually' },
                        { key: '← Prev', desc: 'Go back to the previous step' },
                        { key: 'Reset', desc: 'Exit simulation and return to input' },
                    ].map(c => (
                        <div key={c.key} className="help-control-card">
                            <code className="help-control-key">{c.key}</code>
                            <p>{c.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="help-section">
                <h3><SectionIcon icon="🗄" /> 6. MySQL EXPLAIN Interpretation</h3>
                <p>Step 10 runs your query through the real MySQL optimizer using <code>EXPLAIN FORMAT=TRADITIONAL</code>. Key fields:</p>
                <div className="help-explain-grid">
                    <div className="help-explain-field">
                        <code>possible_keys</code>
                        <p>Indexes MySQL <em>considered</em> using — does NOT mean they were used.</p>
                    </div>
                    <div className="help-explain-field highlight">
                        <code>key</code>
                        <p>The single index MySQL <strong>actually chose</strong>. This is the important one.</p>
                    </div>
                    <div className="help-explain-field">
                        <code>type</code>
                        <p>Access method. Speed order:</p>
                        <div className="help-access-badges">
                            <AccessBadge type="const" color="fast" />
                            <AccessBadge type="eq_ref" color="fast" />
                            <AccessBadge type="ref" color="good" />
                            <AccessBadge type="range" color="ok" />
                            <AccessBadge type="index" color="slow" />
                            <AccessBadge type="ALL" color="slow" />
                        </div>
                    </div>
                    <div className="help-explain-field">
                        <code>rows</code>
                        <p>Estimated rows MySQL expects to read — lower is better.</p>
                    </div>
                    <div className="help-explain-field">
                        <code>Extra</code>
                        <p>Additional optimizer notes, e.g. "Using index" (covering index) or "Using filesort".</p>
                    </div>
                </div>
            </section>

            <section className="help-section">
                <h3><SectionIcon icon="📋" /> 7. History</h3>
                <p>After analysis, click <strong>Save Analysis</strong>. The History tab stores all saved sessions. Reopen any record to view the exact stored results without re-running the query.</p>
            </section>

            <section className="help-section">
                <h3><SectionIcon icon="🤖" /> 7b. AI Tutor</h3>
                <p>The <strong>AI Tutor</strong> (powered by Gemini) provides conversational, high-level guidance regarding database indexing concepts. It helps explain complex terms or suggest conceptual optimizations but does not override the deterministic recommendation engine.</p>
            </section>

            <section className="help-section">
                <h3><SectionIcon icon="📥" /> 8. Reports &amp; Downloads</h3>
                <div className="help-dl-grid">
                    <div className="help-dl-card"><span>TXT</span><p>Plain text summary of query and recommendations.</p></div>
                    <div className="help-dl-card"><span>PDF</span><p>Professional formatted document for printing or sharing.</p></div>
                    <div className="help-dl-card"><span>DOCX</span><p>Microsoft Word compatible analytical breakdown.</p></div>
                </div>
            </section>

            <section className="help-section">
                <h3><SectionIcon icon="☾" /> 9. Light / Dark Mode</h3>
                <p>Click the <code>☀ / ☾</code> toggle in the top navigation bar. Your preference is automatically saved in your browser's local storage.</p>
            </section>

            <section className="help-section help-trouble-section">
                <h3><SectionIcon icon="🔧" /> 10. Troubleshooting</h3>
                <div className="help-trouble-grid">
                    {[
                        { issue: 'Invalid SQL Error', fix: 'Ensure your query is a valid SELECT statement. DML queries (UPDATE, DELETE) are blocked for security.' },
                        { issue: 'Missing Schema', fix: 'Create tables in Schema Management first, then select the schema from the dropdown.' },
                        { issue: 'No Recommendation', fix: 'Existing indexes (like PKs) may already cover the query, or the column has low selectivity (e.g., boolean = true).' },
                        { issue: 'EXPLAIN Unavailable', fix: 'Check that the database connection is healthy in the System Status panel on the Simulator page.' },
                        { issue: 'Empty History', fix: 'You must click "Save Analysis" on the Simulator page to persist a session.' },
                        { issue: 'Report Download Fails', fix: 'Ensure the FastAPI backend is running and all Python dependencies are installed.' },
                    ].map(t => (
                        <div key={t.issue} className="help-trouble-card">
                            <div className="help-trouble-issue">⚠ {t.issue}</div>
                            <p>{t.fix}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
