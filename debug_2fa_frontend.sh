#!/bin/bash

API_BASE="http://localhost:8080/api"
EMAIL="debug2fa@example.com"
PASSWORD="TestPassword123!"

echo "=== 2FA Frontend Debug Test ==="
echo ""

# Step 1: Register and login
echo "1. Registering user..."
REGISTER_RESPONSE=$(curl -s -X POST ${API_BASE}/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}")

ACCESS_TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
echo "Access token: $ACCESS_TOKEN"
echo ""

# Step 2: Test 2FA setup with detailed response
echo "2. Setting up 2FA (detailed response)..."
SETUP_RESPONSE=$(curl -s -X POST ${API_BASE}/auth/2fa \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -d '{"enable":true}')

echo "Full 2FA Response:"
echo "$SETUP_RESPONSE" | jq . 2>/dev/null || echo "$SETUP_RESPONSE"
echo ""

# Step 3: Extract and display values
SECRET=$(echo $SETUP_RESPONSE | grep -o '"secret":"[^"]*"' | cut -d'"' -f4)
OTPAUTH_URL=$(echo $SETUP_RESPONSE | grep -o '"otpauth_url":"[^"]*"' | cut -d'"' -f4)

echo "Extracted Secret: $SECRET"
echo "Extracted OTPAuth URL: $OTPAUTH_URL"
echo ""

# Step 4: Test QR code URL structure
echo "3. QR Code URL breakdown:"
echo "URL: $OTPAUTH_URL"
echo ""

if [ ! -z "$OTPAUTH_URL" ]; then
    echo "✅ OTPAuth URL is present"
    echo "URL decoded: $(echo $OTPAUTH_URL | sed 's/%20/ /g' | sed 's/%26/\&/g')"
else
    echo "❌ OTPAuth URL is missing!"
fi

if [ ! -z "$SECRET" ]; then
    echo "✅ Secret is present: $SECRET"
else
    echo "❌ Secret is missing!"
fi

echo ""
echo "=== Frontend Debug Complete ==="
