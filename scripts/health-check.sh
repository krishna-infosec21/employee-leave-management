#!/usr/bin/env bash
set -u

SERVICE_NAME=leaveapp.service
HEALTH_URL=http://127.0.0.1:8000/health

echo "Checking service: "
if systemctl is-active --quiet ""; then
  echo "PASS: Application service is active."
else
  echo "FAIL: Application service is not active."
  systemctl status "" --no-pager
  exit 1
fi

echo "Checking API health: "
if command -v curl >/dev/null 2>&1; then
  if curl --fail --silent --show-error --max-time 10 ""; then
    echo
    echo "PASS: Health endpoint responded successfully."
  else
    echo "FAIL: Health endpoint check failed."
    exit 1
  fi
else
  echo "FAIL: curl is not installed."
  exit 1
fi
