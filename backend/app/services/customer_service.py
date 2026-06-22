"""
Customer service layer.
Contains business logic for customer operations.
"""

import math
from typing import Optional
from sqlalchemy.orm import Session

from app.crud.customer import CustomerRepository
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerResponse
from app.schemas.common import PaginatedResponse
from app.exceptions.handlers import NotFoundException, DuplicateException
from app.core.logging import logger


class CustomerService:
    """Service layer for customer business logic."""

    def __init__(self):
        self.repo = CustomerRepository()

    def get_customer(self, db: Session, customer_id: int) -> CustomerResponse:
        """Get a single customer by ID."""
        customer = self.repo.get_by_id(db, customer_id)
        if not customer:
            raise NotFoundException("Customer", customer_id)
        return CustomerResponse.model_validate(customer)

    def get_customers(
        self,
        db: Session,
        page: int = 1,
        page_size: int = 10,
        search: Optional[str] = None,
        sort_by: Optional[str] = None,
        sort_order: str = "desc",
    ) -> PaginatedResponse[CustomerResponse]:
        """Get paginated list of customers with search and sort."""
        customers, total = self.repo.get_all(
            db, page, page_size, search, sort_by, sort_order
        )

        total_pages = math.ceil(total / page_size) if total > 0 else 1

        return PaginatedResponse[CustomerResponse](
            items=[CustomerResponse.model_validate(c) for c in customers],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    def create_customer(self, db: Session, customer_data: CustomerCreate) -> CustomerResponse:
        """Create a new customer with email uniqueness check."""
        # Check email uniqueness
        existing = self.repo.get_by_email(db, customer_data.email)
        if existing:
            raise DuplicateException("email", customer_data.email)

        logger.info(f"Creating customer: {customer_data.full_name} ({customer_data.email})")
        customer = self.repo.create(db, customer_data)
        return CustomerResponse.model_validate(customer)

    def update_customer(
        self, db: Session, customer_id: int, customer_data: CustomerUpdate
    ) -> CustomerResponse:
        """Update a customer with email uniqueness check."""
        customer = self.repo.get_by_id(db, customer_id)
        if not customer:
            raise NotFoundException("Customer", customer_id)

        # Check email uniqueness if being updated
        if customer_data.email and customer_data.email != customer.email:
            existing = self.repo.get_by_email(db, customer_data.email)
            if existing:
                raise DuplicateException("email", customer_data.email)

        logger.info(f"Updating customer ID {customer_id}")
        updated = self.repo.update(db, customer, customer_data)
        return CustomerResponse.model_validate(updated)

    def delete_customer(self, db: Session, customer_id: int) -> None:
        """Delete a customer by ID."""
        customer = self.repo.get_by_id(db, customer_id)
        if not customer:
            raise NotFoundException("Customer", customer_id)

        logger.info(f"Deleting customer ID {customer_id}: {customer.full_name}")
        self.repo.delete(db, customer)


customer_service = CustomerService()
