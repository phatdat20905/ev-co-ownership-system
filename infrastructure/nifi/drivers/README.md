# NiFi JDBC Drivers

This directory contains JDBC drivers required for NiFi to connect to various databases.

## Required Drivers

### PostgreSQL JDBC Driver

**Version**: 42.7.1  
**File**: `postgresql-42.7.1.jar`  
**Download**: https://jdbc.postgresql.org/download/postgresql-42.7.1.jar

Used for connecting to all service databases (auth, user, booking, cost, vehicle, contract, admin, notification).

### MongoDB Java Driver

**Version**: 4.11.1  
**Files**:
- `mongodb-driver-sync-4.11.1.jar`
- `mongodb-driver-core-4.11.1.jar`
- `bson-4.11.1.jar`

**Download**: Available via Maven Central

Used for connecting to MongoDB for analytics storage.

## Installation

### Automatic Installation (Recommended)

#### On Linux/Mac:
```bash
cd infrastructure/nifi
chmod +x setup.sh
./setup.sh
```

#### On Windows (PowerShell):
```powershell
cd infrastructure/nifi
.\setup.ps1
```

### Manual Installation

1. Create this directory if it doesn't exist:
```bash
mkdir -p infrastructure/nifi/drivers
```

2. Download PostgreSQL JDBC Driver:
```bash
curl -L https://jdbc.postgresql.org/download/postgresql-42.7.1.jar \
     -o infrastructure/nifi/drivers/postgresql-42.7.1.jar
```

3. Download MongoDB drivers:
```bash
# MongoDB Driver Sync
curl -L https://repo1.maven.org/maven2/org/mongodb/mongodb-driver-sync/4.11.1/mongodb-driver-sync-4.11.1.jar \
     -o infrastructure/nifi/drivers/mongodb-driver-sync-4.11.1.jar

# MongoDB Driver Core
curl -L https://repo1.maven.org/maven2/org/mongodb/mongodb-driver-core/4.11.1/mongodb-driver-core-4.11.1.jar \
     -o infrastructure/nifi/drivers/mongodb-driver-core-4.11.1.jar

# BSON
curl -L https://repo1.maven.org/maven2/org/mongodb/bson/4.11.1/bson-4.11.1.jar \
     -o infrastructure/nifi/drivers/bson-4.11.1.jar
```

## Verification

After installation, verify the drivers are present:

```bash
ls -la infrastructure/nifi/drivers/
```

You should see:
```
postgresql-42.7.1.jar
mongodb-driver-sync-4.11.1.jar
mongodb-driver-core-4.11.1.jar
bson-4.11.1.jar
```

## Usage in NiFi

These drivers are automatically mounted into the NiFi container at:
```
/opt/nifi/nifi-current/lib/drivers/
```

When configuring database connection pools in NiFi:

### PostgreSQL Connection
```
Database Connection URL: jdbc:postgresql://postgres-auth:5432/auth_db
Database Driver Class Name: org.postgresql.Driver
Database Driver Location: /opt/nifi/nifi-current/lib/drivers/postgresql-42.7.1.jar
Database User: postgres
Password: postgres123
```

### MongoDB Connection
Use the PutMongo processor with:
```
Mongo URI: mongodb://admin:admin123@mongodb:27017
```

## Adding Custom Drivers

To add additional JDBC drivers:

1. Download the JAR file
2. Place it in this directory
3. Restart NiFi container:
```bash
docker-compose restart nifi
```

4. Configure the processor with the driver location:
```
/opt/nifi/nifi-current/lib/drivers/your-driver.jar
```

## Common Issues

### Driver Not Found
- Verify the JAR file exists in the drivers directory
- Check file permissions (should be readable)
- Restart NiFi after adding new drivers

### Class Not Found
- Ensure the driver class name is correct
- Verify the driver JAR contains the specified class
- Check NiFi logs for detailed error messages

### Connection Failed
- Test database connectivity from NiFi container:
```bash
docker exec -it ev_nifi bash
apt-get update && apt-get install -y postgresql-client
psql -h postgres-auth -U postgres -d auth_db
```

## Version Updates

To update drivers:

1. Download the new version
2. Replace the old JAR file
3. Update the file name in NiFi processor configurations
4. Restart NiFi

## Security Notes

- Drivers in this directory are shared with the NiFi container as read-only
- Always download drivers from official sources
- Verify checksums when possible
- Keep drivers updated for security patches

## References

- PostgreSQL JDBC: https://jdbc.postgresql.org/
- MongoDB Java Driver: https://mongodb.github.io/mongo-java-driver/
- NiFi Documentation: https://nifi.apache.org/docs/nifi-docs/html/administration-guide.html#controller-services
