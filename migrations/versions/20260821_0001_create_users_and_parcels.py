"""create users and parcels

Revision ID: 20260821_0001
Revises:
Create Date: 2026-08-21 00:00:00
"""

from alembic import op
import sqlalchemy as sa


revision = "20260821_0001"
down_revision = None
branch_labels = None
depends_on = None


user_role = sa.Enum("user", "admin", name="user_role")
weight_category = sa.Enum("light", "medium", "heavy", name="weight_category")
parcel_status = sa.Enum("pending", "in_transit", "delivered", name="parcel_status")


def upgrade():
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("role", user_role, nullable=False, server_default="user"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.UniqueConstraint("email", name="uq_users_email"),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=False)

    op.create_table(
        "parcels",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("pickup_location", sa.String(length=500), nullable=False),
        sa.Column("destination", sa.String(length=500), nullable=False),
        sa.Column("weight_category", weight_category, nullable=False),
        sa.Column("distance_km", sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column("price", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("status", parcel_status, nullable=False, server_default="pending"),
        sa.Column("current_location", sa.String(length=500), nullable=True),
        sa.Column("owner_id", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.CheckConstraint("price >= 0", name="ck_parcels_price_nonnegative"),
        sa.CheckConstraint(
            "distance_km IS NULL OR distance_km >= 0",
            name="ck_parcels_distance_km_nonnegative",
        ),
        sa.ForeignKeyConstraint(["owner_id"], ["users.id"]),
    )
    op.create_index("ix_parcels_owner_id", "parcels", ["owner_id"], unique=False)


def downgrade():
    op.drop_index("ix_parcels_owner_id", table_name="parcels")
    op.drop_table("parcels")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
