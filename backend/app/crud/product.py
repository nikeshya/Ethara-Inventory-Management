"""
Product repository (CRUD operations).
Implements the Repository Pattern for product data access.
Supports pagination, search, sorting, and filtering.
"""

import math
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import asc, desc, or_

from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


class ProductRepository:
    """Repository for Product database operations."""

    @staticmethod
    def get_by_id(db: Session, product_id: int) -> Optional[Product]:
        """Retrieve a product by its ID."""
        return db.query(Product).filter(Product.id == product_id).first()

    @staticmethod
    def get_by_sku(db: Session, sku: str) -> Optional[Product]:
        """Retrieve a product by its SKU."""
        return db.query(Product).filter(Product.sku == sku.strip().upper()).first()

    @staticmethod
    def get_all(
        db: Session,
        page: int = 1,
        page_size: int = 10,
        search: Optional[str] = None,
        sort_by: Optional[str] = None,
        sort_order: str = "desc",
        category: Optional[str] = None,
    ) -> Tuple[List[Product], int]:
        """
        Retrieve products with pagination, search, sorting, and filtering.
        
        Returns:
            Tuple of (products list, total count)
        """
        query = db.query(Product)

        # Search filter (name, SKU, or description)
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Product.name.ilike(search_term),
                    Product.sku.ilike(search_term),
                    Product.description.ilike(search_term),
                )
            )

        # Category filter
        if category:
            query = query.filter(Product.category == category)

        # Get total count before pagination
        total = query.count()

        # Sorting
        sort_column = getattr(Product, sort_by, None) if sort_by else Product.created_at
        if sort_column is None:
            sort_column = Product.created_at
        
        order_func = desc if sort_order == "desc" else asc
        query = query.order_by(order_func(sort_column))

        # Pagination
        offset = (page - 1) * page_size
        products = query.offset(offset).limit(page_size).all()

        return products, total

    @staticmethod
    def create(db: Session, product_data: ProductCreate) -> Product:
        """Create a new product."""
        db_product = Product(**product_data.model_dump())
        db.add(db_product)
        db.commit()
        db.refresh(db_product)
        return db_product

    @staticmethod
    def update(db: Session, db_product: Product, product_data: ProductUpdate) -> Product:
        """Update an existing product."""
        update_data = product_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_product, field, value)
        db.commit()
        db.refresh(db_product)
        return db_product

    @staticmethod
    def delete(db: Session, db_product: Product) -> None:
        """Delete a product."""
        db.delete(db_product)
        db.commit()

    @staticmethod
    def get_low_stock_count(db: Session, threshold: int = 10) -> int:
        """Count products with stock below the threshold."""
        return db.query(Product).filter(Product.stock_quantity <= threshold).count()

    @staticmethod
    def get_total_count(db: Session) -> int:
        """Get total number of products."""
        return db.query(Product).count()

    @staticmethod
    def get_categories(db: Session) -> List[str]:
        """Get all distinct product categories."""
        results = db.query(Product.category).distinct().filter(Product.category.isnot(None)).all()
        return [r[0] for r in results]
