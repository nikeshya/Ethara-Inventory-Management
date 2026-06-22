"""
Dashboard API endpoint.
Provides aggregated statistics for the dashboard view.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.services.dashboard_service import dashboard_service
from app.schemas.order import DashboardStats

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get(
    "",
    response_model=DashboardStats,
    summary="Get dashboard statistics",
    description=(
        "Retrieve aggregated statistics including total products, customers, orders, "
        "low stock count, total revenue, and recent orders."
    ),
)
def get_dashboard_stats(db: Session = Depends(get_db)):
    return dashboard_service.get_stats(db)
