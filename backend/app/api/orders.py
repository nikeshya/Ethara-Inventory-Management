"""
Order API endpoints.
Provides RESTful operations for order management with stock validation.
"""

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import Optional

from app.database.session import get_db
from app.services.order_service import order_service
from app.schemas.order import OrderCreate, OrderResponse, OrderListResponse
from app.schemas.common import PaginatedResponse, MessageResponse

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post(
    "",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new order",
    description=(
        "Create a new order for a customer with multiple products. "
        "Validates stock availability, calculates totals, and reduces inventory automatically."
    ),
)
def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
):
    return order_service.create_order(db, order_data)


@router.get(
    "",
    response_model=PaginatedResponse[OrderListResponse],
    summary="List all orders",
    description="Retrieve paginated list of orders with optional status filter and search.",
)
def get_orders(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by customer name"),
    sort_by: Optional[str] = Query(None, description="Sort field (total_amount, order_date, created_at)"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$", description="Sort direction"),
    status: Optional[str] = Query(None, description="Filter by status (pending, confirmed, shipped, delivered, cancelled)"),
    db: Session = Depends(get_db),
):
    return order_service.get_orders(
        db, page, page_size, search, sort_by, sort_order, status
    )


@router.get(
    "/{order_id}",
    response_model=OrderResponse,
    summary="Get order by ID",
    description="Retrieve full order details including customer info and line items.",
)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
):
    return order_service.get_order(db, order_id)


@router.delete(
    "/{order_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an order",
    description="Permanently delete an order and its line items.",
)
def delete_order(
    order_id: int,
    db: Session = Depends(get_db),
):
    order_service.delete_order(db, order_id)
    return None
