from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers import auth
from .routers import employees
from .routers import leaves
from .routers import documents
from .routers import admin

Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Employee Leave Management API",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(employees.router)
app.include_router(leaves.router)
app.include_router(documents.router)
app.include_router(admin.router)


@app.get("/")
def root():
    return {
        "application": "Employee Leave Management",
        "status": "running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    from fastapi.openapi.utils import get_openapi

    openapi_schema = get_openapi(
        title="Employee Leave Management API",
        version="1.0.0",
        description="Employee Leave Management System API",
        routes=app.routes,
    )

    schemas = openapi_schema["components"]["schemas"]

    leave_action = {
        "title": "LeaveAction",
        "type": "object",
        "properties": {
            "status": {
                "title": "Status",
                "type": "string"
            }
        },
        "required": ["status"]
    }

    ordered_schemas = {}

    for name, schema in schemas.items():
        ordered_schemas[name] = schema

        if name == "HTTPValidationError":
            ordered_schemas["LeaveAction"] = leave_action

    openapi_schema["components"]["schemas"] = ordered_schemas

    app.openapi_schema = openapi_schema

    return app.openapi_schema


app.openapi = custom_openapi