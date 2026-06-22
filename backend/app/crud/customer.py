"""
Customer repository (CRUD operations).
Implements the Repository Pattern for customer data access.
"""

from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import asc, desc, or_

from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerUpdate


class CustomerRepository:
    """Repository for Customer database operations."""

    @staticmethod
    def get_by_id(db: Session, customer_id: int) -> Optional[Customer]:
        """Retrieve a customer by ID."""
        return db.query(Customer).filter(Customer.id == customer_id).first()

    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[Customer]:
        """Retrieve a customer by email."""
        return db.query(Customer).filter(Customer.email == email.strip().lower()).first()

    @staticmethod
    def get_all(
        db: Session,
        page: int = 1,
        page_size: int = 10,
        search: Optional[str] = None,
        sort_by: Optional[str] = None,
        sort_order: str = "desc",
    ) -> Tuple[List[Customer], int]:
        """
        Retrieve customers with pagination, search, and sorting.
        
        Returns:
            Tuple of (customers list, total count)
        """
        query = db.query(Customer)

        # Search filter (name or email)
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Customer.full_name.ilike(search_term),
                    Customer.email.ilike(search_term),
                    Customer.phone.ilike(search_term),
                )
            )

        # Total count
        total = query.count()

        # Sorting
        sort_column = getattr(Customer, sort_by, None) if sort_by else Customer.created_at
        if sort_column is None:
            sort_column = Customer.created_at

        order_func = desc if sort_order == "desc" else asc
        query = query.order_by(order_func(sort_column))

        # Pagination
        offset = (page - 1) * page_size
        customers = query.offset(offset).limit(page_size).all()

        return customers, total

    @staticmethod
    def create(db: Session, customer_data: CustomerCreate) -> Customer:
        """Create a new customer."""
        db_customer = Customer(**customer_data.model_dump())
        db.add(db_customer)
        db.commit()
        db.refresh(db_customer)
        return db_customer

    @staticmethod
    def update(db: Session, db_customer: Customer, customer_data: CustomerUpdate) -> Customer:
        """Update an existing customer."""
        update_data = customer_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_customer, field, value)
        db.commit()
        db.refresh(db_customer)
        return db_customer

    @staticmethod
    def delete(db: Session, db_customer: Customer) -> None:
        """Delete a customer."""
        db.delete(db_customer)
        db.commit()

    @staticmethod
    def get_total_count(db: Session) -> int:
        """Get total number of customers."""
        return db.query(Customer).count()
