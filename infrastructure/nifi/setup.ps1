# PowerShell Setup Script for NiFi
# This script helps download JDBC drivers and setup initial NiFi configuration

$ErrorActionPreference = "Stop"

$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$DRIVERS_DIR = Join-Path $SCRIPT_DIR "drivers"
$TEMPLATES_DIR = Join-Path $SCRIPT_DIR "templates"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "NiFi Setup for EV Co-ownership System" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Create directories if they don't exist
New-Item -ItemType Directory -Force -Path $DRIVERS_DIR | Out-Null
New-Item -ItemType Directory -Force -Path $TEMPLATES_DIR | Out-Null

# Download PostgreSQL JDBC Driver
Write-Host ""
Write-Host "📥 Downloading PostgreSQL JDBC Driver..." -ForegroundColor Yellow
$POSTGRES_VERSION = "42.7.1"
$POSTGRES_JAR = "postgresql-$POSTGRES_VERSION.jar"
$POSTGRES_PATH = Join-Path $DRIVERS_DIR $POSTGRES_JAR

if (-not (Test-Path $POSTGRES_PATH)) {
    $url = "https://jdbc.postgresql.org/download/$POSTGRES_JAR"
    Write-Host "Downloading from: $url"
    Invoke-WebRequest -Uri $url -OutFile $POSTGRES_PATH
    Write-Host "✅ PostgreSQL JDBC driver downloaded: $POSTGRES_JAR" -ForegroundColor Green
} else {
    Write-Host "✅ PostgreSQL JDBC driver already exists: $POSTGRES_JAR" -ForegroundColor Green
}

# Download MongoDB Java Driver
Write-Host ""
Write-Host "📥 Downloading MongoDB Java Driver..." -ForegroundColor Yellow
$MONGO_VERSION = "4.11.1"
$MONGO_JAR = "mongodb-driver-sync-$MONGO_VERSION.jar"
$MONGO_PATH = Join-Path $DRIVERS_DIR $MONGO_JAR

if (-not (Test-Path $MONGO_PATH)) {
    $url = "https://repo1.maven.org/maven2/org/mongodb/mongodb-driver-sync/$MONGO_VERSION/$MONGO_JAR"
    Write-Host "Downloading from: $url"
    Invoke-WebRequest -Uri $url -OutFile $MONGO_PATH
    Write-Host "✅ MongoDB driver downloaded: $MONGO_JAR" -ForegroundColor Green
} else {
    Write-Host "✅ MongoDB driver already exists: $MONGO_JAR" -ForegroundColor Green
}

# Download MongoDB BSON library
Write-Host ""
Write-Host "📥 Downloading MongoDB BSON library..." -ForegroundColor Yellow
$BSON_VERSION = "4.11.1"
$BSON_JAR = "bson-$BSON_VERSION.jar"
$BSON_PATH = Join-Path $DRIVERS_DIR $BSON_JAR

if (-not (Test-Path $BSON_PATH)) {
    $url = "https://repo1.maven.org/maven2/org/mongodb/bson/$BSON_VERSION/$BSON_JAR"
    Write-Host "Downloading from: $url"
    Invoke-WebRequest -Uri $url -OutFile $BSON_PATH
    Write-Host "✅ BSON library downloaded: $BSON_JAR" -ForegroundColor Green
} else {
    Write-Host "✅ BSON library already exists: $BSON_JAR" -ForegroundColor Green
}

# Download MongoDB Core library
Write-Host ""
Write-Host "📥 Downloading MongoDB Core library..." -ForegroundColor Yellow
$CORE_VERSION = "4.11.1"
$CORE_JAR = "mongodb-driver-core-$CORE_VERSION.jar"
$CORE_PATH = Join-Path $DRIVERS_DIR $CORE_JAR

if (-not (Test-Path $CORE_PATH)) {
    $url = "https://repo1.maven.org/maven2/org/mongodb/mongodb-driver-core/$CORE_VERSION/$CORE_JAR"
    Write-Host "Downloading from: $url"
    Invoke-WebRequest -Uri $url -OutFile $CORE_PATH
    Write-Host "✅ MongoDB Core library downloaded: $CORE_JAR" -ForegroundColor Green
} else {
    Write-Host "✅ MongoDB Core library already exists: $CORE_JAR" -ForegroundColor Green
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✅ NiFi Setup Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Start NiFi: docker-compose up -d nifi"
Write-Host "2. Wait for NiFi to start (~2 minutes)"
Write-Host "3. Access NiFi UI: http://localhost:8080/nifi"
Write-Host "4. Login with:"
Write-Host "   Username: admin"
Write-Host "   Password: nifiAdminPassword123"
Write-Host "5. Import templates from: $TEMPLATES_DIR"
Write-Host ""
Write-Host "Installed drivers:" -ForegroundColor Yellow
Get-ChildItem -Path $DRIVERS_DIR | Format-Table Name, Length, LastWriteTime
Write-Host ""
