from typing import Dict, Any, List
import logging
from sqlalchemy import text
from sqlglot import exp
from backend.services.sql_parser import parse_sql, SQLParseError
from backend.database import engine, SessionLocal
from backend.models import TableDef

logger = logging.getLogger(__name__)

class ExplainError(Exception):
    pass

class ExplainAnalyzer:
    def __init__(self, query: str, schema_id: int = None):
        self.query = query
        self.schema_id = schema_id
        self.ast = None

    def _validate_and_translate(self) -> str:
        """
        Ensures the query is a safe SELECT statement and translates logical table names
        to physical table names using the schema_id.
        """
        try:
            self.ast = parse_sql(self.query)
        except SQLParseError as e:
            raise ExplainError(str(e))
            
        # Check if the root node is a SELECT expression
        if not isinstance(self.ast, exp.Select):
            raise ExplainError("Only SELECT queries are allowed for EXPLAIN analysis. Destructive commands (INSERT, UPDATE, DELETE, CREATE, DROP, etc.) are prohibited.")

        if self.schema_id is None:
            return self.query
            
        db = SessionLocal()
        try:
            # Fetch all tables for this schema
            tables = db.query(TableDef).filter(TableDef.schema_id == self.schema_id).all()
            # Map lowercase logical name to physical name
            table_map = {t.name.lower(): f"phy_{self.schema_id}_{t.id}" for t in tables}
            
            # Identify CTEs (Common Table Expressions) so we don't try to map them to physical tables
            cte_names = set()
            for with_ in self.ast.find_all(exp.With):
                for cte in with_.expressions:
                    cte_names.add(cte.alias.lower())

            def replace_table(node):
                if isinstance(node, exp.Table):
                    tname = node.name.lower()
                    if tname in table_map and tname not in cte_names:
                        orig_name = node.name
                        orig_alias = node.alias
                        node.set("this", exp.Identifier(this=table_map[tname]))
                        # BUGFIX: also clear the logical schema/db prefix (e.g. ECOMMERCE.phy_6_6 -> phy_6_6).
                        # When the user writes "FROM ECOMMERCE.orders", sqlglot captures the schema name
                        # as the 'db' attribute on the Table node. After remapping to the physical table name,
                        # this prefix must be removed — ECOMMERCE is a logical name only and is not a real
                        # MySQL database. The physical tables all live in the connected Aiven/MySQL database.
                        node.set("db", None)
                        # If no explicit alias exists, preserve the logical table name as an alias
                        # so that qualified column references (e.g. users.id, orders.user_id)
                        # continue resolving correctly in multi-table queries without explicit aliases.
                        if not orig_alias:
                            node.set("alias", exp.TableAlias(this=exp.Identifier(this=orig_name)))
                return node
                
            translated_ast = self.ast.copy().transform(replace_table)
            return translated_ast.sql(dialect="mysql")
        except Exception as e:
            logger.error(f"Error translating query: {e}")
            raise ExplainError(f"Error translating query: {str(e)}")
        finally:
            db.close()

    def _interpret_access_type(self, access_type: str) -> str:
        """
        Provides an educational explanation of the MySQL access type.
        """
        if not access_type:
            return ""
        
        at = access_type.lower()
        if at == "all":
            return "MySQL is scanning the entire table (full table scan). This can become very expensive as table size increases."
        elif at == "index":
            return "MySQL is scanning the entire index tree (full index scan). Slightly faster than ALL, but still expensive."
        elif at == "range":
            return "MySQL is using an index range scan. Commonly associated with range predicates (>, <, BETWEEN)."
        elif at == "ref":
            return "MySQL is doing an indexed lookup using a non-unique/reference value. Very efficient."
        elif at == "eq_ref":
            return "MySQL is doing an indexed lookup finding one matching row per preceding row in a join (using a PRIMARY KEY or UNIQUE index). Extremely efficient."
        elif at == "const" or at == "system":
            return "MySQL is doing a very selective single-row lookup. Lightning fast."
        return f"MySQL access type: {access_type}."

    def execute_explain(self) -> Dict[str, Any]:
        """
        Executes EXPLAIN and normalizes the output.
        """
        translated_query = self._validate_and_translate()
        
        if engine is None:
            raise ExplainError("Database connection is not configured or MySQL is unavailable.")
        
        # We explicitly concatenate EXPLAIN with the validated query string.
        explain_sql = text(f"EXPLAIN FORMAT=TRADITIONAL {translated_query}")
        
        try:
            with engine.connect() as conn:
                result = conn.execute(explain_sql)
                rows = result.mappings().fetchall()
                
                normalized_rows = []
                for row in rows:
                    r_dict = dict(row)
                    
                    access_type = r_dict.get("type")
                    interpretation = self._interpret_access_type(access_type) if access_type else ""
                    
                    possible_keys = r_dict.get("possible_keys") or r_dict.get("Possible_keys")
                    key = r_dict.get("key") or r_dict.get("Key")
                    
                    # We need to map physical table names back to logical table names for the UI
                    # But if we don't have schema_id, we can't. Wait, the physical table name is 'phy_X_Y'.
                    table_name = r_dict.get("table")
                    
                    # Actually, SQLGlot preserves table aliases if we provided them, e.g. `users AS u`.
                    # In that case, EXPLAIN returns `u` for the table name.
                    # If there's no alias, it returns the physical table name `phy_1_2`.
                    # Let's map it back to logical name if it matches phy_schemaId_tableId pattern.
                    if table_name and self.schema_id and table_name.startswith(f"phy_{self.schema_id}_"):
                        try:
                            t_id = int(table_name.split("_")[-1])
                            db = SessionLocal()
                            t_def = db.query(TableDef).filter(TableDef.id == t_id).first()
                            if t_def:
                                table_name = t_def.name
                            db.close()
                        except:
                            pass
                            
                    normalized_rows.append({
                        "id": r_dict.get("id"),
                        "select_type": r_dict.get("select_type"),
                        "table": table_name,
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
