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
        parsed_statements = sqlglot.parse(query, read=dialect)
        
        # Remove any None entries that might result from trailing semicolons or empty statements
        valid_statements = [stmt for stmt in parsed_statements if stmt is not None]
        
        if len(valid_statements) > 1:
            raise SQLParseError("Only one SQL statement is allowed.")
        if not valid_statements:
            raise SQLParseError("Could not parse SQL query.")
            
        return valid_statements[0]
    except sqlglot.errors.ParseError as e:
        raise SQLParseError(f"Syntax error in SQL query: {str(e)}")
    except SQLParseError:
        raise
    except Exception as e:
        raise SQLParseError(f"Invalid SQL query: {str(e)}")

