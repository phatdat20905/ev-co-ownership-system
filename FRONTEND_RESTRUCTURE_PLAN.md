# 🔄 KẾ HOẠCH TÁI CẤU TRÚC FRONTEND

## 📊 Phân Tích Hiện Tại

### Vấn Đề:
1. **Files trùng lặp:**
   - `pages/shared/ContractManagement.jsx` ≈ `pages/contracts/ContractList.jsx` + `ContractDetails.jsx`
   - `pages/shared/CarManagement.jsx` ≈ `pages/vehicles/VehicleList.jsx` + `VehicleDetails.jsx`
   - `pages/shared/ServiceManagement.jsx` (chức năng không rõ ràng)

2. **Mock data chưa kết nối API:**
   - `dashboard/coowner/CoownerDashboard.jsx` - mock userData
   - `dashboard/coowner/vehicles/VehicleDashboard.jsx` - mock vehicles
   - `dashboard/coowner/history/UsageHistory.jsx` - mock usageData
   - `dashboard/coowner/history/UsageAnalytics.jsx` - mock analyticsData
   - `dashboard/coowner/financial/PaymentPortal.jsx` - mock pendingBills
   - `dashboard/coowner/contracts/ContractManagement.jsx` - mock contracts
   - `staff/StaffProfile.jsx` - mock staffData
   - `admin/AdminProfile.jsx` - mock adminData

3. **Cấu trúc phân tán:**
   - Một số pages trong `pages/` root level
   - Một số trong `pages/dashboard/coowner/`
   - Một số trong `pages/shared/`
   - Không nhất quán

---

## 🎯 CẤU TRÚC MỚI ĐỀ XUẤT

```
frontend/src/
├── pages/
│   ├── auth/                          # Public pages
│   │   ├── Login.jsx                  ✅ Keep
│   │   ├── Register.jsx               ✅ Keep
│   │   ├── ForgotPassword.jsx         ✅ Keep
│   │   ├── ResetPassword.jsx          ✅ Keep
│   │   └── VerifyEmail.jsx            ✅ Keep
│   │
│   ├── public/                        # Landing & info pages
│   │   ├── Dashboard.jsx              ✅ Keep (rename to Home.jsx)
│   │   └── policies/                  ✅ Keep
│   │       ├── ChinhSachBaoMat.jsx
│   │       ├── QuyDinhHoatDong.jsx
│   │       └── QuyenLoiThanhVien.jsx
│   │
│   ├── coowner/                       # Co-owner role pages
│   │   ├── Dashboard.jsx              ← Từ dashboard/coowner/CoownerDashboard.jsx
│   │   ├── Profile.jsx                ← Từ dashboard/coowner/account/Profile.jsx
│   │   │
│   │   ├── group/                     # Group management
│   │   │   ├── GroupManagement.jsx    ✅ Keep (đã kết nối API)
│   │   │   ├── VotingSystem.jsx       ✅ Keep (đã kết nối API)
│   │   │   ├── CommonFund.jsx         ✅ Keep (đã kết nối API)
│   │   │   └── VotingManagement.jsx   ⚠️ Review (có thể merge với VotingSystem)
│   │   │
│   │   ├── booking/                   # Booking & scheduling
│   │   │   ├── BookingCalendar.jsx    ✅ Keep
│   │   │   ├── BookingForm.jsx        ✅ Keep
│   │   │   ├── BookingList.jsx        ← Từ pages/bookings/BookingList.jsx
│   │   │   ├── BookingDetails.jsx     ← Từ pages/bookings/BookingDetails.jsx
│   │   │   └── ScheduleView.jsx       ✅ Keep
│   │   │
│   │   ├── financial/                 # Financial management
│   │   │   ├── ExpenseTracking.jsx    ✅ Keep (cần kết nối API)
│   │   │   ├── CostBreakdown.jsx      ✅ Keep (cần kết nối API)
│   │   │   ├── PaymentPortal.jsx      ⚠️ Kết nối API
│   │   │   └── PaymentHistory.jsx     ✅ Keep
│   │   │
│   │   ├── vehicles/                  # Vehicle info
│   │   │   ├── VehicleDashboard.jsx   ⚠️ Kết nối API
│   │   │   ├── VehicleList.jsx        ← MERGE từ pages/vehicles/
│   │   │   └── VehicleDetails.jsx     ← MERGE từ pages/vehicles/
│   │   │
│   │   ├── contracts/                 # Contracts
│   │   │   ├── ContractManagement.jsx ⚠️ Kết nối API
│   │   │   ├── ContractList.jsx       ← MERGE từ pages/contracts/
│   │   │   └── ContractDetails.jsx    ← MERGE từ pages/contracts/
│   │   │
│   │   ├── history/                   # Usage history
│   │   │   ├── UsageHistory.jsx       ⚠️ Kết nối API
│   │   │   └── UsageAnalytics.jsx     ⚠️ Kết nối API
│   │   │
│   │   ├── ownership/                 # Ownership management
│   │   │   ├── OwnershipManagement.jsx ✅ Keep
│   │   │   ├── DocumentUpload.jsx     ✅ Keep
│   │   │   └── ContractViewer.jsx     ✅ Keep
│   │   │
│   │   └── ai/                        # AI features
│   │       └── AIRecommendations.jsx  ✅ Keep (đã kết nối API)
│   │
│   ├── staff/                         # Staff role pages
│   │   ├── Dashboard.jsx              ← Từ StaffDashboard.jsx
│   │   ├── Profile.jsx                ← Từ StaffProfile.jsx (kết nối API)
│   │   ├── CheckInOut.jsx             ← Từ CheckInOutManagement.jsx
│   │   ├── ServiceManagement.jsx      ← Từ pages/shared/ (kết nối API)
│   │   └── VehicleManagement.jsx      ← Từ pages/shared/CarManagement.jsx
│   │
│   ├── admin/                         # Admin role pages
│   │   ├── Dashboard.jsx              ← Từ AdminDashboard.jsx
│   │   ├── Profile.jsx                ← Từ AdminProfile.jsx (kết nối API)
│   │   ├── KYCVerification.jsx        ✅ Keep
│   │   ├── KYCManagement.jsx          ⚠️ Review (merge với KYCVerification?)
│   │   ├── StaffManagement.jsx        ✅ Keep
│   │   ├── FinancialReports.jsx       ✅ Keep
│   │   └── DisputeManagement.jsx      ✅ Keep
│   │
│   └── shared/                        # Shared utility pages
│       ├── NotificationSettings.jsx   ← Từ pages/notifications/
│       ├── PaymentCallback.jsx        ← Từ pages/payment/
│       ├── KYCStatus.jsx              ← Từ pages/profile/
│       └── ChangePassword.jsx         ← Từ pages/profile/
```

---

## 🗑️ FILES CẦN XÓA

### 1. Trùng lặp chức năng:
- ❌ `pages/shared/ContractManagement.jsx` (giữ phiên bản trong dashboard/coowner/contracts/)
- ❌ `pages/shared/CarManagement.jsx` (giữ VehicleList/Details)
- ❌ `pages/contracts/ContractList.jsx` (merge vào coowner/contracts/)
- ❌ `pages/contracts/ContractDetails.jsx` (merge vào coowner/contracts/)
- ❌ `pages/vehicles/VehicleList.jsx` (merge vào coowner/vehicles/)
- ❌ `pages/vehicles/VehicleDetails.jsx` (merge vào coowner/vehicles/)

### 2. Có thể merge:
- ⚠️ `dashboard/coowner/group/VotingManagement.jsx` + `VotingSystem.jsx` → Giữ 1 file
- ⚠️ `admin/KYCManagement.jsx` + `KYCVerification.jsx` → Giữ 1 file

---

## 🔄 ACTIONS CẦN THỰC HIỆN

### Phase 1: Dọn dẹp & Di chuyển (1-2h)

```bash
# 1. Xóa files trùng lặp
rm frontend/src/pages/shared/ContractManagement.jsx
rm frontend/src/pages/shared/CarManagement.jsx

# 2. Di chuyển files từ root level vào role folders
mv frontend/src/pages/bookings/* frontend/src/pages/coowner/booking/
mv frontend/src/pages/contracts/* frontend/src/pages/coowner/contracts/
mv frontend/src/pages/vehicles/* frontend/src/pages/coowner/vehicles/

# 3. Di chuyển dashboard files
mv frontend/src/pages/dashboard/coowner/* frontend/src/pages/coowner/
mv frontend/src/pages/staff/StaffDashboard.jsx frontend/src/pages/staff/Dashboard.jsx
mv frontend/src/pages/admin/AdminDashboard.jsx frontend/src/pages/admin/Dashboard.jsx

# 4. Rename Home
mv frontend/src/pages/dashboard/Dashboard.jsx frontend/src/pages/public/Home.jsx

# 5. Di chuyển shared utilities
mv frontend/src/pages/notifications/* frontend/src/pages/shared/
mv frontend/src/pages/payment/* frontend/src/pages/shared/
mv frontend/src/pages/profile/* frontend/src/pages/shared/
```

### Phase 2: Kết nối API cho mock pages (2-3h)

**Priority High:**
1. ✅ `coowner/group/VotingSystem.jsx` - DONE
2. ✅ `coowner/group/CommonFund.jsx` - DONE
3. ⚠️ `coowner/Dashboard.jsx` - Cần kết nối userService, bookingService
4. ⚠️ `coowner/vehicles/VehicleDashboard.jsx` - Kết nối vehicleService
5. ⚠️ `coowner/history/UsageHistory.jsx` - Kết nối bookingService
6. ⚠️ `coowner/financial/PaymentPortal.jsx` - Kết nối costService
7. ⚠️ `staff/Profile.jsx` - Kết nối userService
8. ⚠️ `admin/Profile.jsx` - Kết nối userService

**Priority Medium:**
9. `coowner/history/UsageAnalytics.jsx` - Kết nối aiService
10. `coowner/contracts/ContractManagement.jsx` - Kết nối contractService
11. `staff/ServiceManagement.jsx` - Kết nối vehicleService

### Phase 3: Cập nhật Routes (30 phút)

**File: `frontend/src/App.jsx`**

```jsx
// Old routes
/dashboard → /
/dashboard/coowner → /coowner
/dashboard/coowner/group/... → /coowner/group/...

// New routes
/auth/login
/auth/register
/coowner/dashboard
/coowner/group/management
/coowner/booking/calendar
/staff/dashboard
/staff/checkinout
/admin/dashboard
/admin/kyc
```

### Phase 4: Cập nhật imports (30 phút)

Tìm và thay thế tất cả imports cũ sang đường dẫn mới:
```bash
# Example
# Old: import CoownerDashboard from './pages/dashboard/coowner/CoownerDashboard'
# New: import CoownerDashboard from './pages/coowner/Dashboard'
```

### Phase 5: Testing (1h)

- Test tất cả routes hoạt động
- Test navigation giữa các pages
- Test API calls
- Test loading/error states

---

## 📋 CHECKLIST

### Cleanup
- [ ] Xóa `pages/shared/ContractManagement.jsx`
- [ ] Xóa `pages/shared/CarManagement.jsx`
- [ ] Xóa thư mục `pages/bookings/` (sau khi merge)
- [ ] Xóa thư mục `pages/contracts/` (sau khi merge)
- [ ] Xóa thư mục `pages/vehicles/` (sau khi merge)
- [ ] Xóa thư mục `pages/dashboard/coowner/` (sau khi move)
- [ ] Xóa thư mục rỗng `pages/notifications/`, `pages/payment/`, `pages/profile/`

### API Integration
- [x] VotingSystem.jsx
- [x] CommonFund.jsx
- [ ] CoownerDashboard.jsx
- [ ] VehicleDashboard.jsx
- [ ] UsageHistory.jsx
- [ ] UsageAnalytics.jsx
- [ ] PaymentPortal.jsx
- [ ] ContractManagement.jsx
- [ ] StaffProfile.jsx
- [ ] AdminProfile.jsx
- [ ] ServiceManagement.jsx

### Routes Update
- [ ] Update App.jsx routes
- [ ] Update navigation links
- [ ] Update imports
- [ ] Test all routes

### Documentation
- [ ] Update README.md với cấu trúc mới
- [ ] Update component documentation
- [ ] Update API integration guide

---

## 🚀 TIMELINE

**Tổng thời gian ước tính: 5-7 giờ**

1. **Phase 1 - Cleanup:** 1-2h
2. **Phase 2 - API Integration:** 2-3h
3. **Phase 3 - Routes Update:** 30 phút
4. **Phase 4 - Imports:** 30 phút
5. **Phase 5 - Testing:** 1h

---

## ⚠️ LƯU Ý

1. **Backup trước khi thực hiện:**
   ```bash
   git checkout -b restructure-frontend
   git add .
   git commit -m "Backup before frontend restructure"
   ```

2. **Thực hiện từng bước nhỏ:**
   - Commit sau mỗi phase
   - Test ngay sau mỗi thay đổi

3. **Ưu tiên:**
   - Phase 1 (Cleanup) trước
   - Phase 2 (API) sau
   - Routes & Testing cuối cùng

4. **Rollback plan:**
   - Nếu có vấn đề: `git reset --hard HEAD`
   - Hoặc: `git checkout master`
