# Apache NiFi Quick Start Guide

Get Apache NiFi up and running in 5 minutes for the EV Co-ownership System.

## Prerequisites

- Docker and Docker Compose installed
- At least 4GB RAM available
- Infrastructure services running (Postgres, MongoDB, RabbitMQ, Redis)

## Step 1: Setup Drivers (One-time)

### Windows (PowerShell)
```powershell
cd infrastructure/nifi
.\setup.ps1
```

### Linux/Mac (Bash)
```bash
cd infrastructure/nifi
chmod +x setup.sh
./setup.sh
```

This downloads PostgreSQL and MongoDB JDBC drivers (~10MB).

## Step 2: Start NiFi

```bash
# From project root
docker-compose -f docker-compose.dev.yml up -d nifi

# Monitor startup (takes ~2 minutes)
docker logs -f ev_nifi
```

Wait for the message: `NiFi has started. The UI is available at...`

## Step 3: Access NiFi UI

Open your browser to: **http://localhost:8080/nifi**

**Login credentials**:
- Username: `admin`
- Password: `nifiAdminPassword123`

## Step 4: Import Your First Flow

1. Click the **Upload Template** button (📤) in the top toolbar
2. Navigate to `infrastructure/nifi/templates/`
3. Select `event-stream-processor.json`
4. Click **Open** to upload

## Step 5: Add Template to Canvas

1. Drag the **Template** icon (📋) from the left toolbar onto the canvas
2. Select "Event Stream Processor" from the dropdown
3. Click **Add**

You now have a complete event processing flow ready!

## Step 6: Configure and Start

### Enable Controller Services

1. Right-click anywhere on the canvas
2. Select **Configure**
3. Go to **Controller Services** tab
4. Click the **⚡** (lightning bolt) icon to enable all services
5. Click **Enable**

### Start the Flow

1. Select the process group you just added
2. Click the **▶️ Start** button in the toolbar
3. Watch the data flow in real-time!

## Common Use Cases

### Real-time Event Processing

The event-stream-processor template:
- ✅ Consumes booking events from RabbitMQ
- ✅ Extracts and validates data
- ✅ Stores in MongoDB analytics database
- ✅ Routes to appropriate handlers

### Cross-Database Analytics

To sync data across services:

1. Import `database-sync-flow.json` template
2. Configure source databases (already set via env variables)
3. Start the flow
4. Data automatically aggregates in MongoDB

### Scheduled Reports

1. Import `analytics-aggregation.json`
2. Set schedule (default: daily at 2 AM)
3. Reports generated and emailed automatically

## Verify It's Working

### Check Flow Statistics

In the NiFi UI, you should see:
- **In/Out**: Number of FlowFiles processed
- **Read/Written**: Data volume
- **Tasks/Time**: Processing metrics

### Check MongoDB

```bash
docker exec -it ev_mongodb mongosh -u admin -p admin123

use ev_analytics
db.booking_events.find().limit(5)
```

You should see processed events!

### Check Logs

```bash
# NiFi application logs
docker exec ev_nifi tail -f /opt/nifi/nifi-current/logs/nifi-app.log

# Container logs
docker logs ev_nifi
```

## Troubleshooting

### NiFi Won't Start

**Symptom**: Container exits or restarts repeatedly

**Fix**:
```bash
# Increase Docker memory to 4GB+
# Check available memory
docker stats ev_nifi

# Restart NiFi
docker-compose -f docker-compose.dev.yml restart nifi
```

### Can't Connect to Database

**Symptom**: Processor shows connection errors

**Fix**:
1. Ensure database containers are running:
   ```bash
   docker ps | grep postgres
   ```
2. Test connectivity:
   ```bash
   docker exec -it ev_nifi bash
   apt-get update && apt-get install -y postgresql-client
   psql -h postgres-auth -U postgres -d auth_db
   ```

### Template Import Fails

**Symptom**: "Invalid template" error

**Fix**:
- Ensure you're using the latest NiFi version (2.0.0)
- Check JSON file is not corrupted
- Try importing as plain text (copy/paste)

### No Events Processing

**Symptom**: Processors running but no data flowing

**Fix**:
1. Check RabbitMQ has messages:
   ```bash
   # RabbitMQ Management UI
   http://localhost:15672
   # Login: admin/admin123
   # Check queues: booking.created, cost.created, etc.
   ```

2. Verify RabbitMQ connection in NiFi:
   - Right-click ConsumeAMQP processor
   - Configure → Properties
   - Check Host, Port, Username, Password

## Next Steps

### Learn NiFi Basics

- **Processors**: Building blocks for data operations
- **Connections**: Routes between processors
- **Controller Services**: Shared resources (DB pools, etc.)
- **Process Groups**: Organize related processors

### Build Custom Flows

1. Drag processors from the toolbar
2. Connect them with relationships
3. Configure properties
4. Start and monitor

### Advanced Features

- **Provenance**: Track data lineage
- **Templates**: Share flows with team
- **Parameters**: Externalize configuration
- **Monitoring**: Set up bulletins and alerts

## Resources

- 📖 [Full NiFi Documentation](./infrastructure/nifi/README.md)
- 📝 [Flow Templates Guide](./infrastructure/nifi/templates/README.md)
- 🔧 [Drivers Setup](./infrastructure/nifi/drivers/README.md)
- 🌐 [Apache NiFi Official Docs](https://nifi.apache.org/docs.html)

## Getting Help

If you encounter issues:

1. Check logs: `docker logs ev_nifi`
2. Review processor bulletins in NiFi UI (🔔 icon)
3. Consult the full README: `infrastructure/nifi/README.md`
4. Ask in team chat or file an issue

---

**You're all set!** 🎉

Your data flows are now automated with Apache NiFi. Happy data engineering!
