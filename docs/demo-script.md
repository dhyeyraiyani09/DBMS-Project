# Final Demonstration Script

**Duration**: 5–10 minutes
**Target Audience**: DBMS Professor / Evaluator

## 1. Introduction (1 min)
"Welcome to the Index Recommendation Engine. This educational tool analyzes user SQL queries against dynamic database schemas, generates deterministic index recommendations, and visually teaches students how B-Trees execute queries securely."

## 2. Schema Management (1 min)
- Navigate to **Schema Manager**.
- Show the `users` and `orders` tables.
- Emphasize that all foreign keys and data types are dynamically preserved in the backend.

## 3. Query Analysis (1.5 mins)
- Navigate to the **SQL Analyzer**.
- Enter Case 3: `SELECT * FROM orders WHERE user_id = 5 ORDER BY order_date DESC;`.
- Click **Validate & Analyze**.
- Explain how the AST parser securely extracts the equality predicate on `user_id` and the sort predicate on `order_date` without executing SQL natively.

## 4. Deterministic Recommendation (1.5 mins)
- Show the **Candidate Cards**.
- Explain the deterministic heuristic natively: +30 for equality on `user_id`, +20 for ordering on `order_date`. Total Score = +50.
- Point out that it explicitly detects the composite index already exists, preventing a redundant recommendation while still visualizing the leftmost prefix rule perfectly.

## 5. Educational Simulation & AI Tutor (2 mins)
- Walk through the interactive **Simulation Steps**. Click **Next** to show B-Tree traversal steps safely.
- In the right-hand panel, use the **AI Tutor**. Click `Explain Recommendation` natively.
- Show the fallback mechanism generating pedagogical explanations grounded purely in the deterministic score (no hallucinations).
- (Optional) Click **Read Aloud** to showcase browser accessibility securely.

## 6. History & Reports (1 min)
- Click **Save Analysis**.
- Navigate to **History**. 
- Click **Download Report** (PDF/DOCX) to prove students can securely export their analysis for grading.

## 7. Conclusion (1 min)
- Toggle **Dark Mode** to show UI polish natively.
- Visit the **Developed By** page securely.
- "This tool cleanly integrates AST parsing, deterministic optimization heuristics, and AI-assisted pedagogy into a fully functional DBMS educational platform safely."
