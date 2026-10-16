# 🏗️ System Architecture

![Architecture](https://img.shields.io/badge/Architecture-3--Tier-blue)
![Frontend](https://img.shields.io/badge/Frontend-React%20%2F%20Vite-61DAFB?logo=react&logoColor=black)
![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)
![Database](https://img.shields.io/badge/Database-PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Cloud](https://img.shields.io/badge/Cloud-AWS-orange?logo=amazonaws&logoColor=white)

This document describes the logical architecture of the **Employee Leave Management System**, a web application for employee profiles, leave requests, manager decisions, and document access.

> **Note:** This is the intended/logical architecture based on the project's technology and deployment configuration. Verify the live AWS routing and enabled services before treating every cloud connection as confirmed.

## Contents

- [Architecture Overview](#architecture-overview)
- [Application Components](#application-components)
- [Request Flow](#request-flow)
- [Leave Approval Flow](#leave-approval-flow)
- [Document Download Flow](#document-download-flow)
- [Authentication and Authorization](#authentication-and-authorization)
- [Deployment View](#deployment-view)
- [Reliability and Security](#reliability-and-security)
- [Related Documentation](#related-documentation)

## Architecture Overview

   mermaid
flowchart TB
    User["Employee / Manager / Admin"]
    DNS["Domain / DNS"]
    CDN["CloudFront (if enabled)"]
    Frontend["React + Vite Frontend"]
    ALB["AWS Application Load Balancer"]
    API["FastAPI Backend on EC2"]
    DB[("PostgreSQL / Amazon RDS")]
    S3[("Amazon S3 Documents")]

    User --> DNS
    DNS --> CDN
    CDN --> Frontend
    User --> Frontend
    Frontend -->|"HTTPS API requests"| ALB
    ALB --> API
    API --> DB
    API -->|"Validate object / create presigned URL"| S3
    User -.->|"Temporary download URL"| S3


The CloudFront path depends on the deployed configuration. The diagram represents a logical deployment and should be checked against the actual DNS records, CloudFront origins, and load balancer listeners.

## Application Components

| Component          | Technology / Service                       | Responsibility                                                |
| ------------------ | ------------------------------------------ | ------------------------------------------------------------- |
| User interface     | React                                      | Login, registration, dashboards, forms, and document controls |
| Frontend tooling   | Vite                                       | Local development server and frontend build tooling           |
| API                | FastAPI                                    | HTTP endpoints, validation, and application logic             |
| ORM                | SQLAlchemy                                 | Python object-to-database mapping                             |
| Database           | PostgreSQL                                 | User, employee, leave, and document metadata                  |
| Authentication     | Bearer access token / JWT implementation   | Authenticated API access                                      |
| Compute            | Amazon EC2                                 | Runs the backend application                                  |
| Load balancing     | AWS Application Load Balancer              | Routes incoming API traffic to registered targets             |
| Relational storage | Amazon RDS for PostgreSQL                  | Managed database hosting, if configured for the environment   |
| Object storage     | Amazon S3                                  | Stores document objects                                       |
| DNS                | Amazon Route 53 or configured DNS provider | Resolves the application domain                               |
| CDN                | Amazon CloudFront, if enabled              | Can serve the frontend through a CDN distribution             |

## Request Flow

1. The user opens the frontend in a browser.
2. The frontend sends API requests to the configured backend base URL.
3. The load balancer forwards API requests to a healthy backend target, when the application is deployed behind an ALB.
4. FastAPI validates request data and runs the appropriate route handler.
5. SQLAlchemy reads or updates the PostgreSQL database.
6. FastAPI returns a JSON response to the frontend.
7. The frontend updates the interface based on the response.

## Leave Approval Flow

   mermaid
flowchart TD
    A["Employee signs in"] --> B["Submit leave request"]
    B --> C["API validates dates and access"]
    C --> D["Save request as PENDING"]
    D --> E["Manager views pending requests"]
    E --> F{"Manager decision"}
    F -->|"Approve"| G["Status: APPROVED"]
    F -->|"Reject"| H["Status: REJECTED"]
    B -.-> I["Employee/Admin cancellation rules"]
    I --> J["Only PENDING requests can be cancelled"]


The current API checks that the start date is not after the end date. Managers can approve or reject pending requests belonging to their direct reports. The implementation does not currently demonstrate automatic leave-balance deduction or a leave-balance ledger in the database models.

## Document Download Flow

   mermaid
sequenceDiagram
    actor User
    participant UI as React Frontend
    participant API as FastAPI
    participant DB as PostgreSQL
    participant S3 as Amazon S3

    User->>UI: Select document download
    UI->>API: GET /api/documents/{id}/download
    API->>DB: Find document metadata
    DB-->>API: Document record
    API->>API: Check role and ownership
    API->>S3: Verify S3 object
    S3-->>API: Object accessible
    API->>S3: Generate presigned URL
    API-->>UI: Return download_url
    UI-->>User: Open temporary download URL


The current document API generates a presigned S3 download URL with a one-hour expiry. The S3 object key and bucket permissions must be configured correctly for the download to work.

## Authentication and Authorization

* Login validates the supplied username and password.
* Passwords are stored as password hashes rather than plain-text passwords.
* Successful login returns a Bearer access token.
* Protected endpoints use the token to identify the current user.
* Role-based checks distinguish `EMPLOYEE`, `MANAGER`, and `ADMIN` operations.
* Leave and document endpoints apply ownership or reporting-line checks in the routes reviewed.

**Review item:** The current employee creation and employee-by-ID routes do not declare authentication dependencies. Add appropriate authentication and authorization checks before exposing them in a production environment. Also restrict CORS origins to trusted frontend domains.

## Deployment View

The project's AWS deployment may include:

* Frontend hosting using Amazon S3 and/or CloudFront.
* API compute on Amazon EC2.
* An Application Load Balancer for API traffic.
* PostgreSQL on Amazon RDS.
* Employee documents in Amazon S3.
* Route 53 or another DNS provider for the application domain.

Confirm actual deployment settings in the AWS console before publishing endpoint names or claiming a service is active.

## Reliability and Security

Recommended operational practices:

* Enable HTTPS for all public application traffic.
* Store secrets in environment variables or a managed secrets service.
* Use IAM roles with least-privilege permissions for S3 and other AWS services.
* Restrict security groups to required source and destination ports.
* Keep database and document storage private unless public access is explicitly required.
* Monitor backend health, application logs, and load balancer target health.
* Configure database backups and test recovery procedures.
* Keep dependency versions updated and review security advisories.
* Validate role and ownership checks for every endpoint that exposes employee or document information.
* Never commit real passwords, JWT secrets, AWS credentials, or private presigned URLs.

## Related Documentation

* [Project README](../README.md)
* [API Reference](./api-reference.md)
* [Database Documentation](./database.md)
* [Deployment Guide](./deployment.md)
* [Security Guide](./security.md)
* [Testing Guide](./testing.md)
* [Troubleshooting](./troubleshooting.md)
* [Detailed Architecture Folder](../architecture/README.md)



**Document status:** Architecture overview. Update this file whenever the deployed topology or application components change.
