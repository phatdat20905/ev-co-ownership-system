#!/bin/bash

# NiFi Setup Script for EV Co-ownership System
# This script helps download JDBC drivers and setup initial NiFi configuration

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DRIVERS_DIR="$SCRIPT_DIR/drivers"
TEMPLATES_DIR="$SCRIPT_DIR/templates"

echo "=========================================="
echo "NiFi Setup for EV Co-ownership System"
echo "=========================================="

# Create directories if they don't exist
mkdir -p "$DRIVERS_DIR"
mkdir -p "$TEMPLATES_DIR"

# Download PostgreSQL JDBC Driver
echo ""
echo "📥 Downloading PostgreSQL JDBC Driver..."
POSTGRES_VERSION="42.7.1"
POSTGRES_JAR="postgresql-${POSTGRES_VERSION}.jar"

if [ ! -f "$DRIVERS_DIR/$POSTGRES_JAR" ]; then
    curl -L "https://jdbc.postgresql.org/download/${POSTGRES_JAR}" \
         -o "$DRIVERS_DIR/$POSTGRES_JAR"
    echo "✅ PostgreSQL JDBC driver downloaded: $POSTGRES_JAR"
else
    echo "✅ PostgreSQL JDBC driver already exists: $POSTGRES_JAR"
fi

# Download MongoDB Java Driver
echo ""
echo "📥 Downloading MongoDB Java Driver..."
MONGO_VERSION="4.11.1"
MONGO_JAR="mongodb-driver-sync-${MONGO_VERSION}.jar"

if [ ! -f "$DRIVERS_DIR/$MONGO_JAR" ]; then
    curl -L "https://repo1.maven.org/maven2/org/mongodb/mongodb-driver-sync/${MONGO_VERSION}/${MONGO_JAR}" \
         -o "$DRIVERS_DIR/$MONGO_JAR"
    echo "✅ MongoDB driver downloaded: $MONGO_JAR"
else
    echo "✅ MongoDB driver already exists: $MONGO_JAR"
fi

# Download MongoDB BSON library (required dependency)
echo ""
echo "📥 Downloading MongoDB BSON library..."
BSON_VERSION="4.11.1"
BSON_JAR="bson-${BSON_VERSION}.jar"

if [ ! -f "$DRIVERS_DIR/$BSON_JAR" ]; then
    curl -L "https://repo1.maven.org/maven2/org/mongodb/bson/${BSON_VERSION}/${BSON_JAR}" \
         -o "$DRIVERS_DIR/$BSON_JAR"
    echo "✅ BSON library downloaded: $BSON_JAR"
else
    echo "✅ BSON library already exists: $BSON_JAR"
fi

# Download MongoDB Core library
echo ""
echo "📥 Downloading MongoDB Core library..."
CORE_VERSION="4.11.1"
CORE_JAR="mongodb-driver-core-${CORE_VERSION}.jar"

if [ ! -f "$DRIVERS_DIR/$CORE_JAR" ]; then
    curl -L "https://repo1.maven.org/maven2/org/mongodb/mongodb-driver-core/${CORE_VERSION}/${CORE_JAR}" \
         -o "$DRIVERS_DIR/$CORE_JAR"
    echo "✅ MongoDB Core library downloaded: $CORE_JAR"
else
    echo "✅ MongoDB Core library already exists: $CORE_JAR"
fi

echo ""
echo "=========================================="
echo "✅ NiFi Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Start NiFi: docker-compose up -d nifi"
echo "2. Wait for NiFi to start (~2 minutes)"
echo "3. Access NiFi UI: http://localhost:8080/nifi"
echo "4. Login with:"
echo "   Username: admin"
echo "   Password: nifiAdminPassword123"
echo "5. Import templates from: $TEMPLATES_DIR"
echo ""
echo "Installed drivers:"
ls -lh "$DRIVERS_DIR"
echo ""
