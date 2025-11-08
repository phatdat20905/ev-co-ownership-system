# EV Co-ownership & Cost-sharing System

Hệ thống quản lý đồng sở hữu và chia sẻ chi phí xe điện

## 🏗️ Architecture
- **Frontend**: React.js + Vite + Tailwind CSS
- **Backend**: Node.js + Express.js (Microservices)
- **Database**: PostgreSQL + MongoDB
- **Infrastructure**: Docker + Redis + RabbitMQ + Apache NiFi
- **Data Flow**: Apache NiFi for ETL and event stream processing

## 🚀 Quick Start

### Development
```bash
# Clone và cài đặt
git clone <repository-url>
cd ev-coownership-system

# Copy environment variables
cp .env.example .env

# Khởi chạy với Docker
docker-compose up -d

# Hoặc chạy development mode
docker-compose -f docker-compose.dev.yml up -d

# Start specific services with profiles
docker compose -f docker-compose.dev.yml --profile auth up -d

# Start NiFi for data flow orchestration
docker compose -f docker-compose.dev.yml up -d nifi

# Setup NiFi drivers (required for first-time setup)
cd infrastructure/nifi
# On Windows:
.\setup.ps1
# On Linux/Mac:
chmod +x setup.sh && ./setup.sh
cd ../..
```

### Access Services

- **Frontend**: http://localhost:5173
- **API Gateway**: http://localhost:3000
- **Auth Service**: http://localhost:3001
- **User Service**: http://localhost:3002
- **Booking Service**: http://localhost:3003
- **Cost Service**: http://localhost:3004
- **Vehicle Service**: http://localhost:3005
- **Contract Service**: http://localhost:3006
- **Admin Service**: http://localhost:3007
- **Notification Service**: http://localhost:3008
- **AI Service**: http://localhost:3009
- **RabbitMQ Management**: http://localhost:15672 (admin/admin123)
- **NiFi UI**: http://localhost:8080/nifi (admin/nifiAdminPassword123)

---

## 🎯 Frontend-Backend Integration Status

### ✅ COMPLETED (Phase 1-4)

#### Service Layer (193 methods)
- ✅ **Auth Service**: 10 methods
- ✅ **User Service**: 24 methods  
- ✅ **Booking Service**: 18 methods
- ✅ **Cost Service**: 26 methods
- ✅ **Vehicle Service**: 32 methods
- ✅ **Contract Service**: 23 methods
- ✅ **AI Service**: 15 methods
- ✅ **Admin Service**: 37 methods

#### Integrated Pages (8 pages)

**Phase 1: Authentication** ✅ `796fd3f0`
- Login.jsx - JWT authentication
- Register.jsx - User registration

**Phase 2: User Management** ✅ `9dc29e7c`
- Profile.jsx - Profile CRUD
- GroupManagement.jsx - Group & member management

**Phase 3: Booking System** ✅ `964f22ce`
- BookingCalendar.jsx - Calendar view
- BookingForm.jsx - Create bookings

**Phase 4: Cost Management** ✅ `28135cf6`
- ExpenseTracking.jsx - Expense analytics
- PaymentHistory.jsx - Payment history

### Key Features
- JWT token auto-management with refresh
- Axios interceptors for auth & error handling
- Toast notifications for user feedback
- Loading states for all API calls
- LocalStorage sync across tabs
- Standardized error handling

### Dependencies
```json
{
  "axios": "^1.6.0",
  "react-toastify": "^9.1.0"
}
```

---
