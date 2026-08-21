"""add cancelled parcel status"""
from alembic import op
revision = "20260821_0002"
down_revision = "20260821_0001"
branch_labels = None
depends_on = None
def upgrade():
    op.execute("ALTER TYPE parcel_status ADD VALUE IF NOT EXISTS 'cancelled'")
def downgrade():
    pass
