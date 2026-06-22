"""
Product API endpoints.
Provides RESTful CRUD operations for products with pagination, search, sort, and filter.
"""

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import Optional

from app.database.session import get_db
from app.services.product_service import product_service
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.schemas.common import PaginatedResponse, MessageResponse

router = APIRouter(prefix="/products", tags=["Products"])


@router.post(
    "",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new product",
    description="Create a new product with unique SKU. Price and stock cannot be negative.",
)
def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db),
):
    return product_service.create_product(db, product_data)


@router.get(
    "",
    response_model=PaginatedResponse[ProductResponse],
    summary="List all products",
    description="Retrieve paginated list of products with optional search, sort, and filter.",
)
def get_products(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by name, SKU, or description"),
    sort_by: Optional[str] = Query(None, description="Sort field (name, price, stock_quantity, created_at)"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$", description="Sort direction"),
    category: Optional[str] = Query(None, description="Filter by category"),
    db: Session = Depends(get_db),
):
    return product_service.get_products(
        db, page, page_size, search, sort_by, sort_order, category
    )


@router.get(
    "/categories",
    response_model=list[str],
    summary="Get product categories",
    description="Retrieve all distinct product categories.",
)
def get_categories(db: Session = Depends(get_db)):
    return product_service.get_categories(db)


@router.get(
    "/{product_id}",
    response_model=ProductResponse,
    summary="Get product by ID",
    description="Retrieve a single product by its ID.",
)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
):
    return product_service.get_product(db, product_id)


@router.put(
    "/{product_id}",
    response_model=ProductResponse,
    summary="Update a product",
    description="Update product fields. Only provided fields will be updated.",
)
def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: Session = Depends(get_db),
):
    return product_service.update_product(db, product_id, product_data)


@router.delete(
    "/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a product",
    description="Permanently delete a product by its ID.",
)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
):
    product_service.delete_product(db, product_id)
    return None
