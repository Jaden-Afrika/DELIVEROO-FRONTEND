"""Flask-SQLAlchemy and Flask-Migrate configuration; this module defines no routes."""

import os

from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

db = SQLAlchemy()
migrate = Migrate()


def create_app() -> Flask:
    """Create the minimal Flask application needed by the migration CLI."""
    load_dotenv()
    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL must be set before starting the API or running migrations.")
    jwt_secret = os.environ.get("JWT_SECRET_KEY")
    if not jwt_secret:
        raise RuntimeError("JWT_SECRET_KEY must be set before starting the API.")

    app = Flask(__name__)
    app.config.update(
        SQLALCHEMY_DATABASE_URI=database_url,
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        JWT_SECRET_KEY=jwt_secret,
    )

    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app, resources={r"/*": {"origins": os.environ.get("FRONTEND_ORIGIN", "http://localhost:5173")}})

    # Import models after db is configured so Alembic discovers their metadata.
    from . import models  # noqa: F401
    from .routes import api

    app.register_blueprint(api)

    return app
