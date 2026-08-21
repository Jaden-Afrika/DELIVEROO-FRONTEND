"""PostgreSQL schema models for Deliveroo deliveries."""

from sqlalchemy import CheckConstraint, Enum, ForeignKey, Numeric, String, UniqueConstraint, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql.sqltypes import DateTime

from .database import db

USER_ROLES = ("user", "admin")
WEIGHT_CATEGORIES = ("light", "medium", "heavy")
PARCEL_STATUSES = ("pending", "in_transit", "delivered")


class User(db.Model):
    __tablename__ = "users"
    __table_args__ = (UniqueConstraint("email", name="uq_users_email"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(
        Enum(*USER_ROLES, name="user_role"), nullable=False, server_default="user"
    )
    created_at: Mapped[object] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=text("now()")
    )

    parcels: Mapped[list["Parcel"]] = relationship(back_populates="owner")


class Parcel(db.Model):
    __tablename__ = "parcels"
    __table_args__ = (
        CheckConstraint("price >= 0", name="ck_parcels_price_nonnegative"),
        CheckConstraint(
            "distance_km IS NULL OR distance_km >= 0",
            name="ck_parcels_distance_km_nonnegative",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    pickup_location: Mapped[str] = mapped_column(String(500), nullable=False)
    destination: Mapped[str] = mapped_column(String(500), nullable=False)
    weight_category: Mapped[str] = mapped_column(
        Enum(*WEIGHT_CATEGORIES, name="weight_category"), nullable=False
    )
    distance_km: Mapped[object | None] = mapped_column(Numeric(10, 2), nullable=True)
    price: Mapped[object] = mapped_column(Numeric(12, 2), nullable=False)
    status: Mapped[str] = mapped_column(
        Enum(*PARCEL_STATUSES, name="parcel_status"),
        nullable=False,
        server_default="pending",
    )
    current_location: Mapped[str | None] = mapped_column(String(500), nullable=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    created_at: Mapped[object] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=text("now()")
    )

    owner: Mapped[User] = relationship(back_populates="parcels")
