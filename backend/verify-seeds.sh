#!/bin/bash

# 🔍 VERIFY SEED DATA
# Kiểm tra xem seed data đã được tạo thành công chưa

echo "======================================"
echo "🔍 VERIFY SEED DATA"
echo "======================================"
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Database credentials (update these based on your .env files)
DB_USER="postgres"
DB_PASSWORD="postgres"
DB_HOST="localhost"

check_table_count() {
    local db_name=$1
    local table_name=$2
    local service_name=$3
    
    count=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $db_name -t -c "SELECT COUNT(*) FROM $table_name;" 2>/dev/null | xargs)
    
    if [ -z "$count" ]; then
        echo -e "${RED}❌ Error querying $table_name in $db_name${NC}"
        return 1
    fi
    
    if [ "$count" -gt 0 ]; then
        echo -e "${GREEN}✅ $service_name - $table_name: $count rows${NC}"
    else
        echo -e "${YELLOW}⚠️  $service_name - $table_name: 0 rows${NC}"
    fi
}

echo "Checking Auth Service..."
check_table_count "ev_auth_db" "users" "Auth"
check_table_count "ev_auth_db" "kyc_verifications" "Auth"
echo ""

echo "Checking User Service..."
check_table_count "ev_user_db" "user_profiles" "User"
check_table_count "ev_user_db" "co_ownership_groups" "User"
check_table_count "ev_user_db" "group_members" "User"
check_table_count "ev_user_db" "group_votes" "User"
check_table_count "ev_user_db" "fund_transactions" "User"
echo ""

echo "Checking Vehicle Service..."
check_table_count "ev_vehicle_db" "vehicles" "Vehicle"
check_table_count "ev_vehicle_db" "maintenance_records" "Vehicle"
check_table_count "ev_vehicle_db" "insurance_policies" "Vehicle"
check_table_count "ev_vehicle_db" "charging_sessions" "Vehicle"
echo ""

echo "Checking Booking Service..."
check_table_count "ev_booking_db" "bookings" "Booking"
check_table_count "ev_booking_db" "check_in_out_logs" "Booking"
echo ""

echo "Checking Cost Service..."
check_table_count "ev_cost_db" "costs" "Cost"
check_table_count "ev_cost_db" "cost_splits" "Cost"
check_table_count "ev_cost_db" "wallets" "Cost"
check_table_count "ev_cost_db" "payments" "Cost"
check_table_count "ev_cost_db" "invoices" "Cost"
echo ""

echo "Checking Contract Service..."
check_table_count "ev_contract_db" "contract_templates" "Contract"
check_table_count "ev_contract_db" "contracts" "Contract"
check_table_count "ev_contract_db" "contract_signatures" "Contract"
echo ""

echo "Checking Notification Service..."
check_table_count "ev_notification_db" "notification_templates" "Notification"
check_table_count "ev_notification_db" "notifications" "Notification"
check_table_count "ev_notification_db" "notification_preferences" "Notification"
echo ""

echo "Checking Admin Service..."
check_table_count "ev_admin_db" "staff" "Admin"
check_table_count "ev_admin_db" "disputes" "Admin"
check_table_count "ev_admin_db" "dispute_messages" "Admin"
check_table_count "ev_admin_db" "system_settings" "Admin"
echo ""

echo "======================================"
echo "✅ Verification Complete"
echo "======================================"
echo ""
echo "💡 Tip: If you see 0 rows, run ./seed-all.sh"
