## 1. Overview

This document describes testing for the Employee Leave Management System frontend, backend, database, authentication, leave workflows, documents, and deployment.

## 2. Prerequisites

- Python and the backend virtual environment
- Node.js and npm
- PostgreSQL and valid database configuration
- Required environment variables
- AWS resources, when testing the deployed application

Never put real passwords, tokens, or secrets in test files or public documentation.

## 3. Backend Tests

Open PowerShell and start the backend:

cd C:\Users\Admin\Desktop\employee-leave-management\backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload

When the backend starts, open http://127.0.0.1:8000/docs

Test the health endpoint in another PowerShell window:

Invoke-RestMethod http://127.0.0.1:8000/health

## 4. Frontend Tests

Open another PowerShell window:

cd C:\Users\Admin\Desktop\employee-leave-management\frontend
npm install
npm run dev

Open the local frontend URL printed by Vite, commonly http://localhost:5173/

Verify the login page, navigation, API communication, and error messages.

## 5. Authentication Tests

- [ ] Registration works with valid test data.
- [ ] Duplicate usernames and email addresses are rejected.
- [ ] Valid login returns an access token.
- [ ] Invalid credentials are rejected.
- [ ] Protected endpoints reject missing or invalid tokens.
- [ ] Password hashes are not returned in API responses.

## 6. Employee Tests

- [ ] Authorized users can view their own profile.
- [ ] Employee list access requires authentication.
- [ ] Employee creation requires appropriate authorization.
- [ ] Users cannot access other employees' private information without permission.

## 7. Leave Request Tests

- [ ] An employee can create a valid leave request.
- [ ] Invalid date ranges are rejected.
- [ ] New requests receive PENDING status.
- [ ] Employees can view their own requests.
- [ ] Managers can view authorized team requests.
- [ ] Authorized managers can approve or reject pending requests.
- [ ] Only permitted pending requests can be cancelled.
- [ ] Unauthorized users cannot modify other users' requests.

## 8. Document Tests

- [ ] Users see only documents they are authorized to access.
- [ ] Missing S3 objects return a safe error response.
- [ ] Unauthorized document downloads are rejected.
- [ ] Authorized downloads return a working temporary URL.
- [ ] The S3 bucket does not allow unintended public access.

## 9. Admin and Manager Tests

- [ ] Non-admin users cannot access admin-only endpoints.
- [ ] Dashboard counts match the database.
- [ ] Managers cannot approve requests outside their authorized team.
- [ ] Backend authorization is enforced independently of frontend controls.

## 10. Database Tests

- [ ] The application connects to the configured PostgreSQL database.
- [ ] Required tables and relationships exist.
- [ ] Duplicate usernames and email addresses are rejected.
- [ ] Leave requests and document metadata persist in the database.
- [ ] Database credentials are not exposed in logs or source control.

## 11. Deployment Tests

- [ ] The deployed health endpoint responds successfully.
- [ ] The load balancer target is healthy.
- [ ] The frontend communicates with the configured backend.
- [ ] DNS and HTTPS work correctly.
- [ ] Private S3 documents are accessible only to authorized users.
- [ ] Production CORS settings allow only intended frontend origins.

## 12. Test Results

| Test | Expected result | Actual result | Status |
|---|---|---|---|
| Health endpoint | Successful response | Not tested | Pending |
| Valid login | Access token returned | Not tested | Pending |
| Invalid login | Authentication rejected | Not tested | Pending |
| Create leave | PENDING request created | Not tested | Pending |
| Unauthorized document access | Access denied | Not tested | Pending |
| Admin access control | Non-admin request denied | Not tested | Pending |

Update the actual result and status only after running each test.

## 13. Safe Testing

Use test accounts and sample data. Test only systems you own or have explicit permission to assess.

## 14. Related Documentation

- [Project Documentation](README.md)
- [API Reference](api-reference.md)
- [Architecture](architecture.md)
- [Database](database.md)
- [Deployment](deployment.md)
- [Security](security.md)
- [Troubleshooting](troubleshooting.md)
