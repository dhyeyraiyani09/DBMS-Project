from typing import Dict, List, Any, Optional
from sqlglot import exp
from .sql_parser import parse_sql, SQLParseError

class QueryAnalyzer:
    def __init__(self, query: str):
        self.original_query = query
        self.ast = parse_sql(query)
        self.aliases: Dict[str, str] = {}  # alias -> table_name

    def analyze(self) -> Dict[str, Any]:
        if not isinstance(self.ast, exp.Select):
            raise ValueError("This analyzer currently supports SELECT queries.")
        
        tables = self._extract_tables()
        columns = self._extract_columns()
        where_conditions = self._extract_where()
        joins = self._extract_joins()
        order_by = self._extract_order_by()
        group_by = self._extract_group_by()
        having = self._extract_having()
        
        is_distinct = self.ast.args.get("distinct") is not None
        limit_expr = self.ast.args.get("limit")
        limit_val = limit_expr.expression.this if limit_expr and hasattr(limit_expr.expression, 'this') else None
        
        return {
            "valid": True,
            "original_query": self.original_query,
            "query_type": "SELECT",
            "tables": tables,
            "columns": columns,
            "where_conditions": where_conditions,
            "joins": joins,
            "order_by": order_by,
            "group_by": group_by,
            "having": having,
            "distinct": is_distinct,
            "limit": str(limit_val) if limit_val else None
        }

    def _resolve_alias(self, table_ref: Optional[str]) -> Optional[str]:
        if not table_ref:
            return None
        if table_ref in self.aliases:
            return self.aliases[table_ref]
        ref_lower = table_ref.lower()
        for alias, table_name in self.aliases.items():
            if alias.lower() == ref_lower:
                return table_name
        for t in self.ast.find_all(exp.Table):
            if t.name.lower() == ref_lower:
                return t.name
        return table_ref

    def _extract_tables(self) -> List[Dict[str, str]]:
        tables = []
        for table in self.ast.find_all(exp.Table):
            table_name = table.name
            alias = table.alias if table.alias else None
            if alias:
                self.aliases[alias] = table_name
            tables.append({"name": table_name, "alias": alias})
        return tables

    def _extract_columns(self) -> List[Dict[str, str]]:
        columns = []
        # We want to extract columns but ignore function names etc.
        for col in self.ast.find_all(exp.Column):
            col_name = col.name
            table_ref = col.table
            
            # Resolve alias if present (case-insensitive)
            resolved_table = self._resolve_alias(table_ref) if table_ref else None
            
            # Deduplicate
            col_dict = {"name": col_name, "table": resolved_table, "original_ref": table_ref}
            if col_dict not in columns:
                columns.append(col_dict)
                
        # Also extract columns specified in JOIN ... USING (...)
        for join in self.ast.find_all(exp.Join):
            using_cols = join.args.get("using")
            if using_cols:
                join_table = join.this.name
                resolved_table = self._resolve_alias(join.this.alias or join_table)
                for u_col in using_cols:
                    c_name = u_col.name if hasattr(u_col, "name") else str(u_col).strip('`" ')
                    col_dict = {"name": c_name, "table": resolved_table, "original_ref": join.this.alias or join_table}
                    if col_dict not in columns:
                        columns.append(col_dict)

        return columns

    def _classify_predicate(self, node: exp.Expression) -> str:
        if isinstance(node, exp.EQ):
            return "EQUALITY"
        if isinstance(node, (exp.GT, exp.GTE, exp.LT, exp.LTE, exp.Between)):
            return "RANGE"
        if isinstance(node, exp.In):
            return "IN"
        if isinstance(node, (exp.Like, exp.ILike)):
            return "LIKE"
        if isinstance(node, (exp.Is, exp.Null)):
            return "NULL_CHECK"
        return "OTHER"

    def _extract_where(self) -> List[Dict[str, Any]]:
        where_clause = self.ast.args.get("where")
        if not where_clause:
            return []
            
        conditions = []
        # find_all with exp.Condition covers EQ, GT, LT, IN, LIKE, etc.
        # But we specifically want the granular binary/unary expressions
        for node in where_clause.find_all((exp.Binary, exp.In, exp.Between, exp.Is)):
            if isinstance(node, (exp.And, exp.Or)):
                continue
            # Only process if it's directly evaluating columns
            cols = list(node.find_all(exp.Column))
            if not cols:
                continue
                
            operator = node.key.upper() if hasattr(node, 'key') else type(node).__name__.upper()
            classification = self._classify_predicate(node)
            
            for col in cols:
                table_ref = col.table
                resolved_table = self._resolve_alias(table_ref) if table_ref else None
                
                conditions.append({
                    "column": col.name,
                    "table": resolved_table,
                    "operator": operator,
                    "classification": classification,
                    "expression_raw": node.sql(dialect="mysql")
                })
        return conditions

    def _extract_joins(self) -> List[Dict[str, Any]]:
        joins = []
        tables = list(self.ast.find_all(exp.Table))
        join_nodes = list(self.ast.find_all(exp.Join))
        
        for idx, join in enumerate(join_nodes):
            join_type = join.side.upper() + " JOIN" if join.side else ("INNER JOIN" if join.kind in ("INNER", "") else "JOIN")
            table = join.this.name
            alias = join.this.alias if join.this.alias else None
            
            on_clause = join.args.get("on")
            conditions = []
            if on_clause:
                for eq in on_clause.find_all(exp.EQ):
                    left_col = list(eq.left.find_all(exp.Column))
                    right_col = list(eq.right.find_all(exp.Column))
                    if left_col and right_col:
                        conditions.append({
                            "left": left_col[0].sql(dialect="mysql"),
                            "right": right_col[0].sql(dialect="mysql"),
                            "operator": "="
                        })
            
            using_clause = join.args.get("using")
            if using_clause:
                # Preceding table is tables[idx] since tables contains [from_table, join0_table, join1_table, ...]
                prev_table = tables[idx] if idx < len(tables) else None
                left_ref = (prev_table.alias or prev_table.name) if prev_table else "left"
                right_ref = alias or table
                for u_col in using_clause:
                    c_name = u_col.name if hasattr(u_col, "name") else str(u_col).strip('`" ')
                    conditions.append({
                        "left": f"{left_ref}.{c_name}",
                        "right": f"{right_ref}.{c_name}",
                        "operator": "="
                    })
            
            joins.append({
                "join_type": join_type,
                "table": table,
                "alias": alias,
                "conditions": conditions
            })
        return joins

    def _extract_order_by(self) -> List[Dict[str, Any]]:
        order_by_clause = self.ast.args.get("order")
        if not order_by_clause:
            return []
            
        orders = []
        for i, order in enumerate(order_by_clause.expressions):
            # sqlglot represents order direction with `desc` boolean
            direction = "DESC" if order.args.get("desc") else "ASC"
            col = list(order.find_all(exp.Column))
            if col:
                col_name = col[0].name
                table_ref = col[0].table
                resolved_table = self._resolve_alias(table_ref) if table_ref else None
                
                orders.append({
                    "column": col_name,
                    "table": resolved_table,
                    "direction": direction,
                    "sequence": i + 1
                })
        return orders

    def _extract_group_by(self) -> List[Dict[str, Any]]:
        group_by_clause = self.ast.args.get("group")
        if not group_by_clause:
            return []
            
        groups = []
        for i, group in enumerate(group_by_clause.expressions):
            col = list(group.find_all(exp.Column))
            if col:
                col_name = col[0].name
                table_ref = col[0].table
                resolved_table = self._resolve_alias(table_ref) if table_ref else None
                
                groups.append({
                    "column": col_name,
                    "table": resolved_table,
                    "sequence": i + 1
                })
        return groups

    def _extract_having(self) -> List[Dict[str, Any]]:
        having_clause = self.ast.args.get("having")
        if not having_clause:
            return []
            
        conditions = []
        for node in having_clause.find_all((exp.Binary, exp.In, exp.Between)):
            conditions.append({
                "expression_raw": node.sql(dialect="mysql")
            })
        return conditions
