#!/usr/bin/env bash
set -euo pipefail

# EC2 User Data example for Ubuntu.
# Review before using in production.

exec > /var/log/employee-leave-user-data.log 2>&1

echo "Starting EC2 initialization..."

if [ "$(id -u)" -ne 0 ]; then
  echo "ERROR: Run this script with root privileges."
  exit 1
fi

if ! command -v apt-get >/dev/null 2>&1; then
  echo "ERROR: Ubuntu or Debian is required."
  exit 1
fi

apt-get update
apt-get install -y curl ca-certificates

echo "Checking leaveapp service..."
if systemctl list-unit-files leaveapp.service --no-legend 2>/dev/null | grep -q leaveapp.service; then
  systemctl --no-pager status leaveapp.service || true
else
  echo "leaveapp.service is not installed; skipping service check."
fi

echo "EC2 initialization completed."
echo "Check /var/log/employee-leave-user-data.log for details."
