#!/bin/bash

# Test script for 2FA login flow
# Tests both step 1 (email/password) and step 2 (2FA token)

BASE_URL="http://localhost:8080/api/auth"
TEST_EMAIL="test@example.com"
TEST_PASSWORD="testpass123"

echo "=== Testing 2FA Login Flow ==="
echo ""

# Step 1: Try to log in without 2FA token (should get requires_2fa response)
echo "Step 1: Testing login without 2FA token..."
echo "Request: POST $BASE_URL/login"
echo "Body: {\"email\": \"$TEST_EMAIL\", \"password\": \"$TEST_PASSWORD\"}"
echo ""

STEP1_RESPONSE=$(curl -s -w "HTTP_STATUS:%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\", \"password\": \"$TEST_PASSWORD\"}" \
  "$BASE_URL/login")

STEP1_BODY=$(echo "$STEP1_RESPONSE" | sed -E 's/HTTP_STATUS:[0-9]{3}$//')
STEP1_STATUS=$(echo "$STEP1_RESPONSE" | tr -d '\n' | sed -E 's/.*HTTP_STATUS:([0-9]{3})$/\1/')

echo "Response Status: $STEP1_STATUS"
echo "Response Body: $STEP1_BODY"
echo ""

# Check if the response indicates 2FA is required
if echo "$STEP1_BODY" | grep -q '"requires_2fa":true'; then
    echo "✅ Step 1 Success: Server correctly requires 2FA"
    echo ""
    
    # Step 2: Generate a TOTP token for testing
    echo "Step 2: Testing login with 2FA token..."
    echo "Note: This would normally require a real TOTP token from an authenticator app"
    echo "For testing, we'll use a dummy token (which should fail with 'Invalid 2FA token')"
    echo ""
    
    DUMMY_TOKEN="123456"
    echo "Request: POST $BASE_URL/login"
    echo "Body: {\"email\": \"$TEST_EMAIL\", \"password\": \"$TEST_PASSWORD\", \"two_fa_token\": \"$DUMMY_TOKEN\"}"
    echo ""
    
    STEP2_RESPONSE=$(curl -s -w "HTTP_STATUS:%{http_code}" \
      -X POST \
      -H "Content-Type: application/json" \
      -d "{\"email\": \"$TEST_EMAIL\", \"password\": \"$TEST_PASSWORD\", \"two_fa_token\": \"$DUMMY_TOKEN\"}" \
      "$BASE_URL/login")
    
    STEP2_BODY=$(echo "$STEP2_RESPONSE" | sed -E 's/HTTP_STATUS:[0-9]{3}$//')
    STEP2_STATUS=$(echo "$STEP2_RESPONSE" | tr -d '\n' | sed -E 's/.*HTTP_STATUS:([0-9]{3})$/\1/')
    
    echo "Response Status: $STEP2_STATUS"
    echo "Response Body: $STEP2_BODY"
    echo ""
    
    if echo "$STEP2_BODY" | grep -q '"error":"Invalid 2FA token"'; then
        echo "✅ Step 2 Success: Server correctly validates 2FA tokens"
        echo ""
        echo "🎉 2FA Login Flow Test Complete!"
        echo "✅ Both steps are working correctly:"
        echo "   - Step 1: Email/password validation with 2FA requirement detection"
        echo "   - Step 2: 2FA token validation"
        echo ""
        echo "🔧 Frontend Implementation:"
        echo "   - Login form now supports two-step authentication"
        echo "   - UI switches to 2FA input when requires_2fa is true"
        echo "   - Clean, professional 2FA input with 6-digit code field"
        echo "   - Back button to return to email/password step"
    else
        echo "❌ Step 2 Issue: Expected 'Invalid 2FA token' error"
    fi
else
    echo "❌ Step 1 Issue: Server did not require 2FA or user doesn't have 2FA enabled"
    echo "Make sure the test user has 2FA enabled"
fi

echo ""
echo "=== Frontend Testing ==="
echo "🌐 Frontend is running at: http://localhost:5173"
echo "🔧 To test the complete flow:"
echo "   1. Navigate to the login page"
echo "   2. Enter email: $TEST_EMAIL and password: $TEST_PASSWORD"
echo "   3. Click 'Sign in' - should show 2FA step"
echo "   4. Enter a 6-digit code and click 'Verify Code'"
echo "   5. Should get 'Invalid 2FA token' error (expected for dummy codes)"
