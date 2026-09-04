import React from 'react';

export default function LearnPage() {
    return (
        <div className="learn-page">
            <h2>Learn About Database Indexes</h2>

            <section>
                <h3>What is an Index?</h3>
                <p>
                    A database index is a data structure (often a B-Tree) that improves the speed of data retrieval operations on a database table at the cost of additional writes and storage space. 
                    Think of it like an index at the back of a book. Instead of reading every page to find a topic (a full table scan), you look it up in the index to find the exact page number.
                </p>
                <p>
                    Indexes directly relate to the <strong>predicates</strong> (conditions) in your SQL queries. When you filter data using <code>WHERE</code>, or sort using <code>ORDER BY</code>, an index allows the database engine to quickly locate the relevant rows without examining the entire table.
                </p>
            </section>

            <section>
                <h3>Why Indexes Matter</h3>
                <ul>
                    <li><strong>WHERE clauses:</strong> Indexes allow the database to quickly jump to rows matching specific conditions (e.g., <code>WHERE age &gt; 25</code>).</li>
                    <li><strong>JOIN operations:</strong> When linking tables, indexes on the foreign key columns dramatically speed up the matching process.</li>
                    <li><strong>ORDER BY & GROUP BY:</strong> Since indexes store data in a sorted order, they can sometimes completely eliminate the need for a separate sorting step in query execution.</li>
                </ul>
                <div className="educational-note" style={{ padding: '1rem', borderRadius: '4px', marginTop: '1rem' }}>
                    <strong>Note:</strong> Indexes are not automatically beneficial for every query. They consume memory/disk space and slow down <code>INSERT</code>, <code>UPDATE</code>, and <code>DELETE</code> operations because the index must be updated alongside the table.
                </div>
            </section>

            <section>
                <h3>Types of Indexes</h3>
                <ul>
                    <li><strong>Single-column index:</strong> An index created on just one column.</li>
                    <li><strong>Composite index:</strong> An index created on multiple columns.</li>
                    <li><strong>Primary key index:</strong> A unique index created automatically on a table's primary key column.</li>
                    <li><strong>Unique index:</strong> Guarantees that all values in the indexed column(s) are distinct.</li>
                    <li><strong>Covering index:</strong> An index that contains all the columns required to satisfy a query, allowing the database to fetch the results directly from the index without reading the actual table rows.</li>
                </ul>
            </section>

            <section>
                <h3>Understanding Composite Indexes</h3>
                <p>
                    A composite index spans multiple columns. The <strong>order</strong> of columns is critical due to the <em>leftmost-prefix rule</em>.
                </p>
                <p>
                    For example, consider an index on <code>(user_id, order_date)</code>:
                </p>
                <ul>
                    <li>It can speed up queries filtering by <em>both</em> <code>user_id</code> and <code>order_date</code>.</li>
                    <li>It can speed up queries filtering by <em>just</em> <code>user_id</code>.</li>
                    <li>It <strong>cannot</strong> effectively speed up queries filtering by <em>just</em> <code>order_date</code>.</li>
                </ul>
                <p>
                    <strong>Rule of thumb:</strong> Equality conditions (<code>=</code>) commonly come first, followed by sorting/grouping columns, while range conditions (<code>&gt;</code>, <code>&lt;</code>) are generally considered later.
                </p>
            </section>

            <section>
                <h3>Existing Indexes & Selectivity</h3>
                <p>
                    Before recommending a new index, a smart engine checks for <strong>Existing Indexes</strong> to avoid redundancy. Creating duplicate indexes wastes space and slows down writes.
                </p>
                <p>
                    <strong>Selectivity</strong> refers to how many unique values exist in a column relative to the total rows. 
                    High-selectivity columns (like email addresses) are excellent for filtering because they quickly narrow down the results. 
                    Low-selectivity columns (like boolean <code>is_active</code>) may provide little to no benefit because the database still has to read a massive portion of the table, often making a full table scan faster than using the index.
                </p>
            </section>

            <section>
                <h3>How the Recommendation Engine Works</h3>
                <p>This project uses a deterministic and transparent process:</p>
                <ol>
                    <li><strong>SQL Query:</strong> The user provides a raw SQL string.</li>
                    <li><strong>Parse Query:</strong> The engine translates the SQL into an Abstract Syntax Tree (AST).</li>
                    <li><strong>Detect Operations:</strong> The engine identifies tables, filters (WHERE), JOINs, and sorting (ORDER BY).</li>
                    <li><strong>Generate Candidates:</strong> Potential index combinations are mapped based on column usage.</li>
                    <li><strong>Check Existing Indexes:</strong> The schema is queried to discard redundant candidates.</li>
                    <li><strong>Score Candidates:</strong> A heuristic algorithm awards points for exact matches, covering indexes, and penalizes range misplacements.</li>
                    <li><strong>Rank Candidates:</strong> Candidates are thresholded to provide a final recommendation.</li>
                    <li><strong>Analyze MySQL EXPLAIN:</strong> We run the query through MySQL's actual optimizer to see its physical execution path.</li>
                </ol>
                <p>
                    <em>Note: The heuristic recommendation score is distinct from the MySQL optimizer's EXPLAIN information. Heuristics guide structural database design, whereas EXPLAIN shows the physical execution plan. Neither guarantees a specific runtime measurement without benchmarking.</em>
                </p>
            </section>

            <section>
                <h3>Educational Video</h3>
                <p>Watch this video to visually understand how B-Tree indexes traverse data:</p>
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', maxWidth: '100%' }}>
                    {/* Placeholder embedding an educational video from a reputable source (e.g. Hussein Nasser or ByteByteGo) */}
                    <iframe 
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                        src="https://www.youtube-nocookie.com/embed/fsG1XaZEa78" 
                        title="Database Indexing Explained" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen>
                    </iframe>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'gray', marginTop: '0.5rem' }}>Source: "Database Indexing Explained (with PostgreSQL)" by Hussein Nasser (Educational link only).</p>
            </section>

            <section>
                <h3>References</h3>
                
                <h4>Books</h4>
                <ul>
                    <li><em>Database System Concepts</em> by Abraham Silberschatz, Henry F. Korth, and S. Sudarshan</li>
                    <li><em>Fundamentals of Database Systems</em> by Ramez Elmasri and Shamkant B. Navathe</li>
                </ul>
                
                <h4>Official Documentation</h4>
                <ul>
                    <li><a href="https://dev.mysql.com/doc/refman/8.0/en/optimization-indexes.html" target="_blank" rel="noopener noreferrer">MySQL 8.0 Reference Manual: Optimization and Indexes</a></li>
                    <li><a href="https://sqlglot.com/sqlglot.html" target="_blank" rel="noopener noreferrer">SQLGlot AST Parsing Documentation</a></li>
                </ul>
                
                <h4>Educational Resources & Videos</h4>
                <ul>
                    <li><a href="https://use-the-index-luke.com/" target="_blank" rel="noopener noreferrer">Use The Index, Luke! - A Guide to Database Performance</a></li>
                    <li>Hussein Nasser - Database Engineering Tutorials (YouTube)</li>
                </ul>
            </section>
        </div>
    );
}
