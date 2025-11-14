#!/bin/bash

# 🔄 RESET ALL SEED DATA
# Undo tất cả seeds và chạy lại từ đầu

set -e

echo "======================================"
echo "🔄 RESET SEED DATA"
echo "======================================"
echo ""

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$SCRIPT_DIR"

echo -e "${RED}⚠️  WARNING: This will DELETE all seed data!${NC}"
echo -e "${YELLOW}   This operation cannot be undone.${NC}"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Reset cancelled."
    exit 0
fi

echo ""
echo "Undoing all seeds..."
echo ""

undo_seeds() {
    local service_name=$1
    local service_path=$2
    
    echo -e "${YELLOW}🔄 Undoing $service_name seeds...${NC}"
    
    if [ ! -d "$service_path" ]; then
        echo -e "${YELLOW}⚠️  Service directory not found, skipping${NC}"
        return 0
    fi
    
    cd "$service_path"
    
    if [ ! -d "src/seeders" ]; then
        echo -e "${YELLOW}⚠️  No seeders directory found, skipping${NC}"
        cd - > /dev/null
        return 0
    fi
    
    npx sequelize-cli db:seed:undo:all
    
    echo -e "${GREEN}✅ $service_name seeds undone${NC}"
    cd - > /dev/null
    echo ""
}

# Undo in reverse order
undo_seeds "Admin Service" "$BACKEND_DIR/admin-service"
undo_seeds "Notification Service" "$BACKEND_DIR/notification-service"
undo_seeds "Contract Service" "$BACKEND_DIR/contract-service"
undo_seeds "Cost Service" "$BACKEND_DIR/cost-service"
undo_seeds "Booking Service" "$BACKEND_DIR/booking-service"
undo_seeds "Vehicle Service" "$BACKEND_DIR/vehicle-service"
undo_seeds "User Service" "$BACKEND_DIR/user-service"
undo_seeds "Auth Service" "$BACKEND_DIR/auth-service"

echo ""
echo -e "${GREEN}✅ All seeds have been reset!${NC}"
echo ""

read -p "Do you want to re-seed now? (yes/no): " reseed

if [ "$reseed" == "yes" ]; then
    echo ""
    echo "Re-seeding all services..."
    ./seed-all.sh
else
    echo ""
    echo "To re-seed, run: ./seed-all.sh"
fi
