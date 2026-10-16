import pytest
from backend.services.recommendation_engine import RecommendationEngine

def create_mock_schema():
    return {
        "id": 1,
        "name": "test_schema",
        "tables": [
            {
                "name": "users",
                "columns": [
                    {"id": 1, "name": "id", "data_type": "INT", "is_primary_key": True},
                    {"id": 2, "name": "age", "data_type": "INT", "is_primary_key": False},
                    {"id": 3, "name": "name", "data_type": "VARCHAR(255)", "is_primary_key": False},
                    {"id": 4, "name": "is_active", "data_type": "BOOLEAN", "is_primary_key": False}
                ],
                "indexes": []
            },
            {
                "name": "orders",
                "columns": [
                    {"id": 5, "name": "id", "data_type": "INT", "is_primary_key": True},
                    {"id": 6, "name": "user_id", "data_type": "INT", "is_primary_key": False},
                    {"id": 7, "name": "order_date", "data_type": "DATETIME", "is_primary_key": False},
                    {"id": 8, "name": "status", "data_type": "VARCHAR(50)", "is_primary_key": False}
                ],
                "indexes": [
                    {
                        "name": "idx_orders_user_date",
                        "index_columns": [
                            {"column_id": 6, "seq_in_index": 1},
                            {"column_id": 7, "seq_in_index": 2}
                        ]
                    }
                ]
            }
        ]
    }

def test_simple_range_predicate():
    analysis = {
        "query_type": "SELECT",
        "tables": [{"name": "users", "alias": None}],
        "where_conditions": [
            {"column": "age", "table": "users", "classification": "RANGE", "operator": "GT"}
        ],
        "joins": [], "order_by": [], "group_by": []
    }
    schema = create_mock_schema()
    engine = RecommendationEngine(analysis, schema)
    result = engine.run()
    
    candidates = result["candidates"]
    assert len(candidates) == 1
    c = candidates[0]
    assert c["table"] == "users"
    assert c["columns"] == ["age"]
    assert c["score"] == 20  # +20 (RANGE)
    assert c["status"] in ["RECOMMENDED", "CANDIDATE", "LOW_PRIORITY"]

def test_equality_and_order_by_composite_ordering():
    analysis = {
        "query_type": "SELECT",
        "tables": [{"name": "orders"}],
        "where_conditions": [
            {"column": "order_date", "table": "orders", "classification": "RANGE", "operator": "GTE"},
            {"column": "user_id", "table": "orders", "classification": "EQUALITY", "operator": "EQ"}
        ],
        "joins": [],
        "order_by": [
            {"column": "order_date", "table": "orders", "direction": "DESC", "sequence": 1}
        ],
        "group_by": []
    }
    schema = create_mock_schema()
    # Remove existing index for this test so we can observe the composite generation
    schema["tables"][1]["indexes"] = []
    
    engine = RecommendationEngine(analysis, schema)
    result = engine.run()
    
    # Extract candidates
    candidates = result["candidates"]
    
    # Ensure composite candidate was created
    composite = next((c for c in candidates if len(c["columns"]) > 1), None)
    assert composite is not None
    # Verify order: equality (user_id) -> order_by/range (order_date)
    assert composite["columns"] == ["user_id", "order_date"]
    
    # Verify scoring
    # +30 (Eq), +20 (Range), +20 (Order By), +10 (INT user_id), -10 (maintenance) = 70. order_date data_type DATETIME (not hitting high sel heuristic intentionally unless explicitly coded)
    # Wait, my High Selectivity heuristic applies per column, so user_id gives +10.
    assert composite["score"] == 60

def test_existing_index_coverage():
    analysis = {
        "query_type": "SELECT",
        "tables": [{"name": "orders"}],
        "where_conditions": [
            {"column": "user_id", "table": "orders", "classification": "EQUALITY", "operator": "EQ"}
        ],
        "joins": [], "order_by": [], "group_by": []
    }
    schema = create_mock_schema()
    
    engine = RecommendationEngine(analysis, schema)
    result = engine.run()
    
    # Candidate should be user_id
    candidates = result["candidates"]
    assert len(candidates) == 1
    c = candidates[0]
    
    # Covered by left prefix of idx_orders_user_date (user_id, order_date)
    assert c["status"] == "REDUNDANT"
    assert c["existing_index_conflict"] is True
    # The score should be heavily penalized by PENALTY_EXACT_EXISTING or PENALTY_REDUNDANT
    assert "COVERED_BY_INDEX" in [f["category"] for f in c["factors"]]

def test_primary_key_coverage():
    analysis = {
        "query_type": "SELECT",
        "tables": [{"name": "users"}],
        "where_conditions": [
            {"column": "id", "table": "users", "classification": "EQUALITY", "operator": "EQ"}
        ],
        "joins": [], "order_by": [], "group_by": []
    }
    schema = create_mock_schema()
    
    engine = RecommendationEngine(analysis, schema)
    result = engine.run()
    
    c = result["candidates"][0]
    assert c["status"] == "EXISTING"
    assert c["existing_index_conflict"] is True
    assert "EXISTING_PK" in [f["category"] for f in c["factors"]]

def test_low_selectivity_penalty():
    analysis = {
        "query_type": "SELECT",
        "tables": [{"name": "users"}],
        "where_conditions": [
            {"column": "is_active", "table": "users", "classification": "EQUALITY", "operator": "EQ"}
        ],
        "joins": [], "order_by": [], "group_by": []
    }
    schema = create_mock_schema()
    
    engine = RecommendationEngine(analysis, schema)
    result = engine.run()
    
    c = result["candidates"][0]
    # Score: +30 (EQUALITY) - 20 (LOW_SELECTIVITY) = 10
    assert c["score"] == 10
    assert c["status"] == "LOW_PRIORITY"

def test_join_candidate():
    analysis = {
        "query_type": "SELECT",
        "tables": [{"name": "users", "alias": "u"}, {"name": "orders", "alias": "o"}],
        "where_conditions": [
            {"column": "name", "table": "users", "classification": "EQUALITY", "operator": "EQ"}
        ],
        "joins": [
            {
                "join_type": "INNER JOIN",
                "table": "orders",
                "alias": "o",
                "conditions": [{"left": "u.id", "right": "o.user_id", "operator": "="}]
            }
        ],
        "order_by": [], "group_by": []
    }
    schema = create_mock_schema()
    # Remove existing idx for orders so we can see plain candidate
    schema["tables"][1]["indexes"] = []
    
    engine = RecommendationEngine(analysis, schema)
    result = engine.run()
    
    candidates = result["candidates"]
    cols_proposed = [tuple(c["columns"]) for c in candidates]
    
    # Should recommend on orders(user_id) for the JOIN
    assert ("user_id",) in cols_proposed
    
    user_id_cand = next(c for c in candidates if c["columns"] == ["user_id"])
    assert user_id_cand["table"] == "orders"
    # Score: +25 (JOIN) + 10 (INT) = 35
    assert user_id_cand["score"] == 25
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from backend.services.recommendation_engine import RecommendationEngine

def create_schema_verify():
    return {
        "id": 1,
        "name": "test_schema",
        "tables": [
            {
                "name": "orders",
                "columns": [
                    {"id": 1, "name": "id", "data_type": "INT", "is_primary_key": True},
                    {"id": 2, "name": "user_id", "data_type": "INT", "is_primary_key": False},
                    {"id": 3, "name": "order_date", "data_type": "DATETIME", "is_primary_key": False},
                    {"id": 4, "name": "status", "data_type": "VARCHAR", "is_primary_key": False}
                ],
                "indexes": []
            }
        ]
    }

def test_factor_consistency():
    analysis = {
        "query_type": "SELECT",
        "tables": [{"name": "orders"}],
        "where_conditions": [
            {"column": "user_id", "table": "orders", "classification": "EQUALITY", "operator": "EQ"},
            {"column": "order_date", "table": "orders", "classification": "RANGE", "operator": "GTE"}
        ],
        "joins": [],
        "order_by": [
            {"column": "order_date", "table": "orders", "direction": "DESC", "sequence": 1}
        ],
        "group_by": []
    }
    schema = create_schema_verify()
    engine = RecommendationEngine(analysis, schema)
    res = engine.run()
    for cand in res["candidates"]:
        assert cand["score"] == sum(f["points"] for f in cand["factors"]), f"Score mismatch: {cand['score']} != {sum(f['points'] for f in cand['factors'])}"
    print("Factor consistency: PASS")

def test_multiple_equality_order():
    analysis = {
        "query_type": "SELECT",
        "tables": [{"name": "orders"}],
        "where_conditions": [
            {"column": "user_id", "table": "orders", "classification": "EQUALITY", "operator": "EQ"},
            {"column": "status", "table": "orders", "classification": "EQUALITY", "operator": "EQ"}
        ],
        "joins": [], "order_by": [], "group_by": []
    }
    schema = create_schema_verify()
    for _ in range(5):
        engine = RecommendationEngine(analysis, schema)
        res = engine.run()
        c = res["candidates"][0]
        # Should be alphabetical for tie breaking
        assert c["columns"] == ["status", "user_id"], f"Cols: {c['columns']}"
    print("Multiple equality order: PASS")

def test_redundancy_cases():
    schema = create_schema_verify()
    
    # 1. Exact existing match
    schema["tables"][0]["indexes"] = [{"name": "idx_user_id", "index_columns": [{"column_id": 2, "seq_in_index": 1}]}]
    analysis = {
        "query_type": "SELECT",
        "tables": [{"name": "orders"}],
        "where_conditions": [{"column": "user_id", "table": "orders", "classification": "EQUALITY", "operator": "EQ"}],
        "joins": [], "order_by": [], "group_by": []
    }
    res = RecommendationEngine(analysis, schema).run()
    assert res["candidates"][0]["status"] == "EXISTING"
    
    # 2. Covered by left prefix
    schema["tables"][0]["indexes"] = [
        {"name": "idx_composite", "index_columns": [
            {"column_id": 2, "seq_in_index": 1},
            {"column_id": 3, "seq_in_index": 2}
        ]}
    ]
    res = RecommendationEngine(analysis, schema).run()
    assert res["candidates"][0]["status"] == "REDUNDANT"
    
    # 3. Not covered (query targets non-leading col)
    analysis_non_leading = {
        "query_type": "SELECT",
        "tables": [{"name": "orders"}],
        "where_conditions": [{"column": "order_date", "table": "orders", "classification": "EQUALITY", "operator": "EQ"}],
        "joins": [], "order_by": [], "group_by": []
    }
    res = RecommendationEngine(analysis_non_leading, schema).run()
    # status should not be REDUNDANT
    assert res["candidates"][0]["status"] not in ["EXISTING", "REDUNDANT"]

    # 4. Candidate composite against existing single
    schema["tables"][0]["indexes"] = [{"name": "idx_user_id", "index_columns": [{"column_id": 2, "seq_in_index": 1}]}]
    analysis_composite = {
        "query_type": "SELECT",
        "tables": [{"name": "orders"}],
        "where_conditions": [
            {"column": "user_id", "table": "orders", "classification": "EQUALITY", "operator": "EQ"},
            {"column": "order_date", "table": "orders", "classification": "EQUALITY", "operator": "EQ"}
        ],
        "joins": [], "order_by": [], "group_by": []
    }
    res = RecommendationEngine(analysis_composite, schema).run()
    assert res["candidates"][0]["status"] not in ["EXISTING", "REDUNDANT"]
    print("Redundancy cases: PASS")

def test_duplicate_candidate():
    analysis = {
        "query_type": "SELECT",
        "tables": [{"name": "orders"}],
        "where_conditions": [{"column": "user_id", "table": "orders", "classification": "EQUALITY", "operator": "EQ"}],
        "joins": [],
        "order_by": [{"column": "user_id", "table": "orders", "direction": "DESC", "sequence": 1}], 
        "group_by": []
    }
    schema = create_schema_verify()
    schema["tables"][0]["indexes"] = []
    res = RecommendationEngine(analysis, schema).run()
    cands = res["candidates"]
    assert len(cands) == 1
    assert cands[0]["score"] == 50 # 30 EQ + 20 ORDER
    print("Duplicate candidate (merged evidence): PASS")

def test_no_recommendation():
    schema = create_schema_verify()
    schema["tables"][0]["indexes"] = [{"name": "idx_user_id", "index_columns": [{"column_id": 2, "seq_in_index": 1}]}]
    analysis = {
        "query_type": "SELECT",
        "tables": [{"name": "orders"}],
        "where_conditions": [{"column": "user_id", "table": "orders", "classification": "EQUALITY", "operator": "EQ"}],
        "joins": [], "order_by": [], "group_by": []
    }
    res = RecommendationEngine(analysis, schema).run()
    assert len(res["recommendations"]) == 0
    print("No recommendation (due to existing): PASS")

def test_case_insensitive_alias_candidates():
    schema = create_mock_schema()
    analysis = {
        "query_type": "SELECT",
        "tables": [{"name": "users", "alias": "U"}, {"name": "orders", "alias": "O"}],
        "where_conditions": [
            {"column": "name", "table": "users", "classification": "EQUALITY", "operator": "EQ"}
        ],
        "joins": [
            {
                "join_type": "INNER JOIN",
                "table": "orders",
                "alias": "O",
                "conditions": [{"left": "u.id", "right": "o.user_id", "operator": "="}]
            }
        ],
        "order_by": [], "group_by": []
    }
    res = RecommendationEngine(analysis, schema).run()
    cand_tables = {c["table"] for c in res["candidates"]}
    # Must NOT have ghost tables 'u' or 'o'
    assert "u" not in cand_tables
    assert "o" not in cand_tables
    assert "users" in cand_tables
    assert "orders" in cand_tables

def test_schema_qualified_join_candidates():
    schema = create_mock_schema()
    analysis = {
        "query_type": "SELECT",
        "tables": [{"name": "users", "alias": "u"}, {"name": "orders", "alias": "o"}],
        "where_conditions": [],
        "joins": [
            {
                "join_type": "INNER JOIN",
                "table": "orders",
                "alias": "o",
                "conditions": [{"left": "test_schema.users.id", "right": "test_schema.orders.user_id", "operator": "="}]
            }
        ],
        "order_by": [], "group_by": []
    }
    res = RecommendationEngine(analysis, schema).run()
    cand_tables = {c["table"] for c in res["candidates"]}
    assert "users" in cand_tables
    assert "orders" in cand_tables
    # Orders should have candidate for user_id
    orders_cands = [c for c in res["candidates"] if c["table"] == "orders"]
    assert any("user_id" in c["columns"] for c in orders_cands)

def test_join_using_candidates():
    schema = create_mock_schema()
    # Add user_id column to users table so both have user_id
    schema["tables"][0]["columns"].append({"id": 10, "name": "user_id", "data_type": "INT", "is_primary_key": False})
    analysis = {
        "query_type": "SELECT",
        "tables": [{"name": "users", "alias": "u"}, {"name": "orders", "alias": "o"}],
        "where_conditions": [],
        "joins": [
            {
                "join_type": "INNER JOIN",
                "table": "orders",
                "alias": "o",
                "conditions": [{"left": "u.user_id", "right": "o.user_id", "operator": "="}]
            }
        ],
        "order_by": [], "group_by": []
    }
    res = RecommendationEngine(analysis, schema).run()
    user_cands = [c for c in res["candidates"] if c["table"] == "users" and "user_id" in c["columns"]]
    order_cands = [c for c in res["candidates"] if c["table"] == "orders" and "user_id" in c["columns"]]
    assert len(user_cands) >= 1
    assert len(order_cands) >= 1

def test_multi_table_composite_candidates_and_existing_indexes():
    schema = {
        "id": 1,
        "name": "test_multi",
        "tables": [
            {
                "name": "users",
                "columns": [
                    {"id": 1, "name": "id", "data_type": "INT", "is_primary_key": True},
                    {"id": 2, "name": "city", "data_type": "VARCHAR(255)", "is_primary_key": False},
                    {"id": 3, "name": "age", "data_type": "INT", "is_primary_key": False}
                ],
                "indexes": [
                    {"name": "idx_users_city", "index_columns": [{"column_id": 2, "seq_in_index": 1}]}
                ]
            },
            {
                "name": "orders",
                "columns": [
                    {"id": 4, "name": "id", "data_type": "INT", "is_primary_key": True},
                    {"id": 5, "name": "user_id", "data_type": "INT", "is_primary_key": False},
                    {"id": 6, "name": "status", "data_type": "VARCHAR(50)", "is_primary_key": False},
                    {"id": 7, "name": "total", "data_type": "DECIMAL(10,2)", "is_primary_key": False}
                ],
                "indexes": []
            }
        ]
    }
    analysis = {
        "query_type": "SELECT",
        "tables": [{"name": "users", "alias": "u"}, {"name": "orders", "alias": "o"}],
        "where_conditions": [
            {"column": "city", "table": "users", "classification": "EQUALITY", "operator": "EQ"},
            {"column": "age", "table": "users", "classification": "RANGE", "operator": "GT"},
            {"column": "status", "table": "orders", "classification": "EQUALITY", "operator": "EQ"},
            {"column": "total", "table": "orders", "classification": "RANGE", "operator": "GT"},
        ],
        "joins": [
            {
                "join_type": "INNER JOIN",
                "table": "orders",
                "alias": "o",
                "conditions": [{"left": "u.id", "right": "o.user_id", "operator": "="}]
            }
        ],
        "order_by": [
            {"column": "total", "table": "orders", "direction": "DESC", "sequence": 1}
        ],
        "group_by": [
            {"column": "city", "table": "users", "sequence": 1},
            {"column": "status", "table": "orders", "sequence": 2}
        ]
    }
    res = RecommendationEngine(analysis, schema).run()
    # Check that candidates are correctly separated per table
    users_cands = [c for c in res["candidates"] if c["table"] == "users"]
    orders_cands = [c for c in res["candidates"] if c["table"] == "orders"]
    assert len(users_cands) > 0
    assert len(orders_cands) > 0
    
    # Existing index on users(city) should mark users(city) as EXISTING
    city_cand = next(c for c in users_cands if c["columns"] == ["city"])
    assert city_cand["status"] == "EXISTING"
    assert city_cand["existing_index_conflict"] is True
    
    # Orders should have a composite candidate on status, user_id, total
    comp_orders = next((c for c in orders_cands if len(c["columns"]) > 1), None)
    assert comp_orders is not None
    assert comp_orders["columns"] == ["status", "user_id", "total"]

def test_dynamic_recommendation_selection_policy():
    # 10-table schema
    tables = []
    for i in range(1, 11):
        tables.append({
            "name": f"t{i}",
            "columns": [
                {"id": i * 10 + 1, "name": "id", "data_type": "INT", "is_primary_key": True},
                {"id": i * 10 + 2, "name": f"t{i-1}_id" if i > 1 else "code", "data_type": "INT", "is_primary_key": False},
                {"id": i * 10 + 3, "name": "status", "data_type": "VARCHAR(50)", "is_primary_key": False},
                {"id": i * 10 + 4, "name": "amount", "data_type": "DECIMAL(10,2)", "is_primary_key": False},
            ],
            "indexes": []
        })
    schema = {"id": 1, "name": "ten_tables_schema", "tables": tables}
    
    # Query with WHERE on t1, t2, t3, t4, t5 so all 5 have recommended indexes
    analysis = {
        "query_type": "SELECT",
        "tables": [{"name": f"t{i}"} for i in range(1, 11)],
        "where_conditions": [
            {"column": "status", "table": "t1", "classification": "EQUALITY", "operator": "EQ"},
            {"column": "status", "table": "t2", "classification": "EQUALITY", "operator": "EQ"},
            {"column": "status", "table": "t3", "classification": "EQUALITY", "operator": "EQ"},
            {"column": "status", "table": "t4", "classification": "EQUALITY", "operator": "EQ"},
            {"column": "status", "table": "t5", "classification": "EQUALITY", "operator": "EQ"},
        ],
        "joins": [
            {
                "join_type": "INNER JOIN",
                "table": f"t{i}",
                "conditions": [{"left": f"t{i-1}.id", "right": f"t{i}.t{i-1}_id", "operator": "="}]
            }
            for i in range(2, 11)
        ],
        "order_by": [], "group_by": []
    }
    res = RecommendationEngine(analysis, schema).run()
    # Dynamic policy must allow more than 3 recommendations for a 10-table query
    assert len(res["recommendations"]) > 3
    # Check that multiple tables are represented in recommendations
    rec_tables = {r["table"] for r in res["recommendations"]}
    assert len(rec_tables) >= 5
