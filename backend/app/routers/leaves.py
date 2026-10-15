
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


def get_employee_profile(db: Session, user_id: int):
    employee = db.query(Employee).filter(
        Employee.user_id == user_id
    ).first()

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee profile not found"
        )

    return employee


@router.post("/", response_model=LeaveRequestResponse)
def create_leave(
    request: LeaveRequestCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    role = current_user.get("role")
    user_id = int(current_user["user_id"])

    if role not in ["EMPLOYEE", "MANAGER", "ADMIN"]:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to create leave requests"
        )

    if request.from_date > request.to_date:
        raise HTTPException(
            status_code=400,
            detail="From date cannot be after to date"
        )

    # Employees and managers can only create requests for themselves.
    if role in ["EMPLOYEE", "MANAGER"]:
        employee = get_employee_profile(db, user_id)

        if request.employee_id != employee.id:
            raise HTTPException(
                status_code=403,
                detail="You can only apply for your own leave"
            )

        employee_id = employee.id

    else:
        # Admin can create a request for an existing employee.
        target = db.query(Employee).filter(
            Employee.id == request.employee_id
        ).first()

        if not target:
            raise HTTPException(
                status_code=404,
                detail="Employee not found"
            )

        employee_id = target.id

    leave = LeaveRequest(
        employee_id=employee_id,
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
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    role = current_user.get("role")
    user_id = int(current_user["user_id"])

    if role == "ADMIN":
        return db.query(LeaveRequest).all()

    employee = get_employee_profile(db, user_id)

    if role == "EMPLOYEE":
        return db.query(LeaveRequest).filter(
            LeaveRequest.employee_id == employee.id
        ).all()

    if role == "MANAGER":
        return (
            db.query(LeaveRequest)
            .join(Employee, LeaveRequest.employee_id == Employee.id)
            .filter(Employee.manager_id == employee.id)
            .all()
        )

    raise HTTPException(
        status_code=403,
        detail="Not authorized to view leave requests"
    )


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

    manager = get_employee_profile(
        db, int(current_user["user_id"])
    )

    return (
        db.query(LeaveRequest)
        .join(Employee, LeaveRequest.employee_id == Employee.id)
        .filter(
            Employee.manager_id == manager.id,
            LeaveRequest.status == "PENDING"
        )
        .all()
    )


@router.get("/{leave_id}", response_model=LeaveRequestResponse)
def get_leave(
    leave_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    role = current_user.get("role")
    user_id = int(current_user["user_id"])

    leave = db.query(LeaveRequest).filter(
        LeaveRequest.id == leave_id
    ).first()

    if not leave:
        raise HTTPException(
            status_code=404,
            detail="Leave request not found"
        )

    if role == "ADMIN":
        return leave

    employee = get_employee_profile(db, user_id)

    if role == "EMPLOYEE" and leave.employee_id == employee.id:
        return leave

    if role == "MANAGER":
        target = db.query(Employee).filter(
            Employee.id == leave.employee_id
        ).first()

        if target and target.manager_id == employee.id:
            return leave

    raise HTTPException(
        status_code=403,
        detail="Not authorized to view this leave request"
    )


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

    manager = get_employee_profile(
        db, int(current_user["user_id"])
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

    if leave.status != "PENDING":
        raise HTTPException(
            status_code=400,
            detail="Only pending leave requests can be approved"
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

    manager = get_employee_profile(
        db, int(current_user["user_id"])
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

    if leave.status != "PENDING":
        raise HTTPException(
            status_code=400,
            detail="Only pending leave requests can be rejected"
        )

    leave.status = "REJECTED"
    leave.manager_comment = action.manager_comment

    db.commit()
    db.refresh(leave)

    return leave


@router.put("/{leave_id}/cancel", response_model=LeaveRequestResponse)
def cancel_leave(
    leave_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    role = current_user.get("role")
    user_id = int(current_user["user_id"])

    leave = db.query(LeaveRequest).filter(
        LeaveRequest.id == leave_id
    ).first()

    if not leave:
        raise HTTPException(
            status_code=404,
            detail="Leave request not found"
        )

    if role == "ADMIN":
        pass
    elif role in ["EMPLOYEE", "MANAGER"]:
        employee = get_employee_profile(db, user_id)

        if leave.employee_id != employee.id:
            raise HTTPException(
                status_code=403,
                detail="You can only cancel your own leave request"
            )
    else:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to cancel leave requests"
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

