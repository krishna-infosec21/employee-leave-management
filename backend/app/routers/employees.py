from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Employee, User
from ..schemas import EmployeeCreate, EmployeeResponse
from ..auth import get_current_user


router = APIRouter(
    prefix="/api/employees",
    tags=["Employees"]
)


@router.post("/", response_model=EmployeeResponse)
def create_employee(
    employee: EmployeeCreate,
    db: Session = Depends(get_db)
):
    new_employee = Employee(
        user_id=employee.user_id,
        first_name=employee.name,
        department_id=employee.department_id,
        manager_id=employee.manager_id
    )

    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)

    return {
        "id": new_employee.id,
        "user_id": new_employee.user_id,
        "name": new_employee.first_name,
        "email": employee.email,
        "department_id": new_employee.department_id
    }


@router.get("/", response_model=list[EmployeeResponse])
def get_employees(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    employees = db.query(Employee).all()

    result = []

    for employee in employees:
        user = db.query(User).filter(
            User.id == employee.user_id
        ).first()

        result.append({
            "id": employee.id,
            "user_id": employee.user_id,
            "name": employee.first_name,
            "email": user.email if user else "",
            "department_id": employee.department_id
        })

    return result


@router.get("/me/profile")
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    employee = db.query(Employee).filter(
        Employee.user_id == current_user["user_id"]
    ).first()

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee profile not found"
        )

    user = db.query(User).filter(
        User.id == employee.user_id
    ).first()

    return {
        "id": employee.id,
        "user_id": employee.user_id,
        "username": user.username if user else "",
        "name": employee.first_name,
        "email": user.email if user else "",
        "department_id": employee.department_id,
        "employee_code": employee.employee_code,
        "joining_date": employee.joining_date,
        "active": employee.active
    }


@router.get("/manager/team")
def get_manager_team(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user.get("role") != "MANAGER":
        raise HTTPException(
            status_code=403,
            detail="Only managers can access their team"
        )

    manager = db.query(Employee).filter(
        Employee.user_id == current_user["user_id"]
    ).first()

    if not manager:
        raise HTTPException(
            status_code=404,
            detail="Manager profile not found"
        )

    employees = db.query(Employee).filter(
        Employee.manager_id == manager.id
    ).all()

    result = []

    for employee in employees:
        user = db.query(User).filter(
            User.id == employee.user_id
        ).first()

        result.append({
            "id": employee.id,
            "user_id": employee.user_id,
            "name": employee.first_name,
            "email": user.email if user else "",
            "department_id": employee.department_id,
            "employee_code": employee.employee_code,
            "active": employee.active
        })

    return result


@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(
    employee_id: int,
    db: Session = Depends(get_db)
):
    employee = db.query(Employee).filter(
        Employee.id == employee_id
    ).first()

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    user = db.query(User).filter(
        User.id == employee.user_id
    ).first()

    return {
        "id": employee.id,
        "user_id": employee.user_id,
        "name": employee.first_name,
        "email": user.email if user else "",
        "department_id": employee.department_id
    }