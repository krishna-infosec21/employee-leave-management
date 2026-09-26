from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import LeaveRequest
from ..schemas import (
    LeaveRequestCreate,
    LeaveRequestResponse
)


router = APIRouter(
    prefix="/api/leaves",
    tags=["Leaves"]
)


@router.post("/", response_model=LeaveRequestResponse)
def create_leave(
    request: LeaveRequestCreate,
    db: Session = Depends(get_db)
):
    if request.from_date > request.to_date:
        raise HTTPException(
            status_code=400,
            detail="From date cannot be after to date"
        )

    leave = LeaveRequest(
        employee_id=request.employee_id,
        leave_type_id=request.leave_type_id,
        from_date=request.from_date,
        to_date=request.to_date,
        reason=request.reason,
        status="PENDING"
    )

    db.add(leave)
    db.commit()
    db.refresh(leave)

    return leave


@router.get("/", response_model=list[LeaveRequestResponse])
def get_leaves(
    db: Session = Depends(get_db)
):
    leaves = db.query(LeaveRequest).all()
    return leaves


@router.get("/{leave_id}", response_model=LeaveRequestResponse)
def get_leave(
    leave_id: int,
    db: Session = Depends(get_db)
):
    leave = db.query(LeaveRequest).filter(
        LeaveRequest.id == leave_id
    ).first()

    if not leave:
        raise HTTPException(
            status_code=404,
            detail="Leave request not found"
        )

    return leave


@router.put("/{leave_id}/approve", response_model=LeaveRequestResponse)
def approve_leave(
    leave_id: int,
    db: Session = Depends(get_db)
):
    leave = db.query(LeaveRequest).filter(
        LeaveRequest.id == leave_id
    ).first()

    if not leave:
        raise HTTPException(
            status_code=404,
            detail="Leave request not found"
        )

    leave.status = "APPROVED"

    db.commit()
    db.refresh(leave)

    return leave


@router.put("/{leave_id}/reject", response_model=LeaveRequestResponse)
def reject_leave(
    leave_id: int,
    db: Session = Depends(get_db)
):
    leave = db.query(LeaveRequest).filter(
        LeaveRequest.id == leave_id
    ).first()

    if not leave:
        raise HTTPException(
            status_code=404,
            detail="Leave request not found"
        )

    leave.status = "REJECTED"

    db.commit()
    db.refresh(leave)

    return leave