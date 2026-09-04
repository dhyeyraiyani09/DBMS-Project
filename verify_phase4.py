import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from backend.services.recommendation_engine import RecommendationEngine

def create_schema():
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
    schema = create_schema()
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
    schema = create_schema()
    for _ in range(5):
        engine = RecommendationEngine(analysis, schema)
        res = engine.run()
        c = res["candidates"][0]
        # Should be alphabetical for tie breaking
        assert c["columns"] == ["status", "user_id"], f"Cols: {c['columns']}"
    print("Multiple equality order: PASS")

def test_redundancy_cases():
    schema = create_schema()
    
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
    schema = create_schema()
    schema["tables"][0]["indexes"] = []
    res = RecommendationEngine(analysis, schema).run()
    cands = res["candidates"]
    assert len(cands) == 1
    assert cands[0]["score"] == 50 # 30 EQ + 20 ORDER
    print("Duplicate candidate (merged evidence): PASS")

def test_no_recommendation():
    schema = create_schema()
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

if __name__ == "__main__":
    test_factor_consistency()
    test_multiple_equality_order()
    test_redundancy_cases()
    test_duplicate_candidate()
    test_no_recommendation()
