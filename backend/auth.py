"""JWT authentication helpers for the API."""

from datetime import UTC, datetime, timedelta
from functools import wraps

import jwt
from flask import current_app, g, jsonify, request

from .models import User


def create_token(user: User) -> str:
    expires_at = datetime.now(UTC) + timedelta(hours=24)
    return jwt.encode(
        {"sub": str(user.id), "exp": expires_at},
        current_app.config["JWT_SECRET_KEY"],
        algorithm="HS256",
    )


def require_auth(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        scheme, _, token = request.headers.get("Authorization", "").partition(" ")
        if scheme.lower() != "bearer" or not token:
            return jsonify(error="Authentication is required."), 401
        try:
            payload = jwt.decode(token, current_app.config["JWT_SECRET_KEY"], algorithms=["HS256"])
            user = User.query.get(int(payload["sub"]))
        except (jwt.PyJWTError, KeyError, TypeError, ValueError):
            return jsonify(error="Your session is invalid or has expired."), 401
        if user is None:
            return jsonify(error="Your session is invalid or has expired."), 401
        g.current_user = user
        return view(*args, **kwargs)

    return wrapped


def require_admin(view):
    @require_auth
    @wraps(view)
    def wrapped(*args, **kwargs):
        if g.current_user.role != "admin":
            return jsonify(error="Administrator access is required."), 403
        return view(*args, **kwargs)

    return wrapped
