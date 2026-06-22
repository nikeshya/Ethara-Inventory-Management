"""
Customer API endpoints.
Provides RESTful CRUD operations for customers with pagination and search.
"""

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import Optional

from app.database.session import get_db
from app.services.customer_service import customer_service
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerResponse
from app.schemas.common import PaginatedResponse, MessageResponse

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.post(
    "",
    response_model=CustomerResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new customer",
    description="Create a new customer with unique email. Email and phone are validated.",
)
def create_customer(
    customer_data: CustomerCreate,
    db: Session = Depends(get_db),
):
    return customer_service.create_customer(db, customer_data)


@router.get(
    "",
    response_model=PaginatedResponse[CustomerResponse],
    summary="List all customers",
    description="Retrieve paginated list of customers with optional search and sort.",
)
def get_customers(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by name, email, or phone"),
    sort_by: Optional[str] = Query(None, description="Sort field (full_name, email, created_at)"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$", description="Sort direction"),
    db: Session = Depends(get_db),
):
    return customer_service.get_customers(
        db, page, page_size, search, sort_by, sort_order
    )


@router.get(
    "/{customer_id}",
    response_model=CustomerResponse,
    summary="Get customer by ID",
    description="Retrieve a single customer by their ID.",
)
def get_customer(
    customer_id: int,
    db: Session = Depends(get_db),
):
    return customer_service.get_customer(db, customer_id)


@router.put(
    "/{customer_id}",
    response_model=CustomerResponse,
    summary="Update a customer",
    description="Update customer fields. Only provided fields will be updated.",
)
def update_customer(
    customer_id: int,
    customer_data: CustomerUpdate,
    db: Session = Depends(get_db),
):
    return customer_service.update_customer(db, customer_id, customer_data)


@router.delete(
    "/{customer_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a customer",
    description="Permanently delete a customer and all associated orders.",
)
def delete_customer(
    customer_id: int,
    db: Session = Depends(get_db),
):
    customer_service.delete_customer(db, customer_id)
    return None
