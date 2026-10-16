# Deployment Notes

## 1. Project Overview

Employee Leave Management System uses React, FastAPI, PostgreSQL, and AWS deployment services.

## 2. AWS Resources

- Region: ap-south-2
- Backend: EC2 running FastAPI
- Load balancing: Application Load Balancer
- Database: Amazon RDS for PostgreSQL
- Frontend: Amazon S3
- Employee documents: private S3 bucket
- DNS: Route 53, if configured
- CDN: CloudFront, if configured

Confirm resource names and settings in the AWS Console before deployment.

## 3. Backend Deployment

1. Confirm the EC2 instance is running.
2. Confirm the application source code is available.
3. Install required Python dependencies.
4. Configure the database connection securely.
5. Start the application service.
6. Check application logs for errors.

Ubuntu service commands:

sudo systemctl status leaveapp.service
sudo journalctl -u leaveapp.service -n 100 --no-pager

These commands assume the service is named leaveapp.service.

## 4. Health Check

Check the local backend endpoint:

curl -i http://127.0.0.1:8000/health

Use the actual configured port and protocol.

## 5. Database

- Confirm RDS is available.
- Verify application database connectivity.
- Allow database traffic only from authorized resources.
- Back up the database before schema changes.
- Never commit database passwords or connection strings.

## 6. Load Balancer

- Verify the target group port.
- Verify the health-check path.
- Confirm the target is healthy.
- Review load balancer and EC2 security groups.
- Use HTTPS for public traffic where configured.

## 7. Frontend Deployment

- Build the frontend using the project's configured build command.
- Upload the build output to the intended frontend bucket.
- Verify the frontend API URL.
- Verify CloudFront configuration if enabled.
- Never put AWS credentials in frontend code.

## 8. S3 Documents

- Keep employee documents in a private bucket.
- Grant the backend only required S3 permissions.
- Verify object keys and database metadata.
- Test authorized downloads.
- Do not make the document bucket public to fix access errors.

## 9. DNS and HTTPS

- Verify Route 53 records.
- Confirm the TLS certificate matches the domain.
- Test HTTPS behavior.
- Allow time for DNS changes to propagate.

## 10. Verification Checklist

- [ ] Backend service is running.
- [ ] Health endpoint responds successfully.
- [ ] Load balancer target is healthy.
- [ ] Database connection works.
- [ ] Frontend loads correctly.
- [ ] Login works.
- [ ] Leave workflows work.
- [ ] Authorized document downloads work.
- [ ] DNS and HTTPS work if configured.
- [ ] Logs do not expose secrets.

## 11. Security

- Use least-privilege IAM permissions.
- Keep secrets out of Git.
- Restrict SSH and database access.
- Restrict production CORS origins.
- Review application logs after deployment.
- Test changes before production deployment.
