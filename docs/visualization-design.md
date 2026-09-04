# Visualization Design

Visualizations are critical for the educational aspect of this simulator.

## 1. Query Analysis
- **Concept:** Highlight detected SQL clauses.
- **Visual:** Operations extracted directly from AST parsing are mapped dynamically into grid cards displaying the classifications of WHERE, JOIN, ORDER BY, and GROUP BY targets independently.

## 2. Recommendation Pipeline
- **Concept:** Show the step-by-step flow of how the system arrived at the recommendation.
- **Visual:** A React-driven state machine orchestrating a progressive pipeline:
  ```text
  SQL -> Parser -> Operation Detection -> Candidate Generation -> Existing Index Check -> Scoring -> Recommendation
  ```
- **Type:** Animated CSS step rendering featuring manual and auto-play sequencing.

## 3. Index Tree (B-Tree Concept)
- **Concept:** Educate the user on how the recommended index works structurally.
- **Visual:** An educational ASCII-style hierarchical representation indicating traversal reduction behavior without hallucinating direct physical MySQL layouts. 
- **Type:** Static educational diagraming integrated seamlessly into the deep-dive pipeline.

## 4. Composite Ordering Rules
- **Concept:** Explain B-tree heuristic column prioritization visually.
- **Visual:** Dynamic flex-box diagram mapping sequence blocks sequentially (Equality -> Ordering -> Range).
- **Type:** Contextual text dynamically integrated based directly off Phase 4 candidate generation behaviors.

## 5. Recommendation Score Breakdown
- **Concept:** Explain the heuristic math.
- **Visual:** Explicit UI factors mapping score combinations (+30, -10, etc) next to direct text reasons injected straight from the backend validation API.

## 6. Before/After Execution Plan (Deferred to Phase 6)
- **Concept:** Compare MySQL `EXPLAIN` metrics.
- **Visual:** To be determined in Phase 6 based explicitly on query execution profiling.
