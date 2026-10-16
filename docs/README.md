
<div align="center">

# 📚 Project Documentation

### Employee Leave Management System

![API](https://img.shields.io/badge/API-FastAPI-009688?style=for-the-badge\&logo=fastapi\&logoColor=white)
![Database](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=for-the-badge\&logo=postgresql\&logoColor=white)
![Cloud](https://img.shields.io/badge/Cloud-AWS-FF9900?style=for-the-badge\&logo=amazonaws\&logoColor=white)

**Explore the system design, APIs, database, deployment, and security.**

</div>

---

## 🗂️ Documentation Index

| Document                                  | Description                                                |
| ----------------------------------------- | ---------------------------------------------------------- |
| [🔌 API Reference](api-reference.md)      | Backend endpoints, authentication, and request testing     |
| [🏗️ Architecture](architecture.md)       | Application components and request flow                    |
| [🗄️ Database](database.md)               | Database tables, relationships, and PostgreSQL setup       |
| [☁️ Deployment](deployment.md)            | AWS infrastructure and deployment validation               |
| [🔐 Security](security.md)                | Authentication, authorization, secrets, and cloud security |
| [🧪 Testing](testing.md)                  | Functional testing and validation checklist                |
| [🛠️ Troubleshooting](troubleshooting.md) | Common errors and debugging guidance                       |

---

## 🚀 About the Project

The Employee Leave Management System is a web application designed to manage employee profiles, leave applications, leave requests, and employee document references.

### Technology Stack

* **Frontend:** React and Vite
* **Backend:** Python and FastAPI
* **ORM:** SQLAlchemy
* **Database:** PostgreSQL
* **Cloud:** AWS services used or configured for deployment

---

## 🔄 Application Workflow

```mermaid
flowchart TD
    A[User] --> B[React Frontend]
    B --> C[FastAPI Backend]
    C --> D{Authentication and Authorization}
    D -->|Authorized| E[(PostgreSQL)]
    D -->|Rejected| F[Error Response]
    C --> G[Amazon S3 Document Storage, if configured]
    E --> H[API Response]
    H --> B
```

*This is a high-level conceptual view. Refer to the individual documents and actual project configuration for implementation details.*

---

<div align="center">

**📖 One project. Organized documentation. Easier maintenance.**

</div>
