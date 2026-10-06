"""
Tests for the centralized MySQL type-mapping fix (normalize_mysql_type).

Covers:
  A. VARCHAR → VARCHAR(255)
  B. INT → INT (unchanged)
  C. DECIMAL → DECIMAL(10,2)
  D. Already-specified types (VARCHAR(255)) handled correctly
  E. Unsupported / injection types rejected with HTTP 400
  F. create_column API: VARCHAR column succeeds
  G. create_column API: INT PRIMARY KEY still works
  H. Real MySQL DDL verification (skipped when MySQL unavailable)
"""
import pytest
from sqlalchemy.pool import StaticPool
from fastapi import HTTPException
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from backend.main import app
from backend.database import Base, get_db
from backend.routers.schema_router import normalize_mysql_type

# ──────────────────────────────────────────────────────────────────────────────
# Shared SQLite in-memory engine (StaticPool keeps the same connection)
# ──────────────────────────────────────────────────────────────────────────────
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


# ──────────────────────────────────────────────────────────────────────────────
# Unit tests for normalize_mysql_type (no DB required)
# ──────────────────────────────────────────────────────────────────────────────
class TestNormalizeMysqlType:
    """Direct unit tests for the helper function."""

    def test_varchar_maps_to_varchar_255(self):
        assert normalize_mysql_type("VARCHAR") == "VARCHAR(255)"

    def test_varchar_already_specified_handled(self):
        # "VARCHAR(255)" base is "VARCHAR" → maps to canonical "VARCHAR(255)"
        assert normalize_mysql_type("VARCHAR(255)") == "VARCHAR(255)"

    def test_varchar_lowercase(self):
        assert normalize_mysql_type("varchar") == "VARCHAR(255)"

    def test_int_stays_int(self):
        assert normalize_mysql_type("INT") == "INT"

    def test_bigint(self):
        assert normalize_mysql_type("BIGINT") == "BIGINT"

    def test_boolean(self):
        assert normalize_mysql_type("BOOLEAN") == "BOOLEAN"

    def test_date(self):
        assert normalize_mysql_type("DATE") == "DATE"

    def test_datetime(self):
        assert normalize_mysql_type("DATETIME") == "DATETIME"

    def test_text(self):
        assert normalize_mysql_type("TEXT") == "TEXT"

    def test_decimal_maps_to_decimal_10_2(self):
        assert normalize_mysql_type("DECIMAL") == "DECIMAL(10,2)"

    def test_float(self):
        assert normalize_mysql_type("FLOAT") == "FLOAT"

    def test_double(self):
        assert normalize_mysql_type("DOUBLE") == "DOUBLE"

    def test_unsupported_type_raises_400(self):
        with pytest.raises(HTTPException) as exc_info:
            normalize_mysql_type("CHAR")
        assert exc_info.value.status_code == 400

    def test_injection_attempt_raises_400(self):
        with pytest.raises(HTTPException) as exc_info:
            normalize_mysql_type("INT; DROP TABLE users;")
        assert exc_info.value.status_code == 400

    def test_empty_string_raises_400(self):
        with pytest.raises(HTTPException) as exc_info:
            normalize_mysql_type("")
        assert exc_info.value.status_code == 400

    def test_none_raises_400(self):
        with pytest.raises(HTTPException) as exc_info:
            normalize_mysql_type(None)
        assert exc_info.value.status_code == 400


# ──────────────────────────────────────────────────────────────────────────────
# API-level integration tests (SQLite, physical DDL skipped automatically)
# ──────────────────────────────────────────────────────────────────────────────
class TestColumnApiTypeFix:
    """Schema API integration tests – DDL gated by dialect check so safe on SQLite."""

    def _create_schema_and_table(self, schema_name, table_name):
        sch = client.post("/api/schemas/", json={"name": schema_name})
        assert sch.status_code == 201, sch.text
        tbl = client.post(f"/api/schemas/{sch.json()['id']}/tables", json={"name": table_name})
        assert tbl.status_code == 201, tbl.text
        return sch.json(), tbl.json()

    def test_varchar_column_succeeds(self):
        """F – VARCHAR column must not raise a 400."""
        _, tbl = self._create_schema_and_table("tm_varchar_schema", "products")
        res = client.post(
            f"/api/schemas/tables/{tbl['id']}/columns",
            json={"name": "name", "data_type": "VARCHAR"},
        )
        assert res.status_code == 201, res.text
        assert res.json()["data_type"] == "VARCHAR"

    def test_int_primary_key_column_succeeds(self):
        """G – INT PRIMARY KEY still works."""
        _, tbl = self._create_schema_and_table("tm_int_schema", "orders")
        res = client.post(
            f"/api/schemas/tables/{tbl['id']}/columns",
            json={"name": "id", "data_type": "INT", "is_primary_key": True},
        )
        assert res.status_code == 201, res.text
        assert res.json()["is_primary_key"] is True

    def test_decimal_column_succeeds(self):
        _, tbl = self._create_schema_and_table("tm_decimal_schema", "items")
        res = client.post(
            f"/api/schemas/tables/{tbl['id']}/columns",
            json={"name": "price", "data_type": "DECIMAL"},
        )
        assert res.status_code == 201, res.text

    def test_unsupported_type_rejected(self):
        """E – unsupported types must be rejected with HTTP 400."""
        _, tbl = self._create_schema_and_table("tm_badtype_schema", "stuff")
        res = client.post(
            f"/api/schemas/tables/{tbl['id']}/columns",
            json={"name": "col", "data_type": "NVARCHAR"},
        )
        assert res.status_code == 400

    def test_injection_type_rejected(self):
        _, tbl = self._create_schema_and_table("tm_injection_schema", "hack")
        res = client.post(
            f"/api/schemas/tables/{tbl['id']}/columns",
            json={"name": "col", "data_type": "INT; DROP TABLE users;"},
        )
        assert res.status_code == 400


# ──────────────────────────────────────────────────────────────────────────────
# Real-MySQL verification (requires live MySQL, skipped otherwise)
# ──────────────────────────────────────────────────────────────────────────────
def _mysql_available():
    try:
        from backend.database import engine as mysql_engine
        if mysql_engine and mysql_engine.dialect.name == "mysql":
            with mysql_engine.connect() as c:
                c.execute(text("SELECT 1"))
            return True
    except Exception:
        pass
    return False


@pytest.mark.skipif(not _mysql_available(), reason="MySQL not available")
class TestMysqlRealVerification:
    """H – Real MySQL DDL verification."""

    def test_real_mysql_varchar_column(self):
        from backend.database import engine as mysql_engine
        test_table = "phy_test_varchar_fix_9999"
        with mysql_engine.connect() as conn:
            conn.execute(text(f"DROP TABLE IF EXISTS `{test_table}`"))
            conn.execute(text(f"CREATE TABLE `{test_table}` (_phy_dummy INT)"))

            mysql_type = normalize_mysql_type("VARCHAR")
            assert mysql_type == "VARCHAR(255)"

            conn.execute(text(f"ALTER TABLE `{test_table}` ADD COLUMN `name` {mysql_type}"))

            row = conn.execute(text(
                "SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS "
                "WHERE TABLE_SCHEMA = DATABASE() "
                "  AND TABLE_NAME = :tbl AND COLUMN_NAME = 'name'"
            ), {"tbl": test_table}).fetchone()

            assert row is not None, "Column 'name' was not created"
            assert "varchar(255)" in row[0].lower(), f"Expected varchar(255), got: {row[0]}"

            conn.execute(text(f"DROP TABLE IF EXISTS `{test_table}`"))
