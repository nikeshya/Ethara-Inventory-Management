"""
Product Pydantic schemas for request validation and response serialization.
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime


class ProductBase(BaseModel):
    """Base product schema with shared fields."""
    name: str = Field(..., min_length=1, max_length=255, description="Product name")
    sku: str = Field(..., min_length=1, max_length=100, description="Stock Keeping Unit (must be unique)")
    price: float = Field(..., ge=0, description="Product price (cannot be negative)")
    stock_quantity: int = Field(..., ge=0, description="Current stock level (cannot be negative)")
    description: Optional[str] = Field(None, max_length=2000, description="Product description")
    category: Optional[str] = Field(None, max_length=100, description="Product category")

    @field_validator("sku")
    @classmethod
    def validate_sku(cls, v: str) -> str:
        """Ensure SKU is uppercase and stripped of whitespace."""
        return v.strip().upper()

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        """Ensure product name is properly trimmed."""
        return v.strip()


class ProductCreate(ProductBase):
    """Schema for creating a new product."""
    pass


class ProductUpdate(BaseModel):
    """Schema for updating a product. All fields are optional."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    sku: Optional[str] = Field(None, min_length=1, max_length=100)
    price: Optional[float] = Field(None, ge=0)
    stock_quantity: Optional[int] = Field(None, ge=0)
    description: Optional[str] = Field(None, max_length=2000)
    category: Optional[str] = Field(None, max_length=100)

    @field_validator("sku")
    @classmethod
    def validate_sku(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            return v.strip().upper()
        return v


class ProductResponse(ProductBase):
    """Schema for product response with database fields."""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
