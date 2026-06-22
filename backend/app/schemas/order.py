"""
Order and OrderItem Pydantic schemas for request validation and response serialization.
"""

from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import datetime


class OrderItemCreate(BaseModel):
    """Schema for creating an order line item."""
    product_id: int = Field(..., gt=0, description="Product ID")
    quantity: int = Field(..., gt=0, description="Quantity to order (must be positive)")


class OrderCreate(BaseModel):
    """Schema for creating a new order."""
    customer_id: int = Field(..., gt=0, description="Customer ID")
    items: List[OrderItemCreate] = Field(..., min_length=1, description="Order items (at least one required)")

    @field_validator("items")
    @classmethod
    def validate_unique_products(cls, v: List[OrderItemCreate]) -> List[OrderItemCreate]:
        """Ensure no duplicate product IDs in a single order."""
        product_ids = [item.product_id for item in v]
        if len(product_ids) != len(set(product_ids)):
            raise ValueError("Duplicate product IDs are not allowed in a single order")
        return v


class OrderItemResponse(BaseModel):
    """Schema for order item response."""
    id: int
    product_id: int
    quantity: int
    unit_price: float
    subtotal: float
    product_name: Optional[str] = None
    product_sku: Optional[str] = None

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    """Schema for order response with related data."""
    id: int
    customer_id: int
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    total_amount: float
    status: str
    order_date: datetime
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True


class OrderListResponse(BaseModel):
    """Simplified order response for list views (without items)."""
    id: int
    customer_id: int
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    total_amount: float
    status: str
    order_date: datetime
    items_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


class DashboardStats(BaseModel):
    """Schema for dashboard statistics."""
    total_products: int = 0
    total_customers: int = 0
    total_orders: int = 0
    low_stock_products: int = 0
    total_revenue: float = 0.0
    recent_orders: List[OrderListResponse] = []
