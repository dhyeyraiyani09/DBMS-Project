# Phase 4 Implementation Details

## 1. Objective
The goal of Phase 4 was to build the core deterministic Index Recommendation Engine. The engine takes the parsed SQL representation from Phase 3 and the database schema structure from Phase 2 to programmatically generate, validate, score, and rank index recommendations. The recommendations are generated using an explicit ruleset representing an educational heuristic, not actual database cost metrics.

## 2. Architecture
```text
Query Analysis (Phase 3 AST Parser)
 ↓
Candidate Generation (Groups relevant columns by Equality, Order/Group, Range)
 ↓
Validation (Validates against existing DB schema layout / redundant prefix matching)
 ↓
Scoring (Points assigned for where/order/group predicates and datatype selectivity)
 ↓
Ranking (Orders by score DESC, with deterministic alphabetical tie breakers)
 ↓
Recommendation (Returns structured JSON arrays encapsulating status and factor breakdown)
```

## 3. Candidate Generation Rules
The candidate generator operates deterministically on the structured outputs from Phase 3, avoiding parsing raw SQL directly.
* **WHERE Equality / IN / NULL Checks**: Mapped as highly relevant Equality candidates.
* **WHERE Range / LIKE**: Mapped as Range candidates.
* **JOINs**: Columns linked in ON statements are identified.
* **ORDER BY & GROUP BY**: Extracted for indexing.

## 4. Composite Index Logic
When multiple index-worthy conditions occur on the same table, the columns are merged into a composite tuple following the strict ordering heuristics mapping the standard standard b-tree access optimal order:
`Equality Predicates -> Ordering / Grouping -> Range Predicates`
*Example*: `WHERE user_id = 5 AND order_date > '2026-01-01' ORDER BY order_date DESC` generates `(user_id, order_date)`.

## 5. Existing Index Detection
The engine evaluates candidates against existing schema metadata retrieved via Phase 2 definitions. 
* **Exact Coverage**: If the candidate exactly matches a Primary Key or Existing Index, it is heavily penalized (`-100`) and marked as `EXISTING`.
* **Left-Prefix Coverage**: If an existing index serves the candidate's exact column sequence as a left-most prefix, the candidate is penalized (`-30`) and marked as `REDUNDANT`.

## 6. Scoring Formula
The deterministic implementation relies on exact metric constants:
* `SCORE_WHERE_EQUALITY = +30`
* `SCORE_JOIN = +25`
* `SCORE_WHERE_RANGE = +20`
* `SCORE_ORDER_BY = +20`
* `SCORE_GROUP_BY = +15`
* `SCORE_HIGH_SELECTIVITY = +10` (Heuristic applying to INT/VARCHAR/UUID)
* `PENALTY_EXACT_EXISTING = -100`
* `PENALTY_REDUNDANT = -30`
* `PENALTY_LOW_SELECTIVITY = -20` (Heuristic applying to BOOLEAN / TINYINT(1))
* `PENALTY_MAINTENANCE_PER_COL = -10` (Applied to every column exceeding 1 in a composite index)

**Recommendation Threshold**: `30` points minimum.

## 7. Example Recommendation
**Query**: `SELECT * FROM orders WHERE user_id = 5 AND order_date >= '2026-01-01' ORDER BY order_date DESC;`
**Candidate**: `orders (user_id, order_date)`
**Score**: `70`
**Factors**:
* `+30` Column user_id is used in an equality predicate.
* `+20` Column order_date is used in ORDER BY.
* `+20` Column order_date is used in a range predicate.
* `+10` Column user_id likely has high selectivity.
* `-10` Composite index with 2 columns has increased maintenance overhead.
**Final status**: `RECOMMENDED`

## 8. Five Demonstration Cases
* **CASE 1 (Simple Range)**: `WHERE age > 25` generates candidate `users (age)` categorized as RANGE and HIGH_SELECTIVITY (+30). Marked `RECOMMENDED`.
* **CASE 2 (Composite Ordering)**: `WHERE user_id = 5 ORDER BY order_date DESC` generates composite candidate `orders (user_id, order_date)`. The sequence retains exact heuristics (+30 EQ, +20 ORDER, +10 SEL, -10 MAINT). Marked `RECOMMENDED` (Score 50).
* **CASE 3 (JOINs & Coverage)**: `JOIN orders o ON u.id = o.user_id WHERE u.id = 5` proposes `users(id)` and `orders(user_id)`. `users(id)` is identified as the `EXISTING_PK` and marked `EXISTING`. `orders(user_id)` evaluates to +35 and is `RECOMMENDED`.
* **CASE 4 (Redundant Prefix)**: Evaluating `WHERE user_id = 5` against an existing index `(user_id, order_date)`. The candidate `(user_id)` matches the prefix, triggers `REDUNDANT_PREFIX` (-30 points), and receives status `REDUNDANT`.
* **CASE 5 (Low Selectivity)**: `WHERE is_active = TRUE`. The boolean column is identified, the +30 Equality score is offset by -20 `LOW_SELECTIVITY` bringing the total to `10`. The index falls under the threshold (`30`) and receives status `LOW_PRIORITY`.

## 9. Testing
Testing results using exhaustive deterministic mock schemas overriding the FastAPI integration layers:
* Candidate Generation: `PASSED`
* Composite Rules: `PASSED`
* Existing Indexes (PK & Prefixes): `PASSED`
* Low Selectivity Discarding: `PASSED`

## 10. Security
* **User SQL executed during recommendation:** NO. (Parsed dynamically as AST via Phase 3 pipeline)
* **AI used to determine recommendation:** NO. (Determined strictly using documented math operators evaluated securely on the backend)

## 11. Determinism
Determinism has been fully verified. Set sorting mechanisms wrap all unordered dictionary retrievals ensuring factors and permutations cascade equivalently, while tie-breakers depend strictly on descending scores then ascending table structures ensuring zero random variance.

## 12. Issues Found
During implementation, standard loop iteration dynamically shifted tuple composition structures making tests frail due to random dictionary key hashing allocations under Python >3.3.

## 13. Fixes Made
All column collection buckets inside `_generate_candidates` have been explicitly wrapped with `sorted()` evaluations enforcing stable AST mapping extraction regardless of environment hashing logic.

## 14. Documentation
* **Updated**: `README.md`, `CHANGELOG.md`, `docs/api-design.md`, `docs/algorithm-design.md`
* **Created**: `docs/phase-4-implementation.md`

## 15. Deferred Work
* Advanced interactive recommendation visualization (Phase 5).
* B-Tree representations (Phase 5).
* MySQL EXPLAIN logic triggering physical validation mapping (Phase 6).
* Usage history (Phase 7).
* Reporting & AI Tutoring (Phase 8/9).
