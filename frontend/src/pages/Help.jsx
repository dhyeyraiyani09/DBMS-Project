import React from 'react';

export default function HelpPage() {
    return (
        <div className="help-page">
            <h2>User Manual & Help</h2>
            
            <section>
                <h3>1. Getting Started</h3>
                <p>The Index Recommendation Engine is an interactive educational tool that analyzes SQL queries, checks your database schema, and deterministically recommends indexes that could speed up the query execution.</p>
            </section>

            <section>
                <h3>2. Simulator</h3>
                <ul>
                    <li><strong>Selecting a Schema:</strong> Before running an analysis, you must select an active database schema from the dropdown menu on the Simulator page. (You can create schemas in the <em>Schema Management</em> tab).</li>
                    <li><strong>Entering SQL:</strong> Type or paste your <code>SELECT</code> query into the text area.</li>
                    <li><strong>Analyze Query:</strong> Click this button to run the engine. The system will securely parse the AST and process recommendations.</li>
                    <li><strong>Start Interactive Simulation:</strong> Once analyzed, click this to visualize the step-by-step pipeline.</li>
                </ul>
            </section>

            <section>
                <h3>3. Query Analysis</h3>
                <p>During analysis, the engine extracts key clauses from your query to understand its behavior:</p>
                <ul>
                    <li><strong>Tables & Columns:</strong> Identifies which tables are queried and which columns are selected.</li>
                    <li><strong>WHERE:</strong> Filters are extracted and categorized (e.g., equality, range).</li>
                    <li><strong>JOIN:</strong> Identifies foreign-key table links.</li>
                    <li><strong>ORDER BY / GROUP BY / HAVING:</strong> Sorting and grouping logic is parsed to structure composite index ends.</li>
                </ul>
            </section>

            <section>
                <h3>4. Recommendation Results</h3>
                <p>The engine uses a deterministic scoring system:</p>
                <ul>
                    <li><strong>Candidate Indexes:</strong> All logically possible indexes derived from the query.</li>
                    <li><strong>Score Breakdown:</strong> Points are added for covering columns or equality constraints; points are deducted for poor range placements.</li>
                    <li><strong>Existing/Redundant Indexes:</strong> Automatically excludes candidates that are already covered by indexes in your schema.</li>
                    <li><strong>Final Recommendation:</strong> The highest-scoring candidate that surpasses the minimum threshold.</li>
                </ul>
            </section>

            <section>
                <h3>5. Visualization Controls</h3>
                <p>While running the simulation, you can control playback using the bottom bar:</p>
                <ul>
                    <li><strong>Start/Autoplay:</strong> Automatically advances the pipeline every 2.5 seconds.</li>
                    <li><strong>Next / Previous:</strong> Manually navigate through the steps.</li>
                    <li><strong>Reset:</strong> Exit the simulation and return to the main query input view.</li>
                </ul>
            </section>

            <section>
                <h3>6. MySQL EXPLAIN Interpretation</h3>
                <p>Step 9 runs your query through the real MySQL Optimizer using <code>EXPLAIN FORMAT=TRADITIONAL</code>. Key fields include:</p>
                <ul>
                    <li><code>possible_keys</code>: Indexes MySQL considers logically applicable.</li>
                    <li><code>key</code>: The single index MySQL actually chooses to use.</li>
                    <li><code>type</code> (Access Type): How MySQL retrieves rows. 
                        <ul>
                            <li><strong>const/eq_ref:</strong> Extremely fast (usually primary key lookups).</li>
                            <li><strong>ref:</strong> Good speed (matching a non-unique index).</li>
                            <li><strong>range:</strong> Moderate speed (scanning a subset of an index).</li>
                            <li><strong>index/ALL:</strong> Slow (scanning the entire index or full table).</li>
                        </ul>
                    </li>
                    <li><code>rows</code>: The estimated number of rows MySQL expects to read.</li>
                    <li><code>Extra</code>: Additional optimizer notes (e.g., "Using index").</li>
                </ul>
            </section>

            <section>
                <h3>7. History</h3>
                <p>After analysis, you can click <strong>Save Analysis</strong>. Visit the <strong>History</strong> tab to see a list of your saved sessions. Opening a previous analysis lets you view the exact stored results without re-running the database query.</p>
            </section>

            <section>
                <h3>8. Reports & 9. Download</h3>
                <p>While viewing a saved analysis in the <strong>History</strong> tab, you can download a generated report. The buttons provided are:</p>
                <ul>
                    <li><strong>TXT:</strong> A plain text summary of the query and recommendations.</li>
                    <li><strong>PDF:</strong> A professional, formatted document.</li>
                    <li><strong>DOCX:</strong> A Microsoft Word compatible file containing the analytical breakdown.</li>
                </ul>
            </section>
            
            <section>
                <h3>10. Light / Dark Mode</h3>
                <p>Click the <code>☀ / ☾</code> toggle button in the top navigation bar to switch between Light and Dark themes. Your preference is saved automatically in your browser.</p>
            </section>

            <section>
                <h3>11. Troubleshooting</h3>
                <ul>
                    <li><strong>Invalid SQL Error:</strong> Ensure your query is a valid <code>SELECT</code> statement. The system restricts updates/deletes for security.</li>
                    <li><strong>Missing Schema:</strong> Ensure you have created tables in the Schema Management tab and selected it from the dropdown.</li>
                    <li><strong>No Recommendation Generated:</strong> The engine determined that existing indexes (like Primary Keys) already perfectly cover the query, or the filter is too low-selectivity (e.g. <code>boolean = true</code>) to warrant an index.</li>
                    <li><strong>EXPLAIN Unavailable:</strong> Ensure the database connection is healthy in the System Status panel.</li>
                    <li><strong>Empty History:</strong> You must click "Save Analysis" on the simulator page to store history.</li>
                    <li><strong>Report Generation Failure:</strong> Ensure the backend service is running and Python formatting dependencies are active.</li>
                </ul>
            </section>
        </div>
    );
}
