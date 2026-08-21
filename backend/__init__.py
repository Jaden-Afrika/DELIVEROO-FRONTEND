"""Database-only application setup for Alembic migrations."""

from .database import create_app, db, migrate

__all__ = ["create_app", "db", "migrate"]
