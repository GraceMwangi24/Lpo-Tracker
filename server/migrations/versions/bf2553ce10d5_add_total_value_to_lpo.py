"""Add total_value to LPO

Revision ID: bf2553ce10d5
Revises: 67da36229af2
Create Date: 2025-04-28 19:13:20.260796

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'bf2553ce10d5'
down_revision = '67da36229af2'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('lpos', schema=None) as batch_op:
        batch_op.add_column(
            sa.Column(
                'total_value',
                sa.Float(),
                nullable=False,
                server_default=sa.text('0.0')
            )
        )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('lpos', schema=None) as batch_op:
        batch_op.drop_column('total_value')
    # ### end Alembic commands ###
