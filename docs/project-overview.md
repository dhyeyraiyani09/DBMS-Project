# Project Overview: Index Recommendation Engine

## 1. Project Objective
The application is an interactive web-based educational and simulation platform designed to act as an **Index Recommendation Engine**. It allows users to input their database schema, existing indexes, and SQL queries to receive intelligent recommendations for new indexes. 

The primary goal of the system is educational. It acts as an **educational DBMS simulator** rather than a production database optimizer, helping users understand *why* certain indexes are recommended, *how* queries are analyzed, and *what* impact the indexes have on query execution plans.

The system will transparently explain:
1. Identified query parts (WHERE, JOIN, ORDER BY, etc.).
2. Candidate columns for indexing.
3. Existence of suitable indexes.
4. Generated candidate indexes.
5. Candidate scoring mechanism.
6. The reasoning behind the final recommendation.
7. Query execution plan changes.
8. Limitations or trade-offs.

## 2. Evaluation Requirements
The project is evaluated based on the following criteria:
- **Problem Understanding (1 mark):** Clear demonstration of objectives, inputs, outputs, and functional requirements.
- **Core Functionality (2 marks):** Actual recommendation logic, SQL processing, algorithm implementation, and accurate output generation.
- **Mandatory Website Structure (1 mark):** Pages for Learn, Developed By, Help, Download, and Day/Night mode toggling.
- **System Design & UI/UX (1 mark):** Logical navigation, clear layout, responsive and accessible design.
- **Demonstration (1 mark):** A working website showcasing modules, core algorithm, and technical implementation.
- **Testing & Project Progress (2 marks):** Test cases, input validation, error handling, and varied SQL cases.
- **Creativity & Innovation (2 marks):** Features like interactive visualizations, index trees, an AI tutor, EXPLAIN comparisons, and multiple explanation levels.

## 3. Target Technology Stack
- **Frontend:** React with modern JavaScript/TypeScript, CSS/Component-styling, and responsive design.
- **Backend:** Python + FastAPI.
- **Database:** MySQL.
- **Visualization:** D3.js, Mermaid.js, or React-compatible visualization libraries.
- **SQL Analysis:** A robust Python SQL parsing library (e.g., `sqlglot` or `sqlparse`) instead of basic string matching.
- **Query Plan:** MySQL `EXPLAIN` statements.

## 4. Development Rules
1. Do not build everything at once. Implement one phase at a time.
2. Preserve working functionality when adding new features.
3. Keep frontend, backend, database, and algorithm logic separated (Modular architecture).
4. Do not hard-code recommendation results.
5. Do not rely on AI to make the core deterministic recommendation decision.
6. Validate all user inputs and provide clear error messages.
7. Test each phase before proceeding.
8. Keep documentation updated.
9. Keep the implementation simple enough for students to understand.
10. Clearly distinguish between the heuristic recommendation score, MySQL EXPLAIN information, and actual query execution time.
