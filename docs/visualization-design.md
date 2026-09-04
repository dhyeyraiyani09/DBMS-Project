# Visualization Design

Visualizations are critical for the educational aspect of this simulator.

## 1. Query Analysis
- **Concept:** Highlight detected SQL clauses.
- **Visual:** A styled text block showing the user's SQL query with colored highlights for `WHERE` (e.g., green), `JOIN` (e.g., blue), `ORDER BY` (e.g., purple). 
- **Type:** Static text with CSS highlighting.

## 2. Recommendation Pipeline
- **Concept:** Show the step-by-step flow of how the system arrived at the recommendation.
- **Visual:** 
  ```text
  SQL -> Parser -> Operation Detection -> Candidate Generation -> Existing Index Check -> Scoring -> Recommendation
  ```
- **Type:** Animated (Mermaid sequence or CSS steps). As the backend processes, each step lights up.

## 3. Index Tree (B-Tree Concept)
- **Concept:** Educate the user on how the recommended index works structurally.
- **Visual:** A simplified D3.js or Mermaid hierarchical tree showing Root, Branch, and Leaf nodes for the recommended column.
- **Type:** Static (or simple hover interactions to show traversal paths).

## 4. Before/After Execution Plan
- **Concept:** Compare MySQL `EXPLAIN` metrics.
- **Visual:** A side-by-side bar chart or data table showing:
  - Rows examined (Before vs After)
  - Query cost/type (e.g., `ALL` table scan vs `ref` index lookup)
- **Type:** Animated (bars growing/shrinking) using a charting library (e.g., Chart.js or Recharts).

## 5. Recommendation Score Breakdown
- **Concept:** Explain the heuristic math.
- **Visual:** A gauge chart showing the final score (e.g., `96 / 100`) accompanied by a waterfall chart or itemized list showing the factor breakdown:
  - Base (+30)
  - Selectivity (+10)
  - Redundancy Penalty (-0)
- **Type:** Static with animated initial load.

## 6. Animation Strategy Summary
- **Animated:** Pipeline progress, EXPLAIN metric comparisons, Score gauge filling.
- **Static:** Parsed SQL highlights, B-Tree structure, factor breakdown text.
