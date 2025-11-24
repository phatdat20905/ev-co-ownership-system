@echo off
REM Test FCM Notification System (Windows)
REM Usage: test-notifications.bat

echo Testing FCM Notification System...
echo ======================================
echo.

REM Configuration
set API_URL=http://localhost:3000
set NOTIFICATION_URL=%API_URL%/notifications

echo Please provide a valid JWT token for testing:
set /p JWT_TOKEN=Token: 

if "%JWT_TOKEN%"=="" (
  echo Error: JWT token is required
  exit /b 1
)

echo.
echo Step 1: Register FCM device token...
set TEST_FCM_TOKEN=test-fcm-token-%RANDOM%

curl -X POST "%NOTIFICATION_URL%/register-token" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer %JWT_TOKEN%" ^
  -d "{\"userId\":\"test-user-id\",\"token\":\"%TEST_FCM_TOKEN%\",\"platform\":\"web\"}"

echo.
echo.
echo Step 2: Get user tokens...
curl -X GET "%NOTIFICATION_URL%/tokens/test-user-id" ^
  -H "Authorization: Bearer %JWT_TOKEN%"

echo.
echo.
echo Step 3: Send push notification...
curl -X POST "%NOTIFICATION_URL%/send" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer %JWT_TOKEN%" ^
  -d "{\"userId\":\"test-user-id\",\"title\":\"Test Notification\",\"body\":\"This is a test notification from FCM\",\"data\":{\"type\":\"test\"}}"

echo.
echo.
echo Step 4: Subscribe to topic...
curl -X POST "%NOTIFICATION_URL%/topic/subscribe" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer %JWT_TOKEN%" ^
  -d "{\"tokens\":[\"%TEST_FCM_TOKEN%\"],\"topic\":\"test-group-123\"}"

echo.
echo.
echo Step 5: Send topic notification...
curl -X POST "%NOTIFICATION_URL%/topic/send" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer %JWT_TOKEN%" ^
  -d "{\"topic\":\"test-group-123\",\"title\":\"Group Announcement\",\"body\":\"Test group announcement\",\"data\":{\"type\":\"announcement\"}}"

echo.
echo.
echo Step 6: Remove FCM token...
curl -X DELETE "%NOTIFICATION_URL%/token/%TEST_FCM_TOKEN%" ^
  -H "Authorization: Bearer %JWT_TOKEN%"

echo.
echo.
echo ======================================
echo Tests completed!
echo ======================================

pause
