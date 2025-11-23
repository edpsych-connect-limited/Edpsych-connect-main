#!/bin/bash

# Login and get token
echo "Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "teacher@demo.com", "password": "Test123!"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Login failed"
  echo $LOGIN_RESPONSE
  exit 1
fi

echo "Login successful. Token: ${TOKEN:0:10}..."

# Get students
echo "Fetching students..."
STUDENTS_RESPONSE=$(curl -s -X GET http://localhost:3000/api/students \
  -H "Authorization: Bearer $TOKEN")

echo "Students response length: ${#STUDENTS_RESPONSE}"
# echo $STUDENTS_RESPONSE

# Extract first student ID
STUDENT_ID=$(echo $STUDENTS_RESPONSE | grep -o '"id":[0-9]*' | head -n 1 | cut -d':' -f2)

if [ -z "$STUDENT_ID" ]; then
  echo "No students found in response"
  # echo $STUDENTS_RESPONSE
  
  # Try to find Amara Singh by name if list is empty or different format
  # Or just try ID 1, 2, 3...
  echo "Trying ID 56 (Amara Singh)..."
  STUDENT_ID=56
fi

echo "Using student ID: $STUDENT_ID"

# Get student profile
echo "Fetching profile for student $STUDENT_ID..."
PROFILE_RESPONSE=$(curl -s -X GET http://localhost:3000/api/students/$STUDENT_ID/profile \
  -H "Authorization: Bearer $TOKEN")

echo $PROFILE_RESPONSE > profile_response.json
echo "Profile response saved to profile_response.json"

# Check if new fields are present
if grep -q "todayLessons" profile_response.json; then
  echo "SUCCESS: todayLessons field found in response"
else
  echo "FAILURE: todayLessons field NOT found in response"
  cat profile_response.json
fi

if grep -q "mappedStrengths" profile_response.json; then
  echo "SUCCESS: mappedStrengths field found in response"
else
  echo "FAILURE: mappedStrengths field NOT found in response"
fi
