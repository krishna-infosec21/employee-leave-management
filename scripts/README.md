# Scripts

This directory contains helper scripts and deployment resources for the Employee Leave Management System.

## Files

| File | Purpose |
|---|---|
| deployment-notes.md | AWS deployment instructions and operational notes |
| health-check.sh | Checks application service and API health |
| user-data.sh | EC2 instance initialization example |

## Requirements

- AWS account and appropriate permissions for deployment tasks.
- Linux shell environment for .sh scripts.
- Required application configuration and environment variables.

## Usage

Review each script before executing it. Update paths, service names, and configuration to match the target environment.

Do not store passwords, access tokens, AWS access keys, or other secrets in scripts.

## Important Notes

- Test scripts in a non-production environment before using them in production.
- Use least-privilege IAM permissions.
- Confirm the target EC2 instance, region, and service configuration before making changes.
- The scripts are helper examples and should be verified against the actual deployment.
