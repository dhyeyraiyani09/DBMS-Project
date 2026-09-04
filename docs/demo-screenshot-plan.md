# Demo Screenshot Plan

If screenshots need to be captured for submission, follow this plan precisely to showcase all critical DBMS Index Recommendation Engine capabilities natively.

| Screenshot Number | Page / State | What Should Be Visible | Recommended Demo Case | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **01** | Simulator Home | Welcome layout, primary navigation (Schema Manager, SQL Analyzer, Learn). | N/A | Establish initial UI context. |
| **02** | Schema Manager | Tables list, `users` and `orders` schemas configured natively with columns. | N/A | Demonstrate dynamic persistence of table metadata natively. |
| **03** | SQL Analyzer | `SELECT * FROM orders WHERE user_id = 5 ORDER BY order_date DESC;` | Case 3 (Composite) | Prove AST parsing identifies equality and sort conditions seamlessly. |
| **04** | Recommendation Engine | `idx_user_date` candidate card with `+30 (Equality)` and `+20 (Order By)` explicitly stating 'Existing index covers candidate'. | Case 3 (Composite) | Demonstrate the deterministic heuristic logic and redundancy prevention visually. |
| **05** | Interactive Simulation | B-Tree simulation step showcasing leftmost prefix traversal safely. | Case 3 (Composite) | Prove interactive educational logic effectively works. |
| **06** | EXPLAIN | Step 9 EXPLAIN table showing `type: range` or `ref` natively. | Case 4 (JOIN) | Confirm integration with raw database execution structures natively. |
| **07** | AI Tutor Panel | Right-aligned AI Tutor answering "Explain Recommendation". | Case 2 (Range) | Demonstrate pedagogical grounding natively. |
| **08** | History & Reports | Table of saved queries, Download buttons visible. | Case 1 (PK) | Show state preservation across sessions cleanly. |
| **09** | Downloaded PDF/TXT | Opened offline report showing JSON configurations natively. | Case 1 (PK) | Prove final deliverable generation functionality. |
| **10** | Learn & Help | Educational Markdown views safely rendered. | N/A | Highlight educational documentation natively. |
| **11** | Developed By | Team placeholder cards nicely formatted. | N/A | Final submission branding overview natively. |
| **12** | Dark Mode Toggle | Application toggled dark with perfect CSS var contrast safely. | N/A | Confirm visual polish across all viewports natively. |
