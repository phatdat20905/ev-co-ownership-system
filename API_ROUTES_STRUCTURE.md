# API Routes Structure - EV Co-ownership System

## 📋 Overview
All APIs follow consistent structure: `http://localhost:3000/api/v1/<service>/<endpoint>`

---

## 🔐 Auth Service (Port 3001)
**Base URL**: `/api/v1/auth`

### Public Routes (No Authentication)
- `POST /api/v1/auth/login` - Login with email/phone + password
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password with token
- `POST /api/v1/auth/verify-email` - Verify email with token

### Protected Routes (Requires Authentication)
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/profile` - Get user profile
- `POST /api/v1/auth/send-verification-email` - Resend verification email

### KYC Routes
- `POST /api/v1/auth/kyc/submit` - Submit KYC documents
- `GET /api/v1/auth/kyc/status/:userId` - Get KYC status
- `PUT /api/v1/auth/kyc/verify/:kycId` - Verify KYC (admin only)
- `PUT /api/v1/auth/kyc/reject/:kycId` - Reject KYC (admin only)

---

## 👤 User Service (Port 3002)
**Base URL**: `/api/v1/user`

### User Management
- `GET /api/v1/user/:id` - Get user profile
- `PUT /api/v1/user/:id` - Update user profile
- `POST /api/v1/user/:id/avatar` - Upload avatar
- `DELETE /api/v1/user/:id` - Deactivate account

### Group Management
- `GET /api/v1/user/groups` - List all groups
- `POST /api/v1/user/groups` - Create new group
- `GET /api/v1/user/groups/:id` - Get group details
- `PUT /api/v1/user/groups/:id` - Update group
- `DELETE /api/v1/user/groups/:id` - Delete group
- `POST /api/v1/user/groups/:id/join` - Join group
- `POST /api/v1/user/groups/:id/leave` - Leave group

### Voting
- `GET /api/v1/user/votes` - List all votes
- `POST /api/v1/user/votes` - Create new vote
- `GET /api/v1/user/votes/:id` - Get vote details
- `POST /api/v1/user/votes/:id/cast` - Cast vote
- `PUT /api/v1/user/votes/:id/close` - Close vote

### Fund Management
- `GET /api/v1/user/fund/balance` - Get fund balance
- `POST /api/v1/user/fund/contribute` - Contribute to fund
- `GET /api/v1/user/fund/transactions` - Get fund transactions

---

## 📅 Booking Service (Port 3003)
**Base URL**: `/api/v1/bookings`

### Booking Management
- `GET /api/v1/bookings` - List user bookings
- `POST /api/v1/bookings` - Create new booking
- `GET /api/v1/bookings/:id` - Get booking details
- `PUT /api/v1/bookings/:id` - Update booking
- `DELETE /api/v1/bookings/:id` - Cancel booking

### Calendar
- `GET /api/v1/bookings/calendar/availability` - Check vehicle availability
- `GET /api/v1/bookings/calendar/month/:year/:month` - Get month calendar
- `GET /api/v1/bookings/calendar/vehicle/:vehicleId` - Get vehicle calendar

### Check-In/Out
- `POST /api/v1/bookings/check-in-out/check-in/:bookingId` - Check-in with QR
- `POST /api/v1/bookings/check-in-out/check-out/:bookingId` - Check-out with QR
- `GET /api/v1/bookings/check-in-out/qr/:bookingId` - Generate QR code

### Conflicts
- `GET /api/v1/bookings/conflicts` - List booking conflicts
- `POST /api/v1/bookings/conflicts/:id/resolve` - Resolve conflict

### Admin Routes
- `GET /api/v1/bookings/admin/all` - List all bookings (admin)
- `PUT /api/v1/bookings/admin/:id/approve` - Approve booking (admin)
- `PUT /api/v1/bookings/admin/:id/reject` - Reject booking (admin)

---

## 💰 Cost Service (Port 3004)
**Base URL**: `/api/v1/costs`

### Cost Management
- `GET /api/v1/costs` - List all costs
- `POST /api/v1/costs` - Create new cost entry
- `GET /api/v1/costs/:id` - Get cost details
- `PUT /api/v1/costs/:id` - Update cost
- `DELETE /api/v1/costs/:id` - Delete cost

### Payments
- `GET /api/v1/costs/payments` - List payments
- `POST /api/v1/costs/payments` - Create payment
- `GET /api/v1/costs/payments/:id` - Get payment details
- `PUT /api/v1/costs/payments/:id/confirm` - Confirm payment

### Wallets
- `GET /api/v1/costs/wallets/:userId` - Get user wallet
- `POST /api/v1/costs/wallets/deposit` - Deposit to wallet
- `POST /api/v1/costs/wallets/withdraw` - Withdraw from wallet
- `GET /api/v1/costs/wallets/transactions` - Get wallet transactions

### Group Wallets
- `GET /api/v1/costs/group-wallets/:groupId` - Get group wallet
- `POST /api/v1/costs/group-wallets/contribute` - Contribute to group wallet
- `GET /api/v1/costs/group-wallets/:groupId/transactions` - Group wallet transactions

### Cost Splitting
- `POST /api/v1/costs/splits` - Create cost split
- `GET /api/v1/costs/splits/:costId` - Get cost split details
- `PUT /api/v1/costs/splits/:id/update` - Update split

### Invoices
- `GET /api/v1/costs/invoices` - List invoices
- `POST /api/v1/costs/invoices/generate` - Generate invoice
- `GET /api/v1/costs/invoices/:id/download` - Download invoice PDF

### Reports
- `GET /api/v1/costs/reports/summary` - Get cost summary
- `GET /api/v1/costs/reports/monthly/:year/:month` - Monthly cost report
- `GET /api/v1/costs/reports/group/:groupId` - Group cost report

---

## 🚗 Vehicle Service (Port 3005)
**Base URL**: `/api/v1/vehicles`

### Vehicle Management
- `GET /api/v1/vehicles` - List all vehicles
- `POST /api/v1/vehicles` - Add new vehicle
- `GET /api/v1/vehicles/:id` - Get vehicle details
- `PUT /api/v1/vehicles/:id` - Update vehicle
- `DELETE /api/v1/vehicles/:id` - Remove vehicle

### Maintenance
- `GET /api/v1/vehicles/maintenance` - List maintenance records
- `POST /api/v1/vehicles/maintenance` - Create maintenance record
- `GET /api/v1/vehicles/maintenance/:id` - Get maintenance details
- `PUT /api/v1/vehicles/maintenance/:id/complete` - Mark complete

### Insurance
- `GET /api/v1/vehicles/insurance/:vehicleId` - Get insurance info
- `POST /api/v1/vehicles/insurance` - Add insurance policy
- `PUT /api/v1/vehicles/insurance/:id` - Update insurance
- `DELETE /api/v1/vehicles/insurance/:id` - Remove insurance

### Charging
- `GET /api/v1/vehicles/charging/sessions` - List charging sessions
- `POST /api/v1/vehicles/charging/start` - Start charging session
- `POST /api/v1/vehicles/charging/stop/:sessionId` - Stop charging
- `GET /api/v1/vehicles/charging/history/:vehicleId` - Charging history

### Analytics
- `GET /api/v1/vehicles/analytics/usage/:vehicleId` - Vehicle usage stats
- `GET /api/v1/vehicles/analytics/performance` - Performance metrics
- `GET /api/v1/vehicles/analytics/costs/:vehicleId` - Cost analytics

### Admin Routes
- `PUT /api/v1/vehicles/admin/:id/activate` - Activate vehicle
- `PUT /api/v1/vehicles/admin/:id/deactivate` - Deactivate vehicle

---

## 📄 Contract Service (Port 3006)
**Base URL**: `/api/v1/contracts`

### Contract Management
- `GET /api/v1/contracts` - List contracts
- `POST /api/v1/contracts` - Create new contract
- `GET /api/v1/contracts/:id` - Get contract details
- `PUT /api/v1/contracts/:id` - Update contract
- `DELETE /api/v1/contracts/:id` - Delete contract

### Signatures
- `GET /api/v1/contracts/signatures/:contractId` - Get signatures
- `POST /api/v1/contracts/signatures/:contractId/sign` - Sign contract
- `GET /api/v1/contracts/signatures/status/:contractId` - Signature status

### Parties
- `GET /api/v1/contracts/parties/:contractId` - List parties
- `POST /api/v1/contracts/parties/:contractId` - Add party
- `DELETE /api/v1/contracts/parties/:id` - Remove party

### Documents
- `GET /api/v1/contracts/documents/:contractId` - List documents
- `POST /api/v1/contracts/documents/upload` - Upload document
- `GET /api/v1/contracts/documents/:id/download` - Download document
- `DELETE /api/v1/contracts/documents/:id` - Delete document

### Amendments
- `GET /api/v1/contracts/amendments/:contractId` - List amendments
- `POST /api/v1/contracts/amendments` - Create amendment
- `PUT /api/v1/contracts/amendments/:id/approve` - Approve amendment

### Templates
- `GET /api/v1/contracts/templates` - List contract templates
- `POST /api/v1/contracts/templates` - Create template
- `GET /api/v1/contracts/templates/:id` - Get template
- `PUT /api/v1/contracts/templates/:id` - Update template

---

## 🔔 Notification Service (Port 3008)
**Base URL**: `/api/v1/notifications`

### Notifications
- `GET /api/v1/notifications` - List user notifications
- `GET /api/v1/notifications/:id` - Get notification details
- `PUT /api/v1/notifications/:id/read` - Mark as read
- `PUT /api/v1/notifications/read-all` - Mark all as read
- `DELETE /api/v1/notifications/:id` - Delete notification

### Templates
- `GET /api/v1/notifications/templates` - List templates
- `POST /api/v1/notifications/templates` - Create template
- `PUT /api/v1/notifications/templates/:id` - Update template

### Preferences
- `GET /api/v1/notifications/preferences` - Get user preferences
- `PUT /api/v1/notifications/preferences` - Update preferences

---

## 🤖 AI Service (Port 3009)
**Base URL**: `/api/v1/ai`

### Schedule Optimization
- `POST /api/v1/ai/schedule/optimize` - Get schedule recommendations
- `GET /api/v1/ai/schedule/suggestions/:userId` - Get user suggestions

### Cost Analysis
- `POST /api/v1/ai/cost/analyze` - Analyze cost patterns
- `GET /api/v1/ai/cost/predictions/:groupId` - Cost predictions

### Dispute Resolution
- `POST /api/v1/ai/dispute/analyze` - Analyze dispute
- `GET /api/v1/ai/dispute/recommendations/:disputeId` - Get recommendations

### Analytics
- `GET /api/v1/ai/analytics/insights/:userId` - User insights
- `GET /api/v1/ai/analytics/patterns/:groupId` - Group patterns
- `GET /api/v1/ai/analytics/trends` - System trends

### Feedback
- `POST /api/v1/ai/feedback` - Submit AI feedback
- `GET /api/v1/ai/feedback/accuracy` - Get accuracy metrics

---

## 👨‍💼 Admin Service (Port 3007)
**Base URL**: `/api/v1/admin`

### Dashboard
- `GET /api/v1/admin/dashboard/stats` - Dashboard statistics
- `GET /api/v1/admin/dashboard/activities` - Recent activities
- `GET /api/v1/admin/dashboard/alerts` - System alerts

### Staff Management
- `GET /api/v1/admin/staff` - List staff members
- `POST /api/v1/admin/staff` - Add staff member
- `PUT /api/v1/admin/staff/:id` - Update staff
- `DELETE /api/v1/admin/staff/:id` - Remove staff
- `PUT /api/v1/admin/staff/:id/permissions` - Update permissions

### Disputes
- `GET /api/v1/admin/disputes` - List all disputes
- `GET /api/v1/admin/disputes/:id` - Get dispute details
- `PUT /api/v1/admin/disputes/:id/resolve` - Resolve dispute
- `POST /api/v1/admin/disputes/:id/escalate` - Escalate dispute

### KYC Verification
- `GET /api/v1/admin/kyc/pending` - List pending KYC
- `GET /api/v1/admin/kyc/:id` - Get KYC details
- `PUT /api/v1/admin/kyc/:id/approve` - Approve KYC
- `PUT /api/v1/admin/kyc/:id/reject` - Reject KYC

### System Management
- `GET /api/v1/admin/system/health` - System health check
- `GET /api/v1/admin/system/logs` - System logs
- `PUT /api/v1/admin/system/settings` - Update settings
- `POST /api/v1/admin/system/backup` - Trigger backup

### Analytics
- `GET /api/v1/admin/analytics/users` - User analytics
- `GET /api/v1/admin/analytics/bookings` - Booking analytics
- `GET /api/v1/admin/analytics/revenue` - Revenue analytics
- `GET /api/v1/admin/analytics/reports` - Generate reports

---

## 🔧 API Gateway Configuration

### Service Mapping
```javascript
{
  auth: 'http://localhost:3001',
  user: 'http://localhost:3002',
  booking: 'http://localhost:3003',
  cost: 'http://localhost:3004',
  vehicle: 'http://localhost:3005',
  contract: 'http://localhost:3006',
  admin: 'http://localhost:3007',
  notification: 'http://localhost:3008',
  ai: 'http://localhost:3009'
}
```

### Authentication
- **Public Routes**: `/api/v1/auth/*` (no token required)
- **Protected Routes**: All other routes require JWT token in `Authorization: Bearer <token>` header
- **Admin Routes**: `/api/v1/admin/*` requires admin role

### Rate Limiting
- **General**: 1000 requests / 15 minutes
- **Login**: 100 requests / 15 minutes (development)
- **Auth**: 5 requests / 15 minutes (skipSuccessful: true)
- **Strict**: 10 requests / 1 minute

---

## 📝 Request/Response Format

### Standard Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "metadata": {
    "timestamp": "2025-11-09T07:30:00.000Z",
    "requestId": "req_xxx_yyy"
  }
}
```

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": { ... }
  },
  "metadata": {
    "timestamp": "2025-11-09T07:30:00.000Z",
    "requestId": "req_xxx_yyy",
    "service": "service-name"
  }
}
```

---

## 🚀 Testing

### Health Checks
All services expose health endpoint:
```bash
GET http://localhost:3000/health              # API Gateway
GET http://localhost:3001/api/v1/health       # Auth Service
GET http://localhost:3002/api/v1/health       # User Service
# ... etc for all services
```

### Example Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@evcoownership.com",
    "password": "123456"
  }'
```

### Example Authenticated Request
```bash
curl http://localhost:3000/api/v1/user/profile \
  -H "Authorization: Bearer <your-token>"
```

---

**Last Updated**: November 9, 2025  
**API Version**: v1  
**Gateway Port**: 3000
