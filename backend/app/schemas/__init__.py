from app.schemas.common import PaginationParams, PaginatedResponse, MessageResponse
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerResponse
from app.schemas.order import (
    OrderCreate,
    OrderItemCreate,
    OrderResponse,
    OrderItemResponse,
    OrderListResponse,
    DashboardStats,
)
