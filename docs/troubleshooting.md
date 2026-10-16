# Troubleshooting Guide

## 1. Overview

This guide covers common issues encountered while running and deploying the Employee Leave Management System.

## 2. Backend Does Not Start

**Symptoms:** uvicorn is not recognized, Python errors appear, or the server exits.

**Checks:**

- Activate the backend virtual environment.
- Confirm that the required packages are installed.
- Run the command from the backend directory.
- Read the complete error message before changing configuration.

Commands:

cd C:\Users\Admin\Desktop\employee-leave-management\backend
.\venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload

## 3. Frontend Does Not Start

**Symptoms:** Vite fails to start, the page is blank, or localhost refuses the connection.

**Checks:**

- Confirm Node.js and npm are installed.
- Run 
pm install in the frontend directory.
- Run 
pm run dev.
- Open the URL printed by Vite.
- Check the terminal for syntax errors and missing imports.

## 4. Database Connection Errors

**Symptoms:** PostgreSQL connection refused, authentication failure, or missing tables.

**Checks:**

- Confirm PostgreSQL is running and reachable.
- Verify the database name, username, host, port, and password configuration.
- Confirm the required database exists.
- Confirm the application uses the intended .env file.
- Never publish database passwords or connection strings.

## 5. Login Fails

**Symptoms:** Login returns 401 Unauthorized or the frontend cannot sign in.

**Checks:**

- Confirm the username and password are correct.
- Verify that the user exists in the configured database.
- Confirm the frontend is calling the correct backend URL.
- Check that the login request uses the API's expected parameter format.
- Inspect the backend logs without exposing credentials.

The current login endpoint accepts username and password as query parameters. Do not assume it accepts a JSON request body.

## 6. 401 Unauthorized

**Possible causes:**

- The access token is missing, invalid, or expired.
- The frontend is not attaching the token.
- The request uses an incorrect Authorization header.

**Checks:**

- Sign in again to obtain a fresh token.
- Send Authorization: Bearer <JWT_ACCESS_TOKEN> to protected endpoints.
- Verify that the backend token verification configuration is correct.
- Never share a real access token in screenshots or public issues.

## 7. 403 Forbidden

**Possible causes:**

- The current role is not allowed to perform the operation.
- The record belongs to another employee or team.

**Action:** Verify the user's role and resource permissions. Do not bypass backend authorization checks.

## 8. Leave Request Errors

**Symptoms:** A leave request cannot be submitted, approved, rejected, or cancelled.

**Checks:**

- Confirm the start date is not after the end date.
- Confirm required fields are present.
- Check the current leave status.
- Confirm the logged-in user has permission for the requested action.
- Remember that cancellation may be allowed only for pending requests.

## 9. Documents Missing or Download Fails

**Possible causes:**

- No document metadata exists in the database.
- The S3 object key is incorrect.
- The object does not exist in the configured bucket.
- The IAM role lacks the required S3 permission.
- The user is not authorized to access the document.

**Checks:**

- Verify that the document appears in the API response.
- Check the database record's S3 key.
- Confirm the object exists in the configured bucket.
- Verify the EC2 role or other configured AWS credentials.
- Confirm the document bucket remains private.
- Check whether a presigned download URL has expired.

## 10. CORS Errors

**Symptoms:** The browser blocks frontend requests even though the API is running.

**Checks:**

- Verify the frontend's configured API URL.
- Check backend CORS settings.
- Allow the intended frontend origin in production.
- Check whether the browser is calling HTTP when HTTPS is required.

## 11. AWS Deployment Issues

### Unhealthy load balancer target

- Check the EC2 application service status.
- Verify that the backend listens on the expected port.
- Check security group rules between the load balancer and EC2.
- Verify the target group's health-check path.

### DNS or HTTPS failure

- Verify the DNS record points to the intended endpoint.
- Check the TLS certificate and domain names.
- Allow time for DNS changes to propagate.

### S3 AccessDenied

- Review the IAM role and bucket policy.
- Verify the object key and bucket region.
- Confirm that the request is authorized.
- Do not make a private document bucket public to work around access errors.

## 12. Logs and Diagnostics

- Check the backend terminal output during local testing.
- Check browser developer tools for failed network requests.
- Check the EC2 service logs for deployed backend errors.
- Review AWS load balancer target health and application logs.
- Remove tokens, passwords, and personal information before sharing logs.

## 13. Safe Recovery

1. Record the exact error message.
2. Identify which component is failing.
3. Check configuration before changing code.
4. Make one change at a time.
5. Retest the affected feature.
6. Avoid deleting databases, S3 objects, or AWS resources without a verified backup and clear reason.

## 14. Related Documentation

- [Project Documentation](README.md)
- [API Reference](api-reference.md)
- [Architecture](architecture.md)
- [Database](database.md)
- [Deployment](deployment.md)
- [Security](security.md)
- [Testing](testing.md)
