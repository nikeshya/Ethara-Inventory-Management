"""
Order repository (CRUD operations).
Implements the Repository Pattern for order data access with eager loading.
"""

from typing import Optional, List, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import asc, desc, func

from app.models.order import Order, OrderItem
from app.models.customer import Customer
from app.models.product import Product


class OrderRepository:
    """Repository for Order database operations."""

    @staticmethod
    def get_by_id(db: Session, order_id: int) -> Optional[Order]:
        """Retrieve an order by ID with eager-loaded relationships."""
        return (
            db.query(Order)
            .options(
                joinedload(Order.customer),
                joinedload(Order.items).joinedload(OrderItem.product),
            )
            .filter(Order.id == order_id)
            .first()
        )

    @staticmethod
    def get_all(
        db: Session,
        page: int = 1,
        page_size: int = 10,
        search: Optional[str] = None,
        sort_by: Optional[str] = None,
        sort_order: str = "desc",
        status: Optional[str] = None,
    ) -> Tuple[List[Order], int]:
        """
        Retrieve orders with pagination, filtering, and sorting.
        Eager loads customer for list display.
        
        Returns:
            Tuple of (orders list, total count)
        """
        query = db.query(Order).options(
            joinedload(Order.customer),
            joinedload(Order.items),
        )

        # Status filter
        if status:
            query = query.filter(Order.status == status)

        # Search by customer name or order ID
        if search:
            search_term = f"%{search}%"
            query = query.join(Customer).filter(
                Customer.full_name.ilike(search_term)
            )

        # Total count (need a separate count query due to joins)
        count_query = db.query(func.count(Order.id))
        if status:
            count_query = count_query.filter(Order.status == status)
        if search:
            count_query = count_query.join(Customer).filter(
                Customer.full_name.ilike(f"%{search}%")
            )
        total = count_query.scalar()

        # Sorting
        sort_column = getattr(Order, sort_by, None) if sort_by else Order.created_at
        if sort_column is None:
            sort_column = Order.created_at

        order_func = desc if sort_order == "desc" else asc
        query = query.order_by(order_func(sort_column))

        # Pagination
        offset = (page - 1) * page_size
        orders = query.offset(offset).limit(page_size).all()

        return orders, total

    @staticmethod
    def create(db: Session, order: Order, items: List[OrderItem]) -> Order:
        """
        Create a new order with its items in a single transaction.
        The caller is responsible for committing/rolling back.
        """
        db.add(order)
        db.flush()  # Get the order ID

        for item in items:
            item.order_id = order.id
            db.add(item)

        db.commit()
        db.refresh(order)
        return order

    @staticmethod
    def delete(db: Session, db_order: Order) -> None:
        """Delete an order and its items (cascade)."""
        db.delete(db_order)
        db.commit()

    @staticmethod
    def get_total_count(db: Session) -> int:
        """Get total number of orders."""
        return db.query(Order).count()

    @staticmethod
    def get_total_revenue(db: Session) -> float:
        """Calculate total revenue from all non-cancelled orders."""
        result = (
            db.query(func.sum(Order.total_amount))
            .filter(Order.status != "cancelled")
            .scalar()
        )
        return result or 0.0

    @staticmethod
    def get_recent_orders(db: Session, limit: int = 5) -> List[Order]:
        """Get the most recent orders with customer info."""
        return (
            db.query(Order)
            .options(
                joinedload(Order.customer),
                joinedload(Order.items),
            )
            .order_by(desc(Order.created_at))
            .limit(limit)
            .all()
        )
