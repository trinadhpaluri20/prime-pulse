from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.alert import (
    AlertResponse,
    AlertReadUpdate,
)
from app.services.alert_service import AlertService

router = APIRouter(prefix="/alerts", tags=["Smart Alerts"])


@router.get("", response_model=List[AlertResponse], summary="List Smart Alerts")
def list_alerts(
    status: Optional[str] = Query(None, description="Read status: All, Unread, Read"),
    priority: Optional[str] = Query(None, description="Priority: All, high, medium, low"),
    competitor: Optional[str] = Query(None, description="Competitor name filter"),
    alert_type: Optional[str] = Query(None, description="Type: activity_spike, pattern, pricing, product, website, hiring, marketing"),
    search: Optional[str] = Query(None, description="Search term in title or description"),
    db: Session = Depends(get_db),
):
    """Retrieve intelligence alerts with multi-dimensional filtering."""
    service = AlertService(db)
    return service.get_alerts(
        status=status,
        priority=priority,
        competitor=competitor,
        alert_type=alert_type,
        search=search,
    )


@router.get("/{alert_id}", response_model=AlertResponse, summary="Get alert by ID")
def get_alert(alert_id: int, db: Session = Depends(get_db)):
    """Retrieve single alert details."""
    service = AlertService(db)
    return service.get_alert_by_id(alert_id)


@router.patch("/read-all", summary="Mark all unread alerts as read")
def mark_all_alerts_read(db: Session = Depends(get_db)):
    """Acknowledge and mark all unread alerts as read."""
    service = AlertService(db)
    count = service.mark_all_read()
    return {"status": "ok", "updated_count": count}


@router.patch("/{alert_id}/read", response_model=AlertResponse, summary="Mark alert as read/unread")
def toggle_alert_read(
    alert_id: int,
    payload: Optional[AlertReadUpdate] = None,
    db: Session = Depends(get_db),
):
    """Toggle or set read status for a specific alert."""
    service = AlertService(db)
    is_read = payload.is_read if payload is not None else True
    return service.mark_read(alert_id, is_read=is_read)
