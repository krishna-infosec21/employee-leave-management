from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Employee, User
from ..schemas import EmployeeCreate, EmployeeResponse


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
        department_id=employee.department_id
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
    db: Session = Depends(get_db)
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