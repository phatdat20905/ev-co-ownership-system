# Testing Guide - EV Co-Ownership System

## Overview
This guide provides comprehensive testing procedures for all 6 integrated services in the EV Co-Ownership System.

**Current Status**: 85% Complete (6/7 services integrated)  
**Testing Priority**: CRITICAL - Must test before production deployment

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Database Migration](#database-migration)
3. [Service Testing](#service-testing)
4. [Integration Testing](#integration-testing)
5. [UI/UX Testing](#uiux-testing)
6. [Performance Testing](#performance-testing)
7. [Security Testing](#security-testing)
8. [Test Checklist](#test-checklist)

---

## Prerequisites

### 1. Environment Setup
```bash
# Start all backend services
docker-compose -f docker-compose.dev.yml up -d

# Verify all services are running
docker ps

# Expected services:
# - auth-service (3001)
# - user-service (3002)
# - booking-service (3003)
# - vehicle-service (3004)
# - cost-service (3005)
# - contract-service (3006)
# - notification-service (3007)
# - PostgreSQL (5432)
# - Redis (6379)
# - RabbitMQ (5672, 15672)
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Frontend should run on http://localhost:5173
```

---

## Database Migration

### ⚠️ CRITICAL: Run This First
This migration adds `phone_number` and `email` columns to the `user_profiles` table.

```bash
cd backend/user-service
npm run migrate
```

**Expected Output**:
```
== 20251110-add-phone-to-user-profile: migrating =======
== 20251110-add-phone-to-user-profile: migrated (0.123s)
```

**Verification**:
```sql
-- Connect to PostgreSQL
psql -h localhost -U postgres -d ev_co_ownership

-- Check columns exist
\d user_profiles

-- Should see:
-- phone_number | character varying(20)
-- email         | character varying(255)
```

**If Migration Fails**:
```bash
# Check database connection
npm run db:status

# Force migration
npm run migrate:undo
npm run migrate
```

---

## Service Testing

### 1. User Service (Zero-Error Design) ✅

#### Test 1.1: Registration Flow
```bash
# Test new user registration
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "Test123!",
    "name": "Test User"
  }'
```

**Expected Result**:
- ✅ User created in `users` table
- ✅ Profile auto-created in `user_profiles` table (zero-error behavior)
- ✅ Returns JWT token
- ✅ Status: 201 Created

**UI Test**:
1. Open http://localhost:5173/register
2. Fill form with test data
3. Submit registration
4. Should redirect to email verification page
5. Check console for no errors

#### Test 1.2: Login & Profile Auto-Create
```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "Test123!"
  }'
```

**Expected Result**:
- ✅ Returns JWT token
- ✅ Profile exists (auto-created if missing)
- ✅ No errors even if profile was missing

**UI Test**:
1. Login at http://localhost:5173/login
2. Navigate to Profile page
3. Should see default profile data
4. Update phone number and save
5. Refresh page - data should persist

#### Test 1.3: Profile Update (Upsert Pattern)
```bash
# Update profile
curl -X PUT http://localhost:3002/api/users/profile \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "0901234567",
    "email": "test@test.com",
    "address": "123 Test Street"
  }'
```

**Expected Result**:
- ✅ Profile updated successfully
- ✅ If profile didn't exist, it's created (upsert)
- ✅ Transaction committed properly
- ✅ Returns updated profile data

---

### 2. Booking Service (QR Code System) ✅

#### Test 2.1: Create Booking
**UI Test**:
1. Navigate to http://localhost:5173/dashboard/coowner/bookings
2. Click "New Booking" button
3. Select vehicle from calendar
4. Choose start/end dates and times
5. Submit booking
6. Should see success toast
7. Booking appears in list with "upcoming" status

**API Test**:
```bash
curl -X POST http://localhost:3003/api/bookings \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicle_id": "uuid-here",
    "start_time": "2025-11-15T10:00:00Z",
    "end_time": "2025-11-15T18:00:00Z"
  }'
```

#### Test 2.2: QR Code Check-In/Out
**UI Test**:
1. Open booking details
2. Click "Check-In" button
3. Scan QR code (or click "Simulate Scan")
4. Should see success message
5. Status changes to "in_use"
6. Upload usage photo (optional)
7. Click "Check-Out" button
8. Scan QR code again
9. Status changes to "completed"

**QR Code Format**:
```json
{
  "booking_id": "uuid",
  "vehicle_id": "uuid",
  "timestamp": "2025-11-10T10:00:00Z",
  "signature": "sha256-hash"
}
```

#### Test 2.3: Booking Calendar
**UI Test**:
1. View calendar at `/dashboard/coowner/bookings/calendar`
2. Should see all bookings color-coded:
   - 🟢 Green: Upcoming
   - 🔵 Blue: In Use
   - ⚪ Gray: Completed
   - 🔴 Red: Cancelled
3. Click on booking to view details
4. Drag-and-drop to reschedule (if upcoming)

---

### 3. Vehicle Service (Real-Time Monitoring) ✅

#### Test 3.1: Vehicle List with Filters
**UI Test**:
1. Navigate to http://localhost:5173/dashboard/coowner/vehicles
2. Should see list of all vehicles
3. Test filters:
   - Status: Available, In Use, Maintenance, Unavailable
   - Type: Sedan, SUV, Hatchback
   - Search by name or plate
4. Click "View Details" on a vehicle

#### Test 3.2: Vehicle Details - 4 Tabs
**UI Test**:
1. Open vehicle details page
2. **Tab 1 - Overview**:
   - Vehicle info (name, type, plate, battery)
   - Specifications (seats, range, charging)
   - Current status with color badge
3. **Tab 2 - Monitoring**:
   - Battery level with progress bar
   - GPS location on map
   - Speed, odometer, temperature
   - Real-time updates (every 30s)
4. **Tab 3 - Bookings**:
   - Upcoming bookings list
   - Past bookings history
   - Quick actions (view booking details)
5. **Tab 4 - Maintenance**:
   - Maintenance history
   - Upcoming service dates
   - Document attachments

#### Test 3.3: Real-Time Updates
**Test Scenario**:
1. Open vehicle monitoring tab
2. Simulate battery change in database:
```sql
UPDATE vehicles 
SET battery_level = 45 
WHERE id = 'vehicle-uuid';
```
3. Wait 30 seconds for auto-refresh
4. Battery level should update automatically

---

### 4. Payment Service (Expense Tracking) ✅

#### Test 4.1: Payment History
**UI Test**:
1. Navigate to http://localhost:5173/dashboard/coowner/payments
2. Should see list of all payments
3. Test filters:
   - Date range picker
   - Status: Paid, Pending, Overdue
   - Type: Booking, Maintenance, Insurance
4. Click on payment to view details

#### Test 4.2: Expense Tracking
**UI Test**:
1. Navigate to `/dashboard/coowner/payments/expenses`
2. View expense categories:
   - Fuel/Charging
   - Maintenance
   - Insurance
   - Registration
   - Other
3. See total expenses per category
4. Filter by date range
5. Export to CSV

#### Test 4.3: Cost Breakdown
**UI Test**:
1. Navigate to `/dashboard/coowner/payments/breakdown`
2. View cost per user (co-owners)
3. See ownership percentage
4. Calculate fair share distribution
5. View payment status for each owner

**API Test**:
```bash
# Get cost breakdown
curl -X GET http://localhost:3005/api/costs/breakdown?group_id=uuid \
  -H "Authorization: Bearer <TOKEN>"
```

---

### 5. Contract Service (Digital Signatures) 🆕

#### Test 5.1: Contract List with Filters
**UI Test**:
1. Navigate to http://localhost:5173/dashboard/coowner/contracts
2. View stats dashboard (5 cards):
   - Total Contracts
   - Active Contracts
   - Pending Signatures
   - Expired Contracts
   - Contracts Signed
3. Test search by contract name/number
4. Test status filter (all, active, pending, draft, expired, terminated)
5. Check expiration warnings (orange badge for ≤30 days)

#### Test 5.2: Contract Details - 5 Tabs
**UI Test**:
1. Click on a contract to view details
2. **Tab 1 - Overview**:
   - Description, vehicle info, contract value
   - Expiring soon alert (if applicable)
3. **Tab 2 - Parties**:
   - List of all parties with avatars
   - Roles (Owner, Co-owner)
   - Ownership percentages
   - Signature status per party
4. **Tab 3 - Terms**:
   - Full contract terms text
   - Formatted with proper line breaks
5. **Tab 4 - Signatures**:
   - Progress bar (signed/total)
   - Individual signer status with timestamps
   - "Signed" with green checkmark or "Pending" with clock icon
6. **Tab 5 - Documents**:
   - List of attachments
   - Download buttons for each document

#### Test 5.3: Digital Signature Workflow
**UI Test**:
1. Create new draft contract
2. Add parties (co-owners)
3. Define terms and conditions
4. Click "Send for Signature"
5. Each party should see "Needs Your Signature" alert
6. Click "Sign Contract" button
7. Complete signature process (ContractSignature modal)
8. Verify signature recorded with timestamp
9. When all parties sign, status changes to "Active"

#### Test 5.4: PDF Download
**UI Test**:
1. Open contract details
2. Click "Download PDF" button
3. Browser should download contract-[number].pdf
4. Open PDF and verify:
   - Contract information
   - All parties listed
   - Signature status
   - Terms and conditions

**API Test**:
```bash
# Download contract PDF
curl -X GET http://localhost:3006/api/contracts/uuid/download \
  -H "Authorization: Bearer <TOKEN>" \
  -o contract.pdf
```

---

### 6. Notification Service (Multi-Channel) 🆕

#### Test 6.1: Notification Settings
**UI Test**:
1. Navigate to http://localhost:5173/dashboard/coowner/settings/notifications
2. View 3 channel cards:
   - 📧 Email (Blue)
   - 📱 SMS (Green)
   - 🔔 Push (Purple)
3. Toggle each channel on/off
4. For each enabled channel, check notification types:
   - Booking confirmations
   - Booking reminders
   - Booking cancellations
   - Payment due alerts
   - Payment received
   - Vehicle maintenance
   - Contract expiry warnings
   - Group notifications
   - System updates
5. Click "Save" button
6. Verify toast success message
7. Refresh page - settings should persist

#### Test 6.2: Notification Preferences API
**API Test**:
```bash
# Get preferences
curl -X GET http://localhost:3007/api/notifications/preferences \
  -H "Authorization: Bearer <TOKEN>"

# Update preferences
curl -X PUT http://localhost:3007/api/notifications/preferences \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": {
      "enabled": true,
      "booking_confirmation": true,
      "payment_due": true
    },
    "sms": {
      "enabled": true,
      "booking_confirmation": true
    },
    "push": {
      "enabled": true,
      "booking_confirmation": true,
      "contract_expiry": true
    }
  }'
```

#### Test 6.3: WebSocket Connection (Frontend Ready)
**Note**: WebSocket backend not yet implemented. Frontend is ready with auto-reconnect logic.

**Frontend Test**:
1. Open browser console
2. Check for WebSocket connection attempts
3. Should see: "WebSocket connecting to ws://localhost:3007/ws"
4. Should retry up to 5 times with 3-second delay
5. After 5 failed attempts, should stop retrying

**When Backend Implemented**:
```bash
# Test WebSocket endpoint
wscat -c "ws://localhost:3007/ws?token=<JWT>&userId=<UUID>"

# Should receive:
# {"type":"connected","userId":"uuid"}

# Send test message:
# {"type":"subscribe","channel":"notifications"}

# Should receive notifications in real-time
```

---

## Integration Testing

### Test 1: Complete User Journey
**Scenario**: New user to active booking

1. **Registration** → User registers with email/password
2. **Profile** → Profile auto-created, user updates phone
3. **Browse Vehicles** → View available vehicles
4. **Create Booking** → Book vehicle for tomorrow
5. **Receive Notification** → Booking confirmation email
6. **Check-In** → QR scan to start usage
7. **Monitor Vehicle** → View real-time battery/location
8. **Check-Out** → QR scan to end usage
9. **View Payment** → See cost in payment history
10. **Sign Contract** → Digital signature for co-ownership

### Test 2: Multi-Party Contract Flow
**Scenario**: 3 co-owners signing contract

1. **Owner 1** creates draft contract
2. **Owner 1** adds Owner 2 and Owner 3 as parties
3. **Owner 1** sends contract for signatures
4. **Owner 2** receives notification, signs contract
5. **Owner 3** receives notification, signs contract
6. Contract status changes to "Active"
7. All parties can download PDF
8. All parties see contract in their list

### Test 3: Payment Distribution
**Scenario**: Cost sharing among co-owners

1. Create vehicle with 3 co-owners (33.33% each)
2. Record maintenance expense ($900)
3. System calculates: $300 per owner
4. Each owner sees their share in breakdown
5. Owners make payments
6. Track payment status per owner

---

## UI/UX Testing

### Test 1: Responsive Design
**Breakpoints to Test**:
- 📱 Mobile: 320px, 375px, 414px
- 📱 Tablet: 768px, 1024px
- 💻 Desktop: 1280px, 1440px, 1920px

**Pages to Test**:
- Contract List & Details
- Notification Settings
- Vehicle List & Details
- Booking Calendar
- Payment History

**Check**:
- ✅ All content visible (no overflow)
- ✅ Buttons touch-friendly (min 44px)
- ✅ Text readable (min 16px)
- ✅ Forms easy to fill
- ✅ Tables scroll horizontally if needed

### Test 2: Loading States
**Verify each page has**:
- ✅ Loading spinner or skeleton
- ✅ Disabled buttons during load
- ✅ Graceful error handling
- ✅ Retry button on errors

### Test 3: Toast Notifications
**Check consistency**:
- ✅ Success: Green with checkmark
- ✅ Error: Red with X icon
- ✅ Warning: Yellow with exclamation
- ✅ Info: Blue with info icon
- ✅ Auto-dismiss after 3-5 seconds
- ✅ Close button available

### Test 4: Accessibility
**Keyboard Navigation**:
- ✅ Tab through all interactive elements
- ✅ Enter/Space to activate buttons
- ✅ Escape to close modals
- ✅ Arrow keys for dropdowns

**Screen Reader**:
- ✅ All images have alt text
- ✅ Buttons have aria-labels
- ✅ Forms have proper labels
- ✅ Error messages announced

---

## Performance Testing

### Test 1: Page Load Times
**Target**: < 3 seconds on 3G

```bash
# Use Lighthouse
npm install -g lighthouse
lighthouse http://localhost:5173 --view
```

**Metrics**:
- ✅ First Contentful Paint: < 1.8s
- ✅ Largest Contentful Paint: < 2.5s
- ✅ Time to Interactive: < 3.8s
- ✅ Cumulative Layout Shift: < 0.1

### Test 2: API Response Times
**Target**: < 500ms per request

```bash
# Test API endpoints
ab -n 1000 -c 10 http://localhost:3002/api/users/profile
```

**Expected**:
- ✅ 95th percentile: < 500ms
- ✅ 99th percentile: < 1000ms
- ✅ Error rate: < 1%

### Test 3: Database Query Performance
```sql
-- Enable query timing
\timing

-- Test slow queries
EXPLAIN ANALYZE SELECT * FROM bookings WHERE user_id = 'uuid';

-- Should use index
-- Execution time: < 50ms
```

---

## Security Testing

### Test 1: Authentication
- ✅ JWT token required for all protected routes
- ✅ Token expires after 24 hours
- ✅ Refresh token mechanism works
- ✅ Invalid token returns 401
- ✅ Password hashed with bcrypt (10 rounds)

### Test 2: Authorization
- ✅ Users can only access their own data
- ✅ Co-owners can access shared resources
- ✅ Admin routes require admin role
- ✅ CORS configured properly

### Test 3: Input Validation
- ✅ SQL injection prevented (parameterized queries)
- ✅ XSS prevented (React auto-escaping)
- ✅ CSRF token on state-changing requests
- ✅ Rate limiting on auth endpoints

---

## Test Checklist

### Frontend Integration (6/7 Services = 85%)
- [x] User Service - Registration, Login, Profile
- [x] Booking Service - QR codes, Calendar, List
- [x] Vehicle Service - List, Details, 4 Tabs
- [x] Payment Service - History, Expenses, Breakdown
- [x] Contract Service - List, Details, 5 Tabs, PDF
- [x] Notification Service - Settings, Preferences
- [ ] AI Service - Predictive features (Optional)

### Database
- [ ] Migration executed successfully
- [ ] All tables created
- [ ] Foreign keys working
- [ ] Indexes created
- [ ] Seed data loaded

### API Endpoints
- [ ] All endpoints return correct status codes
- [ ] Error messages are user-friendly
- [ ] Pagination works (limit/offset)
- [ ] Filtering works (query parameters)
- [ ] Sorting works (order by)

### UI Components
- [ ] All pages load without errors
- [ ] Forms validate input
- [ ] Buttons have loading states
- [ ] Icons display correctly (lucide-react)
- [ ] Modals open/close properly
- [ ] Dropdowns work
- [ ] Date pickers functional

### User Experience
- [ ] Navigation smooth (no flashing)
- [ ] Toast notifications appear
- [ ] Loading spinners show
- [ ] Empty states display
- [ ] Error messages helpful
- [ ] Success feedback clear

### Responsive Design
- [ ] Mobile (320px-767px) works
- [ ] Tablet (768px-1023px) works
- [ ] Desktop (1024px+) works
- [ ] Touch targets ≥ 44px
- [ ] No horizontal scroll

### Performance
- [ ] Page load < 3s
- [ ] API response < 500ms
- [ ] Images optimized
- [ ] Code splitting implemented
- [ ] Lazy loading used

### Security
- [ ] JWT authentication works
- [ ] Protected routes secure
- [ ] Input sanitized
- [ ] CORS configured
- [ ] Rate limiting active

---

## Next Steps

### Immediate (CRITICAL)
1. ✅ Fix heroicons import (DONE - replaced with lucide-react)
2. ⏳ Run database migration
3. ⏳ Test registration flow end-to-end
4. ⏳ Verify all 6 services working

### This Week (HIGH)
1. Implement WebSocket backend
2. Complete end-to-end testing
3. Add React error boundaries
4. Implement loading skeletons

### Next Week (MEDIUM)
1. UI/UX polish
2. Performance optimization
3. Accessibility audit
4. Security hardening

### Optional (LOW)
1. AI Service implementation
2. Advanced analytics
3. Mobile app development
4. Internationalization

---

## Support

For issues or questions:
- 📧 Email: support@evco.com
- 💬 Slack: #testing-team
- 📖 Docs: /docs/README.md
- 🐛 Issues: GitHub Issues

**Last Updated**: November 10, 2025  
**Version**: 1.0.0  
**Status**: 85% Complete (6/7 Services Integrated)
