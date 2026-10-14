from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import LeaveRequest, Employee
from ..schemas import (
    LeaveRequestCreate,
    LeaveRequestResponse,
    LeaveAction
)
from ..auth import get_current_user


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
    return db.query(LeaveRequest).all()


@router.get("/manager/pending", response_model=list[LeaveRequestResponse])
def get_manager_pending_leaves(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user.get("role") != "MANAGER":
        raise HTTPException(
            status_code=403,
            detail="Only managers can access pending leave requests"
        )

    manager = db.query(Employee).filter(
        Employee.user_id == current_user["user_id"]
    ).first()

    if not manager:
        raise HTTPException(
            status_code=404,
            detail="Manager profile not found"
        )

    leaves = (
        db.query(LeaveRequest)
        .join(Employee, LeaveRequest.employee_id == Employee.id)
        .filter(
            Employee.manager_id == manager.id,
            LeaveRequest.status == "PENDING"
        )
        .all()
    )

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
    action: LeaveAction,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user.get("role") != "MANAGER":
        raise HTTPException(
            status_code=403,
            detail="Only managers can approve leave requests"
        )

    manager = db.query(Employee).filter(
        Employee.user_id == current_user["user_id"]
    ).first()

    if not manager:
        raise HTTPException(
            status_code=404,
            detail="Manager profile not found"
        )

    leave = db.query(LeaveRequest).filter(
        LeaveRequest.id == leave_id
    ).first()

    if not leave:
        raise HTTPException(
            status_code=404,
            detail="Leave request not found"
        )

    employee = db.query(Employee).filter(
        Employee.id == leave.employee_id
    ).first()

    if not employee or employee.manager_id != manager.id:
        raise HTTPException(
            status_code=403,
            detail="You can only approve leave requests from your team"
        )

    leave.status = "APPROVED"
    leave.manager_comment = action.manager_comment

    db.commit()
    db.refresh(leave)

    return leave
@router.put("/{leave_id}/reject", response_model=LeaveRequestResponse)
def reject_leave(
    leave_id: int,
    action: LeaveAction,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user.get("role") != "MANAGER":
        raise HTTPException(
            status_code=403,
            detail="Only managers can reject leave requests"
        )

    manager = db.query(Employee).filter(
        Employee.user_id == current_user["user_id"]
    ).first()

    if not manager:
        raise HTTPException(
            status_code=404,
            detail="Manager profile not found"
        )

    leave = db.query(LeaveRequest).filter(
        LeaveRequest.id == leave_id
    ).first()

    if not leave:
        raise HTTPException(
            status_code=404,
            detail="Leave request not found"
        )

    employee = db.query(Employee).filter(
        Employee.id == leave.employee_id
    ).first()

    if not employee or employee.manager_id != manager.id:
        raise HTTPException(
            status_code=403,
            detail="You can only reject leave requests from your team"
        )

    leave.status = "REJECTED"
    leave.manager_comment = action.manager_comment

    db.commit()
    db.refresh(leave)

    return leave
    return leave    
@router.put("/{leave_id}/cancel", response_model=LeaveRequestResponse)
def cancel_leave(
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

    if leave.status != "PENDING":
        raise HTTPException(
            status_code=400,
            detail="Only pending leave requests can be cancelled"
        )

    leave.status = "CANCELLED"

    db.commit()
    db.refresh(leave)

    return leave