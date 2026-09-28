from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Employee
from ..schemas import UserCreate, UserResponse
from ..auth import (
    hash_password,
    verify_password,
    create_access_token
)


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


@router.post("/register", response_model=UserResponse)
def register(
    request: UserCreate,
    db: Session = Depends(get_db)
):
    existing_username = db.query(User).filter(
        User.username == request.username
    ).first()

    if existing_username:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    existing_email = db.query(User).filter(
        User.email == request.email
    ).first()

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    user = User(
        username=request.username,
        email=request.email,
        password_hash=hash_password(request.password),
        role=request.role.upper()
    )

    db.add(user)
    db.flush()

    employee = Employee(
        user_id=user.id,
        first_name=request.name,
        department_id=request.department_id
    )

    db.add(employee)
    db.commit()
    db.refresh(user)

    return user


@router.post("/login")
def login(
    username: str,
    password: str,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.username == username
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    if not verify_password(
        password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    access_token = create_access_token(
        user_id=user.id,
        role=user.role
    )

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "username": user.username,
        "role": user.role
    }