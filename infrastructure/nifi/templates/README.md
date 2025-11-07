# NiFi Flow Templates Guide

This directory contains pre-built NiFi flow templates for common data integration patterns in the EV Co-ownership system.

## Template Files

### 1. event-stream-processor.json
**Purpose**: Real-time event processing from RabbitMQ

**What it does**:
- Consumes events from RabbitMQ queues (booking, cost, notification events)
- Extracts and validates event data
- Routes events based on type
- Stores processed events in MongoDB analytics database
- Triggers downstream notifications

**Use when**: You need real-time event processing and analytics

---

### 2. database-sync-flow.json
**Purpose**: Cross-database data synchronization

**What it does**:
- Extracts data from individual service databases (Postgres)
- Transforms and enriches data
- Aggregates data from multiple sources
- Loads into centralized analytics database (MongoDB)

**Use when**: You need to build consolidated reports or dashboards

---

### 3. analytics-aggregation.json
**Purpose**: Scheduled analytics calculations

**What it does**:
- Runs on a schedule (daily/hourly)
- Calculates KPIs and metrics
- Generates aggregated statistics
- Updates analytics tables
- Triggers report generation

**Use when**: You need periodic analytics updates

---

### 4. data-export-flow.json
**Purpose**: Export data to external systems

**What it does**:
- Extracts data based on schedule or trigger
- Formats data (CSV, JSON, Excel)
- Exports to file system or external APIs
- Sends email notifications with attachments

**Use when**: You need to export data for external processing

---

## How to Use Templates

### Step 1: Import Template

1. Open NiFi UI: http://localhost:8080/nifi
2. Click the **Upload Template** button (📤) in the toolbar
3. Select a `.json` template file
4. Click **Upload**

### Step 2: Add Template to Canvas

1. Drag the **Template** icon from the toolbar onto the canvas
2. Select the imported template from the dropdown
3. Click **Add**

### Step 3: Configure Processors

1. Right-click on a processor
2. Select **Configure**
3. Go to the **Properties** tab
4. Update any processor-specific settings
5. Click **Apply**

### Step 4: Enable Controller Services

1. Right-click on the canvas
2. Select **Configure**
3. Go to **Controller Services** tab
4. Enable required services (DBCPConnectionPool, etc.)
5. Click **Apply**

### Step 5: Start the Flow

1. Select processors or process groups
2. Click **Start** button (▶️) in the toolbar
3. Monitor flow execution in the UI

---

## Creating Custom Templates

### Export Your Flow as Template

1. Select the process group you want to export
2. Right-click and select **Create Template**
3. Give it a name and description
4. The template will be saved

### Download Template

1. Click on the **Templates** button in the toolbar
2. Find your template in the list
3. Click **Download** icon
4. Save the `.xml` or `.json` file

---

## Template Variables

All templates use environment variables for configuration. These are set in `docker-compose.dev.yml`:

```yaml
POSTGRES_AUTH_URL: jdbc:postgresql://postgres-auth:5432/auth_db
POSTGRES_USER: postgres
POSTGRES_PASSWORD: postgres123
MONGODB_URI: mongodb://admin:admin123@mongodb:27017
RABBITMQ_HOST: rabbitmq
RABBITMQ_PORT: 5672
RABBITMQ_USER: admin
RABBITMQ_PASSWORD: admin123
REDIS_HOST: redis
REDIS_PORT: 6379
REDIS_PASSWORD: redis123
```

You can reference these in processor properties using `${VARIABLE_NAME}`.

---

## Common Processors Used

### Database Processors
- **QueryDatabaseTable**: Incremental database queries
- **ExecuteSQLRecord**: Execute SQL and return records
- **PutDatabaseRecord**: Insert/update database records

### RabbitMQ Processors
- **ConsumeAMQP**: Consume messages from RabbitMQ queue
- **PublishAMQP**: Publish messages to RabbitMQ exchange

### MongoDB Processors
- **PutMongo**: Insert documents into MongoDB
- **GetMongo**: Query MongoDB collections

### Transformation Processors
- **EvaluateJsonPath**: Extract JSON data
- **JoltTransformJSON**: Complex JSON transformations
- **ConvertRecord**: Convert between data formats
- **MergeRecord**: Combine multiple records

### Routing Processors
- **RouteOnAttribute**: Route based on attributes
- **RouteOnContent**: Route based on content

### Utility Processors
- **GenerateFlowFile**: Create flowfiles on schedule
- **LogAttribute**: Log for debugging
- **UpdateAttribute**: Modify flowfile attributes

---

## Best Practices

1. **Always handle failures**: Configure failure relationships
2. **Use batching**: Set appropriate batch sizes for performance
3. **Monitor queues**: Watch for back pressure
4. **Log appropriately**: Use LogAttribute for debugging, but remove in production
5. **Version control**: Export and save your flows regularly
6. **Test incrementally**: Start with small data sets before scaling

---

## Troubleshooting

### Template won't import
- Ensure the JSON is valid
- Check NiFi version compatibility
- Try importing as XML instead

### Processors fail to start
- Check controller services are enabled
- Verify database connections
- Review processor configuration

### No data flowing
- Check RabbitMQ queues have messages
- Verify database tables exist
- Review processor scheduling settings

---

## Additional Templates (Coming Soon)

- **ml-data-preparation.json**: Prepare data for AI/ML models
- **audit-log-aggregation.json**: Collect and analyze audit logs
- **real-time-alerts.json**: Monitor data and trigger alerts
- **backup-and-archive.json**: Automated data backup flows

---

For more information, see the main [NiFi README](../README.md).
