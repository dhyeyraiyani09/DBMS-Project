# Project Requirements

## 1. Functional Requirements

### 1.1 Core Engine
- The system must accept database schema details (tables, columns, datatypes, PKs, FKs, existing indexes, workload metadata).
- The system must parse and analyze SQL queries (SELECT, FROM, WHERE, JOIN, ORDER BY, GROUP BY, HAVING).
- The system must detect existing indexes to avoid redundant recommendations.
- The system must generate candidate indexes (single and composite).
- The system must score and rank candidate indexes based on a transparent heuristic algorithm.
- The system must generate an explanation for the recommendation.
- The system must run `EXPLAIN` on the MySQL database to compare query plans (before and after simulated index creation).

### 1.2 User Flow
1. Open Website -> Simulator.
2. Enter/Select Schema and Existing Indexes.
3. Enter SQL Query.
4. System Validates Input and Parses SQL.
5. System Identifies Query Operations and Checks Existing Indexes.
6. System Generates and Scores Candidates.
7. System Displays Best Recommendation and Explanation.
8. System Shows Visualizations and EXPLAIN Analysis.
9. User can Save to History or Download a Report.

### 1.3 Mandatory Pages
- **Simulator:** The core application interface.
- **Learn:** Educational content about database indexes, B-trees, optimizations, etc.
- **Developed By:** Team member details, photos, and guide information.
- **Help:** User manual explaining how to use the app and interpret results.
- **Download:** Ability to download reports (PDF/DOCX/TXT).
- **History:** Log of previously analyzed queries and recommendations.

## 2. Non-Functional Requirements

### 2.1 Performance
- Core recommendation operations and query parsing should respond within ~2 seconds.

### 2.2 Security
- Protection against SQL injection.
- Input sanitization on all user-provided schemas and queries.
- API validation.
- Safe read-only execution or restricted privileges for the database connection running `EXPLAIN`.

### 2.3 Accessibility
- Support for keyboard navigation.
- High contrast themes (Day ☀️ / Night 🌙 modes).
- Screen-reader friendly labels and proper ARIA tags.
- Visible focus indicators for interactive elements.

### 2.4 Compatibility & Maintainability
- Support modern browsers (Chrome, Edge, Firefox, Safari).
- Modular architecture with clear separation of concerns (Frontend, Backend, DB, Algorithm).
- Reusable components and clear naming conventions.

## 3. Five Initial Demonstration Cases

### Case 1: Simple WHERE query
- **Schema:** `users(id PK, name, email, age)`
- **Query:** `SELECT * FROM users WHERE age > 25;`
- **Expected:** Single-column index on `age`. High score due to WHERE usage.
- **Validation:** Ensures basic filtering is detected.

### Case 2: WHERE + ORDER BY (Composite Index)
- **Schema:** `orders(id PK, user_id, amount, order_date)`
- **Query:** `SELECT * FROM orders WHERE user_id = 5 ORDER BY order_date DESC;`
- **Expected:** Composite index on `(user_id, order_date)`.
- **Validation:** Ensures composite index ordering principles are followed.

### Case 3: JOIN query
- **Schema:** `users(id PK, name)`, `posts(id PK, user_id FK, title)`
- **Query:** `SELECT u.name, p.title FROM users u JOIN posts p ON u.id = p.user_id;`
- **Expected:** Index on foreign key `posts.user_id` to speed up the JOIN.
- **Validation:** Ensures JOIN conditions are extracted and indexed appropriately.

### Case 4: Existing Index
- **Schema:** `products(id PK, category_id, price)` with an existing index on `category_id`.
- **Query:** `SELECT * FROM products WHERE category_id = 3;`
- **Expected:** System detects existing index and recommends NO new index, or explains that the current one is optimal.
- **Validation:** Tests the system's ability to avoid redundant recommendations.

### Case 5: Low-selectivity column
- **Schema:** `employees(id PK, name, is_active)`
- **Query:** `SELECT * FROM employees WHERE is_active = 1;`
- **Expected:** Recommendation engine penalizes the column due to low selectivity (boolean) and suggests full table scan might be more efficient.
- **Validation:** Tests heuristic penalty for low-cardinality/selectivity columns.
