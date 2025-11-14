@echo off
REM 🌱 MASTER SEED SCRIPT - EV Co-ownership System (Windows)
REM Chạy tất cả seeders theo đúng thứ tự dependencies

setlocal EnableDelayedExpansion

echo ======================================
echo 🌱 EV CO-OWNERSHIP SYSTEM - SEED DATA
echo ======================================
echo.

set BACKEND_DIR=%~dp0
echo 📍 Backend directory: %BACKEND_DIR%
echo.

echo ⚠️  WARNING: This will insert seed data into all databases.
echo    Make sure you have run migrations first!
echo.
set /p confirm="Do you want to continue? (yes/no): "

if /i not "%confirm%"=="yes" (
    echo ❌ Seeding cancelled.
    exit /b 0
)

echo.
echo Starting seed process...
echo.

REM ===========================================
REM PHASE 1: Core Services
REM ===========================================
echo ================================================
echo PHASE 1: Core Services
echo ================================================

call :seed_service "Auth Service" "%BACKEND_DIR%auth-service"
call :seed_service "User Service" "%BACKEND_DIR%user-service"

REM ===========================================
REM PHASE 2: Vehicle & Booking
REM ===========================================
echo ================================================
echo PHASE 2: Vehicle ^& Booking Services
echo ================================================

call :seed_service "Vehicle Service" "%BACKEND_DIR%vehicle-service"
call :seed_service "Booking Service" "%BACKEND_DIR%booking-service"

REM ===========================================
REM PHASE 3: Financial Services
REM ===========================================
echo ================================================
echo PHASE 3: Financial Services
echo ================================================

call :seed_service "Cost Service" "%BACKEND_DIR%cost-service"
call :seed_service "Contract Service" "%BACKEND_DIR%contract-service"

REM ===========================================
REM PHASE 4: Supporting Services
REM ===========================================
echo ================================================
echo PHASE 4: Supporting Services
echo ================================================

call :seed_service "Notification Service" "%BACKEND_DIR%notification-service"
call :seed_service "Admin Service" "%BACKEND_DIR%admin-service"

echo.
echo ================================================
echo ✅ ALL SEEDS COMPLETED SUCCESSFULLY!
echo ================================================
echo.
echo 📊 Summary:
echo    - Auth Service: Users, KYC verifications
echo    - User Service: Profiles, Groups, Members, Votes, Fund transactions
echo    - Vehicle Service: Vehicles, Maintenance, Insurance, Charging
echo    - Booking Service: Bookings, Check-in/out logs
echo    - Cost Service: Costs, Splits, Payments, Wallets, Invoices
echo    - Contract Service: Templates, Contracts, Signatures
echo    - Notification Service: Templates, Notifications, Preferences
echo    - Admin Service: Staff, Disputes, System settings
echo.
echo 🔑 Test Credentials:
echo    Admin: admin@evcoownership.com / Password123!
echo    Staff: staff.nguyen@evcoownership.com / Password123!
echo    Co-owner: nguyen.van.a@gmail.com / Password123!
echo.
echo 🎉 Happy testing!

goto :eof

:seed_service
set service_name=%~1
set service_path=%~2

echo.
echo 📦 Seeding %service_name%...

if not exist "%service_path%" (
    echo ❌ Service directory not found: %service_path%
    exit /b 1
)

cd /d "%service_path%"

if not exist "src\seeders" (
    echo ⚠️  No seeders directory found, skipping
    goto :seed_success
)

call npx sequelize-cli db:seed:all

if errorlevel 1 (
    echo ❌ Failed to seed %service_name%
    exit /b 1
)

:seed_success
echo ✅ %service_name% seeded successfully
cd /d "%BACKEND_DIR%"
goto :eof
