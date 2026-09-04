# User Manual: Index Recommendation Engine

Welcome to the Index Recommendation Engine! This educational platform dynamically simulates database schema architecture, SQL parsing, and deterministic index heuristics seamlessly.

## 1. Opening the Application
Ensure the backend FastAPI server and the Vite frontend server are running natively. Open your web browser and navigate to the local host port specified (typically `http://localhost:5173`).

## 2. Creating/Selecting Schema
Navigate to the **Schema Manager** panel from the main navigation safely.
Use the dropdown to select a pre-existing schema natively, or click **Create New Schema** and provide a valid alphanumeric name securely.

## 3. Adding Tables/Columns/Indexes
Inside the Schema Manager:
- Click **Add Table** to inject a new table context.
- Within the table, click **Add Column** to dynamically specify names (e.g. `user_id`), data types (`INT`), and Primary Key configurations securely.
- Click **Add Index** to manually define an existing index context natively.

## 4. Entering SQL
Navigate to the **SQL Analyzer** panel gracefully.
Enter a valid `SELECT` statement in the text area (e.g. `SELECT * FROM users WHERE id = 3;`).

## 5. Running Analysis
Click **Validate & Analyze** securely. The tool extracts AST boundaries seamlessly and pushes the results to the Recommendation Engine natively.

## 6. Understanding Recommendation Scores
Review the generated **Candidate Cards** nicely. Scores are deterministic:
- **+30 points**: Exact `WHERE` match (Equality).
- **+25 points**: `JOIN` constraints cleanly.
- **+20 points**: `WHERE` range boundaries securely.
- **+20 points**: `ORDER BY` sorting cleanly.
- **+15 points**: `GROUP BY` logic natively.
The highest valid score above the system threshold becomes the **Recommendation**.

## 7. Using Simulation Controls
Navigate to the **Simulation Steps** interactive viewer gracefully.
Click **Next** to proceed step-by-step through B-Tree extraction, heuristic evaluations, and left-most prefix logic securely. Click **Replay** or **Reset** to loop the pedagogical layout safely.

## 8. Understanding EXPLAIN
Navigate to Step 9 natively. A standard MySQL `EXPLAIN` format dynamically populates `type`, `possible_keys`, and `key`. 
*Note*: `possible_keys` represents optimizer considerations; `key` represents the active selection cleanly.

## 9. Using AI Tutor
Access the **AI Tutor** right-side panel cleanly.
Click any context action securely (e.g., `Explain Recommendation`, `Quiz Me`). The pedagogical AI engine maps deterministic heuristics flawlessly without hallucinating external schemas cleanly.

## 10. Saving Analysis
Inside the Simulator view cleanly, click **Save Analysis**. The entire query state, AST result, and EXPLAIN configurations securely persist into the offline DB natively.

## 11. Opening History
Navigate to the **History & Reports** panel elegantly.
Click **View** on any previously saved analysis to smoothly load the entire state back into the active Simulator memory securely.

## 12. Downloading Reports
Inside the **History & Reports** panel safely, click **Download PDF** or **TXT** to explicitly export the structured AST extraction variables cleanly for grading submission locally.

## 13. Using Learn
Access the **Learn** panel natively. Read structured B-Tree explanations and review attached pedagogical videos smoothly.

## 14. Using Help
Access the **Help** panel safely to troubleshoot UI routing loops and standard AST formatting queries natively.

## 15. Developed By Page
Navigate to the **Developed By** panel cleanly. View structural placeholder cards representing the final grading submission team natively.

## 16. Theme Toggle
Click the **Sun/Moon** icon seamlessly in the top right navigation header to safely swap dynamic CSS variables `var(--*)` cleanly. Preferences save natively to `localStorage`.

## 17. Troubleshooting
- **SQL Fails to Parse**: Ensure statements natively begin with `SELECT` cleanly. Check for missing commas securely.
- **AI Tutor Fails**: If API Keys are unavailable natively, the AI securely degrades to structured, deterministic fallback explanations smoothly.
- **Schema Errors**: Verify primary keys are actively attached to structural tables natively.
