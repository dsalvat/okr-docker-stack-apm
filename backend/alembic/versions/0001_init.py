from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

revision = '0001_init'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table('okr_submissions',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('objective', sa.Text(), nullable=False),
        sa.Column('clarity', sa.Float(), nullable=False),
        sa.Column('focus', sa.Float(), nullable=False),
        sa.Column('writing', sa.Float(), nullable=False),
        sa.Column('score', sa.Float(), nullable=False),
        sa.Column('feedback', mysql.LONGTEXT(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_okr_submissions_created_at','okr_submissions',['created_at'], unique=False)

    op.create_table('key_results',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('okr_id', sa.String(length=36), nullable=False),
        sa.Column('kr_definition', sa.Text(), nullable=False),
        sa.Column('target_value', sa.String(length=255), nullable=False),
        sa.Column('target_date', sa.DateTime(), nullable=False),
        sa.Column('clarity', sa.Float(), nullable=False),
        sa.Column('measurability', sa.Float(), nullable=False),
        sa.Column('feasibility', sa.Float(), nullable=False),
        sa.Column('score', sa.Float(), nullable=False),
        sa.Column('feedback', mysql.LONGTEXT(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.ForeignKeyConstraint(['okr_id'], ['okr_submissions.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_key_results_okr_id','key_results',['okr_id'], unique=False)
    op.create_index('ix_key_results_created_at','key_results',['created_at'], unique=False)

def downgrade():
    op.drop_index('ix_key_results_created_at', table_name='key_results')
    op.drop_index('ix_key_results_okr_id', table_name='key_results')
    op.drop_table('key_results')
    op.drop_index('ix_okr_submissions_created_at', table_name='okr_submissions')
    op.drop_table('okr_submissions')
