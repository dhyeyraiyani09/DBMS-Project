from typing import Dict, Any, List
import logging
from sqlalchemy import text
from sqlglot import exp
from backend.services.sql_parser import parse_sql, SQLParseError
from backend.database import engine

logger = logging.getLogger(__name__)

class ExplainError(Exception):
    pass

class ExplainAnalyzer:
    def __init__(self, query: str):
        self.query = query

    def _validate_safe_select(self):
        """
        Ensures the query is a safe SELECT statement to prevent destructive EXPLAIN execution.
        """
        ast = parse_sql(self.query)
        # Check if the root node is a SELECT expression
        if not isinstance(ast, exp.Select):
            raise ExplainError("Only SELECT queries are allowed for EXPLAIN analysis. Destructive commands (INSERT, UPDATE, DELETE, CREATE, DROP, etc.) are prohibited.")

    def _interpret_access_type(self, access_type: str) -> str:
        """
        Provides an educational explanation of the MySQL access type.
        """
        if not access_type:
            return ""
        
        at = access_type.lower()
        if at == "all":
            return "MySQL is scanning the entire table. This can become very expensive as table size increases."
        elif at == "index":
            return "MySQL is scanning the entire index tree. Slightly faster than ALL, but still expensive."
        elif at == "range":
            return "MySQL is using an index range lookup. Commonly associated with range predicates (>, <, BETWEEN)."
        elif at == "ref":
            return "MySQL is using a non-unique index to find rows. Very efficient."
        elif at == "eq_ref":
            return "MySQL is using a PRIMARY KEY or UNIQUE index, finding exactly one row. Extremely efficient."
        elif at == "const" or at == "system":
            return "MySQL treats this table as having only one row. Lightning fast."
        return f"MySQL access type: {access_type}."

    def execute_explain(self) -> Dict[str, Any]:
        """
        Executes EXPLAIN and normalizes the output.
        """
        self._validate_safe_select()
        
        if engine is None:
            raise ExplainError("Database connection is not configured or MySQL is unavailable.")
        
        # We explicitly concatenate EXPLAIN with the validated query string. 
        # We know it's a single SELECT statement thanks to parse_sql and validation above.
        explain_sql = text(f"EXPLAIN FORMAT=TRADITIONAL {self.query}")
        
        try:
            with engine.connect() as conn:
                result = conn.execute(explain_sql)
                rows = result.mappings().fetchall()
                
                normalized_rows = []
                for row in rows:
                    r_dict = dict(row)
                    
                    access_type = r_dict.get("type")
                    interpretation = self._interpret_access_type(access_type) if access_type else ""
                    
                    # Some MySQL versions return different casing
                    possible_keys = r_dict.get("possible_keys") or r_dict.get("Possible_keys")
                    key = r_dict.get("key") or r_dict.get("Key")
                    
                    normalized_rows.append({
                        "id": r_dict.get("id"),
                        "select_type": r_dict.get("select_type"),
                        "table": r_dict.get("table"),
                        "type": access_type,
                        "possible_keys": possible_keys,
                        "key": key,
                        "key_len": r_dict.get("key_len"),
                        "ref": r_dict.get("ref"),
                        "rows": r_dict.get("rows"),
                        "filtered": r_dict.get("filtered"),
                        "Extra": r_dict.get("Extra"),
                        "interpretation": interpretation
                    })
                    
                return {
                    "success": True,
                    "explain_rows": normalized_rows,
                    "summary": f"EXPLAIN returned {len(normalized_rows)} row(s)."
                }
                
        except Exception as e:
            logger.error(f"EXPLAIN execution failed: {e}")
            raise ExplainError(f"EXPLAIN execution failed: {str(e)}")
