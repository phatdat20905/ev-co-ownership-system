# NiFi Migration Guide for Existing Deployments

This guide helps you add Apache NiFi to an existing EV Co-ownership System deployment.

## Pre-Migration Checklist

- [ ] Backup current docker volumes
- [ ] Verify minimum 4GB RAM available
- [ ] Check disk space (need ~10GB for NiFi)
- [ ] Review current RabbitMQ queue configurations
- [ ] Document current manual ETL processes
- [ ] Test in dev environment first

---

## Migration Steps

### 1. Update Docker Compose

The `docker-compose.dev.yml` has been updated with NiFi service. If you have a custom compose file:

```yaml
# Add to your docker-compose file

services:
  # ... existing services ...

  nifi:
    image: apache/nifi:2.0.0
    container_name: ev_nifi
    ports:
      - "8443:8443"
      - "8080:8080"
    environment:
      SINGLE_USER_CREDENTIALS_USERNAME: admin
      SINGLE_USER_CREDENTIALS_PASSWORD: nifiAdminPassword123
      NIFI_WEB_HTTP_PORT: 8080
      NIFI_WEB_HTTPS_PORT: 8443
      NIFI_JVM_HEAP_INIT: 1g
      NIFI_JVM_HEAP_MAX: 2g
      # Add database URLs (see docker-compose.dev.yml for full list)
      POSTGRES_AUTH_URL: jdbc:postgresql://postgres-auth:5432/auth_db
      # ... add all other env vars
    volumes:
      - nifi_data:/opt/nifi/nifi-current/conf
      - nifi_database_repository:/opt/nifi/nifi-current/database_repository
      - nifi_flowfile_repository:/opt/nifi/nifi-current/flowfile_repository
      - nifi_content_repository:/opt/nifi/nifi-current/content_repository
      - nifi_provenance_repository:/opt/nifi/nifi-current/provenance_repository
      - nifi_state:/opt/nifi/nifi-current/state
      - nifi_logs:/opt/nifi/nifi-current/logs
      - ./infrastructure/nifi/templates:/opt/nifi/nifi-current/templates
      - ./infrastructure/nifi/drivers:/opt/nifi/nifi-current/lib/drivers
    networks:
      - ev_network
    depends_on:
      postgres-auth:
        condition: service_healthy
      mongodb:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:8080/nifi-api/system-diagnostics || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 120s

volumes:
  # ... existing volumes ...
  nifi_data:
  nifi_database_repository:
  nifi_flowfile_repository:
  nifi_content_repository:
  nifi_provenance_repository:
  nifi_state:
  nifi_logs:
```

### 2. Create Infrastructure Directory

```bash
# From project root
mkdir -p infrastructure/nifi/templates
mkdir -p infrastructure/nifi/drivers
```

### 3. Download Setup Scripts

The following files have been created in `infrastructure/nifi/`:
- `setup.sh` (Linux/Mac)
- `setup.ps1` (Windows)
- `README.md`
- `QUICK_START.md`
- `ARCHITECTURE.md`
- `templates/README.md`
- `drivers/README.md`

### 4. Download JDBC Drivers

**Windows**:
```powershell
cd infrastructure/nifi
.\setup.ps1
```

**Linux/Mac**:
```bash
cd infrastructure/nifi
chmod +x setup.sh
./setup.sh
```

### 5. Start NiFi

```bash
# Pull NiFi image
docker pull apache/nifi:2.0.0

# Start NiFi (will also start dependencies)
docker-compose -f docker-compose.dev.yml up -d nifi

# Monitor startup
docker logs -f ev_nifi
```

Wait for message: `NiFi has started. The UI is available...`

### 6. Verify Installation

```bash
# Check NiFi is running
docker ps | grep nifi

# Check health
curl http://localhost:8080/nifi-api/system-diagnostics

# Access UI
# Browser: http://localhost:8080/nifi
# Login: admin / nifiAdminPassword123
```

### 7. Import Templates

1. Open NiFi UI
2. Click Upload Template (📤)
3. Import `infrastructure/nifi/templates/event-stream-processor.json`
4. Add template to canvas
5. Start flow

---

## Data Migration Scenarios

### Scenario 1: No Existing ETL

**Before**: Manual data exports and reports  
**After**: Automated NiFi flows

**Steps**:
1. Import analytics-aggregation template
2. Schedule reports
3. Monitor for 1 week
4. Decommission manual processes

### Scenario 2: Custom Scripts Exist

**Before**: Cron jobs running custom Python/Node scripts  
**After**: NiFi flows replace scripts

**Migration**:
1. Document current script logic
2. Build equivalent NiFi flow
3. Run in parallel for 1 week
4. Compare outputs
5. Switch over when validated
6. Archive old scripts

### Scenario 3: External ETL Tool

**Before**: Using another ETL tool (Airflow, Talend, etc.)  
**After**: Migrate to NiFi

**Migration**:
1. Inventory existing jobs
2. Prioritize by criticality
3. Migrate one job at a time
4. Dual-run for validation
5. Gradual cutover

---

## Rollback Plan

If you need to rollback:

### Step 1: Stop NiFi

```bash
docker-compose -f docker-compose.dev.yml stop nifi
```

### Step 2: Remove Container

```bash
docker-compose -f docker-compose.dev.yml rm -f nifi
```

### Step 3: Restore Previous State

```bash
# If you modified docker-compose, restore from backup
git checkout docker-compose.dev.yml

# Remove NiFi volumes (optional - keeps data for later)
docker volume rm ev-co-ownership-system_nifi_data
docker volume rm ev-co-ownership-system_nifi_database_repository
# ... remove other nifi volumes if needed
```

### Step 4: Resume Previous ETL

Re-enable any manual scripts or previous ETL tools.

---

## Common Migration Issues

### Issue 1: Port Conflicts

**Symptom**: NiFi won't start, port 8080 already in use

**Fix**:
```yaml
# Change NiFi port in docker-compose
ports:
  - "8081:8080"  # Use 8081 instead
  - "8444:8443"
```

### Issue 2: Insufficient Memory

**Symptom**: NiFi container crashes or restarts

**Fix**:
```yaml
# Reduce heap size in docker-compose
NIFI_JVM_HEAP_MAX: 1g

# Or increase Docker memory limit
# Docker Desktop → Settings → Resources → Memory → 6GB
```

### Issue 3: Driver Not Found

**Symptom**: Database processors fail with ClassNotFoundException

**Fix**:
```bash
# Re-run setup script
cd infrastructure/nifi
./setup.ps1  # or ./setup.sh

# Restart NiFi
docker-compose -f docker-compose.dev.yml restart nifi
```

### Issue 4: Database Connection Timeout

**Symptom**: Processors show connection timeout errors

**Fix**:
1. Ensure all database containers are running:
   ```bash
   docker ps | grep postgres
   ```

2. Test connectivity:
   ```bash
   docker exec -it ev_nifi bash
   apt-get update && apt-get install -y postgresql-client
   psql -h postgres-auth -U postgres -d auth_db
   ```

3. Check environment variables are set correctly in docker-compose

---

## Performance Tuning After Migration

### Week 1: Baseline

- Monitor resource usage
- Track flow throughput
- Identify bottlenecks

### Week 2-4: Optimize

**Database Connections**:
```
Max Total Connections: 5 → 10
Max Wait Time: 1000ms → 500ms
```

**Processor Concurrency**:
```
Concurrent Tasks: 1 → 4
Run Duration: 0 sec → 5 sec
```

**Batch Sizes**:
```
Batch Size: 10 → 100
```

### Month 2: Scale

Consider:
- Adding more CPU/RAM to NiFi container
- Deploying NiFi cluster (3+ nodes)
- Optimizing database queries
- Adding caching layers

---

## Monitoring Setup

### Enable Reporting

1. NiFi UI → Controller Settings
2. Add Reporting Task
3. Configure metrics export
4. Schedule frequency: 1 minute

### Integrate with Existing Monitoring

**Prometheus**:
```yaml
# Add PrometheusReportingTask in NiFi
Metrics Endpoint: http://nifi:9092/metrics
```

**Grafana Dashboard**:
- Import NiFi dashboard template
- Connect to Prometheus
- Add alerts for queue depth, errors

---

## Training & Documentation

### For Developers

1. Share [QUICK_START.md](./QUICK_START.md)
2. Demo basic flow creation
3. Hands-on workshop building a simple flow

### For Operations

1. Share [README.md](./README.md) - full documentation
2. Training on monitoring and troubleshooting
3. Runbook for common issues

### For Data Team

1. Share [ARCHITECTURE.md](./ARCHITECTURE.md) - integration patterns
2. Workshop on building complex flows
3. Best practices guide

---

## Success Metrics

Track these metrics post-migration:

**Week 1**:
- [ ] NiFi uptime > 99%
- [ ] All critical flows running
- [ ] Zero data loss

**Month 1**:
- [ ] Manual ETL reduced by 50%
- [ ] Report generation automated
- [ ] Data quality improved

**Quarter 1**:
- [ ] Manual ETL eliminated
- [ ] Real-time analytics enabled
- [ ] Team fully trained

---

## Next Steps After Migration

1. **Week 1**: Monitor and stabilize
2. **Week 2-4**: Build additional flows
3. **Month 2**: Optimize performance
4. **Month 3**: Advanced features (ML pipelines, etc.)

---

## Support During Migration

**Internal**:
- Slack channel: #nifi-migration
- Weekly sync meetings
- Shared runbook

**External**:
- Apache NiFi docs: https://nifi.apache.org/docs.html
- NiFi mailing list: dev@nifi.apache.org
- Stack Overflow: [apache-nifi] tag

---

## Appendix: Comparison with Previous State

### Before NiFi

```
Manual Reports → Python scripts → Cron jobs → Email
Database Sync → Custom SQL scripts → Manual execution
Event Processing → RabbitMQ → Custom consumers → Ad-hoc storage
```

### After NiFi

```
Automated Reports → NiFi flows → Scheduled → Auto-email
Database Sync → NiFi ExecuteSQL → Automated → Real-time
Event Processing → RabbitMQ → NiFi ConsumeAMQP → MongoDB analytics
```

**Benefits**:
- ✅ Visual flow design
- ✅ Built-in error handling
- ✅ Audit trail (provenance)
- ✅ Easy monitoring
- ✅ No code deployments
- ✅ Rapid iteration

---

**Migration Complete!** 🎉

Your system now has enterprise-grade data flow orchestration with Apache NiFi.
