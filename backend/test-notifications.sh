#!/bin/bash
# Test FCM Notification System
# Usage: ./test-notifications.sh

set -e

echo "🧪 Testing FCM Notification System..."
echo "======================================"

# Configuration
API_URL="http://localhost:3000"
NOTIFICATION_URL="${API_URL}/notifications"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results
PASSED=0
FAILED=0

# Function to print test result
print_result() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✓ PASS${NC}: $2"
    ((PASSED++))
  else
    echo -e "${RED}✗ FAIL${NC}: $2"
    ((FAILED++))
  fi
}

# Function to make API call
api_call() {
  local method=$1
  local endpoint=$2
  local data=$3
  local token=$4
  
  if [ -n "$data" ]; then
    curl -s -X $method "${NOTIFICATION_URL}${endpoint}" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $token" \
      -d "$data"
  else
    curl -s -X $method "${NOTIFICATION_URL}${endpoint}" \
      -H "Authorization: Bearer $token"
  fi
}

echo ""
echo "📝 Step 1: Get test user token..."
echo "Please provide a valid JWT token for testing:"
read -r JWT_TOKEN

if [ -z "$JWT_TOKEN" ]; then
  echo -e "${RED}Error: JWT token is required${NC}"
  exit 1
fi

echo ""
echo "📝 Step 2: Register FCM device token..."
TEST_FCM_TOKEN="test-fcm-token-$(date +%s)"
REGISTER_RESPONSE=$(api_call POST "/register-token" \
  "{\"userId\":\"test-user-id\",\"token\":\"$TEST_FCM_TOKEN\",\"platform\":\"web\"}" \
  "$JWT_TOKEN")

if echo "$REGISTER_RESPONSE" | grep -q "success.*true"; then
  print_result 0 "FCM token registration"
else
  print_result 1 "FCM token registration"
  echo "Response: $REGISTER_RESPONSE"
fi

echo ""
echo "📝 Step 3: Get user tokens..."
GET_TOKENS_RESPONSE=$(api_call GET "/tokens/test-user-id" "" "$JWT_TOKEN")

if echo "$GET_TOKENS_RESPONSE" | grep -q "$TEST_FCM_TOKEN"; then
  print_result 0 "Get user tokens"
else
  print_result 1 "Get user tokens"
  echo "Response: $GET_TOKENS_RESPONSE"
fi

echo ""
echo "📝 Step 4: Send push notification..."
SEND_RESPONSE=$(api_call POST "/send" \
  "{\"userId\":\"test-user-id\",\"title\":\"Test Notification\",\"body\":\"This is a test notification from FCM\",\"data\":{\"type\":\"test\"}}" \
  "$JWT_TOKEN")

if echo "$SEND_RESPONSE" | grep -q "success.*true"; then
  print_result 0 "Send push notification"
else
  print_result 1 "Send push notification"
  echo "Response: $SEND_RESPONSE"
fi

echo ""
echo "📝 Step 5: Get notifications list..."
LIST_RESPONSE=$(api_call GET "" "" "$JWT_TOKEN")

if echo "$LIST_RESPONSE" | grep -q "success.*true"; then
  print_result 0 "Get notifications list"
else
  print_result 1 "Get notifications list"
  echo "Response: $LIST_RESPONSE"
fi

echo ""
echo "📝 Step 6: Topic subscription..."
SUBSCRIBE_RESPONSE=$(api_call POST "/topic/subscribe" \
  "{\"tokens\":[\"$TEST_FCM_TOKEN\"],\"topic\":\"test-group-123\"}" \
  "$JWT_TOKEN")

if echo "$SUBSCRIBE_RESPONSE" | grep -q "success.*true"; then
  print_result 0 "Subscribe to topic"
else
  print_result 1 "Subscribe to topic"
  echo "Response: $SUBSCRIBE_RESPONSE"
fi

echo ""
echo "📝 Step 7: Send topic notification..."
TOPIC_SEND_RESPONSE=$(api_call POST "/topic/send" \
  "{\"topic\":\"test-group-123\",\"title\":\"Group Announcement\",\"body\":\"This is a test group announcement\",\"data\":{\"type\":\"announcement\"}}" \
  "$JWT_TOKEN")

if echo "$TOPIC_SEND_RESPONSE" | grep -q "success.*true"; then
  print_result 0 "Send topic notification"
else
  print_result 1 "Send topic notification"
  echo "Response: $TOPIC_SEND_RESPONSE"
fi

echo ""
echo "📝 Step 8: Unsubscribe from topic..."
UNSUBSCRIBE_RESPONSE=$(api_call POST "/topic/unsubscribe" \
  "{\"tokens\":[\"$TEST_FCM_TOKEN\"],\"topic\":\"test-group-123\"}" \
  "$JWT_TOKEN")

if echo "$UNSUBSCRIBE_RESPONSE" | grep -q "success.*true"; then
  print_result 0 "Unsubscribe from topic"
else
  print_result 1 "Unsubscribe from topic"
  echo "Response: $UNSUBSCRIBE_RESPONSE"
fi

echo ""
echo "📝 Step 9: Remove FCM token..."
REMOVE_RESPONSE=$(api_call DELETE "/token/$TEST_FCM_TOKEN" "" "$JWT_TOKEN")

if echo "$REMOVE_RESPONSE" | grep -q "success.*true"; then
  print_result 0 "Remove FCM token"
else
  print_result 1 "Remove FCM token"
  echo "Response: $REMOVE_RESPONSE"
fi

echo ""
echo "======================================"
echo "📊 Test Results:"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo "======================================"

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}❌ Some tests failed!${NC}"
  exit 1
fi
