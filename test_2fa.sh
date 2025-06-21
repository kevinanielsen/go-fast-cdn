#!/bin/bash

API_BASE="http://localhost:8080/api"
EMAIL="test2fa$(date +%s)@example.com"
PASSWORD="TestPassword123!"

echo "=== 2FA API Testing Script ==="
echo ""

# Step 1: Register a new user
echo "1. Registering new user..."
REGISTER_RESPONSE=$(curl -s -X POST ${API_BASE}/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}")

echo "Register response: $REGISTER_RESPONSE"
echo ""

# Step 2: Login to get access token
echo "2. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST ${API_BASE}/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}")

echo "Login response: $LOGIN_RESPONSE"

# Extract access token from login response
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
    echo "Failed to get access token. Exiting."
    exit 1
fi

echo "Access token: $ACCESS_TOKEN"
echo ""

# Step 3: Setup 2FA
echo "3. Setting up 2FA..."
SETUP_2FA_RESPONSE=$(curl -s -X POST ${API_BASE}/auth/2fa \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -d '{"enable":true}')

echo "2FA Setup response: $SETUP_2FA_RESPONSE"
echo ""

# Step 4: Get user profile to check 2FA status
echo "4. Getting user profile..."
PROFILE_RESPONSE=$(curl -s -X GET ${API_BASE}/auth/profile \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

echo "Profile response: $PROFILE_RESPONSE"
echo ""

# Step 5: Test 2FA verification endpoint (will fail without valid token)
echo "5. Testing 2FA verification (with invalid token)..."
VERIFY_2FA_RESPONSE=$(curl -s -X POST ${API_BASE}/auth/2fa/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -d '{"token":"000000"}')

echo "2FA Verify response: $VERIFY_2FA_RESPONSE"
echo ""

echo "=== 2FA API Test Complete ==="
