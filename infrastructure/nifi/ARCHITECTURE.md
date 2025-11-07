# NiFi Integration Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        EV Co-ownership System                        │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Apache NiFi Layer                            │
│  ┌───────────────┐  ┌───────────────┐  ┌─────────────────────┐    │
│  │ Event Stream  │  │   Database    │  │   Analytics         │    │
│  │  Processor    │  │   Sync ETL    │  │  Aggregation        │    │
│  └───────────────┘  └───────────────┘  └─────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
         │                    │                       │
         ▼                    ▼                       ▼
┌───────────────┐   ┌──────────────────┐    ┌──────────────────┐
│   RabbitMQ    │   │  PostgreSQL DBs  │    │    MongoDB       │
│   Queues      │   │  (8 services)    │    │   Analytics      │
└───────────────┘   └──────────────────┘    └──────────────────┘
```

## Data Flow Patterns

### 1. Event-Driven Processing

```
Service Event → RabbitMQ → NiFi ConsumeAMQP → Process → Store → Notify
```

**Example Flow**:
```
Booking Created → booking.created queue → NiFi extracts data 
→ Validate & transform → Store in analytics DB → Trigger notification
```

### 2. Database Synchronization

```
Service DB → NiFi ExecuteSQL → Transform → Aggregate → Analytics DB
```

**Example Flow**:
```
Cost Service (Postgres) → Extract costs → Join with user data 
→ Calculate group totals → Store in MongoDB analytics
```

### 3. Scheduled Analytics

```
Timer Trigger → Query DBs → Calculate KPIs → Update Analytics → Email Report
```

**Example Flow**:
```
Daily 2 AM → Fetch bookings, costs, usage → Calculate metrics 
→ Update dashboards → Email admin summary
```

## Integration Points

### A. RabbitMQ Event Streams

**Queues Monitored**:
- `booking.created` - New bookings
- `booking.updated` - Booking changes
- `booking.cancelled` - Cancellations
- `cost.created` - New costs
- `cost.split.calculated` - Split calculations
- `payment.completed` - Payment confirmations
- `notification.sent` - Notification tracking
- `ai.recommendation.generated` - AI insights
- `contract.signed` - Contract events
- `dispute.created` - Dispute alerts

**NiFi Processors**:
- `ConsumeAMQP` - Pull messages from queues
- `PublishAMQP` - Publish processed events back

### B. PostgreSQL Databases

**Connected Databases**:
1. `auth_db` (port 5432) - Users, KYC, sessions
2. `user_db` (port 5433) - Profiles, groups, votes
3. `booking_db` (port 5434) - Bookings, calendar, conflicts
4. `cost_db` (port 5435) - Costs, payments, invoices
5. `vehicle_db` (port 5436) - Vehicles, maintenance, charging
6. `contract_db` (port 5437) - Contracts, signatures
7. `admin_db` (port 5438) - Disputes, staff, audit logs
8. `notification_db` (port 5439) - Notifications, templates

**NiFi Processors**:
- `QueryDatabaseTable` - Incremental data extraction
- `ExecuteSQLRecord` - Custom SQL queries
- `PutDatabaseRecord` - Insert/update records

### C. MongoDB Analytics

**Collections**:
- `booking_events` - Booking event history
- `cost_events` - Cost tracking
- `usage_analytics` - Vehicle usage patterns
- `financial_reports` - Revenue/expense aggregates
- `user_behavior` - User interaction metrics
- `ai_recommendations` - ML model outputs
- `audit_trail` - System-wide audit logs

**NiFi Processors**:
- `PutMongo` - Insert documents
- `GetMongo` - Query collections
- `DeleteMongo` - Cleanup old data

### D. Redis Cache

**Use Cases**:
- Cache frequently queried data
- Store intermediate processing results
- Rate limiting for external APIs
- Session data for analytics

**NiFi Processors**:
- Custom Redis processors (via ExecuteScript)
- DistributedMapCache for flow-wide caching

## Key Use Cases

### Use Case 1: Real-time Booking Analytics

**Trigger**: Booking created event from booking-service

**Flow**:
1. NiFi consumes `booking.created` from RabbitMQ
2. Extracts booking details (vehicle, user, times, group)
3. Enriches with user profile from `user_db`
4. Enriches with vehicle details from `vehicle_db`
5. Calculates usage metrics
6. Stores in `booking_events` MongoDB collection
7. Updates real-time dashboard aggregates
8. Publishes analytics event back to RabbitMQ

**Value**:
- Real-time dashboard updates
- Immediate conflict detection
- Usage pattern analysis
- Fair scheduling insights

### Use Case 2: Daily Financial Reconciliation

**Trigger**: Cron schedule (daily at 2 AM)

**Flow**:
1. GenerateFlowFile triggers the flow
2. Query `cost_db` for yesterday's costs
3. Query `payment_db` for payments
4. Join costs with payments
5. Calculate group balances
6. Identify discrepancies
7. Store reconciliation report in MongoDB
8. Email summary to finance admin
9. Alert on discrepancies

**Value**:
- Automated financial tracking
- Early fraud detection
- Payment reconciliation
- Audit compliance

### Use Case 3: Vehicle Maintenance Predictions

**Trigger**: Continuous (every 15 minutes)

**Flow**:
1. Query `vehicle_db.maintenance_history`
2. Query `vehicle_db.charging_sessions`
3. Calculate usage metrics (distance, charge cycles)
4. Compare with manufacturer recommendations
5. Predict next maintenance date
6. Store predictions in MongoDB
7. Publish alert events for overdue vehicles
8. Update vehicle dashboard

**Value**:
- Proactive maintenance
- Reduced vehicle downtime
- Cost optimization
- Safety compliance

### Use Case 4: AI Training Data Preparation

**Trigger**: Weekly (Sunday midnight)

**Flow**:
1. Extract booking patterns from `booking_db`
2. Extract user behavior from `user_db`
3. Extract cost patterns from `cost_db`
4. Join and denormalize data
5. Apply transformations (normalization, encoding)
6. Export to CSV/Parquet
7. Upload to AI service data store (MongoDB)
8. Trigger AI model retraining

**Value**:
- Fresh training data for AI models
- Improved recommendation accuracy
- Automated ML pipeline
- Data versioning

### Use Case 5: Cross-Service Data Validation

**Trigger**: Hourly

**Flow**:
1. Query booking totals from `booking_db`
2. Query cost totals from `cost_db`
3. Query payment totals from payment gateway
4. Cross-validate numbers
5. Detect anomalies (missing costs, orphan bookings)
6. Store validation results
7. Alert on critical issues
8. Auto-correct minor issues

**Value**:
- Data integrity assurance
- Early error detection
- Automated data quality monitoring
- Reduced manual reconciliation

## Performance Optimization

### Batching

```yaml
# Configure processors for batch processing
Batch Size: 1000
Run Duration: 5 seconds
Concurrent Tasks: 4
```

**Benefits**:
- Reduced database roundtrips
- Better throughput
- Lower resource usage

### Caching

```yaml
# Use DistributedMapCache for frequently accessed data
Cache Service: DistributedMapCacheClientService
Max Cache Size: 10000
Eviction Strategy: LRU
```

**Benefits**:
- Faster lookups
- Reduced database load
- Improved response times

### Parallel Processing

```yaml
# Configure process groups for parallelism
Concurrent Tasks: 8
Max Queue Size: 10000
Back Pressure Threshold: 8000
```

**Benefits**:
- Higher throughput
- Better resource utilization
- Scalability

## Security Considerations

### 1. Credential Management

✅ **Current**: Environment variables in docker-compose
⚠️ **Production**: Use secrets management (Vault, AWS Secrets Manager)

### 2. Network Security

✅ **Current**: Internal Docker network
⚠️ **Production**: TLS/SSL for all connections

### 3. Access Control

✅ **Current**: Single user authentication
⚠️ **Production**: LDAP/OIDC integration, RBAC

### 4. Data Privacy

⚠️ **Consider**: Encrypt sensitive data at rest and in transit
⚠️ **Consider**: PII masking in logs and provenance

### 5. Audit Logging

✅ **Current**: NiFi provenance tracking enabled
⚠️ **Production**: Export provenance to external audit system

## Monitoring & Alerting

### Metrics to Monitor

1. **FlowFile Metrics**:
   - Queue depth
   - Processing time
   - Throughput (records/sec)

2. **Resource Metrics**:
   - CPU usage
   - Memory usage
   - Disk I/O

3. **Error Metrics**:
   - Failed processors
   - Retry counts
   - Dead letter queue size

### Alerting Rules

```yaml
# Example alerting thresholds
Queue Depth > 5000: Warning
Queue Depth > 10000: Critical
Failed FlowFiles > 100: Warning
Processor Down > 5 min: Critical
Memory Usage > 80%: Warning
```

### Integration with Monitoring Stack

**Option 1**: Prometheus + Grafana
- Configure PrometheusReportingTask in NiFi
- Scrape metrics endpoint
- Visualize in Grafana

**Option 2**: ELK Stack
- Use NiFi SiteToSiteProvenanceReportingTask
- Send to Logstash
- Visualize in Kibana

## Scaling Strategies

### Horizontal Scaling

**NiFi Cluster**:
```yaml
# Deploy 3+ NiFi nodes
nifi-node-1:
  image: apache/nifi:2.0.0
  environment:
    NIFI_CLUSTER_IS_NODE: true
    NIFI_ZK_CONNECT_STRING: zookeeper:2181
    
nifi-node-2:
  # Same configuration
  
zookeeper:
  image: zookeeper:3.8
```

**Benefits**:
- High availability
- Load distribution
- Zero-downtime updates

### Vertical Scaling

```yaml
# Increase resources per node
NIFI_JVM_HEAP_MAX: 8g
deploy:
  resources:
    limits:
      cpus: '4'
      memory: 16G
```

## Disaster Recovery

### Backup Strategy

1. **Flow Definitions**:
   - Export flow.xml.gz regularly
   - Version control in Git

2. **Configuration**:
   - Backup nifi.properties
   - Export controller services

3. **Data**:
   - FlowFile repos (can be rebuilt)
   - Provenance data (export critical paths)

### Recovery Procedure

1. Deploy new NiFi instance
2. Restore flow.xml.gz
3. Restore controller services
4. Replay events from RabbitMQ DLQ if needed
5. Verify data integrity

## Best Practices

1. ✅ **Always use DBCPConnectionPool** for database connections
2. ✅ **Configure failure relationships** for all processors
3. ✅ **Use RetryFlowFile** for transient errors
4. ✅ **Monitor queue depths** to detect bottlenecks
5. ✅ **Version control flows** using Git
6. ✅ **Test flows with small data** before scaling
7. ✅ **Document complex transformations** in processor notes
8. ✅ **Use process groups** to organize related logic
9. ✅ **Enable provenance** for critical data paths
10. ✅ **Regular backups** of flow configurations

## Troubleshooting Guide

See [NiFi README Troubleshooting Section](./README.md#troubleshooting)

## Future Enhancements

- [ ] Machine learning model deployment via NiFi
- [ ] Real-time anomaly detection flows
- [ ] Automated data quality scoring
- [ ] Multi-tenant data isolation
- [ ] Geographic data routing
- [ ] Advanced fraud detection pipelines

---

For implementation details, see the [main NiFi README](./README.md).
