from typing import Dict, List, Any, Tuple
from collections import defaultdict

# Scoring constants based on Phase 0 heuristic
SCORE_WHERE_EQUALITY = 30
SCORE_JOIN = 25
SCORE_WHERE_RANGE = 20
SCORE_ORDER_BY = 20
SCORE_GROUP_BY = 15
SCORE_HIGH_SELECTIVITY = 10

PENALTY_EXACT_EXISTING = -100
PENALTY_REDUNDANT = -30
PENALTY_LOW_SELECTIVITY = -20
PENALTY_MAINTENANCE_PER_COL = -10

THRESHOLD = 30

class RecommendationEngine:
    def __init__(self, analysis: Dict[str, Any], schema_def: Dict[str, Any]):
        self.analysis = analysis
        self.schema = schema_def
        
        # Build quick lookups for schema
        self.tables: Dict[str, Dict[str, Any]] = {}
        for table in self.schema.get("tables", []):
            table_name = table["name"]
            
            # Map column ID to name, and name to definition
            col_id_to_name = {}
            col_name_to_def = {}
            pks = []
            
            for col in table.get("columns", []):
                col_name = col["name"]
                col_id = col["id"]
                col_id_to_name[col_id] = col_name
                col_name_to_def[col_name] = col
                if col.get("is_primary_key"):
                    pks.append(col_name)
                    
            # Map indexes by name and list of column names in order
            indexes = []
            for idx in table.get("indexes", []):
                idx_cols = sorted(idx.get("index_columns", []), key=lambda c: c["seq_in_index"])
                idx_col_names = [col_id_to_name[c["column_id"]] for c in idx_cols if c["column_id"] in col_id_to_name]
                indexes.append({
                    "name": idx["name"],
                    "columns": tuple(idx_col_names)
                })
                
            self.tables[table_name] = {
                "columns": col_name_to_def,
                "pks": tuple(pks),
                "indexes": indexes
            }
            
        self.candidates: Dict[Tuple[str, Tuple[str, ...]], Dict[str, Any]] = {}

    def run(self) -> Dict[str, Any]:
        self._generate_candidates()
        self._score_candidates()
        self._evaluate_existing_indexes()
        
        # Format final response
        candidates_list = []
        recommendations = []
        
        for (table, cols), cand in self.candidates.items():
            status = cand["status"]
            score = cand["score"]
            
            if status == "CANDIDATE":
                if score >= THRESHOLD:
                    status = "RECOMMENDED"
                else:
                    status = "LOW_PRIORITY"
            
            resp = {
                "table": table,
                "columns": list(cols),
                "index_type": "BTREE",
                "score": score,
                "status": status,
                "factors": cand["factors"],
                "existing_index_conflict": cand["existing_index_conflict"]
            }
            candidates_list.append(resp)
            if status == "RECOMMENDED":
                recommendations.append(resp)
                
        # Deterministic sort: score DESC, table ASC, columns ASC
        candidates_list.sort(key=lambda x: (-x["score"], x["table"], tuple(x["columns"])))
        recommendations.sort(key=lambda x: (-x["score"], x["table"], tuple(x["columns"])))
        
        return {
            "query": self.analysis.get("original_query", ""),
            "schema_id": self.schema.get("id", 0),
            "analysis_summary": self.analysis,
            "candidates": candidates_list,
            "recommendations": recommendations[:3] # Limit to top 3 recommendations
        }
        
    def _add_factor(self, table: str, cols: Tuple[str, ...], category: str, points: int, reason: str):
        key = (table, cols)
        if key not in self.candidates:
            self.candidates[key] = {
                "score": 0,
                "status": "CANDIDATE",
                "existing_index_conflict": False,
                "factors": []
            }
        
        # Don't add duplicate factors of the same category for the exact same columns if it's not logical
        # Actually, if multiple equality predicates exist on the same column (rare but possible), we shouldn't double count.
            
        self.candidates[key]["factors"].append({
            "category": category,
            "points": points,
            "reason": reason
        })
        self.candidates[key]["score"] += points

    def _resolve_table_for_col(self, col_name: str, given_table: str = None) -> str:
        """Resolve the table for a column if missing, using the analysis tables list."""
        if given_table:
            return given_table
            
        valid_tables = [t["name"] for t in self.analysis.get("tables", [])]
        found_in = []
        for t in valid_tables:
            if t in self.tables and col_name in self.tables[t]["columns"]:
                found_in.append(t)
        
        if len(found_in) == 1:
            return found_in[0]
        return None

    def _generate_candidates(self):
        # We will collect column evidence per table
        # evidence_per_table[table_name] = {"equality": set(), "range": set(), "order": [], "group": []}
        evidence = defaultdict(lambda: {"equality": set(), "range": set(), "order": [], "group": [], "join": set()})
        
        for where in self.analysis.get("where_conditions", []):
            col_name = where["column"]
            table_name = self._resolve_table_for_col(col_name, where.get("table"))
            if not table_name:
                continue
                
            cls = where["classification"]
            if cls in ["EQUALITY", "IN", "NULL_CHECK"]:
                evidence[table_name]["equality"].add(col_name)
                self._add_factor(table_name, (col_name,), "WHERE_EQUALITY", SCORE_WHERE_EQUALITY, f"Column {col_name} is used in an equality/IN/NULL predicate.")
            elif cls in ["RANGE", "LIKE"]:
                evidence[table_name]["range"].add(col_name)
                self._add_factor(table_name, (col_name,), "WHERE_RANGE", SCORE_WHERE_RANGE, f"Column {col_name} is used in a range/LIKE predicate.")

        for join in self.analysis.get("joins", []):
            for cond in join.get("conditions", []):
                # cond['left'] and cond['right'] are raw expressions. 
                # Our Phase 3 might just have them as strings.
                # To be precise, we know from Phase 3 that joining columns are often fully qualified.
                # Since we don't have perfect parsed join columns from Phase 3, we'll try to guess from raw string.
                # Wait, Phase 4 should ideally use structured info.
                left = cond.get("left", "")
                right = cond.get("right", "")
                
                for side in [left, right]:
                    parts = side.split(".")
                    if len(parts) == 2:
                        t_alias, c_name = parts
                        # Resolve alias
                        t_name = t_alias
                        for t in self.analysis.get("tables", []):
                            if t.get("alias") == t_alias or t.get("name") == t_alias:
                                t_name = t["name"]
                                break
                        evidence[t_name]["join"].add(c_name)
                        self._add_factor(t_name, (c_name,), "JOIN", SCORE_JOIN, f"Column {c_name} is used in a JOIN condition.")

        for order in self.analysis.get("order_by", []):
            col_name = order["column"]
            table_name = self._resolve_table_for_col(col_name, order.get("table"))
            if table_name:
                evidence[table_name]["order"].append(col_name)
                self._add_factor(table_name, (col_name,), "ORDER_BY", SCORE_ORDER_BY, f"Column {col_name} is used in ORDER BY.")

        for group in self.analysis.get("group_by", []):
            col_name = group["column"]
            table_name = self._resolve_table_for_col(col_name, group.get("table"))
            if table_name:
                evidence[table_name]["group"].append(col_name)
                self._add_factor(table_name, (col_name,), "GROUP_BY", SCORE_GROUP_BY, f"Column {col_name} is used in GROUP BY.")

        # Composite Candidates (Equality -> Join -> Order/Group -> Range)
        for table, ev in evidence.items():
            composite = []
            
            # 1. Equality / exact-match predicates
            eq_cols = sorted(list(ev["equality"]))
            for c in eq_cols:
                if c not in composite:
                    composite.append(c)
                    
            # 2. JOIN equality
            join_cols = sorted(list(ev["join"]))
            for c in join_cols:
                if c not in composite:
                    composite.append(c)
            
            # 3. ORDER BY / GROUP BY
            # Maintain order of appearance, but deduplicate
            order_cols = []
            for c in ev["order"]:
                if c not in order_cols:
                    order_cols.append(c)
            
            group_cols = []
            for c in ev["group"]:
                if c not in group_cols:
                    group_cols.append(c)
            
            for c in group_cols + order_cols:
                if c not in composite:
                    composite.append(c)
                    
            # 4. Range predicates
            range_cols = sorted(list(ev["range"]))
            for c in range_cols:
                if c not in composite:
                    composite.append(c)
                    
            if len(composite) > 1:
                comp_tuple = tuple(composite)
                # Combine evidence
                for c in composite:
                    if c in ev["equality"]:
                        self._add_factor(table, comp_tuple, "WHERE_EQUALITY", SCORE_WHERE_EQUALITY, f"Column {c} is used in an equality predicate.")
                    if c in ev["join"]:
                        self._add_factor(table, comp_tuple, "JOIN", SCORE_JOIN, f"Column {c} is used in a JOIN condition.")
                    if c in order_cols:
                        self._add_factor(table, comp_tuple, "ORDER_BY", SCORE_ORDER_BY, f"Column {c} is used in ORDER BY.")
                    if c in group_cols:
                        self._add_factor(table, comp_tuple, "GROUP_BY", SCORE_GROUP_BY, f"Column {c} is used in GROUP BY.")
                    if c in ev["range"]:
                        self._add_factor(table, comp_tuple, "WHERE_RANGE", SCORE_WHERE_RANGE, f"Column {c} is used in a range predicate.")
                
                # Maintenance penalty
                maintenance_penalty = (len(composite) - 1) * PENALTY_MAINTENANCE_PER_COL
                self._add_factor(table, comp_tuple, "MAINTENANCE_COST", maintenance_penalty, f"Composite index with {len(composite)} columns has increased maintenance overhead.")

    def _score_candidates(self):
        for (table, cols), cand in self.candidates.items():
            # Selectivity heuristics
            for col in cols:
                table_def = self.tables.get(table)
                if not table_def:
                    continue
                col_def = table_def["columns"].get(col)
                if not col_def:
                    continue
                
                data_type = col_def["data_type"].upper()
                if "BOOL" in data_type or "TINYINT(1)" in data_type:
                    self._add_factor(table, cols, "LOW_SELECTIVITY", PENALTY_LOW_SELECTIVITY, f"Column {col} is boolean/low selectivity.")
                # High-selectivity scoring is unavailable because actual cardinality/statistical
                # information is not currently available in Phase 2 schema metadata.


    def _evaluate_existing_indexes(self):
        for (table, cols), cand in self.candidates.items():
            table_def = self.tables.get(table)
            if not table_def:
                continue
            
            # Check PK
            pks = table_def["pks"]
            if pks:
                # If the candidate is an exact match for PK
                if cols == pks:
                    self._add_factor(table, cols, "EXISTING_PK", PENALTY_EXACT_EXISTING, "Candidate exactly matches the Primary Key.")
                    cand["status"] = "EXISTING"
                    cand["existing_index_conflict"] = True
                    continue
                    
                # If PK is a left prefix of candidate
                if len(cols) > len(pks) and cols[:len(pks)] == pks:
                    self._add_factor(table, cols, "COVERED_BY_PK", PENALTY_REDUNDANT, "Candidate is partially covered by Primary Key prefix.")
                
                # If candidate is a left prefix of PK
                if len(pks) > len(cols) and pks[:len(cols)] == cols:
                    self._add_factor(table, cols, "EXISTING_PK", PENALTY_EXACT_EXISTING, "Candidate is fully covered by the Primary Key.")
                    cand["status"] = "REDUNDANT"
                    cand["existing_index_conflict"] = True
                    continue

            # Check other indexes
            for idx in table_def["indexes"]:
                idx_cols = idx["columns"]
                if not idx_cols:
                    continue
                    
                if cols == idx_cols:
                    self._add_factor(table, cols, "EXISTING_INDEX", PENALTY_EXACT_EXISTING, f"Candidate exactly matches existing index '{idx['name']}'.")
                    cand["status"] = "EXISTING"
                    cand["existing_index_conflict"] = True
                    break
                    
                # If candidate is a left prefix of an existing index
                if len(idx_cols) > len(cols) and idx_cols[:len(cols)] == cols:
                    self._add_factor(table, cols, "COVERED_BY_INDEX", PENALTY_EXACT_EXISTING, f"Candidate is fully covered by the prefix of existing index '{idx['name']}'.")
                    cand["status"] = "REDUNDANT"
                    cand["existing_index_conflict"] = True
                    break
                    
                # If existing index is a left prefix of candidate
                if len(cols) > len(idx_cols) and cols[:len(idx_cols)] == idx_cols:
                    self._add_factor(table, cols, "REDUNDANT_PREFIX", PENALTY_REDUNDANT, f"Existing index '{idx['name']}' already covers the prefix of this candidate.")
