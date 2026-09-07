import React from 'react';

const Callout = ({ icon, title, children }) => (
    <div className="learn-callout">
        <div className="learn-callout-icon">{icon}</div>
        <div>
            <strong className="learn-callout-title">{title}</strong>
            <div className="learn-callout-body">{children}</div>
        </div>
    </div>
);

export default function LearnPage() {
    return (
        <div className="learn-page">
            <div className="learn-hero">
                <h2>Learn: Database Indexes</h2>
                <p>A structured guide to understanding how indexes work and how this engine recommends them.</p>
            </div>

            {/* Section 1 */}
            <section className="learn-section">
                <h3>What is a Database Index?</h3>
                <div className="learn-two-col">
                    <div>
                        <p>
                            A database index is a data structure — most commonly a <strong>B-Tree</strong> — that
                            improves the speed of data retrieval at the cost of additional writes and storage.
                            Think of it like an index at the back of a textbook: instead of scanning every page
                            (full table scan), you jump directly to the relevant entry.
                        </p>
                        <p>
                            Indexes directly relate to the <strong>predicates</strong> in SQL queries. When you filter
                            with <code>WHERE</code> or sort with <code>ORDER BY</code>, an index lets the engine locate
                            relevant rows without examining the entire table.
                        </p>
                    </div>
                    <div className="learn-diagram-box">
                        <div className="learn-diagram-title">Without Index</div>
                        <div className="learn-diagram-flow">
                            <div className="learn-diagram-node">Full Table Scan</div>
                            <div className="learn-diagram-arrow">↓</div>
                            <div className="learn-diagram-node learn-diagram-slow">Read All N Rows</div>
                            <div className="learn-diagram-arrow">↓</div>
                            <div className="learn-diagram-node">Filter Results</div>
                        </div>
                        <hr className="learn-diagram-sep" />
                        <div className="learn-diagram-title">With Index</div>
                        <div className="learn-diagram-flow">
                            <div className="learn-diagram-node">B-Tree Lookup</div>
                            <div className="learn-diagram-arrow">↓</div>
                            <div className="learn-diagram-node learn-diagram-fast">Read ~k Rows</div>
                            <div className="learn-diagram-arrow">↓</div>
                            <div className="learn-diagram-node">Return Results</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 2 */}
            <section className="learn-section">
                <h3>Why Indexes Matter</h3>
                <div className="learn-clause-cards">
                    {[
                        { clause: 'WHERE', icon: '🎯', color: 'eq', desc: 'Indexes allow the engine to jump directly to matching rows instead of reading the full table.' },
                        { clause: 'JOIN', icon: '🔗', color: 'join', desc: 'Indexes on foreign-key columns dramatically speed up table linking operations.' },
                        { clause: 'ORDER BY', icon: '↕', color: 'ord', desc: 'Since B-Trees store data sorted, an index can eliminate costly filesort operations.' },
                        { clause: 'GROUP BY', icon: '📊', color: 'grp', desc: 'Similar to ORDER BY — the sorted structure enables efficient grouping.' },
                    ].map(c => (
                        <div key={c.clause} className={`learn-clause-card learn-clause-${c.color}`}>
                            <div className="learn-clause-header">
                                <span>{c.icon}</span>
                                <code>{c.clause}</code>
                            </div>
                            <p>{c.desc}</p>
                        </div>
                    ))}
                </div>
                <Callout icon="⚠" title="Trade-off">
                    Indexes are not always beneficial. They consume disk space and slow down <code>INSERT</code>,
                    <code> UPDATE</code>, and <code>DELETE</code> because the index structure must be updated alongside the table.
                </Callout>
            </section>

            {/* Section 3 */}
            <section className="learn-section">
                <h3>Types of Indexes</h3>
                <div className="learn-type-grid">
                    {[
                        { name: 'Single-Column', icon: '▪', desc: 'Index on one column. Simple and effective for WHERE equality on that column.' },
                        { name: 'Composite', icon: '▪▪', desc: 'Index on multiple columns. Column order matters — leftmost-prefix rule applies.' },
                        { name: 'Primary Key', icon: '🔑', desc: 'Unique index created automatically on the primary key. Always the fastest lookup.' },
                        { name: 'Unique Index', icon: '✓', desc: 'Guarantees all values in the indexed column(s) are distinct.' },
                        { name: 'Covering Index', icon: '⬡', desc: 'Contains all columns needed by a query — avoids reading the actual table rows entirely.' },
                    ].map(t => (
                        <div key={t.name} className="learn-type-card">
                            <div className="learn-type-icon">{t.icon}</div>
                            <div>
                                <div className="learn-type-name">{t.name}</div>
                                <p>{t.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Section 4 — Composite Index */}
            <section className="learn-section">
                <h3>Understanding Composite Indexes</h3>
                <div className="learn-two-col">
                    <div>
                        <p>
                            A composite index spans multiple columns. The <strong>order</strong> of columns is critical
                            due to the <em>leftmost-prefix rule</em>.
                        </p>
                        <p>Consider an index on <code>(user_id, order_date)</code>:</p>
                        <div className="learn-prefix-list">
                            <div className="learn-prefix-row learn-prefix-ok">✓ <code>WHERE user_id = 5</code> — uses index (leftmost prefix)</div>
                            <div className="learn-prefix-row learn-prefix-ok">✓ <code>WHERE user_id = 5 AND order_date &gt; '2024'</code> — uses full index</div>
                            <div className="learn-prefix-row learn-prefix-bad">✗ <code>WHERE order_date &gt; '2024'</code> — cannot use index (skips first column)</div>
                        </div>
                        <Callout icon="💡" title="Column Order Rule of Thumb">
                            Equality conditions (<code>=</code>) first, then sorting/grouping, then range conditions (<code>&gt;</code>, <code>&lt;</code>).
                        </Callout>
                    </div>
                    <div className="learn-composite-diagram">
                        <div className="learn-comp-title">Index: (user_id, order_date)</div>
                        <div className="learn-comp-col learn-comp-eq">
                            <div className="learn-comp-col-tag">Equality</div>
                            <code>user_id</code>
                        </div>
                        <div className="learn-comp-arrow">↓</div>
                        <div className="learn-comp-col learn-comp-ord">
                            <div className="learn-comp-col-tag">Sort / Range</div>
                            <code>order_date</code>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 5 — Engine */}
            <section className="learn-section">
                <h3>How the Recommendation Engine Works</h3>
                <p>This project uses a deterministic, transparent 10-step process:</p>
                <div className="learn-pipeline">
                    {[
                        { n: '1', label: 'SQL Query', desc: 'User provides a raw SQL string.' },
                        { n: '2', label: 'Parse (AST)', desc: 'SQLGlot translates the SQL into an Abstract Syntax Tree.' },
                        { n: '3', label: 'Detect Operations', desc: 'Tables, filters, JOINs, and sorting are identified.' },
                        { n: '4', label: 'Generate Candidates', desc: 'Potential index combinations are mapped from column usage.' },
                        { n: '5', label: 'Check Existing Indexes', desc: 'Schema is queried to discard redundant candidates.' },
                        { n: '6', label: 'Score Candidates', desc: 'Heuristic points awarded: WHERE +30, JOIN +25, Range +20, ORDER BY +20, GROUP BY +15.' },
                        { n: '7', label: 'Rank Candidates', desc: 'Scores are sorted; top candidate above threshold is recommended.' },
                        { n: '8', label: 'Deep Dive', desc: 'Composite index column ordering is analyzed and explained.' },
                        { n: '9', label: 'Recommendation', desc: 'Final recommendation with score breakdown is presented.' },
                        { n: '10', label: 'MySQL EXPLAIN', desc: 'The query is run through MySQL\'s actual optimizer to show the physical execution path.' },
                    ].map((step, i) => (
                        <div key={step.n} className="learn-pipeline-step">
                            <div className="learn-pipeline-num">{step.n}</div>
                            <div className="learn-pipeline-body">
                                <div className="learn-pipeline-label">{step.label}</div>
                                <div className="learn-pipeline-desc">{step.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
                <Callout icon="ℹ" title="Heuristics vs. EXPLAIN">
                    The heuristic recommendation score is distinct from the MySQL optimizer's EXPLAIN information.
                    Heuristics guide structural database design; EXPLAIN shows the physical execution plan.
                    Neither guarantees specific runtime performance without benchmarking.
                </Callout>
            </section>

            {/* Section 6 — Selectivity */}
            <section className="learn-section">
                <h3>Existing Indexes &amp; Selectivity</h3>
                <p>
                    Before recommending a new index, the engine checks for <strong>Existing Indexes</strong> to avoid
                    redundancy. Creating duplicate indexes wastes space and slows down write operations.
                </p>
                <div className="learn-selectivity-compare">
                    <div className="learn-select-card learn-select-high">
                        <div className="learn-select-label">High Selectivity ✓</div>
                        <code>email</code>, <code>order_id</code>
                        <p>Many unique values — index quickly narrows results. Excellent for indexing.</p>
                    </div>
                    <div className="learn-select-card learn-select-low">
                        <div className="learn-select-label">Low Selectivity ✗</div>
                        <code>is_active</code>, <code>status</code>
                        <p>Few unique values — index still reads most rows. Full table scan may be faster.</p>
                    </div>
                </div>
            </section>

            {/* Section 7 — Video */}
            <section className="learn-section">
                <h3>Educational Video</h3>
                <p>Watch this video to visually understand how B-Tree indexes traverse data:</p>
                <div className="learn-video-wrapper">
                    <iframe
                        src="https://www.youtube-nocookie.com/embed/fsG1XaZEa78"
                        title="Database Indexing Explained"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
                <p className="learn-video-credit">Source: "Database Indexing Explained (with PostgreSQL)" by Hussein Nasser — Educational reference only.</p>
            </section>

            {/* Section 8 — References */}
            <section className="learn-section">
                <h3>References</h3>
                <div className="learn-refs-grid">
                    <div className="learn-ref-group">
                        <div className="learn-ref-group-title">Books</div>
                        <ul>
                            <li><em>Database System Concepts</em> — Silberschatz, Korth, Sudarshan</li>
                            <li><em>Fundamentals of Database Systems</em> — Elmasri &amp; Navathe</li>
                        </ul>
                    </div>
                    <div className="learn-ref-group">
                        <div className="learn-ref-group-title">Official Documentation</div>
                        <ul>
                            <li><a href="https://dev.mysql.com/doc/refman/8.0/en/optimization-indexes.html" target="_blank" rel="noopener noreferrer">MySQL 8.0 — Optimization and Indexes</a></li>
                            <li><a href="https://sqlglot.com/sqlglot.html" target="_blank" rel="noopener noreferrer">SQLGlot AST Parsing Documentation</a></li>
                        </ul>
                    </div>
                    <div className="learn-ref-group">
                        <div className="learn-ref-group-title">Educational Resources</div>
                        <ul>
                            <li><a href="https://use-the-index-luke.com/" target="_blank" rel="noopener noreferrer">Use The Index, Luke!</a></li>
                            <li>Hussein Nasser — Database Engineering (YouTube)</li>
                        </ul>
                    </div>
                </div>
            </section>
        </div>
    );
}
