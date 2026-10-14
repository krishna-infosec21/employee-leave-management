from datetime import date
from pydantic import BaseModel


class EmployeeCreate(BaseModel):
    user_id: int
    name: str
    email: str
    department_id: int
    manager_id: int | None = None

class EmployeeResponse(BaseModel):
    id: int
    user_id: int
    name: str
    email: str
    department_id: int

    class Config:
        from_attributes = True


class LeaveAction(BaseModel):
    status: str
    manager_comment: str | None = None

class LeaveRequestCreate(BaseModel):
    employee_id: int
    leave_type_id: int
    from_date: date
    to_date: date
    reason: str


class LeaveRequestResponse(BaseModel):
    id: int
    employee_id: int
    leave_type_id: int
    from_date: date
    to_date: date
    reason: str
    status: str
    manager_comment: str | None = None

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    username: str
    password: str
    name: str
    email: str
    department_id: int
    role: str = "EMPLOYEE"


class UserResponse(BaseModel):
    id: int
    username: str
    role: str

    class Config:
        from_attributes = True