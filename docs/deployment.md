# 🚀 Deployment Guide

![AWS](https://img.shields.io/badge/Cloud-AWS-orange?logo=amazonaws&logoColor=white)
![Compute](https://img.shields.io/badge/Compute-EC2-FF9900?logo=amazonec2&logoColor=white)
![Database](https://img.shields.io/badge/Database-RDS-527FFF?logo=amazonrds&logoColor=white)
![Storage](https://img.shields.io/badge/Storage-S3-569A31?logo=amazons3&logoColor=white)

This guide describes the deployment approach for the Employee Leave Management System. Follow it for authorized development or production environments.

> **Important:** AWS resources and network paths can change. Confirm the actual resources and settings in your AWS account before executing deployment commands. Do not publish private endpoints, account IDs, credentials, or secrets.

## Contents

- [Deployment Overview](#deployment-overview)
- [Application Components](#application-components)
- [Prerequisites](#prerequisites)
- [Configuration](#configuration)
- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Database Setup](#database-setup)
- [Document Storage](#document-storage)
- [Domain and HTTPS](#domain-and-https)
- [Validation Checklist](#validation-checklist)
- [Security Checklist](#security-checklist)
- [Troubleshooting](#troubleshooting)
- [Related Documentation](#related-documentation)

## Deployment Overview

mermaid
flowchart TB
    User["Browser / User"]
    DNS["DNS Provider / Route 53"]
    CDN["CloudFront (if configured)"]
    Web["Frontend Hosting: S3 or configured web host"]
    ALB["Application Load Balancer"]
    EC2["EC2 Backend: FastAPI"]
    RDS[("RDS PostgreSQL")]
    Docs[("S3 Document Bucket")]

    User --> DNS
    DNS --> CDN
    CDN --> Web
    User --> Web
    User -->|"API over HTTPS"| ALB
    ALB --> EC2
    EC2 --> RDS
    EC2 --> Docs


This is a logical reference diagram. Confirm the live CloudFront origins, DNS records, ALB listeners, target groups, and storage configuration before treating every path as active.

## Application Components

| Component        | Purpose                                                                  |
| ---------------- | ------------------------------------------------------------------------ |
| Frontend         | React/Vite web application                                               |
| Backend          | FastAPI application running on EC2 or another configured compute service |
| Load balancer    | Routes API requests to healthy registered backend targets                |
| Database         | PostgreSQL on Amazon RDS or a configured PostgreSQL host                 |
| Frontend storage | Amazon S3 or the configured frontend hosting service                     |
| Document storage | Amazon S3 objects referenced by document records                         |
| DNS              | Resolves the application domain                                          |
| CDN              | CloudFront distribution, if enabled                                      |

## Prerequisites

Before deploying, confirm you have:

* Access to the correct AWS account and region.
* An EC2 instance or other compute host for the backend.
* A PostgreSQL database and appropriate database credentials.
* A document S3 bucket and a suitable IAM role or permission policy.
* A frontend hosting destination.
* A load balancer and target group, if using an ALB.
* DNS control for the application domain, if configuring a custom domain.
* Python and Node.js versions compatible with the project.
* Git access to the project repository.

Do not place AWS access keys, database passwords, or JWT secrets in source files or public repositories.

## Configuration

Configure environment-specific settings outside source control.

Example backend `.env` shape:

   env
DATABASE_URL=postgresql://<username>:<password>@<database-host>:5432/<database-name>
JWT_SECRET=<long-random-secret>


Use the exact environment variable names expected by the backend code. If S3 settings are configurable in a future version, document those settings here as well.

### Configuration guidelines

* Use a different configuration for local development and production.
* Keep `.env` out of Git.
* Use an IAM role attached to the compute instance instead of hard-coded AWS credentials where possible.
* Rotate secrets if they are exposed.
* Restrict access to environment files and deployment logs.
* Never use example placeholder values as production credentials.

## Backend Deployment

The backend is a FastAPI application.

### General deployment workflow

1. Connect to the authorized backend host.
2. Pull or copy the intended application version.
3. Create and activate a Python virtual environment.
4. Install dependencies from `backend/requirements.txt`.
5. Configure the environment variables.
6. Verify database connectivity.
7. Start the application through the configured service manager.
8. Check service logs for startup or database errors.
9. Validate the health endpoint.
10. Confirm the load balancer target reports healthy, if an ALB is used.

Example commands for an Ubuntu host:

   bash
cd /path/to/employee-leave-management/backend

python3 -m venv venv
source venv/bin/activate

pip install --upgrade pip
pip install -r requirements.txt


Replace `/path/to/employee-leave-management` with the actual repository path on the host. The commands above install dependencies; they do not configure or start a production service.

### Application entry point

The application object is defined in:

   text
backend/app/main.py


For local development, the application can typically be started from the backend directory with:

   bash
uvicorn app.main:app --reload


Do not use `--reload` as the production process configuration. Use the deployment's service manager and a production-appropriate process configuration.

### Service checks

Check the service using the service manager configured on the host. If the service is named `leaveapp`, for example:

   bash
sudo systemctl status leaveapp
sudo journalctl -u leaveapp -n 100 --no-pager


Use these commands only if that service name matches your host configuration.

## Frontend Deployment

The frontend uses React and Vite.

### General workflow

1. Open a terminal in the frontend directory.
2. Install dependencies using the project's package manager.
3. Set the production API base URL using the configuration mechanism expected by the frontend.
4. Build the frontend.
5. Review the generated build files.
6. Publish the build to the configured hosting service.
7. Confirm the site loads over HTTPS.
8. Test login and authenticated API calls against the intended backend.

Typical Vite commands:

  bash
cd /path/to/employee-leave-management/frontend
npm install
npm run build

Use the package manager and scripts declared in `frontend/package.json`. The frontend's API base URL must point to the deployed API, not to a local development address.

If Amazon S3 is used for static website assets, configure the bucket and delivery method according to the application's security requirements. Prefer HTTPS delivery through an appropriately configured CloudFront distribution rather than exposing private content unnecessarily.

## Database Setup

1. Confirm the intended PostgreSQL instance and database name.
2. Ensure the backend host can reach the database on the required port.
3. Configure the backend's `DATABASE_URL`.
4. Use a database account with only the necessary permissions.
5. Back up an existing database before schema changes.
6. Apply reviewed migrations if the schema has changed.
7. Verify the application can read and write the expected records.

The application calls SQLAlchemy's `Base.metadata.create_all(bind=engine)` during startup. This can create missing tables, but it is not a full schema migration system.

Do not assume `database/schema.sql` has been executed against an AWS or local database simply because the file exists in the repository.

## Document Storage

The document API references files stored in Amazon S3.

Deployment checks:

* Confirm the configured bucket name and AWS region.
* Ensure the backend's IAM role has the minimum required S3 permissions.
* Verify the object key saved in the database matches the actual S3 key.
* Keep the bucket private unless public access is specifically required.
* Test the application's document authorization checks.
* Confirm presigned download links work and expire as expected.
* Do not store permanent public links where temporary presigned links are intended.

The current document download route generates a presigned URL with a one-hour expiry.

## Domain and HTTPS

When configuring a custom domain:

1. Verify the domain is under your control.
2. Check the intended DNS records.
3. Confirm the load balancer or CloudFront distribution is configured for the domain.
4. Attach a valid TLS certificate in the appropriate AWS service and region.
5. Verify HTTP-to-HTTPS behavior where required.
6. Confirm the frontend uses the HTTPS API address.
7. Test DNS resolution and application behavior from a normal client network.

DNS configuration alone does not create a working application route. The DNS target, certificate, listener, origin, and backend health must all be correct.

## Validation Checklist

### Backend

* [ ] Backend service starts without errors.
* [ ] `GET /health` returns a healthy status.
* [ ] API documentation is available at `/docs` where enabled.
* [ ] Database connection succeeds.
* [ ] Authentication works with a test account.
* [ ] Role and ownership restrictions are enforced.
* [ ] Document download works for authorized users only.

### Load balancer

* [ ] Target group has healthy registered targets.
* [ ] Health check path matches the backend health route.
* [ ] Listener rules forward requests to the intended target group.
* [ ] Security groups allow only the required traffic.

### Frontend

* [ ] Frontend loads over HTTPS.
* [ ] API base URL points to the deployed backend.
* [ ] Login and registration work.
* [ ] Employee, manager, and admin pages behave according to role.
* [ ] Browser network requests do not expose secrets.

### Storage and database

* [ ] PostgreSQL is reachable only from authorized hosts.
* [ ] Document bucket is not unintentionally public.
* [ ] S3 object keys match the database records.
* [ ] Backups are configured and recoverability has been tested.

## Security Checklist

* [ ] HTTPS is enabled for public application traffic.
* [ ] Secrets are not committed to Git.
* [ ] IAM follows least privilege.
* [ ] Database access is restricted by network rules.
* [ ] S3 Block Public Access is enabled where appropriate.
* [ ] CORS allows only trusted frontend origins in production.
* [ ] Employee endpoints enforce authentication and authorization.
* [ ] Logs do not contain passwords, tokens, or presigned URLs.
* [ ] Dependencies and the operating system receive security updates.
* [ ] Backups and recovery procedures are tested.

## Troubleshooting

| Problem                        | Checks                                                                                        |
| ------------------------------ | --------------------------------------------------------------------------------------------- |
| Backend service fails to start | Review service logs, Python environment, dependencies, and environment variables              |
| Health check fails             | Confirm the app is running, port and health path are correct, and network rules allow traffic |
| ALB target is unhealthy        | Check health check configuration, target port, service status, and security groups            |
| Database connection fails      | Verify `DATABASE_URL`, database availability, credentials, and network access                 |
| Document download fails        | Check object key, bucket region, IAM permissions, and document ownership rules                |
| Frontend cannot reach API      | Check the API base URL, HTTPS configuration, CORS, DNS, and load balancer routing             |
| Domain does not open           | Check DNS records, certificate status, distribution/origin configuration, and target health   |

## Related Documentation

* [Project README](../README.md)
* [Architecture](./architecture.md)
* [API Reference](./api-reference.md)
* [Database Guide](./database.md)
* [Security Guide](./security.md)
* [Testing Guide](./testing.md)
* [Troubleshooting](./troubleshooting.md)
* [Detailed Deployment Folder](../deployment/README.md)

---

**Document status:** General deployment guide. Verify all commands, service names, and AWS settings against the target environment before use.
