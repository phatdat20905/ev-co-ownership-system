#!/bin/bash
# Script to verify infrastructure health after startup

echo "========================================="
echo "Infrastructure Health Check"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Redis
echo -n "Checking Redis... "
REDIS_STATUS=$(docker inspect ev_redis --format='{{.State.Health.Status}}' 2>/dev/null)
if [ "$REDIS_STATUS" == "healthy" ]; then
    echo -e "${GREEN}✓ Healthy${NC}"
else
    echo -e "${RED}✗ $REDIS_STATUS${NC}"
fi

# Check RabbitMQ
echo -n "Checking RabbitMQ... "
RABBITMQ_STATUS=$(docker inspect ev_rabbitmq --format='{{.State.Health.Status}}' 2>/dev/null)
if [ "$RABBITMQ_STATUS" == "healthy" ]; then
    echo -e "${GREEN}✓ Healthy${NC}"
else
    echo -e "${RED}✗ $RABBITMQ_STATUS${NC}"
fi

# Check RabbitMQ queue errors
echo -n "Checking RabbitMQ errors... "
ERROR_COUNT=$(docker logs ev_rabbitmq --since 1m 2>&1 | grep -c "not_found.*booking.created")
if [ "$ERROR_COUNT" -eq 0 ]; then
    echo -e "${GREEN}✓ No errors${NC}"
else
    echo -e "${RED}✗ $ERROR_COUNT errors found${NC}"
fi

# Check NiFi
echo -n "Checking NiFi... "
NIFI_STATUS=$(docker inspect ev_nifi --format='{{.State.Health.Status}}' 2>/dev/null)
if [ "$NIFI_STATUS" == "healthy" ]; then
    echo -e "${GREEN}✓ Healthy${NC}"
else
    echo -e "${RED}✗ $NIFI_STATUS${NC}"
fi

# Check NiFi process
echo -n "Checking NiFi process... "
NIFI_PROCESS=$(docker exec ev_nifi pgrep -f 'org.apache.nifi.NiFi' 2>/dev/null)
if [ ! -z "$NIFI_PROCESS" ]; then
    echo -e "${GREEN}✓ Running (PID: $NIFI_PROCESS)${NC}"
else
    echo -e "${RED}✗ Not running${NC}"
fi

# Check booking.created queue
echo -n "Checking booking.created queue... "
QUEUE_EXISTS=$(curl -s -u "admin:admin123" "http://localhost:15672/api/queues/%2F/booking.created" 2>/dev/null | grep -o '"name":"booking.created"')
if [ ! -z "$QUEUE_EXISTS" ]; then
    echo -e "${GREEN}✓ Exists${NC}"
else
    echo -e "${RED}✗ Not found${NC}"
fi

# Check MongoDB
echo -n "Checking MongoDB... "
MONGODB_STATUS=$(docker inspect ev_mongodb --format='{{.State.Health.Status}}' 2>/dev/null)
if [ "$MONGODB_STATUS" == "healthy" ]; then
    echo -e "${GREEN}✓ Healthy${NC}"
else
    echo -e "${RED}✗ $MONGODB_STATUS${NC}"
fi

echo ""
echo "========================================="
echo "Summary"
echo "========================================="

# Count healthy services
HEALTHY_COUNT=0
[ "$REDIS_STATUS" == "healthy" ] && ((HEALTHY_COUNT++))
[ "$RABBITMQ_STATUS" == "healthy" ] && ((HEALTHY_COUNT++))
[ "$NIFI_STATUS" == "healthy" ] && ((HEALTHY_COUNT++))
[ "$MONGODB_STATUS" == "healthy" ] && ((HEALTHY_COUNT++))

if [ $HEALTHY_COUNT -eq 4 ] && [ $ERROR_COUNT -eq 0 ] && [ ! -z "$QUEUE_EXISTS" ]; then
    echo -e "${GREEN}✓ All infrastructure services operational!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠ Some issues detected. Please review above.${NC}"
    exit 1
fi
