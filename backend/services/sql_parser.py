import sqlglot
from sqlglot import exp

class SQLParseError(Exception):
    pass

def parse_sql(query: str, dialect: str = "mysql") -> exp.Expression:
    """
    Parses a SQL query into an AST using sqlglot.
    """
    if not query or not query.strip():
        raise SQLParseError("Empty SQL query provided.")
    try:
        # We use parse_one assuming a single statement
        parsed = sqlglot.parse_one(query, read=dialect)
        if not parsed:
             raise SQLParseError("Could not parse SQL query.")
        return parsed
    except sqlglot.errors.ParseError as e:
        raise SQLParseError(f"Syntax error in SQL query: {str(e)}")
    except Exception as e:
        raise SQLParseError(f"Invalid SQL query: {str(e)}")
