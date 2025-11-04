#!/bin/bash

# ============================================================================
# API Health Check Script - Orchestration Layer
# Tests all critical API endpoints for availability and correct responses
# ============================================================================

echo "🔍 Testing Orchestration Layer API Endpoints..."
echo "================================================"
echo ""

BASE_URL="${BASE_URL:-http://localhost:3000}"
PASS_COUNT=0
FAIL_COUNT=0

# Helper function to test endpoint
test_endpoint() {
  local name="$1"
  local method="$2"
  local url="$3"
  local expected_status="$4"
  local data="$5"

  echo -n "Testing $name... "

  if [ "$method" = "GET" ]; then
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$url")
  else
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
      -X "$method" "$BASE_URL$url" \
      -H "Content-Type: application/json" \
      -d "$data")
  fi

  if [ "$RESPONSE" -eq "$expected_status" ]; then
    echo "✅ PASS (HTTP $RESPONSE)"
    ((PASS_COUNT++))
  else
    echo "❌ FAIL (Expected $expected_status, got $RESPONSE)"
    ((FAIL_COUNT++))
  fi
}

# ============================================================================
# Test Suite
# ============================================================================

echo "📊 Student Profile APIs"
echo "------------------------"
test_endpoint "Student Profile (valid ID)" "GET" "/api/students/1/profile" 200
test_endpoint "Student Profile (invalid ID)" "GET" "/api/students/99999/profile" 404

echo ""
echo "📊 Class Dashboard APIs"
echo "------------------------"
test_endpoint "Class Dashboard (valid)" "GET" "/api/class/dashboard?classId=1" 200
test_endpoint "Class Dashboard (invalid)" "GET" "/api/class/dashboard?classId=invalid" 404

echo ""
echo "📊 Lesson APIs"
echo "------------------------"
test_endpoint "Student Lessons" "GET" "/api/students/1/lessons" 200

# Lesson differentiation (POST request)
LESSON_DATA='{
  "lessonPlan": {
    "id": "lesson_1",
    "title": "Test Lesson",
    "subject": "Mathematics",
    "year_group": "Year 3"
  },
  "classId": "1"
}'
test_endpoint "Lesson Differentiation" "POST" "/api/lessons/differentiate" 200 "$LESSON_DATA"

# Lesson assignment (POST request)
ASSIGNMENT_DATA='{
  "lessonPlanId": "lesson_1",
  "classId": "1",
  "assignments": [
    {"studentId": 1, "difficulty": "on_level", "due_date": "2025-11-10T00:00:00Z"}
  ]
}'
test_endpoint "Lesson Assignment" "POST" "/api/lessons/assign" 200 "$ASSIGNMENT_DATA"

echo ""
echo "📊 Voice Command APIs"
echo "------------------------"
VOICE_DATA='{"query": "How is Amara doing?", "classId": "1", "contextType": "dashboard"}'
test_endpoint "Voice Command (query)" "POST" "/api/voice/command" 200 "$VOICE_DATA"

VOICE_ACTION_DATA='{"action": "flag_intervention", "studentId": 1, "classId": "1"}'
test_endpoint "Voice Quick Action" "POST" "/api/voice/quick-actions" 200 "$VOICE_ACTION_DATA"

echo ""
echo "📊 Parent Portal APIs (Security Check)"
echo "------------------------"
# These should fail without authentication
test_endpoint "Parent Portal (no auth)" "GET" "/api/parent/portal/1" 401
test_endpoint "Parent Messages (no auth)" "GET" "/api/parent/messages?childId=1" 401

echo ""
echo "📊 Multi-Agency APIs"
echo "------------------------"
test_endpoint "Multi-Agency View" "GET" "/api/multi-agency/view?userId=1" 200
test_endpoint "EP Dashboard" "GET" "/api/multi-agency/ep-dashboard?epId=2" 200

echo ""
echo "📊 Automated Actions APIs"
echo "------------------------"
test_endpoint "Pending Actions" "GET" "/api/class/actions/pending" 200
test_endpoint "Approve Action" "POST" "/api/class/actions/action_123/approve" 200
REJECT_DATA='{"reason": "Not appropriate at this time"}'
test_endpoint "Reject Action" "POST" "/api/class/actions/action_124/reject" 200 "$REJECT_DATA"

# ============================================================================
# Summary
# ============================================================================

echo ""
echo "================================================"
echo "📊 Test Results Summary:"
echo "================================================"
echo "   ✅ Passed: $PASS_COUNT"
echo "   ❌ Failed: $FAIL_COUNT"
echo "   📈 Total:  $((PASS_COUNT + FAIL_COUNT))"
echo "   🎯 Success Rate: $(awk "BEGIN {printf \"%.1f%%\", ($PASS_COUNT/($PASS_COUNT+$FAIL_COUNT))*100}")"
echo "================================================"

if [ "$FAIL_COUNT" -eq 0 ]; then
  echo ""
  echo "🎉 All tests passed! API is healthy."
  echo ""
  exit 0
else
  echo ""
  echo "⚠️  $FAIL_COUNT test(s) failed. Review logs above."
  echo ""
  exit 1
fi
