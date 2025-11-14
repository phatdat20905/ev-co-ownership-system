@echo off
REM 🔄 RESET ALL SEED DATA (Windows)
REM Undo tất cả seeds và chạy lại từ đầu

setlocal EnableDelayedExpansion

echo ======================================
echo 🔄 RESET SEED DATA
echo ======================================
echo.

set BACKEND_DIR=%~dp0

echo ⚠️  WARNING: This will DELETE all seed data!
echo    This operation cannot be undone.
echo.
set /p confirm="Are you sure you want to continue? (yes/no): "

if /i not "%confirm%"=="yes" (
    echo ❌ Reset cancelled.
    exit /b 0
)

echo.
echo Undoing all seeds...
echo.

REM Undo in reverse order
call :undo_seeds "Admin Service" "%BACKEND_DIR%admin-service"
call :undo_seeds "Notification Service" "%BACKEND_DIR%notification-service"
call :undo_seeds "Contract Service" "%BACKEND_DIR%contract-service"
call :undo_seeds "Cost Service" "%BACKEND_DIR%cost-service"
call :undo_seeds "Booking Service" "%BACKEND_DIR%booking-service"
call :undo_seeds "Vehicle Service" "%BACKEND_DIR%vehicle-service"
call :undo_seeds "User Service" "%BACKEND_DIR%user-service"
call :undo_seeds "Auth Service" "%BACKEND_DIR%auth-service"

echo.
echo ✅ All seeds have been reset!
echo.

set /p reseed="Do you want to re-seed now? (yes/no): "

if /i "%reseed%"=="yes" (
    echo.
    echo Re-seeding all services...
    call seed-all.bat
) else (
    echo.
    echo To re-seed, run: seed-all.bat
)

goto :eof

:undo_seeds
set service_name=%~1
set service_path=%~2

echo 🔄 Undoing %service_name% seeds...

if not exist "%service_path%" (
    echo ⚠️  Service directory not found, skipping
    goto :undo_success
)

cd /d "%service_path%"

if not exist "src\seeders" (
    echo ⚠️  No seeders directory found, skipping
    goto :undo_success
)

call npx sequelize-cli db:seed:undo:all

:undo_success
echo ✅ %service_name% seeds undone
cd /d "%BACKEND_DIR%"
echo.
goto :eof
