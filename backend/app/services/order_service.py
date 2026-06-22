"""
Order service layer.
Contains critical business logic for order processing:
- Stock availability validation
- Automatic inventory reduction
- Total price calculation
- Atomic transaction management
"""

import math
from typing import Optional
from sqlalchemy.orm import Session

from app.crud.order import OrderRepository
from app.crud.product import ProductRepository
from app.crud.customer import CustomerRepository
from app.models.order import Order, OrderItem
from app.schemas.order import (
    OrderCreate,
    OrderResponse,
    OrderItemResponse,
    OrderListResponse,
)
from app.schemas.common import PaginatedResponse
from app.exceptions.handlers import (
    NotFoundException,
    InsufficientStockException,
    ValidationException,
)
from app.core.logging import logger


class OrderService:
    """Service layer for order business logic with stock management."""

    def __init__(self):
        self.order_repo = OrderRepository()
        self.product_repo = ProductRepository()
        self.customer_repo = CustomerRepository()

    def _build_order_response(self, order: Order) -> OrderResponse:
        """Build OrderResponse from Order model with related data."""
        items = []
        for item in order.items:
            items.append(OrderItemResponse(
                id=item.id,
                product_id=item.product_id,
                quantity=item.quantity,
                unit_price=item.unit_price,
                subtotal=item.subtotal,
                product_name=item.product.name if item.product else None,
                product_sku=item.product.sku if item.product else None,
            ))

        return OrderResponse(
            id=order.id,
            customer_id=order.customer_id,
            customer_name=order.customer.full_name if order.customer else None,
            customer_email=order.customer.email if order.customer else None,
            total_amount=order.total_amount,
            status=order.status,
            order_date=order.order_date,
            created_at=order.created_at,
            updated_at=order.updated_at,
            items=items,
        )

    def _build_order_list_response(self, order: Order) -> OrderListResponse:
        """Build simplified OrderListResponse for list views."""
        return OrderListResponse(
            id=order.id,
            customer_id=order.customer_id,
            customer_name=order.customer.full_name if order.customer else None,
            customer_email=order.customer.email if order.customer else None,
            total_amount=order.total_amount,
            status=order.status,
            order_date=order.order_date,
            items_count=len(order.items) if order.items else 0,
            created_at=order.created_at,
        )

    def get_order(self, db: Session, order_id: int) -> OrderResponse:
        """Get a single order with full details."""
        order = self.order_repo.get_by_id(db, order_id)
        if not order:
            raise NotFoundException("Order", order_id)
        return self._build_order_response(order)

    def get_orders(
        self,
        db: Session,
        page: int = 1,
        page_size: int = 10,
        search: Optional[str] = None,
        sort_by: Optional[str] = None,
        sort_order: str = "desc",
        status: Optional[str] = None,
    ) -> PaginatedResponse[OrderListResponse]:
        """Get paginated list of orders."""
        orders, total = self.order_repo.get_all(
            db, page, page_size, search, sort_by, sort_order, status
        )

        total_pages = math.ceil(total / page_size) if total > 0 else 1

        return PaginatedResponse[OrderListResponse](
            items=[self._build_order_list_response(o) for o in orders],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    def create_order(self, db: Session, order_data: OrderCreate) -> OrderResponse:
        """
        Create a new order with full business logic:
        1. Validate customer exists
        2. Validate all products exist
        3. Check stock availability for each item
        4. Calculate prices from current product data
        5. Reduce inventory atomically
        6. Create order with all items
        """
        customer = self.customer_repo.get_by_id(db, order_data.customer_id)
        if not customer:
            raise NotFoundException("Customer", order_data.customer_id)

        order_items = []
        total_amount = 0.0

        for item_data in order_data.items:
            product = self.product_repo.get_by_id(db, item_data.product_id)
            if not product:
                raise NotFoundException("Product", item_data.product_id)

            if product.stock_quantity < item_data.quantity:
                raise InsufficientStockException(
                    product_name=product.name,
                    available=product.stock_quantity,
                    requested=item_data.quantity,
                )

            unit_price = product.price
            subtotal = unit_price * item_data.quantity
            total_amount += subtotal

            order_items.append({
                "product": product,
                "quantity": item_data.quantity,
                "unit_price": unit_price,
                "subtotal": subtotal,
            })

        for item_info in order_items:
            product = item_info["product"]
            product.stock_quantity -= item_info["quantity"]
            logger.info(
                f"Reduced stock for '{product.name}': "
                f"{product.stock_quantity + item_info['quantity']} -> {product.stock_quantity}"
            )

        order = Order(
            customer_id=order_data.customer_id,
            total_amount=round(total_amount, 2),
            status="pending",
        )

        items = [
            OrderItem(
                product_id=item_info["product"].id,
                quantity=item_info["quantity"],
                unit_price=item_info["unit_price"],
                subtotal=item_info["subtotal"],
            )
            for item_info in order_items
        ]

        logger.info(
            f"Creating order for customer '{customer.full_name}' "
            f"with {len(items)} items, total: ${total_amount:.2f}"
        )

        created_order = self.order_repo.create(db, order, items)

        full_order = self.order_repo.get_by_id(db, created_order.id)
        return self._build_order_response(full_order)

    def delete_order(self, db: Session, order_id: int) -> None:
        """Delete an order by ID."""
        order = self.order_repo.get_by_id(db, order_id)
        if not order:
            raise NotFoundException("Order", order_id)

        logger.info(f"Deleting order ID {order_id}")
        self.order_repo.delete(db, order)


order_service = OrderService()
