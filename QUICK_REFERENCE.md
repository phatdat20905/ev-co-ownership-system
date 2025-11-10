# 🚀 Quick Reference Guide - EV Co-ownership System

**Fast lookup for common tasks and commands**

## 🎯 Getting Started in 5 Minutes

```bash
# 1. Clone and setup
git clone <repo>
cd ev-co-ownership-system

# 2. Start with Docker (RECOMMENDED)
docker-compose -f docker-compose.dev.yml up -d

# 3. Run migrations (CRITICAL!)
cd backend/user-service
npm run migrate

# 4. Access app
# Frontend: http://localhost:5173
# API Gateway: http://localhost:3000
```

---

## 📍 Service Ports Quick Reference

| Service | Port | Status | URL |
|---------|------|--------|-----|
| Frontend | 5173 | ✅ | http://localhost:5173 |
| API Gateway | 3000 | ✅ | http://localhost:3000 |
| Auth | 3001 | ✅ | http://localhost:3001 |
| User | 3002 | ✅ | http://localhost:3002 |
| Booking | 3003 | ✅ | http://localhost:3003 |
| Vehicle | 3004 | ✅ | http://localhost:3004 |
| Cost | 3005 | ✅ | http://localhost:3005 |
| Contract | 3006 | ⏳ | http://localhost:3006 |
| Notification | 3007 | ⏳ | http://localhost:3007 |
| AI | 3009 | 📋 | http://localhost:3009 |
| RabbitMQ UI | 15672 | ✅ | http://localhost:15672 |

---

## 🔥 Most Common Commands

### Start Services
```bash
# Start all services (Docker)
docker-compose -f docker-compose.dev.yml up -d

# Start individual service
cd backend/user-service
npm run dev

# Start frontend only
cd frontend
npm run dev
```

### Stop Services
```bash
# Stop all Docker services
docker-compose -f docker-compose.dev.yml down

# Stop and remove volumes
docker-compose -f docker-compose.dev.yml down -v
```

### Database Operations
```bash
# Run migrations
cd backend/user-service
npm run migrate

# Rollback last migration
npm run migrate:undo

# Check database
docker exec -it ev-postgres psql -U postgres -d ev_db_user
```

### Logs & Debugging
```bash
# View service logs
docker-compose -f docker-compose.dev.yml logs -f user-service

# View all logs
docker-compose -f docker-compose.dev.yml logs -f

# Clear logs
cd backend/user-service/logs
rm *.log
```

---

## 🧪 Testing Quick Commands

### Test Registration Flow
```bash
# 1. Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","name":"Test"}'

# 2. Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!"}'

# 3. Get profile (auto-creates if missing)
curl http://localhost:3002/api/user/profile \
  -H "Authorization: Bearer <token>"
```

### Debug Database
```bash
# Check user exists
docker exec -it ev-postgres psql -U postgres -d ev_db_auth \
  -c "SELECT * FROM users WHERE email='test@test.com';"

# Check profile
docker exec -it ev-postgres psql -U postgres -d ev_db_user \
  -c "SELECT * FROM user_profiles WHERE user_id='<id>';"

# Count records
docker exec -it ev-postgres psql -U postgres -d ev_db_user \
  -c "SELECT COUNT(*) FROM user_profiles;"
```

---

## 📂 Key Files Quick Reference

### Backend Files
```
backend/
├── user-service/
│   ├── src/services/userService.js     # 🔥 v2.0 zero-error logic
│   ├── src/controllers/userController.js
│   ├── src/migrations/                  # ⚠️ Run these!
│   └── src/models/userProfile.js
│
├── booking-service/
│   ├── src/services/bookingService.js
│   ├── src/controllers/bookingController.js
│   └── src/models/booking.js
│
└── vehicle-service/
    ├── src/services/vehicleService.js
    └── src/models/vehicle.js
```

### Frontend Files
```
frontend/src/
├── pages/
│   ├── auth/
│   │   ├── Login.jsx                   # ✅ JWT auth
│   │   ├── Register.jsx                # ✅ Multi-step
│   │   └── VerifyEmail.jsx             # ✅ Email verify
│   │
│   ├── bookings/
│   │   ├── BookingList.jsx             # ✅ With filters
│   │   ├── BookingDetails.jsx          # ✅ Full details
│   │   └── BookingCalendar.jsx         # ✅ Calendar view
│   │
│   ├── vehicles/
│   │   ├── VehicleList.jsx             # ✅ Grid + filters
│   │   └── VehicleDetails.jsx          # ✅ 4 tabs
│   │
│   └── payments/
│       ├── PaymentHistory.jsx          # ✅ History
│       └── ExpenseTracking.jsx         # ✅ Analytics
│
├── components/
│   ├── booking/BookingQRCode.jsx       # ✅ QR codes
│   └── vehicle/VehicleStatus.jsx       # ✅ Status badge
│
└── services/
    ├── user.service.js                 # ✅ 24 methods
    ├── booking.service.js              # ✅ 18 methods
    ├── vehicle.service.js              # ✅ 32 methods
    └── cost.service.js                 # ✅ 26 methods
```

---

## 🔧 Troubleshooting Quick Fixes

### Issue: "Profile not found"
**Status**: ✅ FIXED in v2.0  
**Fix**: User service auto-creates profiles now. No action needed.

### Issue: "Connection refused" errors
```bash
# Check if service is running
docker ps

# Restart service
docker-compose -f docker-compose.dev.yml restart user-service

# Check logs
docker-compose logs user-service
```

### Issue: Missing database columns
```bash
# Run migrations
cd backend/user-service
npm run migrate
```

### Issue: Port already in use
```bash
# Find process using port (e.g., 3002)
netstat -ano | findstr :3002

# Kill process (replace PID)
taskkill /PID <PID> /F

# Or change port in .env file
PORT=3012
```

### Issue: Frontend can't connect to backend
```bash
# Check frontend .env
# frontend/.env:
VITE_API_URL=http://localhost:3000/api

# Restart frontend
cd frontend
npm run dev
```

---

## 📚 Documentation Quick Links

| Document | Description |
|----------|-------------|
| [README.md](./README.md) | Main project overview |
| [INTEGRATION_STATUS.md](./docs/INTEGRATION_STATUS.md) | 70% project status (800 lines) |
| [USER_SERVICE_REDESIGN.md](./docs/USER_SERVICE_REDESIGN.md) | v2.0 complete guide (500 lines) |
| [USER_SERVICE_FIX.md](./docs/USER_SERVICE_FIX.md) | Transaction fixes (300 lines) |
| [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) | This file |

---

## 🎯 Current Project Status

### ✅ Completed (4/7 services - 70%)
- User Service v2.0 (zero-error philosophy)
- Booking Service (QR codes, calendar, CRUD)
- Vehicle Service (monitoring, tracking, history)
- Payment Service (expenses, breakdown, history)

### ⏳ In Progress (2/7 services)
- Contract Service (component ready, needs pages)
- Notification Service (polling works, needs WebSocket)

### 📋 Planned (1/7 services)
- AI Service (predictive maintenance, cost optimization)

---

## ⚠️ Critical TODOs

### MUST DO BEFORE TESTING
```bash
# 1. Run database migration
cd backend/user-service
npm run migrate

# 2. Test registration flow end-to-end
# Register → Verify Email → Login → Get Profile

# 3. Verify no errors in logs
docker-compose logs -f user-service
```

### NEXT PRIORITIES
1. **Contract Service Integration** (HIGH)
   - Create ContractList.jsx page
   - Add PDF viewer
   - Multi-party signing workflow

2. **Notification WebSocket** (MEDIUM)
   - Real-time push notifications
   - Settings page for preferences

3. **Testing Suite** (MEDIUM)
   - Unit tests for services
   - E2E tests with Cypress
   - Integration tests

---

## 💡 Pro Tips

### Performance
```javascript
// Use React.memo for expensive components
export default React.memo(VehicleList);

// Use raw queries for read-only operations
const profile = await db.UserProfile.findOne({
  where: { userId },
  raw: true  // Faster
});
```

### Debugging
```bash
# Enable debug logs
NODE_ENV=development npm run dev

# Watch logs in real-time
tail -f backend/user-service/logs/combined.log

# Check API responses
curl -v http://localhost:3002/api/user/profile \
  -H "Authorization: Bearer <token>"
```

### Development
```bash
# Hot reload frontend
cd frontend
npm run dev

# Nodemon for backend
cd backend/user-service
npm run dev  # Already uses nodemon

# Run tests on file change
npm run test:watch
```

---

## 🚀 Next Session Checklist

When you return to development:

- [ ] Pull latest changes: `git pull`
- [ ] Start Docker services: `docker-compose -f docker-compose.dev.yml up -d`
- [ ] Check migrations: `cd backend/user-service && npm run migrate`
- [ ] Start frontend: `cd frontend && npm run dev`
- [ ] Check logs: `docker-compose logs -f`
- [ ] Test registration flow end-to-end
- [ ] Review INTEGRATION_STATUS.md for current progress

---

**Last Updated**: Current Session  
**Project Status**: 70% Complete (4/7 services integrated)  
**Next Milestone**: Contract Service Integration + Testing

---

**🔗 Quick Links:**
- Frontend: http://localhost:5173
- API Gateway: http://localhost:3000
- RabbitMQ: http://localhost:15672 (admin/admin123)
- PostgreSQL: `docker exec -it ev-postgres psql -U postgres`
