"""Initial migration - Create all tables

Revision ID: 001_initial
Revises: 
Create Date: 2026-01-26

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001_initial'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('supabase_id', sa.String(255), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('name', sa.String(255), nullable=True),
        sa.Column('phone', sa.String(20), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('city', sa.String(100), nullable=True),
        sa.Column('pincode', sa.String(10), nullable=True),
        sa.Column('role', sa.Enum('customer', 'staff', 'admin', name='userrole'), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('auth_provider', sa.String(50), nullable=True, default='email'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('last_login_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('supabase_id'),
        sa.UniqueConstraint('email')
    )
    op.create_index('ix_users_supabase_id', 'users', ['supabase_id'])
    op.create_index('ix_users_email', 'users', ['email'])

    # Create categories table
    op.create_table(
        'categories',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('slug', sa.String(100), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('icon', sa.String(50), nullable=True),
        sa.Column('image_url', sa.String(500), nullable=True),
        sa.Column('display_order', sa.Integer(), nullable=True, default=0),
        sa.Column('is_active', sa.Boolean(), nullable=True, default=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('slug')
    )
    op.create_index('ix_categories_slug', 'categories', ['slug'])

    # Create products table
    op.create_table(
        'products',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('sku', sa.String(100), nullable=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('slug', sa.String(300), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('category_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('brand', sa.String(100), nullable=True),
        sa.Column('price', sa.Numeric(10, 2), nullable=False),
        sa.Column('original_price', sa.Numeric(10, 2), nullable=True),
        sa.Column('bargain_available', sa.Boolean(), nullable=True, default=True),
        sa.Column('stock_quantity', sa.Integer(), nullable=True, default=0),
        sa.Column('reserved_quantity', sa.Integer(), nullable=True, default=0),
        sa.Column('low_stock_threshold', sa.Integer(), nullable=True, default=5),
        sa.Column('status', sa.Enum('active', 'out_of_stock', 'pre_bookable', 'discontinued', name='productstatus'), nullable=False),
        sa.Column('is_featured', sa.Boolean(), nullable=True, default=False),
        sa.Column('is_bestseller', sa.Boolean(), nullable=True, default=False),
        sa.Column('image_url', sa.String(500), nullable=True),
        sa.Column('images', postgresql.JSON(), nullable=True, default=list),
        sa.Column('specifications', postgresql.JSON(), nullable=True, default=dict),
        sa.Column('tags', postgresql.ARRAY(sa.String()), nullable=True, default=list),
        sa.Column('rating', sa.Numeric(2, 1), nullable=True, default=0),
        sa.Column('review_count', sa.Integer(), nullable=True, default=0),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['category_id'], ['categories.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('sku'),
        sa.UniqueConstraint('slug')
    )
    op.create_index('ix_products_name', 'products', ['name'])
    op.create_index('ix_products_slug', 'products', ['slug'])
    op.create_index('ix_products_brand', 'products', ['brand'])
    op.create_index('ix_products_sku', 'products', ['sku'])

    # Create orders table
    op.create_table(
        'orders',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('order_number', sa.String(50), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('purchase_mode', sa.Enum('pay-online', 'reserve-pickup', name='purchasemode'), nullable=False),
        sa.Column('status', sa.Enum('pending', 'reserved', 'confirmed', 'ready', 'completed', 'cancelled', name='orderstatus'), nullable=False),
        sa.Column('customer_name', sa.String(255), nullable=True),
        sa.Column('customer_phone', sa.String(20), nullable=True),
        sa.Column('customer_email', sa.String(255), nullable=True),
        sa.Column('subtotal', sa.Numeric(10, 2), nullable=False),
        sa.Column('discount_amount', sa.Numeric(10, 2), nullable=True, default=0),
        sa.Column('tax_amount', sa.Numeric(10, 2), nullable=True, default=0),
        sa.Column('total_amount', sa.Numeric(10, 2), nullable=False),
        sa.Column('payment_status', sa.Enum('pending', 'paid', 'refunded', 'failed', name='paymentstatus'), nullable=True),
        sa.Column('payment_method', sa.String(50), nullable=True),
        sa.Column('payment_reference', sa.String(255), nullable=True),
        sa.Column('expected_pickup_date', sa.DateTime(), nullable=True),
        sa.Column('actual_pickup_date', sa.DateTime(), nullable=True),
        sa.Column('customer_notes', sa.Text(), nullable=True),
        sa.Column('staff_notes', sa.Text(), nullable=True),
        sa.Column('metadata', postgresql.JSON(), nullable=True, default=dict),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('confirmed_at', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('cancelled_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('order_number')
    )
    op.create_index('ix_orders_order_number', 'orders', ['order_number'])

    # Create order_items table
    op.create_table(
        'order_items',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('order_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('product_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('product_name', sa.String(255), nullable=False),
        sa.Column('product_sku', sa.String(100), nullable=True),
        sa.Column('unit_price', sa.Numeric(10, 2), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False, default=1),
        sa.Column('total_price', sa.Numeric(10, 2), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id']),
        sa.ForeignKeyConstraint(['product_id'], ['products.id']),
        sa.PrimaryKeyConstraint('id')
    )

    # Create pre_bookings table
    op.create_table(
        'pre_bookings',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('booking_number', sa.String(50), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('status', sa.Enum('pending', 'available', 'partial', 'not_available', 'confirmed', 'completed', 'cancelled', 'expired', name='prebookingstatus'), nullable=False),
        sa.Column('customer_name', sa.String(255), nullable=False),
        sa.Column('customer_phone', sa.String(20), nullable=False),
        sa.Column('customer_email', sa.String(255), nullable=True),
        sa.Column('expected_visit_date', sa.DateTime(), nullable=False),
        sa.Column('preferred_time_slot', sa.String(50), nullable=True),
        sa.Column('store_response', sa.Text(), nullable=True),
        sa.Column('alternatives_offered', postgresql.JSON(), nullable=True, default=list),
        sa.Column('customer_notes', sa.Text(), nullable=True),
        sa.Column('staff_notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('responded_at', sa.DateTime(), nullable=True),
        sa.Column('confirmed_at', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('booking_number')
    )
    op.create_index('ix_pre_bookings_booking_number', 'pre_bookings', ['booking_number'])

    # Create pre_booking_items table
    op.create_table(
        'pre_booking_items',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('pre_booking_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('product_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('product_name', sa.String(255), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False, default=1),
        sa.Column('is_available', sa.String(20), nullable=True, default='pending'),
        sa.Column('available_quantity', sa.Integer(), nullable=True),
        sa.Column('alternative_product_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('alternative_notes', sa.Text(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['pre_booking_id'], ['pre_bookings.id']),
        sa.ForeignKeyConstraint(['product_id'], ['products.id']),
        sa.ForeignKeyConstraint(['alternative_product_id'], ['products.id']),
        sa.PrimaryKeyConstraint('id')
    )

    # Create repair_inquiries table
    op.create_table(
        'repair_inquiries',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('inquiry_number', sa.String(50), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('status', sa.Enum('inquiry_received', 'under_review', 'approved', 'rejected', 'in_progress', 'waiting_parts', 'completed', 'delivered', 'cancelled', name='repairstatus'), nullable=False),
        sa.Column('customer_name', sa.String(255), nullable=False),
        sa.Column('customer_phone', sa.String(20), nullable=False),
        sa.Column('customer_email', sa.String(255), nullable=True),
        sa.Column('appliance_type', sa.Enum('ceiling_fan', 'table_fan', 'pedestal_fan', 'wall_fan', 'exhaust_fan', 'mixer_grinder', 'wet_grinder', 'iron', 'induction_cooktop', 'motor', 'other', name='appliancetype'), nullable=False),
        sa.Column('appliance_brand', sa.String(100), nullable=True),
        sa.Column('appliance_model', sa.String(100), nullable=True),
        sa.Column('problem_description', sa.Text(), nullable=False),
        sa.Column('problem_images', postgresql.JSON(), nullable=True, default=list),
        sa.Column('preferred_visit_date', sa.DateTime(), nullable=False),
        sa.Column('preferred_time_slot', sa.String(50), nullable=True),
        sa.Column('actual_visit_date', sa.DateTime(), nullable=True),
        sa.Column('diagnosis', sa.Text(), nullable=True),
        sa.Column('estimated_cost_min', sa.Numeric(10, 2), nullable=True),
        sa.Column('estimated_cost_max', sa.Numeric(10, 2), nullable=True),
        sa.Column('estimated_duration', sa.String(50), nullable=True),
        sa.Column('rejection_reason', sa.Text(), nullable=True),
        sa.Column('final_cost', sa.Numeric(10, 2), nullable=True),
        sa.Column('parts_used', postgresql.JSON(), nullable=True, default=list),
        sa.Column('repair_notes', sa.Text(), nullable=True),
        sa.Column('customer_notes', sa.Text(), nullable=True),
        sa.Column('staff_notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('reviewed_at', sa.DateTime(), nullable=True),
        sa.Column('approved_at', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('delivered_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('inquiry_number')
    )
    op.create_index('ix_repair_inquiries_inquiry_number', 'repair_inquiries', ['inquiry_number'])


def downgrade() -> None:
    op.drop_table('repair_inquiries')
    op.drop_table('pre_booking_items')
    op.drop_table('pre_bookings')
    op.drop_table('order_items')
    op.drop_table('orders')
    op.drop_table('products')
    op.drop_table('categories')
    op.drop_table('users')
    
    # Drop enums
    op.execute('DROP TYPE IF EXISTS repairstatus')
    op.execute('DROP TYPE IF EXISTS appliancetype')
    op.execute('DROP TYPE IF EXISTS prebookingstatus')
    op.execute('DROP TYPE IF EXISTS paymentstatus')
    op.execute('DROP TYPE IF EXISTS orderstatus')
    op.execute('DROP TYPE IF EXISTS purchasemode')
    op.execute('DROP TYPE IF EXISTS productstatus')
    op.execute('DROP TYPE IF EXISTS userrole')
