import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.main import app
from backend.database import Base, get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
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

@pytest.fixture(autouse=True)
def cleanup():
    # Setup before test
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    # Cleanup after test

def test_create_schema():
    response = client.post("/api/schemas/", json={"name": "ecommerce", "description": "Shop DB"})
    assert response.status_code == 201
    assert response.json()["name"] == "ecommerce"

def test_create_duplicate_schema():
    client.post("/api/schemas/", json={"name": "ecommerce"})
    response = client.post("/api/schemas/", json={"name": "ecommerce"})
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

def test_create_table():
    sch = client.post("/api/schemas/", json={"name": "db1"}).json()
    response = client.post(f"/api/schemas/{sch['id']}/tables", json={"name": "users"})
    assert response.status_code == 201
    assert response.json()["name"] == "users"

def test_create_column():
    sch = client.post("/api/schemas/", json={"name": "db2"}).json()
    tbl = client.post(f"/api/schemas/{sch['id']}/tables", json={"name": "products"}).json()
    response = client.post(f"/api/schemas/tables/{tbl['id']}/columns", json={
        "name": "price",
        "data_type": "DECIMAL",
        "nullable": False
    })
    assert response.status_code == 201
    assert response.json()["name"] == "price"

def test_create_foreign_key():
    sch = client.post("/api/schemas/", json={"name": "db3"}).json()
    t_users = client.post(f"/api/schemas/{sch['id']}/tables", json={"name": "users"}).json()
    c_users_id = client.post(f"/api/schemas/tables/{t_users['id']}/columns", json={
        "name": "id", "data_type": "INT", "is_primary_key": True
    }).json()

    t_orders = client.post(f"/api/schemas/{sch['id']}/tables", json={"name": "orders"}).json()
    c_orders_uid = client.post(f"/api/schemas/tables/{t_orders['id']}/columns", json={
        "name": "user_id", "data_type": "INT"
    }).json()

    response = client.post(f"/api/schemas/tables/{t_orders['id']}/foreign-keys", json={
        "column_id": c_orders_uid['id'],
        "ref_table_id": t_users['id'],
        "ref_column_id": c_users_id['id']
    })
    assert response.status_code == 201
    assert response.json()["column_id"] == c_orders_uid['id']

def test_create_index_preserves_order():
    sch = client.post("/api/schemas/", json={"name": "db4"}).json()
    t1 = client.post(f"/api/schemas/{sch['id']}/tables", json={"name": "logs"}).json()
    c1 = client.post(f"/api/schemas/tables/{t1['id']}/columns", json={"name": "user_id", "data_type": "INT"}).json()
    c2 = client.post(f"/api/schemas/tables/{t1['id']}/columns", json={"name": "action_date", "data_type": "DATETIME"}).json()

    response = client.post(f"/api/schemas/tables/{t1['id']}/indexes", json={
        "name": "idx_logs_user_date",
        "index_type": "BTREE",
        "is_unique": False,
        "columns": [
            {"column_id": c1['id'], "seq_in_index": 1},
            {"column_id": c2['id'], "seq_in_index": 2}
        ]
    })
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "idx_logs_user_date"
    assert len(data["index_columns"]) == 2
    # Verify order preservation
    assert data["index_columns"][0]["column_id"] == c1['id']
    assert data["index_columns"][0]["seq_in_index"] == 1
    assert data["index_columns"][1]["column_id"] == c2['id']
    assert data["index_columns"][1]["seq_in_index"] == 2
