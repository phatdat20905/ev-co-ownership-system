# 📡 API ENDPOINTS DOCUMENTATION
## EV Co-ownership & Cost-sharing System

**Base URL:** `http://localhost:3000/api/v1`

**Response Format:** Tất cả API trả về format chuẩn:
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```

**Error Format:**
```json
{
  "success": false,
  "message": "Error message",
  "error": "Error details"
}
```

**Authentication:** Hầu hết endpoints yêu cầu JWT token trong header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 AUTH SERVICE (Port 3001)

### POST `/auth/register`
Đăng ký tài khoản mới

**Request Body:**
```json
{
  "email": "user@example.com",
  "phone": "+84987654321",
  "password": "SecurePass123!",
  "fullName": "Nguyễn Văn A",
  "dateOfBirth": "1990-01-15",
  "address": "123 Nguyễn Huệ, Q1, TP.HCM"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đăng ký thành công. Vui lòng kiểm tra email để xác thực.",
  "data": {
    "userId": "uuid-xxx-xxx",
    "email": "user@example.com",
    "verificationEmailSent": true
  }
}
```

---

### POST `/auth/login`
Đăng nhập

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "user": {
      "id": "uuid-xxx",
      "email": "user@example.com",
      "fullName": "Nguyễn Văn A",
      "role": "co-owner",
      "isVerified": true,
      "kycStatus": "approved"
    },
    "token": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": "24h"
  }
}
```

---

### POST `/auth/refresh-token`
Làm mới access token

**Request Body:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

---

### POST `/auth/logout`
Đăng xuất

**Headers:** `Authorization: Bearer <token>`

---

### POST `/auth/forgot-password`
Quên mật khẩu

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

---

### POST `/auth/reset-password`
Reset mật khẩu

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePass123!"
}
```

---

### POST `/auth/verify-email`
Xác thực email

**Request Body:**
```json
{
  "token": "verification-token-from-email"
}
```

---

### POST `/auth/change-password`
Đổi mật khẩu (yêu cầu đăng nhập)

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!"
}
```

---

### POST `/auth/kyc/submit`
Gửi KYC verification

**Headers:** `Authorization: Bearer <token>`

**Request Body (multipart/form-data):**
```
idCardNumber: 001234567890
driverLicenseNumber: B2-12345678
idCardFront: <file>
idCardBack: <file>
selfie: <file>
driverLicense: <file>
```

---

### GET `/auth/kyc/status`
Xem trạng thái KYC

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "approved",
    "submittedAt": "2024-01-15T10:30:00Z",
    "approvedAt": "2024-01-16T14:20:00Z",
    "notes": ""
  }
}
```

---

## 👤 USER SERVICE (Port 3002)

### GET `/user/profile`
Lấy thông tin profile

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-xxx",
    "email": "user@example.com",
    "fullName": "Nguyễn Văn A",
    "phone": "+84987654321",
    "avatar": "https://...",
    "dateOfBirth": "1990-01-15",
    "address": "123 Nguyễn Huệ...",
    "kycStatus": "approved",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### PUT `/user/profile`
Cập nhật profile

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "fullName": "Nguyễn Văn A Updated",
  "phone": "+84987654321",
  "address": "456 Lê Lợi, Q1, TP.HCM"
}
```

---

### POST `/user/avatar`
Upload avatar

**Headers:** `Authorization: Bearer <token>`

**Request Body (multipart/form-data):**
```
avatar: <file>
```

---

### POST `/user/groups`
Tạo nhóm đồng sở hữu mới

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "groupName": "Nhóm Xe Tesla Model 3",
  "description": "Nhóm đồng sở hữu xe điện Tesla",
  "rules": "Quy định sử dụng xe: ..."
}
```

---

### GET `/user/groups`
Lấy danh sách nhóm của user

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "group-uuid-1",
      "groupName": "Nhóm Xe Tesla Model 3",
      "role": "admin",
      "ownershipPercentage": 40,
      "memberCount": 3,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### GET `/user/groups/:groupId`
Chi tiết nhóm

**Headers:** `Authorization: Bearer <token>`

---

### GET `/user/groups/:groupId/members`
Danh sách thành viên nhóm

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "userId": "uuid-1",
      "fullName": "Nguyễn Văn A",
      "email": "userA@example.com",
      "role": "admin",
      "ownershipPercentage": 40,
      "joinedAt": "2024-01-01T00:00:00Z",
      "status": "active"
    },
    {
      "userId": "uuid-2",
      "fullName": "Trần Thị B",
      "email": "userB@example.com",
      "role": "member",
      "ownershipPercentage": 30,
      "joinedAt": "2024-01-05T00:00:00Z",
      "status": "active"
    }
  ]
}
```

---

### POST `/user/groups/:groupId/members`
Thêm thành viên vào nhóm

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "email": "newmember@example.com",
  "ownershipPercentage": 20,
  "role": "member"
}
```

---

### PUT `/user/groups/:groupId/members/:userId/ownership`
Cập nhật tỷ lệ sở hữu

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "ownershipPercentage": 35
}
```

---

### DELETE `/user/groups/:groupId/members/:userId`
Xóa thành viên khỏi nhóm

**Headers:** `Authorization: Bearer <token>`

---

### GET `/user/groups/:groupId/votes`
Lấy danh sách bỏ phiếu của nhóm

**Headers:** `Authorization: Bearer <token>`

---

### POST `/user/groups/:groupId/votes`
Tạo bỏ phiếu mới

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Nâng cấp hệ thống âm thanh",
  "description": "Đề xuất lắp loa JBL với chi phí 8.000.000đ",
  "category": "upgrade",
  "deadline": "2024-02-15T23:59:59Z",
  "options": [
    { "text": "Đồng ý" },
    { "text": "Không đồng ý" }
  ]
}
```

---

### POST `/user/votes/:voteId/cast`
Bỏ phiếu

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "optionId": "option-uuid-1"
}
```

---

### PUT `/user/votes/:voteId/close`
Đóng bỏ phiếu

**Headers:** `Authorization: Bearer <token>`

---

### GET `/user/groups/:groupId/fund`
Lấy thông tin quỹ chung

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "groupId": "group-uuid-1",
    "balance": 25800000,
    "currency": "VND",
    "monthlyContribution": 2500000,
    "monthlyBudget": 3000000,
    "lastUpdated": "2024-02-01T10:00:00Z"
  }
}
```

---

### GET `/user/groups/:groupId/fund/transactions`
Lịch sử giao dịch quỹ

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `type`: deposit, withdraw, expense (optional)
- `startDate`: ISO date (optional)
- `endDate`: ISO date (optional)
- `limit`: number (default 50)
- `offset`: number (default 0)

---

### POST `/user/groups/:groupId/fund/contribute`
Nộp tiền vào quỹ

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "amount": 2500000,
  "description": "Đóng góp tháng 2/2024"
}
```

---

### POST `/user/groups/:groupId/fund/withdraw`
Yêu cầu rút tiền

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "amount": 1000000,
  "reason": "Chi phí sửa chữa cá nhân"
}
```

---

## 📅 BOOKING SERVICE (Port 3003)

### POST `/bookings`
Tạo booking mới

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "vehicleId": "vehicle-uuid-1",
  "groupId": "group-uuid-1",
  "startTime": "2024-02-15T08:00:00Z",
  "endTime": "2024-02-15T18:00:00Z",
  "purpose": "business",
  "notes": "Đi gặp khách hàng"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đặt lịch thành công",
  "data": {
    "bookingId": "booking-uuid-1",
    "qrCode": "data:image/png;base64,...",
    "priorityScore": 34,
    "status": "confirmed"
  }
}
```

---

### GET `/bookings`
Lấy danh sách bookings của user

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status`: pending, confirmed, completed, cancelled
- `startDate`: ISO date
- `endDate`: ISO date

---

### GET `/bookings/:bookingId`
Chi tiết booking

**Headers:** `Authorization: Bearer <token>`

---

### PUT `/bookings/:bookingId`
Cập nhật booking

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "startTime": "2024-02-15T09:00:00Z",
  "endTime": "2024-02-15T17:00:00Z",
  "notes": "Updated notes"
}
```

---

### DELETE `/bookings/:bookingId`
Hủy booking

**Headers:** `Authorization: Bearer <token>`

---

### GET `/bookings/calendar/vehicles/:vehicleId`
Lịch của xe

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `startDate`: ISO date (required)
- `endDate`: ISO date (required)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "bookingId": "booking-uuid-1",
      "userId": "user-uuid-1",
      "userName": "Nguyễn Văn A",
      "startTime": "2024-02-15T08:00:00Z",
      "endTime": "2024-02-15T18:00:00Z",
      "status": "confirmed"
    }
  ]
}
```

---

### GET `/bookings/calendar/groups/:groupId`
Lịch của nhóm

**Headers:** `Authorization: Bearer <token>`

---

### POST `/bookings/calendar/availability/check`
Kiểm tra xe còn trống

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "vehicleId": "vehicle-uuid-1",
  "startTime": "2024-02-15T08:00:00Z",
  "endTime": "2024-02-15T18:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "available": true,
    "conflicts": []
  }
}
```

---

### GET `/bookings/:bookingId/qr-code`
Lấy QR code cho check-in

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "qrCode": "data:image/png;base64,iVBOR...",
    "token": "encrypted-token-xxx",
    "expiresIn": "15m"
  }
}
```

---

### POST `/bookings/:bookingId/check-in`
Check-in (Staff only)

**Headers:** `Authorization: Bearer <token>`

**Request Body (multipart/form-data):**
```
odometerReading: 12450
batteryLevel: 85
notes: "Xe tình trạng tốt"
photos[]: <file1>
photos[]: <file2>
signature: <base64-signature-data>
```

---

### POST `/bookings/:bookingId/check-out`
Check-out (Staff only)

**Headers:** `Authorization: Bearer <token>`

**Request Body (multipart/form-data):**
```
odometerReading: 12580
batteryLevel: 45
notes: "Trả xe đúng giờ"
damages[0][location]: "Cửa trước bên phải"
damages[0][severity]: "minor"
damages[0][description]: "Xước nhỏ"
damages[0][photos]: <file>
signature: <base64-signature-data>
```

---

### GET `/bookings/:bookingId/logs`
Lịch sử check-in/check-out

**Headers:** `Authorization: Bearer <token>`

---

## 💰 COST SERVICE (Port 3004)

### POST `/costs`
Tạo chi phí mới

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "groupId": "group-uuid-1",
  "vehicleId": "vehicle-uuid-1",
  "category": "charging",
  "amount": 500000,
  "description": "Sạc điện trạm VinFast",
  "occurredAt": "2024-02-10T14:30:00Z",
  "splitMethod": "usage",
  "usageData": {
    "totalKwh": 50,
    "members": [
      { "userId": "user-1", "kwh": 20 },
      { "userId": "user-2", "kwh": 15 },
      { "userId": "user-3", "kwh": 15 }
    ]
  }
}
```

---

### GET `/costs/group/:groupId`
Danh sách chi phí của nhóm

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `category`: charging, maintenance, insurance, cleaning, other
- `startDate`: ISO date
- `endDate`: ISO date
- `status`: pending, paid, overdue

---

### GET `/costs/:id`
Chi tiết chi phí

**Headers:** `Authorization: Bearer <token>`

---

### GET `/costs/:id/splits`
Xem phân bổ chi phí

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "costId": "cost-uuid-1",
    "totalAmount": 500000,
    "splitMethod": "usage",
    "splits": [
      {
        "userId": "user-1",
        "userName": "Nguyễn Văn A",
        "splitAmount": 200000,
        "status": "paid",
        "paidAt": "2024-02-11T10:00:00Z"
      },
      {
        "userId": "user-2",
        "userName": "Trần Thị B",
        "splitAmount": 150000,
        "status": "pending"
      }
    ]
  }
}
```

---

### GET `/costs/splits/user`
Chi phí cần thanh toán của user

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "splitId": "split-uuid-1",
      "costId": "cost-uuid-1",
      "description": "Sạc điện trạm VinFast",
      "category": "charging",
      "splitAmount": 200000,
      "status": "pending",
      "dueDate": "2024-02-20T00:00:00Z"
    }
  ]
}
```

---

### PUT `/costs/splits/:id/status`
Đánh dấu đã thanh toán

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "status": "paid",
  "paymentMethod": "VNPay",
  "transactionId": "VNP-xxx-xxx"
}
```

---

### POST `/costs/payments/create`
Tạo payment request

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "splitId": "split-uuid-1",
  "paymentMethod": "VNPay",
  "returnUrl": "http://localhost:5173/payment/callback"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentId": "payment-uuid-1",
    "paymentUrl": "https://vnpay.vn/payment?...",
    "amount": 200000,
    "expiresIn": "15m"
  }
}
```

---

### GET `/costs/reports/summary`
Báo cáo tổng hợp chi phí

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `groupId`: group-uuid (required)
- `startDate`: ISO date
- `endDate`: ISO date

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCosts": 5280000,
    "breakdown": {
      "charging": 1500000,
      "maintenance": 2800000,
      "insurance": 800000,
      "other": 180000
    },
    "memberSummary": [
      {
        "userId": "user-1",
        "userName": "Nguyễn Văn A",
        "totalOwed": 2112000,
        "totalPaid": 2112000,
        "balance": 0
      }
    ]
  }
}
```

---

### GET `/costs/wallet`
Ví cá nhân

**Headers:** `Authorization: Bearer <token>`

---

### POST `/costs/wallet/deposit`
Nạp tiền vào ví

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "amount": 1000000,
  "paymentMethod": "VNPay"
}
```

---

### POST `/costs/wallet/withdraw`
Rút tiền khỏi ví

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "amount": 500000,
  "bankAccount": "1234567890",
  "bankName": "Vietcombank"
}
```

---

## 🚗 VEHICLE SERVICE (Port 3005)

### POST `/vehicles`
Thêm xe mới

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "groupId": "group-uuid-1",
  "make": "Tesla",
  "model": "Model 3",
  "year": 2023,
  "vin": "5YJ3E1EA0KF123456",
  "licensePlate": "30A-12345",
  "color": "White",
  "batteryCapacity": 75,
  "range": 500,
  "status": "available"
}
```

---

### GET `/vehicles`
Danh sách xe

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `groupId`: group-uuid (optional)
- `status`: available, in-use, maintenance, charging

---

### GET `/vehicles/:vehicleId`
Chi tiết xe

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "vehicle-uuid-1",
    "make": "Tesla",
    "model": "Model 3",
    "year": 2023,
    "licensePlate": "30A-12345",
    "status": "available",
    "batteryLevel": 85,
    "odometer": 12450,
    "currentLocation": {
      "lat": 10.7769,
      "lng": 106.7009,
      "address": "123 Nguyễn Huệ, Q1, TP.HCM"
    },
    "lastMaintenance": "2024-01-15T00:00:00Z",
    "nextMaintenance": "2024-04-15T00:00:00Z"
  }
}
```

---

### PUT `/vehicles/:vehicleId`
Cập nhật thông tin xe

**Headers:** `Authorization: Bearer <token>`

---

### PUT `/vehicles/:vehicleId/status`
Cập nhật trạng thái xe

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "status": "maintenance",
  "notes": "Bảo dưỡng định kỳ 20.000km"
}
```

---

### POST `/vehicles/:vehicleId/maintenance/schedules`
Tạo lịch bảo dưỡng

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "type": "routine",
  "scheduledDate": "2024-04-15T09:00:00Z",
  "description": "Bảo dưỡng 20.000km",
  "estimatedCost": 3000000
}
```

---

### GET `/vehicles/:vehicleId/maintenance/history`
Lịch sử bảo dưỡng

**Headers:** `Authorization: Bearer <token>`

---

### POST `/vehicles/:vehicleId/charging/sessions`
Tạo phiên sạc điện

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "stationName": "VinFast Station Q1",
  "startTime": "2024-02-10T14:00:00Z",
  "endTime": "2024-02-10T16:30:00Z",
  "kwhCharged": 50,
  "cost": 500000
}
```

---

### GET `/vehicles/:vehicleId/charging/sessions`
Lịch sử sạc điện

**Headers:** `Authorization: Bearer <token>`

---

### POST `/vehicles/:vehicleId/insurance`
Thêm bảo hiểm

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "provider": "Bảo Minh Insurance",
  "policyNumber": "BM-2024-123456",
  "type": "comprehensive",
  "coverage": 500000000,
  "premium": 12000000,
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-12-31T23:59:59Z"
}
```

---

### GET `/vehicles/:vehicleId/insurance`
Danh sách bảo hiểm

**Headers:** `Authorization: Bearer <token>`

---

### GET `/vehicles/:vehicleId/stats`
Thống kê xe

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalKmDriven": 12450,
    "averageKmPerDay": 45,
    "totalChargingSessions": 85,
    "totalMaintenanceCost": 8500000,
    "utilizationRate": 72,
    "lastUsed": "2024-02-10T18:00:00Z"
  }
}
```

---

## 📄 CONTRACT SERVICE (Port 3006)

### POST `/contracts`
Tạo hợp đồng mới

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "groupId": "group-uuid-1",
  "templateId": "template-uuid-1",
  "type": "co-ownership",
  "parties": [
    {
      "userId": "user-uuid-1",
      "role": "party_a",
      "ownershipPercentage": 40
    },
    {
      "userId": "user-uuid-2",
      "role": "party_b",
      "ownershipPercentage": 30
    }
  ],
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2025-01-01T00:00:00Z",
  "terms": {
    "monthlyContribution": 2500000,
    "lateFeePercentage": 5,
    "terminationNoticeDays": 30
  }
}
```

---

### GET `/contracts/user/me`
Danh sách hợp đồng của user

**Headers:** `Authorization: Bearer <token>`

---

### GET `/contracts/:contractId`
Chi tiết hợp đồng

**Headers:** `Authorization: Bearer <token>`

---

### POST `/contracts/:contractId/sign`
Ký hợp đồng

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "signature": "data:image/png;base64,...",
  "ipAddress": "123.45.67.89",
  "userAgent": "Mozilla/5.0..."
}
```

---

### GET `/contracts/:contractId/signature-status`
Trạng thái ký

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalParties": 3,
    "signedCount": 2,
    "pendingCount": 1,
    "signatures": [
      {
        "userId": "user-uuid-1",
        "userName": "Nguyễn Văn A",
        "signedAt": "2024-01-02T10:00:00Z",
        "status": "signed"
      },
      {
        "userId": "user-uuid-2",
        "userName": "Trần Thị B",
        "signedAt": null,
        "status": "pending"
      }
    ]
  }
}
```

---

### POST `/contracts/:contractId/documents`
Upload tài liệu đính kèm

**Headers:** `Authorization: Bearer <token>`

**Request Body (multipart/form-data):**
```
document: <file>
documentType: "registration-certificate"
description: "Giấy đăng ký xe"
```

---

### GET `/contracts/:contractId/download`
Tải hợp đồng PDF

**Headers:** `Authorization: Bearer <token>`

**Response:** PDF file

---

### GET `/contracts/templates`
Danh sách mẫu hợp đồng

**Headers:** `Authorization: Bearer <token>`

---

## 🔔 NOTIFICATION SERVICE (Port 3007)

### GET `/notifications/user/:userId`
Danh sách thông báo

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status`: unread, read, all (default: all)
- `limit`: number (default: 50)
- `offset`: number (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "notif-uuid-1",
      "title": "Booking được phê duyệt",
      "message": "Lịch đặt xe ngày 15/02 đã được xác nhận",
      "type": "booking",
      "priority": "normal",
      "read": false,
      "createdAt": "2024-02-10T10:00:00Z",
      "data": {
        "bookingId": "booking-uuid-1"
      }
    }
  ],
  "total": 15,
  "unreadCount": 3
}
```

---

### PUT `/notifications/:id/read`
Đánh dấu đã đọc

**Headers:** `Authorization: Bearer <token>`

---

### DELETE `/notifications/:id`
Xóa thông báo

**Headers:** `Authorization: Bearer <token>`

---

### GET `/notifications/stats/:userId`
Thống kê thông báo

**Headers:** `Authorization: Bearer <token>`

---

### GET `/notifications/preferences/:userId`
Cài đặt thông báo

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "emailNotifications": true,
    "pushNotifications": true,
    "smsNotifications": false,
    "notificationTypes": {
      "booking": true,
      "payment": true,
      "maintenance": true,
      "voting": true,
      "fund": false
    }
  }
}
```

---

### PUT `/notifications/preferences/:userId`
Cập nhật cài đặt

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "emailNotifications": true,
  "pushNotifications": true,
  "notificationTypes": {
    "booking": true,
    "payment": true,
    "voting": false
  }
}
```

---

## 🤖 AI SERVICE (Port 3008)

### GET `/ai/schedule/group/:groupId/recommendations`
Đề xuất lịch sử dụng

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `startDate`: ISO date (optional)
- `endDate`: ISO date (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "userId": "user-uuid-1",
        "userName": "Nguyễn Văn A",
        "currentUsagePercentage": 25,
        "targetUsagePercentage": 40,
        "deficit": 15,
        "priorityScore": 34,
        "suggestedSlots": [
          {
            "startTime": "2024-02-20T08:00:00Z",
            "endTime": "2024-02-20T18:00:00Z",
            "reason": "Low usage, high priority"
          }
        ]
      }
    ],
    "fairnessScore": 82,
    "generatedAt": "2024-02-10T10:00:00Z"
  }
}
```

---

### POST `/ai/cost/predict`
Dự đoán chi phí

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "groupId": "group-uuid-1",
  "vehicleId": "vehicle-uuid-1",
  "predictionMonths": 3
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "predictions": [
      {
        "month": "2024-03",
        "predictedCost": 5200000,
        "breakdown": {
          "charging": 1800000,
          "maintenance": 2400000,
          "insurance": 1000000
        },
        "confidence": 0.87
      }
    ]
  }
}
```

---

### GET `/ai/usage/group/:groupId/patterns`
Phân tích pattern sử dụng

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "peakHours": [8, 9, 17, 18],
    "peakDays": ["Monday", "Friday"],
    "averageTripDuration": 4.5,
    "commonDestinations": [
      { "area": "Quận 1", "count": 45 },
      { "area": "Quận 3", "count": 32 }
    ],
    "usageDistribution": {
      "business": 60,
      "personal": 40
    }
  }
}
```

---

### POST `/ai/dispute/analyze`
Phân tích tranh chấp

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Request Body:**
```json
{
  "disputeId": "dispute-uuid-1",
  "disputeType": "scheduling_conflict",
  "parties": ["user-uuid-1", "user-uuid-2"],
  "evidence": [
    { "type": "booking_history", "data": {...} },
    { "type": "usage_pattern", "data": {...} }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analysis": {
      "summary": "User A has higher priority based on ownership and usage deficit",
      "recommendation": "Award booking to User A",
      "confidence": 0.92,
      "factors": [
        { "factor": "ownership_percentage", "weight": 0.4, "favoredParty": "user-uuid-1" },
        { "factor": "usage_deficit", "weight": 0.6, "favoredParty": "user-uuid-1" }
      ]
    }
  }
}
```

---

## 👨‍💼 ADMIN SERVICE (Port 3009)

### GET `/admin/kyc/pending`
Danh sách KYC chờ duyệt

**Headers:** `Authorization: Bearer <admin-token>`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "kyc-uuid-1",
      "userId": "user-uuid-1",
      "userName": "Nguyễn Văn A",
      "email": "user@example.com",
      "idCardNumber": "001234567890",
      "submittedAt": "2024-02-08T10:00:00Z",
      "documents": {
        "idCardFront": "https://...",
        "idCardBack": "https://...",
        "selfie": "https://...",
        "driverLicense": "https://..."
      },
      "status": "pending"
    }
  ]
}
```

---

### PUT `/admin/kyc/verify/:id`
Duyệt/Từ chối KYC

**Headers:** `Authorization: Bearer <admin-token>`

**Request Body:**
```json
{
  "action": "approve",
  "notes": "All documents verified"
}
```

---

### GET `/admin/users`
Danh sách users

**Headers:** `Authorization: Bearer <admin-token>`

**Query Parameters:**
- `role`: co-owner, staff, admin
- `status`: active, suspended, pending
- `search`: keyword search (name, email, phone)
- `limit`, `offset`: pagination

---

### GET `/admin/groups`
Danh sách nhóm

**Headers:** `Authorization: Bearer <admin-token>`

---

### GET `/admin/analytics/overview`
Tổng quan hệ thống

**Headers:** `Authorization: Bearer <admin-token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 1250,
      "active": 980,
      "newThisMonth": 45
    },
    "groups": {
      "total": 156,
      "active": 142
    },
    "vehicles": {
      "total": 234,
      "available": 180,
      "inUse": 32,
      "maintenance": 22
    },
    "bookings": {
      "totalThisMonth": 2450,
      "completedRate": 92.5
    },
    "revenue": {
      "thisMonth": 485000000,
      "lastMonth": 462000000,
      "growthRate": 5.0
    }
  }
}
```

---

### GET `/admin/financial/reports`
Báo cáo tài chính

**Headers:** `Authorization: Bearer <admin-token>`

**Query Parameters:**
- `startDate`: ISO date (required)
- `endDate`: ISO date (required)
- `groupId`: group-uuid (optional, for group-specific report)

---

### GET `/admin/disputes`
Danh sách tranh chấp

**Headers:** `Authorization: Bearer <admin-token>`

**Query Parameters:**
- `status`: pending, resolved, escalated
- `type`: scheduling, cost, damage

---

### PUT `/admin/disputes/:disputeId/resolve`
Giải quyết tranh chấp

**Headers:** `Authorization: Bearer <admin-token>`

**Request Body:**
```json
{
  "resolution": "Award booking to User A based on priority score",
  "notes": "User A has higher ownership percentage and usage deficit",
  "actions": [
    { "type": "cancel_booking", "bookingId": "booking-uuid-2" },
    { "type": "notify_users", "userIds": ["user-uuid-1", "user-uuid-2"] }
  ]
}
```

---

### POST `/admin/staff`
Tạo tài khoản staff

**Headers:** `Authorization: Bearer <admin-token>`

**Request Body:**
```json
{
  "email": "staff@evcoownership.com",
  "fullName": "Nguyễn Văn B",
  "phone": "+84987654321",
  "role": "staff",
  "permissions": ["check_in", "check_out", "view_reports"]
}
```

---

### GET `/admin/staff`
Danh sách staff

**Headers:** `Authorization: Bearer <admin-token>`

---

### PUT `/admin/staff/:staffId`
Cập nhật staff

**Headers:** `Authorization: Bearer <admin-token>`

---

### DELETE `/admin/staff/:staffId`
Xóa staff

**Headers:** `Authorization: Bearer <admin-token>`

---

## 🔌 WebSocket Events (Notification Service)

**Connect to:** `ws://localhost:3007` (hoặc `VITE_SOCKET_URL` từ env)

**Authentication:** Gửi token sau khi connect
```javascript
socket.emit('authenticate', { token: 'your_jwt_token' });
```

### Events Client → Server:

**`join_group`** - Tham gia nhóm để nhận thông báo
```javascript
socket.emit('join_group', { groupId: 'group-uuid-1' });
```

**`leave_group`** - Rời nhóm
```javascript
socket.emit('leave_group', { groupId: 'group-uuid-1' });
```

### Events Server → Client:

**`notification`** - Thông báo mới
```javascript
socket.on('notification', (data) => {
  // data: { id, title, message, type, priority, createdAt }
});
```

**`booking_updated`** - Booking thay đổi
```javascript
socket.on('booking_updated', (data) => {
  // data: { bookingId, status, updatedBy }
});
```

**`cost_added`** - Chi phí mới
```javascript
socket.on('cost_added', (data) => {
  // data: { costId, amount, category, groupId }
});
```

**`vote_created`** - Bỏ phiếu mới
```javascript
socket.on('vote_created', (data) => {
  // data: { voteId, title, deadline, groupId }
});
```

**`fund_transaction`** - Giao dịch quỹ
```javascript
socket.on('fund_transaction', (data) => {
  // data: { transactionId, type, amount, balance, groupId }
});
```

---

## 📊 Response Status Codes

- `200 OK`: Thành công
- `201 Created`: Tạo mới thành công
- `400 Bad Request`: Dữ liệu không hợp lệ
- `401 Unauthorized`: Chưa đăng nhập hoặc token không hợp lệ
- `403 Forbidden`: Không có quyền truy cập
- `404 Not Found`: Không tìm thấy resource
- `409 Conflict`: Xung đột (VD: booking trùng giờ)
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Lỗi server

---

## 🔒 Security Best Practices

1. **Token Management:**
   - Access token hết hạn sau 24h
   - Refresh token hết hạn sau 7 ngày
   - Luôn lưu token an toàn (HttpOnly cookies hoặc secure storage)

2. **Rate Limiting:**
   - Auth endpoints: 5 requests/phút
   - Normal endpoints: 100 requests/15 phút
   - Upload endpoints: 10 requests/phút

3. **File Upload:**
   - Max size: 10MB per file
   - Allowed types: jpg, png, pdf, doc, docx
   - Virus scanning enabled

4. **CORS:**
   - Only allow frontend origin
   - Production: `https://app.evcoownership.com`

---

**API Version:** 1.0.0
**Last Updated:** 2024-02-12
**Support:** api@evcoownership.com
