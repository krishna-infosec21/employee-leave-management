from fastapi import APIRouter, Depends, HTTPException
import boto3
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Document


s3 = boto3.client(
    "s3",
    region_name="ap-south-2"
)

BUCKET_NAME = "leaveapp-documents-2117"


router = APIRouter(
    prefix="/api/documents",
    tags=["Documents"]
)


@router.post("/")
def create_document(
    employee_id: int,
    file_name: str,
    s3_key: str,
    db: Session = Depends(get_db)
):
    document = Document(
        employee_id=employee_id,
        file_name=file_name,
        s3_key=s3_key
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return document


@router.get("/")
def get_documents(
    db: Session = Depends(get_db)
):
    documents = db.query(Document).all()

    return documents


@router.get("/{document_id}")
def get_document(
    document_id: int,
    db: Session = Depends(get_db)
):
    document = db.query(Document).filter(
        Document.id == document_id
    ).first()

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    return document


@router.get("/{document_id}/download")
def download_document(
    document_id: int,
    db: Session = Depends(get_db)
):
    document = db.query(Document).filter(
        Document.id == document_id
    ).first()

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    try:
        download_url = s3.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": BUCKET_NAME,
                "Key": document.s3_key
            },
            ExpiresIn=3600
        )

        return {
            "download_url": download_url
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )