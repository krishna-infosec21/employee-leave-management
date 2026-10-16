<div align="center">

# Employee Leave Management System

### A Cloud-Deployed Full-Stack Web Application

A centralized platform for employee leave applications, approvals, leave balance tracking, and document management.

<br>

![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Language-Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![AWS](https://img.shields.io/badge/Cloud-AWS-232F3E?style=for-the-badge&logo=amazonaws&logoColor=white)

</div>

---

## 📌 Project Overview

The **Employee Leave Management System** is designed to simplify leave management through a centralized web application. Employees can submit and track leave requests, managers can review requests, and administrators can oversee employee and leave records.

The project demonstrates full-stack development, REST API integration, database management, authentication, and AWS cloud deployment.

## ✨ Key Features

- **Role-Based Dashboards** — Separate interfaces for employees, managers, and administrators.
- **Authentication** — Login and registration with JWT-based authentication.
- **Leave Management** — Submit, track, approve, and reject leave requests.
- **Leave Balance** — View available leave information.
- **Document Management** — Access employee documents.
- **REST API** — Backend endpoints documented using Swagger UI.
- **Cloud Deployment** — AWS services for application hosting and supporting infrastructure.

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| Frontend | React |
| Backend | Python, FastAPI |
| Database | PostgreSQL |
| Authentication | JSON Web Tokens (JWT) |
| API Documentation | Swagger UI / OpenAPI |
| Compute | AWS EC2 |
| Load Balancing | AWS Application Load Balancer |
| Object Storage | AWS S3 |
| Managed Database | AWS RDS |
| DNS | Amazon Route 53 |
| Content Delivery | Amazon CloudFront |

---

## 🏗️ Architecture

```text
                 Users
                   |
                   v
             React Frontend
                   |
                   v
          AWS Application Load Balancer
                   |
                   v
             FastAPI Backend
                   |
                   v
           PostgreSQL on AWS RDS
````

The application separates the frontend, backend API, and database into distinct layers. AWS services provide the hosting and infrastructure components used by the deployment.

> The diagram is a logical overview. The exact request path depends on the configured frontend URL, load balancer listeners, and backend routes.

## 📁 Project Structure

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
├── screenshots/
└── README.md
```

---

# 🖥️ Project Screenshots

## 🔐 Employee Portal

### 1. Login Page

![Login Page](screenshots/01-login-page.png)

### 2. Registration Page

![Registration Page](screenshots/02-register-page.png)

### 3. Employee Dashboard

![Employee Dashboard](screenshots/03-employee-dashboard.png)

### 4. Employee Profile

![Employee Profile](screenshots/04-employee-profile.png)

### 5. Apply Leave

![Apply Leave](screenshots/05-apply-leave.png)

### 6. My Leaves

![My Leaves](screenshots/06-my-leaves.png)

### 7. Leave Balance

![Leave Balance](screenshots/07-leave-balance.png)

### 8. Employee Documents

![Employee Documents](screenshots/08-employee-documents.png)

### 9. Document Download

![Document Download](screenshots/09-document-download.png)

## 👥 Manager Portal

### 10. Manager Dashboard

![Manager Dashboard](screenshots/10-manager-dashboard.png)

### 11. Manager My Team

![Manager My Team](screenshots/11-manager-my-team.png)

### 12. Manager Leave Requests

![Manager Leave Requests](screenshots/12-manager-leave-requests.png)

## ⚙️ Admin Portal

### 13. Admin Dashboard

![Admin Dashboard](screenshots/13-admin-dashboard.png)

### 14. Total Employees

![Total Employees](screenshots/14-admin-total-employees.png)

### 15. Total Leave Requests

![Total Leave Requests](screenshots/15-admin-total-leave-requests.png)

### 16. Pending Leaves

![Pending Leaves](screenshots/16-admin-pending-leaves.png)

### 17. Approved Leaves

![Approved Leaves](screenshots/17-admin-approved-leaves.png)

### 18. Rejected Leaves

![Rejected Leaves](screenshots/18-admin-rejected-leaves.png)

### 19. Admin Documents

![Admin Documents](screenshots/19-admin-documents.png)

### 20. Admin Document Download

![Admin Document Download](screenshots/20-admin-document-download.png)

## 🔌 API Documentation

### 21. Swagger API Overview — Part 1

![Swagger API Overview 1](screenshots/21-swagger-api-overview-1.png)

### 22. Swagger API Overview — Part 2

![Swagger API Overview 2](screenshots/22-swagger-api-overview-2.png)

### 23. Swagger API Overview — Part 3

![Swagger API Overview 3](screenshots/23-swagger-api-overview-3.png)

## ☁️ AWS Infrastructure

### 24. EC2 Instance

![AWS EC2 Instance](screenshots/24-aws-ec2-instance.png)

### 25. Application Load Balancer

![AWS Load Balancer](screenshots/25-aws-load-balancer.png)

### 26. Target Group Health

![AWS Target Group Health](screenshots/26-aws-target-group-health.png)

### 27. S3 Frontend

![AWS S3 Frontend](screenshots/27-aws-s3-frontend.png)

### 28. Route 53 Domain

![AWS Route 53 Domain](screenshots/28-aws-route53-domain.png)

### 29. CloudFront

![AWS CloudFront](screenshots/29-aws-cloudfront.png)

### 30. RDS Database

![AWS RDS Database](screenshots/30-aws-rds-database.png)

---

## ☁️ AWS Deployment

The application uses AWS infrastructure to host application components and support cloud deployment.

| AWS Service                   | Purpose                                                                  |
| ----------------------------- | ------------------------------------------------------------------------ |
| **Amazon EC2**                | Runs the backend application.                                            |
| **Application Load Balancer** | Routes incoming traffic to configured backend targets.                   |
| **Amazon S3**                 | Stores frontend assets and configured application documents.             |
| **Amazon RDS**                | Hosts the PostgreSQL database.                                           |
| **Amazon Route 53**           | Manages DNS records for the application domain.                          |
| **Amazon CloudFront**         | Delivers configured frontend content through a content delivery network. |

The services above describe the intended roles in this project. Actual traffic paths and access permissions depend on the deployed configuration.

## 🎯 Purpose of Using AWS

AWS was used to gain practical experience deploying a web application in a cloud environment.

Key objectives include:

* Hosting an application outside the local development environment.
* Connecting a backend API to a managed relational database.
* Learning load balancing and target health monitoring.
* Working with object storage and cloud-based content delivery.
* Configuring DNS for application access.
* Understanding cloud infrastructure and service integration.

## 🔒 Security

Security-related components of the project include:

* JWT-based authentication.
* Role-based application access.
* Backend request validation.
* Database-backed persistence.
* Environment-based configuration for sensitive settings.

> These are implementation goals and components. A production deployment should also verify authorization rules, token handling, HTTPS configuration, secret storage, database access restrictions, logging, and document permissions.

## 🎯 Project Scope

The project focuses on:

* Employee registration and authentication.
* Employee profile and leave management.
* Manager review of leave requests.
* Administrative oversight of employee and leave records.
* Document access workflows.
* REST API and database integration.
* Deployment and configuration of AWS infrastructure.

## 🧪 Testing and Validation

Testing and validation can cover the following areas:

* Authentication and role-specific access.
* Leave submission and status transitions.
* Employee, manager, and administrator workflows.
* REST API requests through Swagger UI.
* Database connectivity and persistence.
* Document access and download behavior.
* AWS target group health and application availability.

Actual test coverage depends on the tests executed during development and deployment.

## 🎓 Key Learning Outcomes

Through this project, the following skills were explored:

* React frontend development.
* FastAPI backend and REST API development.
* PostgreSQL database integration.
* JWT-based authentication.
* API testing and debugging with Swagger UI.
* AWS EC2 and load balancer configuration.
* S3, RDS, DNS, and content delivery services.
* Deploying and troubleshooting a multi-component application.

## 🚀 Future Improvements

Potential improvements include:

* Automated unit and integration tests.
* CI/CD pipeline for repeatable deployments.
* Centralized monitoring, logging, and alerts.
* More detailed audit trails for leave approvals.
* Improved reporting and notification features.
* Additional security testing and access-control reviews.
* Infrastructure automation.

## 📋 Project Summary

The Employee Leave Management System combines full-stack application development, database integration, authentication, API documentation, and AWS deployment in a practical project.

It serves as a portfolio demonstration of application development and cloud infrastructure learning.

---

## 👨‍💻 Author

### Krishna Kumar

**AWS Cloud Architecture | Cloud Enthusiast**

Interested in cloud technologies, application deployment, and building practical solutions using AWS.

[![GitHub](https://img.shields.io/badge/GitHub-krishna--infosec21-181717?style=for-the-badge\&logo=github\&logoColor=white)](https://github.com/krishna-infosec21)

---

## 📄 License

This project was created for learning, portfolio development, and demonstrating practical skills in full-stack development and AWS cloud architecture.

No formal open-source license has been specified. Add a `LICENSE` file if you intend to distribute the project under specific reuse terms.

---

<div align="center">

**Built with dedication to continuous learning and cloud technology.**

</div>
