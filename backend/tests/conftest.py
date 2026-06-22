"""
Pytest configuration and fixtures.
Uses an in-memory SQLite database so tests run without PostgreSQL.
"""

import os
import pytest

# Set environment variable BEFORE any app imports so that session.py
# creates a SQLite engine instead of a PostgreSQL one.
os.environ["DATABASE_URL"] = "sqlite:///./test_db.sqlite"
os.environ["DEBUG"] = "False"
os.environ["CORS_ORIGINS"] = '["http://localhost"]'

from fastapi.testclient import TestClient
from app.main import app
from app.database.session import engine
from app.database.base import Base


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Create all tables once before any test runs, drop them when done."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    engine.dispose()  # Release all connections before deleting the file
    # Cleanup the test database file
    try:
        if os.path.exists("./test_db.sqlite"):
            os.remove("./test_db.sqlite")
    except PermissionError:
        pass  # Windows may still hold the file briefly


@pytest.fixture(scope="function")
def client():
    """Provide a fresh TestClient for each test."""
    with TestClient(app) as c:
        yield c
