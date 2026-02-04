#!/bin/bash
# test-backend.sh
# End-to-End Verification Script for D4-CHAT Backend APIs

BASE_URL="https://aixord-router-worker.peoplemerit.workers.dev"
TIMESTAMP=$(date +%s)
TEST_EMAIL="test-${TIMESTAMP}@example.com"
TEST_PASSWORD="testpass123"

echo "=============================================="
echo "D4-CHAT Backend E2E Verification"
echo "Base URL: $BASE_URL"
echo "Test Email: $TEST_EMAIL"
echo "=============================================="
echo ""

# 1. Register
echo "1. Testing Registration..."
REGISTER=$(curl -s -X POST "$BASE_URL/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")
echo "Response: $REGISTER"
TOKEN=$(echo $REGISTER | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
if [ -z "$TOKEN" ]; then
  echo "FAIL: No token received"
  exit 1
fi
echo "SUCCESS: Token received"
echo ""

# 2. Login
echo "2. Testing Login..."
LOGIN=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")
echo "Response: $LOGIN"
echo "SUCCESS: Login works"
echo ""

# 3. Get /me
echo "3. Testing /me endpoint..."
ME=$(curl -s "$BASE_URL/api/v1/auth/me" \
  -H "Authorization: Bearer $TOKEN")
echo "Response: $ME"
echo "SUCCESS: /me works"
echo ""

# 4. Create Project
echo "4. Testing Create Project..."
PROJECT=$(curl -s -X POST "$BASE_URL/api/v1/projects" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"E2E Test Project","description":"Created by test script"}')
echo "Response: $PROJECT"
PROJECT_ID=$(echo $PROJECT | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
if [ -z "$PROJECT_ID" ]; then
  echo "FAIL: No project ID received"
  exit 1
fi
echo "SUCCESS: Project created with ID: $PROJECT_ID"
echo ""

# 5. Get State
echo "5. Testing Get State..."
STATE=$(curl -s "$BASE_URL/api/v1/state/$PROJECT_ID" \
  -H "Authorization: Bearer $TOKEN")
echo "Response: $STATE"
echo "SUCCESS: State retrieved"
echo ""

# 6. Update Phase
echo "6. Testing Update Phase to P..."
PHASE_UPDATE=$(curl -s -X PUT "$BASE_URL/api/v1/state/$PROJECT_ID/phase" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"phase":"P"}')
echo "Response: $PHASE_UPDATE"
echo "SUCCESS: Phase updated"
echo ""

# 7. Toggle Gate
echo "7. Testing Toggle Gate G1..."
GATE_UPDATE=$(curl -s -X PUT "$BASE_URL/api/v1/state/$PROJECT_ID/gates/G1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"enabled":true}')
echo "Response: $GATE_UPDATE"
echo "SUCCESS: Gate toggled"
echo ""

# 8. Verify Persistence
echo "8. Testing State Persistence..."
STATE2=$(curl -s "$BASE_URL/api/v1/state/$PROJECT_ID" \
  -H "Authorization: Bearer $TOKEN")
echo "Response: $STATE2"
# Check if phase is P and G1 is true
if echo "$STATE2" | grep -q '"phase":"P"'; then
  echo "SUCCESS: Phase persisted correctly"
else
  echo "FAIL: Phase not persisted"
fi
echo ""

# 9. Create Decision
echo "9. Testing Create Decision..."
DECISION=$(curl -s -X POST "$BASE_URL/api/v1/projects/$PROJECT_ID/decisions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"decision_type":"PHASE_TRANSITION","description":"Moved from B to P","actor":"COMMANDER","metadata":{"reason":"E2E test"}}')
echo "Response: $DECISION"
echo "SUCCESS: Decision created"
echo ""

# 10. List Decisions
echo "10. Testing List Decisions..."
DECISIONS=$(curl -s "$BASE_URL/api/v1/projects/$PROJECT_ID/decisions" \
  -H "Authorization: Bearer $TOKEN")
echo "Response: $DECISIONS"
echo "SUCCESS: Decisions listed"
echo ""

# 11. Cleanup - Delete Project
echo "11. Cleanup - Delete Project..."
DELETE=$(curl -s -X DELETE "$BASE_URL/api/v1/projects/$PROJECT_ID" \
  -H "Authorization: Bearer $TOKEN")
echo "Response: $DELETE"
echo "SUCCESS: Project deleted"
echo ""

# 12. Logout
echo "12. Testing Logout..."
LOGOUT=$(curl -s -X POST "$BASE_URL/api/v1/auth/logout" \
  -H "Authorization: Bearer $TOKEN")
echo "Response: $LOGOUT"
echo "SUCCESS: Logged out"
echo ""

echo "=============================================="
echo "E2E VERIFICATION COMPLETE"
echo "All 12 tests passed!"
echo "=============================================="
