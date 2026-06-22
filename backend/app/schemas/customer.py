"""
Customer Pydantic schemas for request validation and response serialization.
"""

import re
from pydantic import BaseModel, Field, field_validator, EmailStr
from typing import Optional
from datetime import datetime


class CustomerBase(BaseModel):
    """Base customer schema with shared fields."""
    full_name: str = Field(..., min_length=1, max_length=255, description="Customer full name")
    email: str = Field(..., max_length=255, description="Customer email (must be unique)")
    phone: Optional[str] = Field(None, max_length=20, description="Customer phone number")
    address: Optional[str] = Field(None, max_length=500, description="Customer address")

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        """Validate email format."""
        v = v.strip().lower()
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, v):
            raise ValueError("Invalid email format")
        return v

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        """Validate phone number format (allows digits, spaces, dashes, plus, parentheses)."""
        if v is not None:
            v = v.strip()
            phone_pattern = r'^[\+]?[(]?[0-9]{1,4}[)]?[-\s\./0-9]*$'
            if v and not re.match(phone_pattern, v):
                raise ValueError("Invalid phone number format")
        return v

    @field_validator("full_name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        return v.strip()


class CustomerCreate(CustomerBase):
    """Schema for creating a new customer."""
    pass


class CustomerUpdate(BaseModel):
    """Schema for updating a customer. All fields are optional."""
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    address: Optional[str] = Field(None, max_length=500)

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip().lower()
            email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_pattern, v):
                raise ValueError("Invalid email format")
        return v

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            phone_pattern = r'^[\+]?[(]?[0-9]{1,4}[)]?[-\s\./0-9]*$'
            if v and not re.match(phone_pattern, v):
                raise ValueError("Invalid phone number format")
        return v


class CustomerResponse(CustomerBase):
    """Schema for customer response with database fields."""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
