"""
Product service layer.
Contains business logic for product operations, separating concerns from the API layer.
"""

import math
from typing import Optional
from sqlalchemy.orm import Session

from app.crud.product import ProductRepository
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.schemas.common import PaginatedResponse
from app.exceptions.handlers import NotFoundException, DuplicateException
from app.core.logging import logger


class ProductService:
    """Service layer for product business logic."""

    def __init__(self):
        self.repo = ProductRepository()

    def get_product(self, db: Session, product_id: int) -> ProductResponse:
        """Get a single product by ID."""
        product = self.repo.get_by_id(db, product_id)
        if not product:
            raise NotFoundException("Product", product_id)
        return ProductResponse.model_validate(product)

    def get_products(
        self,
        db: Session,
        page: int = 1,
        page_size: int = 10,
        search: Optional[str] = None,
        sort_by: Optional[str] = None,
        sort_order: str = "desc",
        category: Optional[str] = None,
    ) -> PaginatedResponse[ProductResponse]:
        """Get paginated list of products with search, sort, and filter."""
        products, total = self.repo.get_all(
            db, page, page_size, search, sort_by, sort_order, category
        )

        total_pages = math.ceil(total / page_size) if total > 0 else 1

        return PaginatedResponse[ProductResponse](
            items=[ProductResponse.model_validate(p) for p in products],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    def create_product(self, db: Session, product_data: ProductCreate) -> ProductResponse:
        """Create a new product with SKU uniqueness check."""
        # Check SKU uniqueness
        existing = self.repo.get_by_sku(db, product_data.sku)
        if existing:
            raise DuplicateException("SKU", product_data.sku)

        logger.info(f"Creating product: {product_data.name} (SKU: {product_data.sku})")
        product = self.repo.create(db, product_data)
        return ProductResponse.model_validate(product)

    def update_product(
        self, db: Session, product_id: int, product_data: ProductUpdate
    ) -> ProductResponse:
        """Update a product with SKU uniqueness check."""
        product = self.repo.get_by_id(db, product_id)
        if not product:
            raise NotFoundException("Product", product_id)

        # Check SKU uniqueness if being updated
        if product_data.sku and product_data.sku != product.sku:
            existing = self.repo.get_by_sku(db, product_data.sku)
            if existing:
                raise DuplicateException("SKU", product_data.sku)

        logger.info(f"Updating product ID {product_id}")
        updated = self.repo.update(db, product, product_data)
        return ProductResponse.model_validate(updated)

    def delete_product(self, db: Session, product_id: int) -> None:
        """Delete a product by ID."""
        product = self.repo.get_by_id(db, product_id)
        if not product:
            raise NotFoundException("Product", product_id)

        logger.info(f"Deleting product ID {product_id}: {product.name}")
        self.repo.delete(db, product)

    def get_categories(self, db: Session):
        """Get all distinct product categories."""
        return self.repo.get_categories(db)


product_service = ProductService()
