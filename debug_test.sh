#!/bin/bash

# Simple test to see what's in the context
API_BASE="http://localhost:8080/api"

# Test with existing user from previous test
ACCESS_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0LCJlbWFpbCI6InRlc3QyZmExNzUwNDc0ODEzQGV4YW1wbGUuY29tIiwicm9sZSI6InVzZXIiLCJpc3MiOiJnby1mYXN0LWNkbiIsImV4cCI6MTc1MDQ3NTcxNCwiaWF0IjoxNzUwNDc0ODE0fQ.13YtjefMgpYE_CHa92HU0z2rnSyMfn1_NduXHSaYtpg"

echo "Testing profile endpoint (works):"
curl -s -X GET ${API_BASE}/auth/profile \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"

echo -e "\n\nTesting 2FA setup (fails):"
curl -s -X POST ${API_BASE}/auth/2fa \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -d '{"enable":true}'
