# 🔌 API Reference

![FastAPI](https://img.shields.io/badge/FastAPI-API-009688?logo=fastapi&logoColor=white)
![OpenAPI](https://img.shields.io/badge/OpenAPI-Swagger-85EA2D?logo=swagger&logoColor=black)
![Version](https://img.shields.io/badge/API_Version-1.0.0-blue)

This document describes the API endpoints implemented in the Employee Leave Management System.

## Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Common HTTP Status Codes](#common-http-status-codes)
- [Authentication Endpoints](#authentication-endpoints)
- [Employee Endpoints](#employee-endpoints)
- [Leave Endpoints](#leave-endpoints)
- [Document Endpoints](#document-endpoints)
- [Admin Endpoint](#admin-endpoint)
- [Security Notes](#security-notes)
- [Interactive API Testing](#interactive-api-testing)

## Base URL

For local development:

```text
http://127.0.0.1:8000
````

For the deployed environment, use the configured application domain or load balancer URL. Do not commit private endpoints, credentials, access tokens, or secrets to public documentation.

## Authentication

Protected endpoints use a Bearer access token.

Add the following header to authenticated requests:

```http
Authorization: Bearer <access_token>
```

Obtain the access token by calling `POST /api/auth/login`.

The login endpoint currently accepts `username` and `password` as query parameters, not as a JSON request body.

## Common HTTP Status Codes

| Status                      | Meaning                                                                |
| --------------------------- | ---------------------------------------------------------------------- |
| `200 OK`                    | Request completed successfully                                         |
| `201 Created`               | Resource created; actual status depends on the endpoint implementation |
| `400 Bad Request`           | Invalid request or operation not allowed                               |
| `401 Unauthorized`          | Missing or invalid authentication credentials                          |
| `403 Forbidden`             | Authenticated user does not have permission                            |
| `404 Not Found`             | Requested resource was not found                                       |
| `422 Unprocessable Entity`  | Request parameters or body failed validation                           |
| `500 Internal Server Error` | Unexpected server-side error                                           |

## Authentication Endpoints

### Register a user

`POST /api/auth/register`

Creates a user account and an associated employee profile.

**Request body:** JSON matching the `UserCreate` schema.

Example shape (confirm required fields and accepted values in Swagger):

```json
{
  "username": "employee01",
  "password": "ReplaceWithAStrongPassword",
  "name": "Example Employee",
  "email": "employee01@example.com",
  "department_id": 1,
  "role": "EMPLOYEE"
}
```

**Responses:**

* `200 OK` — account created successfully with the current implementation.
* `400 Bad Request` — username or email already exists.
* `422 Unprocessable Entity` — request validation failed.

**Implementation note:** The endpoint creates the employee profile using the supplied name and department ID. Confirm that the selected department exists before registering the user.

### Login

`POST /api/auth/login`

Authenticates a user and returns an access token.

**Query parameters:**

| Parameter  | Type   | Required | Description         |
| ---------- | ------ | -------- | ------------------- |
| `username` | string | Yes      | Registered username |
| `password` | string | Yes      | Account password    |

Example request:

```bash
curl -X POST "http://127.0.0.1:8000/api/auth/login?username=employee01&password=YOUR_PASSWORD"
```

Use a test account only. Avoid putting real passwords in shell history or shared screenshots.

**Successful response example:**

```json
{
  "message": "Login successful",
  "access_token": "<access_token>",
  "token_type": "bearer",
  "user_id": 1,
  "username": "employee01",
  "role": "EMPLOYEE"
}
```

**Responses:**

* `200 OK` — login successful.
* `401 Unauthorized` — username or password is invalid.
* `422 Unprocessable Entity` — required query parameters are missing.

## Employee Endpoints

### Create an employee profile

`POST /api/employees/`

Creates an employee record.

**Request body:** JSON matching `EmployeeCreate`.

The schema fields should be confirmed in Swagger. The current route maps `user_id`, `name`, `department_id`, and `manager_id` into the employee record; it also returns an email field supplied in the request.

**Important:** The current route does not declare an authentication dependency. Add appropriate authorization checks before exposing this operation in production.

### List employees

`GET /api/employees/`

Returns employee records.

**Authentication:** Required.

**Access:** Requires a valid authenticated user. The current implementation does not apply role-specific filtering to this list.

### Get my profile

`GET /api/employees/me/profile`

Returns the employee profile associated with the authenticated user.

**Authentication:** Required.

**Responses:**

* `200 OK` — profile returned.
* `401 Unauthorized` — missing or invalid token.
* `404 Not Found` — employee profile not found.

### Get a manager's team

`GET /api/employees/manager/team`

Returns employees reporting directly to the authenticated manager.

**Authentication:** Required.

**Access:** `MANAGER` role only.

**Responses:**

* `200 OK` — team returned.
* `403 Forbidden` — caller is not a manager.
* `404 Not Found` — manager profile not found.

### Get an employee by ID

`GET /api/employees/{employee_id}`

Returns one employee record by employee ID.

**Path parameter:**

| Parameter     | Type    | Description        |
| ------------- | ------- | ------------------ |
| `employee_id` | integer | Employee record ID |

**Important:** The current route does not declare an authentication dependency or ownership/role check. Add appropriate access controls before using this endpoint with sensitive employee information.

## Leave Endpoints

### Create a leave request

`POST /api/leaves/`

Creates a leave request.

**Authentication:** Required.

**Request body:** JSON matching `LeaveRequestCreate`. Check the schema in Swagger for exact required fields and date format.

Example shape:

```json
{
  "employee_id": 1,
  "leave_type_id": 1,
  "from_date": "2026-11-02",
  "to_date": "2026-11-03",
  "reason": "Personal work"
}
```

Employees and managers can create requests only for themselves. Administrators can create a request for an existing employee.

**Responses:**

* `200 OK` — request created with the current implementation.
* `400 Bad Request` — start date is after end date.
* `403 Forbidden` — caller is not permitted to create the request.
* `404 Not Found` — employee profile or target employee not found.
* `422 Unprocessable Entity` — request validation failed.

New requests are assigned `PENDING` status.

### List leave requests

`GET /api/leaves/`

**Authentication:** Required.

Returned records depend on the caller's role:

* `EMPLOYEE` — own leave requests.
* `MANAGER` — requests for employees reporting directly to that manager.
* `ADMIN` — all leave requests.

### Get manager's pending leave requests

`GET /api/leaves/manager/pending`

**Authentication:** Required.

**Access:** `MANAGER` role only.

Returns pending leave requests from the manager's direct reports.

### Get a leave request by ID

`GET /api/leaves/{leave_id}`

Returns a single leave request when the caller is authorized to access it.

**Path parameter:**

| Parameter  | Type    | Description      |
| ---------- | ------- | ---------------- |
| `leave_id` | integer | Leave request ID |

Employees can access their own requests, managers can access requests from their direct reports, and administrators can access all requests.

### Approve a leave request

`PUT /api/leaves/{leave_id}/approve`

**Authentication:** Required.

**Access:** `MANAGER` role only. The request must belong to one of the manager's direct reports and must currently be `PENDING`.

**Request body:** JSON matching `LeaveAction`. The current route reads `manager_comment` from this object.

Example shape:

```json
{
  "manager_comment": "Approved"
}
```

The status becomes `APPROVED`.

### Reject a leave request

`PUT /api/leaves/{leave_id}/reject`

**Authentication:** Required.

**Access:** `MANAGER` role only. The request must belong to one of the manager's direct reports and must currently be `PENDING`.

**Request body:** JSON matching `LeaveAction`.

Example shape:

```json
{
  "manager_comment": "Please provide additional information"
}
```

The status becomes `REJECTED`.

### Cancel a leave request

`PUT /api/leaves/{leave_id}/cancel`

**Authentication:** Required.

Employees and managers can cancel their own pending requests. Administrators can cancel pending requests.

The status becomes `CANCELLED`. Only pending requests can be cancelled.

**Common errors:**

* `400 Bad Request` — request is not pending.
* `403 Forbidden` — caller cannot cancel the selected request.
* `404 Not Found` — leave request does not exist.

## Document Endpoints

Document records reference files stored in Amazon S3. Access to records and download links is controlled by the API.

### Create a document record

`POST /api/documents/`

**Authentication:** Required.

**Access:** `ADMIN` role only.

**Query parameters:**

| Parameter     | Type    | Required | Description                        |
| ------------- | ------- | -------- | ---------------------------------- |
| `employee_id` | integer | Yes      | Employee record ID                 |
| `file_name`   | string  | Yes      | Display name of the document       |
| `s3_key`      | string  | Yes      | Object key of the existing S3 file |

The API verifies that the employee exists and checks that the S3 object can be accessed before saving the document record.

Example shape:

```bash
curl -X POST "http://127.0.0.1:8000/api/documents/?employee_id=1&file_name=leave_document.pdf&s3_key=documents/employee1/leave_document.pdf" \
  -H "Authorization: Bearer <access_token>"
```

Use URL encoding for query parameter values when needed.

### List accessible documents

`GET /api/documents/`

**Authentication:** Required.

* `ADMIN` — can list all document records.
* `EMPLOYEE` — can list their own document records.
* `MANAGER` — can list their own documents and documents for direct reports.

### Get a document record

`GET /api/documents/{document_id}`

**Authentication:** Required.

Returns the document record if the caller is authorized. Administrators can access all records; employees can access their own records; managers can access their own records and those belonging to direct reports.

### Generate a document download link

`GET /api/documents/{document_id}/download`

**Authentication:** Required.

Checks access permissions and verifies the S3 object before generating a presigned download URL.

**Successful response example:**

```json
{
  "download_url": "<temporary_presigned_url>"
}
```

The current implementation sets the URL expiry to **3600 seconds (1 hour)**. Anyone who obtains the URL may be able to use it until it expires, so do not publish or share presigned URLs.

**Common errors:**

* `403 Forbidden` — caller lacks access or AWS denies access.
* `404 Not Found` — document record or S3 file not found.
* `500 Internal Server Error` — the link could not be generated.

## Admin Endpoint

### Get admin dashboard statistics

`GET /api/admin/dashboard`

**Authentication:** Required.

**Access:** `ADMIN` role only.

Returns the following counts:

* `total_users`
* `active_users`
* `employees`
* `pending_leaves`
* `documents`

**Responses:**

* `200 OK` — statistics returned.
* `403 Forbidden` — caller is not an administrator.

## Root and Health Endpoints

| Method | Endpoint  | Description                                 |
| ------ | --------- | ------------------------------------------- |
| GET    | `/`       | Returns application name and running status |
| GET    | `/health` | Returns a simple health status              |

Example health response:

```json
{
  "status": "healthy"
}
```

The health endpoint is a basic application check; it does not, by itself, confirm database or S3 connectivity.

## Security Notes

* Use HTTPS in deployed environments.
* Do not commit `.env` files, passwords, JWT secrets, access tokens, or AWS credentials.
* Use a least-privilege IAM role for S3 access.
* Keep employee and document endpoints protected by authentication and role/ownership checks.
* Restrict CORS origins to the actual frontend domains in production. The current application configuration uses a wildcard origin.
* The employee creation and employee-by-ID endpoints currently lack declared authentication dependencies. Review and fix these before production use.
* Never expose presigned download URLs in public logs, screenshots, or documentation.
* Verify request schemas and response codes against the live OpenAPI specification before publishing changes.

## Interactive API Testing

Run the backend locally and open:

```text
http://127.0.0.1:8000/docs
```

Swagger UI shows the generated request schemas, parameters, responses, and authentication controls.

OpenAPI JSON is available at:

```text
http://127.0.0.1:8000/openapi.json
```

For production testing, use only systems and accounts you are authorized to access.
