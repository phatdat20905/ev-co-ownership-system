#!/bin/bash

# 🌱 MASTER SEED SCRIPT - EV Co-ownership System
# Chạy tất cả seeders theo đúng thứ tự dependencies

set -e  # Exit on error

echo "======================================"
echo "🌱 EV CO-OWNERSHIP SYSTEM - SEED DATA"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to run seeder for a service
seed_service() {
    local service_name=$1
    local service_path=$2
    
    echo -e "${YELLOW}📦 Seeding $service_name...${NC}"
    
    if [ ! -d "$service_path" ]; then
        echo -e "${RED}❌ Service directory not found: $service_path${NC}"
        return 1
    fi
    
    cd "$service_path"
    
    # Check if seeders directory exists
    if [ ! -d "src/seeders" ]; then
        echo -e "${YELLOW}⚠️  No seeders directory found, skipping${NC}"
        cd - > /dev/null
        return 0
    fi
    
    # Run seeders
    npx sequelize-cli db:seed:all
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $service_name seeded successfully${NC}"
    else
        echo -e "${RED}❌ Failed to seed $service_name${NC}"
        cd - > /dev/null
        return 1
    fi
    
    cd - > /dev/null
    echo ""
}

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$SCRIPT_DIR"

echo "📍 Backend directory: $BACKEND_DIR"
echo ""

# Confirmation
echo -e "${YELLOW}⚠️  WARNING: This will insert seed data into all databases.${NC}"
echo -e "${YELLOW}   Make sure you have run migrations first!${NC}"
echo ""
read -p "Do you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Seeding cancelled."
    exit 0
fi

echo ""
echo "Starting seed process..."
echo ""

# ===========================================
# PHASE 1: Core Services (no dependencies)
# ===========================================
echo "================================================"
echo "PHASE 1: Core Services"
echo "================================================"

seed_service "Auth Service" "$BACKEND_DIR/auth-service" || exit 1
seed_service "User Service" "$BACKEND_DIR/user-service" || exit 1

# ===========================================
# PHASE 2: Vehicle & Booking
# ===========================================
echo "================================================"
echo "PHASE 2: Vehicle & Booking Services"
echo "================================================"

seed_service "Vehicle Service" "$BACKEND_DIR/vehicle-service" || exit 1
seed_service "Booking Service" "$BACKEND_DIR/booking-service" || exit 1

# ===========================================
# PHASE 3: Financial Services
# ===========================================
echo "================================================"
echo "PHASE 3: Financial Services"
echo "================================================"

seed_service "Cost Service" "$BACKEND_DIR/cost-service" || exit 1
seed_service "Contract Service" "$BACKEND_DIR/contract-service" || exit 1

# ===========================================
# PHASE 4: Supporting Services
# ===========================================
echo "================================================"
echo "PHASE 4: Supporting Services"
echo "================================================"

seed_service "Notification Service" "$BACKEND_DIR/notification-service" || exit 1
seed_service "Admin Service" "$BACKEND_DIR/admin-service" || exit 1

# ===========================================
# PHASE 5: Optional Services
# ===========================================
echo "================================================"
echo "PHASE 5: Optional Services"
echo "================================================"

# AI Service (if implemented)
if [ -d "$BACKEND_DIR/ai-service/src/seeders" ]; then
    seed_service "AI Service" "$BACKEND_DIR/ai-service"
else
    echo -e "${YELLOW}⚠️  AI Service seeders not found, skipping${NC}"
fi

echo ""
echo "================================================"
echo -e "${GREEN}✅ ALL SEEDS COMPLETED SUCCESSFULLY!${NC}"
echo "================================================"
echo ""
echo "📊 Summary:"
echo "   - Auth Service: Users, KYC verifications"
echo "   - User Service: Profiles, Groups, Members, Votes, Fund transactions"
echo "   - Vehicle Service: Vehicles, Maintenance, Insurance, Charging"
echo "   - Booking Service: Bookings, Check-in/out logs"
echo "   - Cost Service: Costs, Splits, Payments, Wallets, Invoices"
echo "   - Contract Service: Templates, Contracts, Signatures"
echo "   - Notification Service: Templates, Notifications, Preferences"
echo "   - Admin Service: Staff, Disputes, System settings"
echo ""
echo "🔑 Test Credentials:"
echo "   Admin: admin@evcoownership.com / Password123!"
echo "   Staff: staff.nguyen@evcoownership.com / Password123!"
echo "   Co-owner: nguyen.van.a@gmail.com / Password123!"
echo ""
echo -e "${GREEN}🎉 Happy testing!${NC}"
