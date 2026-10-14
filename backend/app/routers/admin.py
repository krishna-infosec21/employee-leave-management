from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Employee, LeaveRequest, Document
from ..auth import get_current_user


router = APIRouter(
    prefix="/api/admin",
    tags=["Admin"]
)


@router.get("/dashboard")
def get_admin_dashboard(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user.get("role") != "ADMIN":
        raise HTTPException(
            status_code=403,
            detail="Only admins can access the admin dashboard"
        )

    total_users = db.query(User).count()

    active_users = (
        db.query(Employee)
        .filter(Employee.active == True)
        .count()
    )

    employees = db.query(Employee).count()

    pending_leaves = (
        db.query(LeaveRequest)
        .filter(LeaveRequest.status == "PENDING")
        .count()
    )

    documents = db.query(Document).count()

    return {
        "total_users": total_users,
        "active_users": active_users,
        "employees": employees,
        "pending_leaves": pending_leaves,
        "documents": documents
    }