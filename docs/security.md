# Security Documentation

## 1. Authentication

The backend provides registration and login endpoints under /api/auth.

- POST /api/auth/register creates a user account and employee profile.
- POST /api/auth/login validates credentials and returns an access token.
- Protected endpoints should receive the token using Authorization: Bearer <JWT_ACCESS_TOKEN>.
- Never publish real access tokens, passwords, JWT secrets, or .env files.

## 2. Password Security

- Store password hashes, never plaintext passwords.
- Use secure password hashing and verification functions.
- Never return passwords or password hashes in API responses.
- Use strong, unique passwords.

## 3. Roles and Permissions

| Role | Intended access |
|---|---|
| ADMIN | Authorized administrative functions and system records |
| MANAGER | Authorized team information and leave approvals |
| EMPLOYEE | Own profile, leave requests, and permitted documents |

Always enforce permissions in the backend. Hiding frontend buttons is not sufficient security.

## 4. Leave Request Security

- Employees should access their own leave requests.
- Managers should access only requests belonging to their authorized team.
- Only authorized managers should approve or reject pending requests.
- Validate leave dates, status changes, and record ownership on the server.

## 5. Amazon S3 Document Security

- Keep the documents bucket private.
- Restrict S3 access using least-privilege IAM policies.
- Check user permissions before allowing document downloads.
- Use short-lived presigned URLs for temporary downloads.
- Do not expose AWS credentials in frontend code or GitHub.
- Validate file types and file sizes before accepting uploads.

The current backend download route uses a presigned URL with a one-hour expiry. Review whether a shorter expiry is appropriate.

## 6. Database Security

- Store database credentials in environment variables or an approved secrets manager.
- Never commit .env files.
- Restrict PostgreSQL network access to authorized application resources.
- Use least-privilege database permissions.
- Back up the database securely.
- Do not put real connection strings or passwords in documentation.

## 7. AWS Infrastructure Security

### EC2
- Allow SSH access only from trusted IP addresses where possible.
- Close unnecessary ports and apply security updates.

### Load Balancer and HTTPS
- Use HTTPS for public application traffic.
- Redirect HTTP to HTTPS where appropriate.
- Use a valid TLS certificate.

### IAM
- Grant only the permissions required for each task.
- Prefer temporary credentials or IAM roles over long-lived access keys where possible.
- Review policies and remove unused permissions.

## 8. Security Issues to Review

### CORS

The current main.py configuration uses llow_origins=[*]. Restrict production CORS to the actual frontend origins and review credential settings.

### Employee endpoints

Review POST /api/employees/ and GET /api/employees/{employee_id} in employees.py. The current implementation does not declare an authentication dependency on these routes. Add authentication and appropriate role or ownership checks before using them with real employee data.

### Additional controls

- Consider rate limiting login attempts.
- Validate request data and file uploads.
- Avoid returning stack traces or sensitive information to clients.
- Keep Python and JavaScript dependencies updated.
- Monitor authentication failures and unexpected access attempts.

## 9. Security Testing Checklist

- [ ] Invalid credentials are rejected.
- [ ] Protected endpoints reject missing or invalid tokens.
- [ ] Expired tokens are rejected.
- [ ] Employees cannot access another employee's private records.
- [ ] Managers cannot approve requests outside their authorized team.
- [ ] Non-admin users cannot access admin-only functions.
- [ ] Unauthorized users cannot download private documents.
- [ ] Presigned URLs expire as expected.
- [ ] S3 buckets do not allow unintended public access.
- [ ] Production CORS origins are restricted.
- [ ] Database ports are not publicly accessible.
- [ ] Secrets are absent from public documentation and repository files.
- [ ] HTTPS works correctly in production.

Only test systems you own or have explicit permission to assess.

## 10. Reporting Security Issues

1. Record the affected endpoint or resource.
2. Document reproducible steps without collecting unnecessary personal data.
3. Avoid accessing or modifying other users' information.
4. Fix the issue and retest the affected functionality.
5. Review logs for signs of unauthorized access.

## 11. Related Documentation

- [Project Documentation](README.md)
- [API Reference](api-reference.md)
- [Architecture](architecture.md)
- [Database](database.md)
- [Deployment](deployment.md)
- [Testing](testing.md)
- [Troubleshooting](troubleshooting.md)
