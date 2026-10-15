import boto3

from botocore.exceptions import ClientError
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Document, Employee
from ..auth import get_current_user


BUCKET_NAME = "leaveapp-documents-2117"

s3 = boto3.client(
    "s3",
    region_name="ap-south-2",
    config=boto3.session.Config(
        signature_version="s3v4",
        s3={"addressing_style": "virtual"}
    )
)

router = APIRouter(
    prefix="/api/documents",
    tags=["Documents"]
)


def get_employee_profile(db: Session, user_id: int):
    return db.query(Employee).filter(
        Employee.user_id == user_id
    ).first()


def can_access_document(db: Session, document, current_user: dict):
    role = current_user.get("role")
    user_id = int(current_user["user_id"])

    if role == "ADMIN":
        return True

    employee = get_employee_profile(db, user_id)

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee profile not found"
        )

    if document.employee_id == employee.id:
        return True

    if role == "MANAGER":
        report = db.query(Employee).filter(
            Employee.id == document.employee_id,
            Employee.manager_id == employee.id
        ).first()

        if report:
            return True

    raise HTTPException(
        status_code=403,
        detail="You are not authorized to access this document"
    )


def check_s3_file(s3_key: str):
    if not s3_key or not s3_key.strip():
        raise HTTPException(
            status_code=400,
            detail="S3 file key cannot be empty"
        )

    try:
        s3.head_object(
            Bucket=BUCKET_NAME,
            Key=s3_key.strip()
        )
    except ClientError as e:
        code = e.response.get("Error", {}).get("Code", "")

        if code in ("404", "NoSuchKey", "NotFound"):
            raise HTTPException(
                status_code=404,
                detail="File not found in S3"
            )

        if code in ("403", "AccessDenied"):
            raise HTTPException(
                status_code=403,
                detail="AWS permission denied"
            )

        raise HTTPException(
            status_code=500,
            detail="Unable to verify S3 file"
        )


@router.post("/")
def create_document(
    employee_id: int,
    file_name: str,
    s3_key: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user.get("role") != "ADMIN":
        raise HTTPException(
            status_code=403,
            detail="Only admins can create document records"
        )

    employee = db.query(Employee).filter(
        Employee.id == employee_id
    ).first()

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    check_s3_file(s3_key)

    document = Document(
        employee_id=employee_id,
        file_name=file_name,
        s3_key=s3_key.strip()
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return document


@router.get("/")
def get_documents(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    role = current_user.get("role")
    user_id = int(current_user["user_id"])

    if role == "ADMIN":
        return db.query(Document).all()

    employee = get_employee_profile(db, user_id)

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee profile not found"
        )

    query = db.query(Document).filter(
        Document.employee_id == employee.id
    )

    if role == "MANAGER":
        report_ids = db.query(Employee.id).filter(
            Employee.manager_id == employee.id
        ).all()

        ids = [row[0] for row in report_ids]

        if ids:
            query = db.query(Document).filter(
                (Document.employee_id == employee.id)
                | (Document.employee_id.in_(ids))
            )

    return query.all()


@router.get("/{document_id}")
def get_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    document = db.query(Document).filter(
        Document.id == document_id
    ).first()

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    can_access_document(db, document, current_user)
    return document


@router.get("/{document_id}/download")
def download_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    document = db.query(Document).filter(
        Document.id == document_id
    ).first()

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    can_access_document(db, document, current_user)
    check_s3_file(document.s3_key)

    try:
        download_url = s3.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": BUCKET_NAME,
                "Key": document.s3_key
            },
            ExpiresIn=3600
        )

        return {"download_url": download_url}

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to generate download link"
        )
