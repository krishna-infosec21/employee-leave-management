# 🗄️ Database Documentation

![Database](https://img.shields.io/badge/Database-PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![ORM](https://img.shields.io/badge/ORM-SQLAlchemy-D71F00)
![Schema](https://img.shields.io/badge/Schema-Relational-blue)

This document describes the relational data model used by the Employee Leave Management System.

## Contents

- [Overview](#overview)
- [Tables](#tables)
- [Entity Relationship Diagram](#entity-relationship-diagram)
- [Table Details](#table-details)
- [Data Relationships](#data-relationships)
- [Database Initialization](#database-initialization)
- [Security and Backup](#security-and-backup)
- [Related Documentation](#related-documentation)

## Overview

The application uses PostgreSQL as its relational database and SQLAlchemy as its ORM.

The models currently define six main tables:

| Table | Purpose |
|---|---|
| `users` | Login identity, email, password hash, and role |
| `departments` | Department records |
| `employees` | Employee profile and reporting relationships |
| `leave_types` | Available leave categories and default day values |
| `leave_requests` | Leave applications and manager decisions |
| `documents` | Metadata and S3 object keys for employee documents |

> **Scope note:** These are the six tables represented by the current SQLAlchemy models. A separate leave-balance ledger or audit-log table is not included in this list.

## Tables

  mermaid
erDiagram
    USERS ||--o| EMPLOYEES : "has profile"
    DEPARTMENTS ||--o{ EMPLOYEES : "contains"
    EMPLOYEES o|--o{ EMPLOYEES : "manages"
    EMPLOYEES ||--o{ LEAVE_REQUESTS : "submits"
    LEAVE_TYPES ||--o{ LEAVE_REQUESTS : "categorizes"
    EMPLOYEES ||--o{ DOCUMENTS : "owns"

    USERS {
        int id PK
        string username UK
        string email UK
        string password_hash
        string role
        datetime created_at
    }

    DEPARTMENTS {
        int id PK
        string name UK
    }

    EMPLOYEES {
        int id PK
        int user_id FK
        string employee_code UK
        string first_name
        string last_name
        int department_id FK
        int manager_id FK
        date joining_date
        boolean active
    }

    LEAVE_TYPES {
        int id PK
        string name
        int default_days
    }

    LEAVE_REQUESTS {
        int id PK
        int employee_id FK
        int leave_type_id FK
        date from_date
        date to_date
        string reason
        string status
        string manager_comment
        datetime created_at
    }

    DOCUMENTS {
        int id PK
        int employee_id FK
        string file_name
        string s3_key
        datetime uploaded_at
    }


The diagram shows the relationships represented by the model foreign keys. The `manager_id` field points to another employee record.

## Table Details

### 1. `users`

Stores authentication and account information.

| Column          | Purpose                                                     |
| --------------- | ----------------------------------------------------------- |
| `id`            | Primary key                                                 |
| `username`      | Unique login username                                       |
| `email`         | Unique email address                                        |
| `password_hash` | Hashed password                                             |
| `role`          | Application role, such as `EMPLOYEE`, `MANAGER`, or `ADMIN` |
| `created_at`    | Account creation timestamp                                  |

Security: passwords should never be stored in plain text. The application should store only a suitable password hash.

### 2. `departments`

Stores department information.

| Column | Purpose                |
| ------ | ---------------------- |
| `id`   | Primary key            |
| `name` | Unique department name |

Employee records can reference a department through `department_id`.

### 3. `employees`

Stores employee profile and organizational information.

| Column          | Purpose                                             |
| --------------- | --------------------------------------------------- |
| `id`            | Primary key                                         |
| `user_id`       | Foreign key referencing `users.id`                  |
| `employee_code` | Unique employee identifier                          |
| `first_name`    | Employee first/display name used by the current API |
| `last_name`     | Employee last name                                  |
| `department_id` | Foreign key referencing `departments.id`            |
| `manager_id`    | Optional self-reference to a manager employee       |
| `joining_date`  | Joining date                                        |
| `active`        | Indicates whether the employee is active            |

The current registration route populates `first_name` using the supplied name. Other profile fields may remain empty unless set elsewhere.

### 4. `leave_types`

Defines the available leave categories.

| Column         | Purpose                                            |
| -------------- | -------------------------------------------------- |
| `id`           | Primary key                                        |
| `name`         | Leave category name                                |
| `default_days` | Default number of days configured for the category |

Example categories used during local development include Casual Leave, Sick Leave, and Earned Leave. Actual values depend on the data seeded into the target database.

### 5. `leave_requests`

Stores employee leave applications and their decisions.

| Column            | Purpose                                  |
| ----------------- | ---------------------------------------- |
| `id`              | Primary key                              |
| `employee_id`     | Foreign key referencing `employees.id`   |
| `leave_type_id`   | Foreign key referencing `leave_types.id` |
| `from_date`       | First day of leave                       |
| `to_date`         | Last day of leave                        |
| `reason`          | Employee's reason for leave              |
| `status`          | Request status                           |
| `manager_comment` | Manager's decision comment               |
| `created_at`      | Request creation timestamp               |

The API uses these status values:

* `PENDING`
* `APPROVED`
* `REJECTED`
* `CANCELLED`

The current leave route checks that `from_date` is not after `to_date`. Approval, rejection, and cancellation are restricted to pending requests.

### 6. `documents`

Stores document metadata; the document file itself is stored in Amazon S3.

| Column        | Purpose                                |
| ------------- | -------------------------------------- |
| `id`          | Primary key                            |
| `employee_id` | Foreign key referencing `employees.id` |
| `file_name`   | Display filename                       |
| `s3_key`      | S3 object key                          |
| `uploaded_at` | Record creation/upload timestamp       |

The API checks document access permissions and generates a temporary S3 presigned URL for downloads.

## Data Relationships

* A user account can be associated with an employee profile.
* An employee belongs to a department.
* An employee may report to another employee who acts as their manager.
* An employee can submit multiple leave requests.
* Each leave request references a leave type.
* An employee can have multiple document records.
* Document records store the S3 object key rather than the file's binary content.

## Database Initialization

The backend uses SQLAlchemy models and calls:

  python
Base.metadata.create_all(bind=engine)


This can create tables that do not already exist. It is **not a replacement for database migrations** and does not automatically update existing tables to match every model change.

### Local setup checklist

1. Ensure PostgreSQL is installed and running.
2. Create the intended development database.
3. Configure `DATABASE_URL` in the backend environment.
4. Install the backend dependencies.
5. Start the backend and check the logs for database connection errors.
6. Verify the tables and application endpoints before testing.

Example environment variable shape:

  env
DATABASE_URL=postgresql://<username>:<password>@<host>:5432/<database_name>


Replace the placeholders with your local or authorized environment values. Do not commit the real connection string to Git.

### Existing databases

Before changing a database schema:

* Take a backup.
* Confirm the current tables and columns.
* Review model changes.
* Use a migration tool such as Alembic for controlled schema changes.
* Test the migration against a non-production database first.

The existence of `database/schema.sql` in the repository does not prove that it has been executed against the local or AWS database.

## Security and Backup

* Use a dedicated database user with only the permissions the application needs.
* Do not expose PostgreSQL publicly unless there is a clear, controlled requirement.
* Restrict database network access to trusted application hosts.
* Store connection strings and credentials outside source control.
* Use managed backups or scheduled PostgreSQL backups.
* Test restoration periodically.
* Avoid putting personal employee information into public logs or screenshots.
* Use migrations and version control to track schema changes.

## Related Documentation

* [Project README](../README.md)
* [API Reference](./api-reference.md)
* [Architecture](./architecture.md)
* [Deployment Guide](./deployment.md)
* [Security Guide](./security.md)
* [Testing Guide](./testing.md)
* [Troubleshooting](./troubleshooting.md)
* [Database Folder Documentation](../database/README.md)

---

**Document status:** Based on the current SQLAlchemy model definitions. Update this file when the database models or relationships change.
