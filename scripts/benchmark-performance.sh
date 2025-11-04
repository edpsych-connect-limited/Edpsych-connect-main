#!/bin/bash

# ============================================================================
# Performance Benchmark Script - Orchestration Layer
# Measures response times for critical API endpoints
# ============================================================================

echo "⚡ Benchmarking Orchestration Layer Performance..."
echo "================================================"
echo ""

BASE_URL="${BASE_URL:-http://localhost:3000}"

# ANSI color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Helper function to check if time is within target
check_performance() {
  local time="$1"
  local target="$2"
  local warning="$3"

  # Convert to milliseconds for comparison
  time_ms=$(echo "$time * 1000" | bc)
  target_ms=$(echo "$target * 1000" | bc)
  warning_ms=$(echo "$warning * 1000" | bc)

  if (( $(echo "$time_ms < $target_ms" | bc -l) )); then
    echo -e " ${GREEN}✅ Excellent${NC} (target: <${target}s)"
  elif (( $(echo "$time_ms < $warning_ms" | bc -l) )); then
    echo -e " ${YELLOW}⚠️  Acceptable${NC} (target: <${target}s)"
  else
    echo -e " ${RED}❌ Needs Optimization${NC} (target: <${target}s)"
  fi
}

# ============================================================================
# Benchmark Suite
# ============================================================================

echo "📊 API Endpoint Benchmarks"
echo "------------------------"

# Test 1: Student Profile API (target: < 200ms)
echo -n "Student Profile API: "
TIME=$(curl -s -o /dev/null -w "%{time_total}" "$BASE_URL/api/students/1/profile")
echo -n "${TIME}s"
check_performance "$TIME" 0.2 0.5

# Test 2: Class Dashboard API (target: < 500ms for 28 students)
echo -n "Class Dashboard API (28 students): "
TIME=$(curl -s -o /dev/null -w "%{time_total}" "$BASE_URL/api/class/dashboard?classId=1")
echo -n "${TIME}s"
check_performance "$TIME" 0.5 1.0

# Test 3: Lesson Differentiation API (target: < 3s for 28 students)
echo -n "Lesson Differentiation API (28 students): "
TIME=$(curl -s -o /dev/null -w "%{time_total}" \
  -X POST "$BASE_URL/api/lessons/differentiate" \
  -H "Content-Type: application/json" \
  -d '{
    "lessonPlan": {
      "id": "lesson_1",
      "title": "Fractions - Halves and Quarters",
      "subject": "Mathematics",
      "year_group": "Year 3"
    },
    "classId": "1"
  }')
echo -n "${TIME}s"
check_performance "$TIME" 3.0 5.0

# Test 4: Lesson Assignment API (target: < 1s for 28 students)
echo -n "Lesson Assignment API (28 students): "
TIME=$(curl -s -o /dev/null -w "%{time_total}" \
  -X POST "$BASE_URL/api/lessons/assign" \
  -H "Content-Type: application/json" \
  -d '{
    "lessonPlanId": "lesson_1",
    "classId": "1",
    "assignments": [
      {"studentId": 1, "difficulty": "on_level", "due_date": "2025-11-10T00:00:00Z"},
      {"studentId": 2, "difficulty": "extension", "due_date": "2025-11-10T00:00:00Z"}
    ]
  }')
echo -n "${TIME}s"
check_performance "$TIME" 1.0 2.0

# Test 5: Voice Command API - Simple Query (target: < 2s)
echo -n "Voice Command API (simple query): "
TIME=$(curl -s -o /dev/null -w "%{time_total}" \
  -X POST "$BASE_URL/api/voice/command" \
  -H "Content-Type: application/json" \
  -d '{"query": "How is Amara doing?", "classId": "1", "contextType": "dashboard"}')
echo -n "${TIME}s"
check_performance "$TIME" 2.0 4.0

# Test 6: Voice Command API - Complex Query (target: < 4s)
echo -n "Voice Command API (complex query): "
TIME=$(curl -s -o /dev/null -w "%{time_total}" \
  -X POST "$BASE_URL/api/voice/command" \
  -H "Content-Type: application/json" \
  -d '{"query": "Show me all students who need extra support in mathematics and have declining engagement scores", "classId": "1"}')
echo -n "${TIME}s"
check_performance "$TIME" 4.0 6.0

# Test 7: Parent Portal API (target: < 300ms)
echo -n "Parent Portal API: "
TIME=$(curl -s -o /dev/null -w "%{time_total}" "$BASE_URL/api/parent/portal/1")
echo -n "${TIME}s"
check_performance "$TIME" 0.3 0.6

# Test 8: Multi-Agency View API (target: < 600ms)
echo -n "Multi-Agency View API: "
TIME=$(curl -s -o /dev/null -w "%{time_total}" "$BASE_URL/api/multi-agency/view?userId=1")
echo -n "${TIME}s"
check_performance "$TIME" 0.6 1.0

# Test 9: Pending Actions API (target: < 400ms)
echo -n "Pending Actions API: "
TIME=$(curl -s -o /dev/null -w "%{time_total}" "$BASE_URL/api/class/actions/pending")
echo -n "${TIME}s"
check_performance "$TIME" 0.4 0.8

# Test 10: EP Dashboard API (target: < 800ms)
echo -n "EP Dashboard API: "
TIME=$(curl -s -o /dev/null -w "%{time_total}" "$BASE_URL/api/multi-agency/ep-dashboard?epId=2")
echo -n "${TIME}s"
check_performance "$TIME" 0.8 1.5

echo ""
echo "================================================"

# ============================================================================
# Cache Performance Test
# ============================================================================

echo ""
echo "📊 Cache Performance Test"
echo "------------------------"

# First request (cold cache)
echo -n "First request (cold cache): "
TIME1=$(curl -s -o /dev/null -w "%{time_total}" "$BASE_URL/api/students/1/profile")
echo "${TIME1}s"

# Second request (warm cache) - should be faster
echo -n "Second request (warm cache): "
TIME2=$(curl -s -o /dev/null -w "%{time_total}" "$BASE_URL/api/students/1/profile")
echo "${TIME2}s"

# Calculate improvement
IMPROVEMENT=$(echo "scale=1; (($TIME1 - $TIME2) / $TIME1) * 100" | bc)
echo "Cache improvement: ${IMPROVEMENT}%"

if (( $(echo "$IMPROVEMENT > 20" | bc -l) )); then
  echo -e "${GREEN}✅ Cache is effective${NC} (>20% improvement)"
elif (( $(echo "$IMPROVEMENT > 0" | bc -l) )); then
  echo -e "${YELLOW}⚠️  Cache working but could be better${NC} (>0% improvement)"
else
  echo -e "${RED}❌ Cache may not be working${NC} (no improvement)"
fi

echo ""
echo "================================================"

# ============================================================================
# Load Test (Concurrent Requests)
# ============================================================================

echo ""
echo "📊 Load Test (10 Concurrent Requests)"
echo "------------------------"

echo "Running 10 concurrent requests to Class Dashboard..."

# Create temporary file for results
TEMP_FILE=$(mktemp)

# Run 10 concurrent requests
for i in {1..10}; do
  (curl -s -o /dev/null -w "%{time_total}\n" "$BASE_URL/api/class/dashboard?classId=1") >> "$TEMP_FILE" &
done

# Wait for all background jobs to complete
wait

# Calculate statistics
AVG_TIME=$(awk '{ total += $1; count++ } END { print total/count }' "$TEMP_FILE")
MAX_TIME=$(awk 'BEGIN { max = 0 } { if ($1 > max) max = $1 } END { print max }' "$TEMP_FILE")
MIN_TIME=$(awk 'BEGIN { min = 999 } { if ($1 < min) min = $1 } END { print min }' "$TEMP_FILE")

echo "Average response time: ${AVG_TIME}s"
echo "Minimum response time: ${MIN_TIME}s"
echo "Maximum response time: ${MAX_TIME}s"

# Check if performance is acceptable under load
if (( $(echo "$AVG_TIME < 2.0" | bc -l) )); then
  echo -e "${GREEN}✅ Performance good under load${NC}"
elif (( $(echo "$AVG_TIME < 5.0" | bc -l) )); then
  echo -e "${YELLOW}⚠️  Performance acceptable under load${NC}"
else
  echo -e "${RED}❌ Performance degraded under load${NC}"
fi

# Cleanup
rm "$TEMP_FILE"

echo ""
echo "================================================"
echo "✅ Benchmark complete"
echo ""
echo "💡 Tips for optimization:"
echo "  - Ensure React Query caching is enabled (30s stale time)"
echo "  - Use database indexes on foreign keys"
echo "  - Consider Redis for session storage"
echo "  - Optimize Prisma queries (use 'include' wisely)"
echo "  - Enable gzip compression in production"
echo "================================================"
