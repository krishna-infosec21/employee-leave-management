# Employee Leave Management System

### A Full-Stack Web Application Deployed on AWS

An employee leave management application designed to simplify leave applications, approval workflows, leave balance tracking, and employee document management.

## Project Overview

The Employee Leave Management System provides role-based functionality for employees, managers, and administrators. It combines a React frontend, FastAPI backend, PostgreSQL database, and AWS cloud infrastructure.

This project demonstrates full-stack application development, REST API integration, database management, authentication, and cloud deployment.

## Key Features

* **User Authentication:** Registration and login with JWT-based authentication.
* **Employee Dashboard:** View profile information and manage leave-related activities.
* **Leave Applications:** Submit leave requests and track their status.
* **Leave Balance:** View available leave information.
* **Document Management:** Access and download employee documents.
* **Manager Dashboard:** Review team information and leave requests.
* **Leave Approvals:** Approve or reject leave requests.
* **Admin Dashboard:** View employee records, leave requests, and document information.
* **REST API:** Backend API documentation through Swagger UI.
* **Cloud Infrastructure:** AWS services for hosting, storage, database, DNS, and content delivery.

## Technology Stack

| Component         | Technology                    |
| ----------------- | ----------------------------- |
| Frontend          | React, JavaScript, Vite       |
| Backend           | Python, FastAPI               |
| Database          | PostgreSQL                    |
| ORM               | SQLAlchemy                    |
| Authentication    | JSON Web Tokens (JWT)         |
| API Documentation | Swagger UI, OpenAPI           |
| Compute           | Amazon EC2                    |
| Load Balancing    | AWS Application Load Balancer |
| Object Storage    | Amazon S3                     |
| Managed Database  | Amazon RDS                    |
| DNS               | Amazon Route 53               |
| Content Delivery  | Amazon CloudFront             |
| Version Control   | Git, GitHub                   |

## Application Architecture

```text
                  Users
                    |
                    v
             React Frontend
                    |
                    v
          AWS Cloud Infrastructure
                    |
                    v
       Application Load Balancer
                    |
                    v
             FastAPI Backend
                    |
                    v
        PostgreSQL on Amazon RDS

     Amazon S3: Frontend and Documents
     Route 53: DNS Configuration
     CloudFront: Content Delivery
```

This is a logical overview of the application architecture. Actual request routing depends on the deployed configuration.

## Application Roles

### Employee

* Access the employee dashboard.
* View profile information.
* Apply for leave.
* Track leave requests.
* View leave balance.
* Access available documents.

### Manager

* View team information.
* Review employee leave requests.
* Approve or reject requests.

### Administrator

* View employee information.
* Monitor leave requests and their statuses.
* Access administrative document information.

## Project Structure

```text
employee-leave-management/
│
├── frontend/
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
│
├── backend/
│   └── app/
│       ├── main.py
│       ├── database.py
│       ├── models.py
│       ├── schemas.py
│       ├── auth.py
│       └── routers/
│           ├── auth.py
│           ├── employees.py
│           ├── leaves.py
│           └── documents.py
│
├── database/
│   └── schema.sql
│
├── docs/
│   ├── README.md
│   ├── api-reference.md
│   ├── architecture.md
│   ├── database.md
│   ├── deployment.md
│   ├── security.md
│   ├── testing.md
│   └── troubleshooting.md
│
├── scripts/
│   ├── README.md
│   ├── deployment-notes.md
│   ├── health-check.sh
│   └── user-data.sh
│
├── LICENSE.txt
├── .gitignore
└── README.md
```

## AWS Deployment

The project uses AWS services to demonstrate cloud deployment and infrastructure integration.

| AWS Service               | Purpose                                         |
| ------------------------- | ----------------------------------------------- |
| Amazon EC2                | Hosts the backend application                   |
| Application Load Balancer | Routes requests to configured backend targets   |
| Amazon S3                 | Stores frontend assets and configured documents |
| Amazon RDS                | Provides managed PostgreSQL database hosting    |
| Amazon Route 53           | Manages DNS records                             |
| Amazon CloudFront         | Delivers configured frontend content            |

The exact configuration and request flow depend on the deployed AWS resources.

## API Documentation

The backend uses FastAPI and OpenAPI to document the REST API.

When the backend is running locally, the interactive API documentation is available at:

`http://127.0.0.1:8000/docs`

The API documentation can be used to explore endpoints and test supported requests.

## Local Development

### Prerequisites

* Python
* Node.js and npm
* PostgreSQL
* Git

### Backend Setup

1. Open a terminal in the project directory.
2. Navigate to the backend folder.
3. Create and activate a Python virtual environment.
4. Install the dependencies listed in `backend/requirements.txt`.
5. Configure the database connection and required environment variables.
6. Start the FastAPI application.

Example commands for Windows PowerShell:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Configure the required environment variables before starting the backend. Do not commit real passwords, JWT secrets, or AWS credentials.

### Frontend Setup

Open a second terminal from the project root:

```powershell
cd frontend
npm install
npm run dev
```

Open the local frontend URL shown by Vite in the terminal.

**Note:** Local development requires the database and backend configuration to be correct. The commands above describe the general workflow and may need adjustment to match your environment.

## Documentation

Detailed project documentation is available in the `docs/` folder:

* [API Reference](docs/api-reference.md)
* [Architecture](docs/architecture.md)
* [Database](docs/database.md)
* [Deployment](docs/deployment.md)
* [Security](docs/security.md)
* [Testing](docs/testing.md)
* [Troubleshooting](docs/troubleshooting.md)

Deployment helper scripts and notes are available in the `scripts/` folder.

## Screenshots

Application screenshots can be added here to demonstrate the user interface and AWS deployment.

Suggested screenshot categories:

* Login page
* Employee dashboard
* Employee profile
* Apply leave
* My leaves
* Leave balance
* Employee documents and download
* Manager dashboard and leave requests
* Admin dashboard and document management
* Swagger API documentation
* EC2 instance
* Load balancer and target health
* S3 frontend
* Route 53 domain
* CloudFront distribution
* RDS database

Add screenshots from the repository's `screenshots/` folder when they are available, using relative Markdown image paths.

## Security Considerations

* Keep passwords, JWT secrets, database credentials, and AWS access keys out of source control.
* Configure environment variables securely.
* Restrict database access to trusted sources.
* Review role-based authorization for sensitive operations.
* Verify document access permissions.
* Use HTTPS for public application traffic.
* Review AWS security groups, IAM permissions, and storage access policies before production use.

The presence of authentication or security-related components does not by itself guarantee that the application is production-secure. Security testing and configuration review are necessary.

## Learning Outcomes

This project provided practical experience with:

* React frontend development.
* FastAPI backend and REST API development.
* PostgreSQL database integration.
* JWT-based authentication.
* API exploration and testing with Swagger UI.
* AWS EC2 and load balancer configuration.
* S3 object storage and RDS database hosting.
* Route 53 DNS and CloudFront content delivery.
* Git version control and GitHub documentation.
* Cloud deployment troubleshooting.

## Future Improvements

* Automated unit and integration tests.
* Continuous integration and deployment.
* Centralized logging and monitoring.
* Leave approval notifications.
* Audit trails for administrative actions.
* Additional security testing.
* Infrastructure automation.

## Author

**Krishna Kumar**

Interested in AWS cloud technologies, application deployment, and full-stack development.

## License

This project is distributed under the MIT License. See [LICENSE.txt](LICENSE.txt) for details.
