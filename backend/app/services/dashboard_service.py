"""
Dashboard service layer.
Aggregates statistics across all modules for the dashboard view.
"""

from sqlalchemy.orm import Session

from app.crud.product import ProductRepository
from app.crud.customer import CustomerRepository
from app.crud.order import OrderRepository
from app.schemas.order import DashboardStats, OrderListResponse
from app.core.config import settings


class DashboardService:
    """Service for aggregating dashboard statistics."""

    def __init__(self):
        self.product_repo = ProductRepository()
        self.customer_repo = CustomerRepository()
        self.order_repo = OrderRepository()

    def get_stats(self, db: Session) -> DashboardStats:
        """
        Compute all dashboard statistics in a single call:
        - Total products, customers, orders
        - Low stock product count
        - Total revenue (excluding cancelled orders)
        - Recent orders (last 5)
        """
        total_products = self.product_repo.get_total_count(db)
        total_customers = self.customer_repo.get_total_count(db)
        total_orders = self.order_repo.get_total_count(db)
        low_stock = self.product_repo.get_low_stock_count(
            db, threshold=settings.LOW_STOCK_THRESHOLD
        )
        revenue = self.order_repo.get_total_revenue(db)
        recent = self.order_repo.get_recent_orders(db, limit=5)

        # Build recent orders response
        recent_orders = []
        for order in recent:
            recent_orders.append(
                OrderListResponse(
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
            )

        return DashboardStats(
            total_products=total_products,
            total_customers=total_customers,
            total_orders=total_orders,
            low_stock_products=low_stock,
            total_revenue=round(revenue, 2),
            recent_orders=recent_orders,
        )


dashboard_service = DashboardService()
