import boto3

from botocore.exceptions import ClientError
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Document


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


# Check whether the file really exists in S3
def check_s3_file(s3_key: str):
    if not s3_key or not s3_key.strip():
        raise HTTPException(
            status_code=400,
            detail="S3 file key cannot be empty."
        )

    try:
        s3.head_object(
            Bucket=BUCKET_NAME,
            Key=s3_key.strip()
        )

    except ClientError as e:
        error_code = e.response.get(
            "Error", {}
        ).get("Code", "")

        if error_code in ("404", "NoSuchKey", "NotFound"):
            raise HTTPException(
                status_code=404,
                detail=f"File not found in S3: {s3_key}"
            )

        if error_code in ("403", "AccessDenied"):
            raise HTTPException(
                status_code=403,
                detail="AWS permission denied. Check S3 permissions."
            )

        raise HTTPException(
            status_code=500,
            detail=f"S3 error: {error_code}"
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to verify S3 file: {str(e)}"
        )


# Create a document record only if the S3 file exists
@router.post("/")
def create_document(
    employee_id: int,
    file_name: str,
    s3_key: str,
    db: Session = Depends(get_db)
):
    s3_key = s3_key.strip()

    # Verify the actual file before saving its details
    check_s3_file(s3_key)

    document = Document(
        employee_id=employee_id,
        file_name=file_name,
        s3_key=s3_key
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return document


# List documents
@router.get("/")
def get_documents(
    db: Session = Depends(get_db)
):
    documents = db.query(Document).all()

    return documents


# Get document details
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
            detail="Document not found in database."
        )

    return document


# Download a document
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
            detail="Document not found in database."
        )

    # Check that the actual S3 object exists
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

        return {
            "download_url": download_url
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to generate download link: {str(e)}"
        )