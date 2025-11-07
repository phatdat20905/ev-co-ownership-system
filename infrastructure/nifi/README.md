# Apache NiFi Integration for EV Co-ownership System

## Overview

Apache NiFi provides data flow orchestration, ETL capabilities, and event stream processing for the EV Co-ownership system. It enables:

- **Cross-database ETL**: Sync and transform data between microservices
- **Event Stream Processing**: Process events from RabbitMQ in real-time
- **Analytics Aggregation**: Collect and aggregate data for reporting
- **Data Export/Import**: Scheduled data exports and external integrations
- **Monitoring & Alerting**: Track data flow health and performance

## Quick Start

### 1. Start NiFi

```bash
# Start NiFi along with infrastructure
docker-compose up -d nifi

# Wait for NiFi to be ready (takes ~2 minutes)
docker logs -f ev_nifi
```

### 2. Access NiFi UI

- **URL**: http://localhost:8080/nifi
- **Username**: admin
- **Password**: nifiAdminPassword123

### 3. Import Pre-built Templates

Navigate to the NiFi UI and import templates from `./templates/` directory:

1. Click the "Upload Template" icon (📤) in the toolbar
2. Select a template file (`.xml`)
3. Drag the "Template" icon from the toolbar onto the canvas
4. Select the imported template
5. Configure processors as needed

## Available Flow Templates

### 1. Event Stream Processing (`event-stream-processor.xml`)

**Purpose**: Consume events from RabbitMQ and process them in real-time

**Processors**:
- ConsumeAMQP: Pull events from RabbitMQ queues
- EvaluateJsonPath: Extract event data
- RouteOnAttribute: Route based on event type
- PutDatabaseRecord: Store processed events in MongoDB
- PublishAMQP: Publish transformed events back to RabbitMQ

**Use Cases**:
- Real-time booking conflict detection
- Cost split calculation triggers
- Notification dispatch orchestration
- AI recommendation event processing

### 2. Cross-Database Sync (`database-sync.xml`)

**Purpose**: Sync data between microservice databases for reporting and analytics

**Processors**:
- ExecuteSQLRecord: Extract data from service databases
- ConvertRecord: Transform data formats
- MergeRecord: Combine data from multiple sources
- PutDatabaseRecord: Load into analytics database (MongoDB)

**Use Cases**:
- User-booking-cost aggregation for dashboards
- Vehicle usage analytics
- Contract compliance reporting
- Financial reconciliation

### 3. Analytics Data Pipeline (`analytics-pipeline.xml`)

**Purpose**: Build aggregated analytics tables for admin dashboards

**Processors**:
- QueryDatabaseTable: Incremental data extraction
- JoltTransformJSON: Complex data transformations
- CalculateRecordStats: Statistical calculations
- PutMongo: Load into MongoDB analytics collections

**Use Cases**:
- Daily/weekly/monthly KPI calculations
- Revenue and cost tracking
- Vehicle utilization metrics
- User behavior analytics

### 4. Scheduled Reports (`scheduled-reports.xml`)

**Purpose**: Generate and export scheduled reports

**Processors**:
- GenerateTableFetch: Fetch data with scheduling
- ExecuteGroovyScript: Custom report logic
- MergeContent: Combine report sections
- PutFile: Export to filesystem
- PutEmail: Email reports to admins

**Use Cases**:
- Monthly financial reports
- Vehicle maintenance schedules
- Contract expiry notifications
- Audit log exports

### 5. Data Quality & Validation (`data-quality.xml`)

**Purpose**: Monitor data quality and detect anomalies

**Processors**:
- ValidateRecord: Schema validation
- DetectDuplicate: Deduplication
- MonitorActivity: Track data flow rates
- PutEmail: Alert on quality issues

**Use Cases**:
- Detect duplicate bookings
- Validate cost calculations
- Monitor missing data
- Alert on data anomalies

## Database Connections

NiFi is pre-configured to connect to all service databases:

| Service | JDBC URL | User | Password |
|---------|----------|------|----------|
| Auth | `jdbc:postgresql://postgres-auth:5432/auth_db` | postgres | postgres123 |
| User | `jdbc:postgresql://postgres-user:5432/user_db` | postgres | postgres123 |
| Booking | `jdbc:postgresql://postgres-booking:5432/booking_db` | postgres | postgres123 |
| Cost | `jdbc:postgresql://postgres-cost:5432/cost_db` | postgres | postgres123 |
| Vehicle | `jdbc:postgresql://postgres-vehicle:5432/vehicle_db` | postgres | postgres123 |
| Contract | `jdbc:postgresql://postgres-contract:5432/contract_db` | postgres | postgres123 |
| Admin | `jdbc:postgresql://postgres-admin:5432/admin_db` | postgres | postgres123 |
| Notification | `jdbc:postgresql://postgres-notification:5432/notification_db` | postgres | postgres123 |
| MongoDB | `mongodb://admin:admin123@mongodb:27017` | admin | admin123 |

## RabbitMQ Integration

**Connection Details**:
- Host: `rabbitmq`
- Port: `5672`
- Username: `admin`
- Password: `admin123`

**Key Queues to Monitor**:
- `booking.created`
- `booking.updated`
- `cost.created`
- `payment.completed`
- `notification.sent`
- `ai.recommendation.generated`

## Redis Integration

**Connection Details**:
- Host: `redis`
- Port: `6379`
- Password: `redis123`

**Use Cases**:
- Cache frequently accessed data
- Store intermediate processing results
- Rate limiting for external API calls

## Best Practices

### 1. Database Connections

Create DBCPConnectionPool controller services for each database:

```
Service Name: PostgresAuthPool
Database Connection URL: ${POSTGRES_AUTH_URL}
Database Driver Class Name: org.postgresql.Driver
Database Driver Location(s): /opt/nifi/nifi-current/lib/drivers/postgresql-42.7.1.jar
Database User: ${POSTGRES_USER}
Password: ${POSTGRES_PASSWORD}
Max Wait Time: 500 ms
Max Total Connections: 10
```

### 2. RabbitMQ Connections

Use ConsumeAMQP processor:

```
Host Name: ${RABBITMQ_HOST}
Port: ${RABBITMQ_PORT}
Username: ${RABBITMQ_USER}
Password: ${RABBITMQ_PASSWORD}
Queue: booking.created
```

### 3. Error Handling

Always configure:
- **Failure Relationships**: Route to error handling flow
- **Retry Logic**: Use RetryFlowFile processor
- **Dead Letter Queue**: For unrecoverable errors
- **Logging**: Use LogAttribute processor for debugging

### 4. Performance Optimization

- **Batch Processing**: Use MergeRecord for batch inserts
- **Parallel Processing**: Adjust concurrent tasks per processor
- **Back Pressure**: Configure queue sizes appropriately
- **Monitoring**: Enable bulletin boards and provenance

### 5. Security

- Store credentials in environment variables (already configured)
- Use SSL/TLS for production deployments
- Enable NiFi authentication and authorization
- Audit all data access via provenance

## Custom Processors

Add custom processors by placing JAR files in:
```
./drivers/
```

Recommended additions:
- PostgreSQL JDBC Driver (already mounted if placed)
- MongoDB Java Driver
- Custom business logic processors

## Monitoring & Metrics

### NiFi UI Metrics

Access metrics at: http://localhost:8080/nifi

Monitor:
- **FlowFile Queues**: Check for backpressure
- **Processor Stats**: Bytes in/out, tasks completed
- **System Diagnostics**: CPU, memory, disk usage
- **Bulletins**: Errors and warnings

### Integration with Prometheus (Future)

NiFi exposes metrics via:
- Reporting Tasks (configure PrometheusReportingTask)
- NiFi REST API: http://localhost:8080/nifi-api/

## Troubleshooting

### NiFi Won't Start

```bash
# Check logs
docker logs ev_nifi

# Increase JVM heap if needed (edit docker-compose.dev.yml)
NIFI_JVM_HEAP_MAX: 4g

# Restart
docker-compose restart nifi
```

### Database Connection Failures

```bash
# Test database connectivity from NiFi container
docker exec -it ev_nifi bash
apt-get update && apt-get install -y postgresql-client
psql -h postgres-auth -U postgres -d auth_db

# Verify JDBC driver exists
ls -la /opt/nifi/nifi-current/lib/drivers/
```

### RabbitMQ Connection Issues

```bash
# Check RabbitMQ is running
docker ps | grep rabbitmq

# Test connection
docker exec -it ev_nifi bash
apt-get install -y telnet
telnet rabbitmq 5672
```

## Production Deployment

For production, update the following:

1. **Authentication**: Enable LDAP or OIDC authentication
2. **SSL/TLS**: Configure certificates for HTTPS
3. **Clustering**: Deploy NiFi in cluster mode for HA
4. **Persistent Storage**: Use external volumes or NFS
5. **Monitoring**: Integrate with ELK stack or Grafana
6. **Backup**: Automate flow.xml.gz backups

## Example Flows

### Flow 1: Real-time Booking Analytics

```
ConsumeAMQP (booking.created)
  → EvaluateJsonPath (extract booking details)
  → RouteOnAttribute (filter by vehicle type)
  → ExecuteGroovyScript (calculate usage metrics)
  → PutMongo (store in analytics collection)
  → PublishAMQP (trigger notification)
```

### Flow 2: Daily Cost Aggregation

```
GenerateFlowFile (cron: 0 0 * * *)
  → ExecuteSQLRecord (fetch daily costs)
  → JoltTransformJSON (aggregate by group)
  → MergeRecord (batch multiple groups)
  → PutDatabaseRecord (insert into admin analytics)
  → PutEmail (send summary to admins)
```

### Flow 3: Vehicle Health Monitoring

```
QueryDatabaseTable (vehicle_service.maintenance_history)
  → ValidateRecord (check maintenance intervals)
  → RouteOnAttribute (detect overdue maintenance)
  → PublishAMQP (trigger alert event)
  → LogAttribute (audit trail)
```

## Additional Resources

- [Apache NiFi Documentation](https://nifi.apache.org/docs.html)
- [NiFi Expression Language Guide](https://nifi.apache.org/docs/nifi-docs/html/expression-language-guide.html)
- [NiFi Processor Documentation](https://nifi.apache.org/docs/nifi-docs/components/)
- [NiFi Community](https://nifi.apache.org/community.html)

## Support

For questions or issues:
1. Check NiFi logs: `docker logs ev_nifi`
2. Review NiFi bulletins in the UI
3. Consult the team documentation
4. File an issue in the project repository
