"""Authentication and parcel API endpoints."""

from decimal import Decimal, InvalidOperation

from flask import Blueprint, g, jsonify, request
from sqlalchemy import select
from werkzeug.security import check_password_hash, generate_password_hash

from .auth import create_token, require_admin, require_auth
from .database import db
from .models import PARCEL_STATUSES, WEIGHT_CATEGORIES, Parcel, User

api = Blueprint("api", __name__)
WEIGHT_PRICING = {
    "light": (Decimal("150"), Decimal("15")),
    "medium": (Decimal("350"), Decimal("25")),
    "heavy": (Decimal("700"), Decimal("40")),
}


def user_data(user: User) -> dict:
    return {"id": user.id, "name": user.name, "email": user.email, "role": user.role}


def parcel_data(parcel: Parcel, include_owner_name: bool = False) -> dict:
    data = {
        "id": parcel.id,
        "pickupLocation": parcel.pickup_location,
        "destination": parcel.destination,
        "weightCategory": parcel.weight_category,
        "price": float(parcel.price),
        "status": parcel.status,
        "currentLocation": parcel.current_location,
        "distanceKm": float(parcel.distance_km) if parcel.distance_km is not None else None,
        "createdAt": parcel.created_at.isoformat(),
        "ownerId": parcel.owner_id,
    }
    if include_owner_name:
        data["ownerName"] = parcel.owner.name
    return data


def json_body() -> dict | None:
    body = request.get_json(silent=True)
    return body if isinstance(body, dict) else None


@api.post("/auth/signup")
def signup():
    body = json_body()
    if body is None:
        return jsonify(message="A JSON request body is required."), 400
    name = str(body.get("name", "")).strip()
    email = str(body.get("email", "")).strip().lower()
    password = body.get("password", "")
    if not name or not email or not isinstance(password, str):
        return jsonify(message="Name, email, and password are required."), 400
    if len(password) < 8:
        return jsonify(message="Password must contain at least 8 characters."), 400
    if db.session.scalar(select(User).where(User.email == email)):
        return jsonify(message="An account with this email already exists."), 409
    user = User(name=name, email=email, password_hash=generate_password_hash(password))
    db.session.add(user)
    db.session.commit()
    return jsonify(user=user_data(user), token=create_token(user)), 201


@api.post("/auth/login")
def login():
    body = json_body()
    if body is None:
        return jsonify(message="A JSON request body is required."), 400
    email = str(body.get("email", "")).strip().lower()
    password = body.get("password", "")
    user = db.session.scalar(select(User).where(User.email == email))
    if user is None or not isinstance(password, str) or not check_password_hash(user.password_hash, password):
        return jsonify(message="Invalid email or password."), 401
    return jsonify(user=user_data(user), token=create_token(user))


@api.post("/auth/logout")
@require_auth
def logout():
    # JWTs are stateless; the browser ends the session by deleting its token.
    return "", 204


@api.post("/parcels")
@require_auth
def create_parcel():
    body = json_body()
    if body is None:
        return jsonify(message="A JSON request body is required."), 400
    pickup = str(body.get("pickupLocation", "")).strip()
    destination = str(body.get("destination", "")).strip()
    category = body.get("weightCategory")
    if not pickup or not destination or category not in WEIGHT_CATEGORIES:
        return jsonify(message="Pickup location, destination, and a valid weight category are required."), 400
    try:
        distance = Decimal(str(body.get("distanceKm", 0)))
    except (InvalidOperation, TypeError, ValueError):
        return jsonify(message="Distance must be a non-negative number."), 400
    if distance < 0:
        return jsonify(message="Distance must be a non-negative number."), 400
    base_fee, per_km = WEIGHT_PRICING[category]
    parcel = Parcel(
        pickup_location=pickup,
        destination=destination,
        weight_category=category,
        distance_km=distance,
        price=(base_fee + distance * per_km).quantize(Decimal("0.01")),
        current_location=pickup,
        owner_id=g.current_user.id,
    )
    db.session.add(parcel)
    db.session.commit()
    return jsonify(parcel_data(parcel)), 201


@api.get("/parcels/me")
@require_auth
def my_parcels():
    parcels = db.session.scalars(select(Parcel).where(Parcel.owner_id == g.current_user.id).order_by(Parcel.created_at.desc())).all()
    return jsonify([parcel_data(parcel) for parcel in parcels])


@api.get("/parcels/<int:parcel_id>")
@require_auth
def get_parcel(parcel_id: int):
    parcel = db.session.get(Parcel, parcel_id)
    if parcel is None:
        return jsonify(message="Parcel not found."), 404
    if g.current_user.role != "admin" and parcel.owner_id != g.current_user.id:
        return jsonify(message="You do not have access to this parcel."), 403
    return jsonify(parcel_data(parcel))


@api.get("/admin/parcels")
@require_admin
def all_parcels():
    parcels = db.session.scalars(select(Parcel).order_by(Parcel.created_at.desc())).all()
    return jsonify([parcel_data(parcel, include_owner_name=True) for parcel in parcels])


@api.patch("/admin/parcels/<int:parcel_id>/status")
@require_admin
def update_status(parcel_id: int):
    parcel, body = db.session.get(Parcel, parcel_id), json_body()
    if parcel is None:
        return jsonify(message="Parcel not found."), 404
    if body is None or body.get("status") not in PARCEL_STATUSES:
        return jsonify(message="A valid parcel status is required."), 400
    parcel.status = body["status"]
    db.session.commit()
    return jsonify(parcel_data(parcel, include_owner_name=True))


@api.patch("/admin/parcels/<int:parcel_id>/location")
@require_admin
def update_location(parcel_id: int):
    parcel, body = db.session.get(Parcel, parcel_id), json_body()
    if parcel is None:
        return jsonify(message="Parcel not found."), 404
    location = str(body.get("currentLocation", "")).strip() if body else ""
    if not location:
        return jsonify(message="Current location is required."), 400
    parcel.current_location = location
    db.session.commit()
    return jsonify(parcel_data(parcel, include_owner_name=True))
