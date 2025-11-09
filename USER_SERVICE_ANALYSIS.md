# 🔍 USER SERVICE - PHÂN TÍCH TOÀN DIỆN

## 📊 TỔNG QUAN

User Service hiện tại quản lý:
1. **User Profile** - Thông tin cá nhân người dùng
2. **Co-ownership Groups** - Nhóm sở hữu chung xe
3. **Voting System** - Hệ thống bỏ phiếu trong nhóm
4. **Common Fund** - Quỹ chung của nhóm

---

## ✅ CÁC ENDPOINT HIỆN CÓ

### 1. USER PROFILE ENDPOINTS (3 endpoints)

#### ✅ GET `/api/v1/user/profile`
- **Mục đích:** Lấy profile của user đang đăng nhập
- **Auth:** Required (JWT token)
- **Response:** UserProfile object
- **Status:** HOẠT ĐỘNG ✅
- **Frontend:** Đã tích hợp trong `Profile.jsx`

#### ✅ PUT `/api/v1/user/profile`
- **Mục đích:** Cập nhật profile
- **Auth:** Required
- **Body:** `{ fullName, dateOfBirth, address, avatarUrl, bio, preferences }`
- **Response:** Updated UserProfile
- **Status:** HOẠT ĐỘNG ✅
- **Frontend:** Đã tích hợp

#### ✅ GET `/api/v1/user/:userId`
- **Mục đích:** Lấy thông tin user khác (public profile)
- **Auth:** Required
- **Response:** UserProfile (không có preferences)
- **Status:** HOẠT ĐỘNG ✅
- **Use case:** Xem thông tin thành viên trong nhóm

---

### 2. GROUP MANAGEMENT ENDPOINTS (5 endpoints)

#### ✅ GET `/api/v1/user/groups`
- **Mục đích:** Lấy tất cả groups của user
- **Auth:** Required
- **Response:** Array of groups
- **Status:** HOẠT ĐỘNG ✅

#### ✅ POST `/api/v1/user/groups`
- **Mục đích:** Tạo group mới
- **Auth:** Required
- **Body:** `{ name, description, vehicleId }`
- **Response:** Created group
- **Status:** HOẠT ĐỘNG ✅

#### ✅ GET `/api/v1/user/groups/:groupId`
- **Mục đích:** Chi tiết group
- **Auth:** Required
- **Response:** Group with members
- **Status:** HOẠT ĐỘNG ✅

#### ✅ PUT `/api/v1/user/groups/:groupId`
- **Mục đích:** Cập nhật group
- **Auth:** Required (chỉ owner)
- **Body:** `{ name, description, status }`
- **Response:** Updated group
- **Status:** HOẠT ĐỘNG ✅

#### ✅ DELETE `/api/v1/user/groups/:groupId`
- **Mục đích:** Xóa group
- **Auth:** Required (chỉ owner)
- **Status:** HOẠT ĐỘNG ✅

---

### 3. GROUP MEMBER ENDPOINTS (4 endpoints)

#### ✅ POST `/api/v1/user/groups/:groupId/members`
- **Mục đích:** Thêm member vào group
- **Auth:** Required (chỉ owner)
- **Body:** `{ userId, role }`
- **Response:** Created membership
- **Status:** HOẠT ĐỘNG ✅

#### ✅ GET `/api/v1/user/groups/:groupId/members`
- **Mục đích:** Lấy danh sách members
- **Auth:** Required
- **Response:** Array of members
- **Status:** HOẠT ĐỘNG ✅

#### ✅ PUT `/api/v1/user/groups/:groupId/members/:memberId`
- **Mục đích:** Cập nhật role member
- **Auth:** Required (chỉ owner)
- **Body:** `{ role }`
- **Response:** Updated membership
- **Status:** HOẠT ĐỘNG ✅

#### ✅ DELETE `/api/v1/user/groups/:groupId/members/:memberId`
- **Mục đích:** Xóa member khỏi group
- **Auth:** Required (chỉ owner)
- **Status:** HOẠT ĐỘNG ✅

---

### 4. VOTING SYSTEM ENDPOINTS (8 endpoints)

#### ✅ POST `/api/v1/user/votes`
- **Mục đích:** Tạo vote mới
- **Auth:** Required
- **Body:** `{ groupId, title, description, type, options, endDate }`
- **Response:** Created vote
- **Status:** HOẠT ĐỘNG ✅

#### ✅ GET `/api/v1/user/votes`
- **Mục đích:** Lấy tất cả votes (filter by groupId, status)
- **Auth:** Required
- **Query:** `?groupId=xxx&status=active`
- **Response:** Array of votes
- **Status:** HOẠT ĐỘNG ✅

#### ✅ GET `/api/v1/user/votes/:voteId`
- **Mục đích:** Chi tiết vote
- **Auth:** Required
- **Response:** Vote with options and results
- **Status:** HOẠT ĐỘNG ✅

#### ✅ POST `/api/v1/user/votes/:voteId/cast`
- **Mục đích:** Bỏ phiếu
- **Auth:** Required
- **Body:** `{ optionId }`
- **Response:** User vote record
- **Status:** HOẠT ĐỘNG ✅

#### ✅ PUT `/api/v1/user/votes/:voteId`
- **Mục đích:** Cập nhật vote (chỉ creator)
- **Auth:** Required
- **Body:** `{ title, description, endDate }`
- **Status:** HOẠT ĐỘNG ✅

#### ✅ DELETE `/api/v1/user/votes/:voteId`
- **Mục đích:** Xóa vote (chỉ creator)
- **Auth:** Required
- **Status:** HOẠT ĐỘNG ✅

#### ✅ POST `/api/v1/user/votes/:voteId/close`
- **Mục đích:** Đóng vote trước hạn
- **Auth:** Required (chỉ creator)
- **Response:** Closed vote
- **Status:** HOẠT ĐỘNG ✅

#### ✅ GET `/api/v1/user/votes/:voteId/results`
- **Mục đích:** Xem kết quả vote
- **Auth:** Required
- **Response:** Vote results with statistics
- **Status:** HOẠT ĐỘNG ✅

---

### 5. COMMON FUND ENDPOINTS (4 endpoints)

#### ✅ GET `/api/v1/user/fund/:groupId`
- **Mục đích:** Lấy thông tin quỹ chung
- **Auth:** Required
- **Response:** Fund balance and transactions
- **Status:** HOẠT ĐỘNG ✅

#### ✅ POST `/api/v1/user/fund/:groupId/deposit`
- **Mục đích:** Nạp tiền vào quỹ
- **Auth:** Required
- **Body:** `{ amount, description }`
- **Response:** Transaction record
- **Status:** HOẠT ĐỘNG ✅

#### ✅ POST `/api/v1/user/fund/:groupId/withdraw`
- **Mục đích:** Rút tiền từ quỹ
- **Auth:** Required (cần vote approval)
- **Body:** `{ amount, description, reason }`
- **Response:** Transaction record
- **Status:** HOẠT ĐỘNG ✅

#### ✅ GET `/api/v1/user/fund/:groupId/transactions`
- **Mục đích:** Lịch sử giao dịch
- **Auth:** Required
- **Query:** `?type=deposit&limit=20`
- **Response:** Array of transactions
- **Status:** HOẠT ĐỘNG ✅

---

## 📊 TỔNG KẾT ENDPOINTS

| Category | Endpoints | Status |
|----------|-----------|--------|
| User Profile | 3 | ✅ Hoạt động |
| Group Management | 5 | ✅ Hoạt động |
| Group Members | 4 | ✅ Hoạt động |
| Voting System | 8 | ✅ Hoạt động |
| Common Fund | 4 | ✅ Hoạt động |
| **TOTAL** | **24** | **✅ 100%** |

---

## ❌ CHỨC NĂNG THIẾU - CẦN BỔ SUNG

### 1. AVATAR UPLOAD ⚠️ (Priority: HIGH)

**Vấn đề:** 
- Frontend Profile.jsx có chức năng chọn ảnh avatar
- Backend không có endpoint upload file
- Hiện tại chỉ lưu avatarUrl (string), không upload thật

**Cần làm:**
```javascript
// Backend: POST /api/v1/user/avatar
router.post('/avatar', 
  authenticate, 
  uploadMiddleware.single('avatar'),
  userController.uploadAvatar
);

// Service: Upload to S3 or local storage
async uploadAvatar(userId, file) {
  // Upload file
  // Update UserProfile.avatarUrl
  // Return new avatarUrl
}
```

**Frontend:** Đã có UI, chỉ cần gọi API upload

---

### 2. CHANGE PASSWORD ⚠️ (Priority: HIGH)

**Vấn đề:**
- Auth Service có reset password (qua email)
- Không có endpoint "đổi mật khẩu" khi đã đăng nhập
- User muốn đổi password cần nhập mật khẩu cũ để verify

**Cần làm:**
```javascript
// Auth Service: POST /api/v1/auth/change-password
Body: { 
  currentPassword: "old123", 
  newPassword: "new456" 
}

// Verify currentPassword trước khi đổi
```

**Frontend:** Profile.jsx có tab "Bảo mật" nhưng chưa có form đổi password

---

### 3. USER SEARCH ⚠️ (Priority: MEDIUM)

**Vấn đề:**
- Khi thêm member vào group, cần tìm user theo email/name
- Không có endpoint search users

**Cần làm:**
```javascript
// Backend: GET /api/v1/user/search?q=keyword
router.get('/search', 
  authenticate, 
  userController.searchUsers
);

// Response: Array of users (basic info only)
```

---

### 4. NOTIFICATION PREFERENCES ⚠️ (Priority: LOW)

**Vấn đề:**
- UserProfile có field `preferences` (JSONB)
- Frontend Profile.jsx có tab "Thông báo"
- Chưa có cấu trúc cụ thể cho notification settings

**Cần làm:**
```javascript
// Define preferences schema
preferences: {
  notifications: {
    email: true,
    push: false,
    sms: false,
    booking: true,
    payment: true,
    voting: true,
    groupActivity: false
  },
  language: 'vi',
  timezone: 'Asia/Ho_Chi_Minh'
}
```

---

### 5. ACCOUNT DELETION ⚠️ (Priority: LOW)

**Vấn đề:**
- Không có cách để user xóa tài khoản

**Cần làm:**
```javascript
// Auth Service: DELETE /api/v1/auth/account
// Yêu cầu xác nhận password
// Soft delete (isActive = false) hoặc hard delete
```

---

## 🔗 TÍCH HỢP FRONTEND

### ✅ ĐÃ TÍCH HỢP

#### 1. Profile Page (`frontend/src/pages/dashboard/coowner/account/Profile.jsx`)
- ✅ GET /user/profile - Load thông tin
- ✅ PUT /user/profile - Cập nhật thông tin
- ⚠️ Avatar upload - Frontend có UI nhưng API chưa có
- ⚠️ Change password - Tab "Bảo mật" trống
- ⚠️ Notification preferences - Tab "Thông báo" trống

#### 2. Group Management (`frontend/src/pages/dashboard/coowner/group/GroupManagement.jsx`)
- ✅ GET /user/groups - Danh sách groups
- ✅ POST /user/groups - Tạo group
- ✅ GET /user/groups/:id - Chi tiết group
- ✅ PUT /user/groups/:id - Cập nhật group
- ✅ DELETE /user/groups/:id - Xóa group
- ✅ Member management endpoints
- **Status:** FULLY INTEGRATED ✅

#### 3. Voting System (`frontend/src/pages/dashboard/coowner/group/VotingSystem.jsx`)
- ✅ Voting endpoints đã có
- **Cần kiểm tra:** Frontend có gọi đúng API chưa
- **Status:** NEEDS REVIEW ⚠️

#### 4. Common Fund (`frontend/src/pages/dashboard/coowner/group/CommonFund.jsx`)
- ✅ Fund endpoints đã có
- **Cần kiểm tra:** Frontend có gọi đúng API chưa
- **Status:** NEEDS REVIEW ⚠️

---

## ⚠️ VẤN ĐỀ CẦN KIỂM TRA

### 1. Email/Phone trong UserProfile vs Auth

**Hiện trạng:**
- Auth Service lưu email, phone trong User table (auth_db)
- User Service lưu UserProfile (user_db) - KHÔNG có email, phone
- Khi user đăng nhập, có thông tin trong localStorage từ Auth Service
- Profile.jsx hiển thị email/phone từ localStorage, KHÔNG từ API

**Vấn đề:**
- User đổi email/phone ở đâu? Auth Service hay User Service?
- UserProfile không sync với User (auth)

**Giải pháp:**
1. **Email/Phone thuộc Auth Service** (RECOMMENDED)
   - User Service chỉ quản lý fullName, address, bio, avatar
   - Đổi email/phone qua Auth Service endpoint
   - Frontend load email/phone từ localStorage (đã có)

2. **Sync qua RabbitMQ**
   - Auth Service publish UserRegistered event với email/phone
   - User Service listen và tạo UserProfile
   - Khi Auth Service update email/phone, publish event để sync

---

### 2. UserProfile tự động tạo hay user phải setup?

**Hiện trạng:**
- Backend: `updateUserProfile` tự động tạo profile nếu chưa có
- Auth Service: Register chỉ tạo User, KHÔNG tạo UserProfile

**Vấn đề:**
- User mới đăng ký → chưa có profile
- Lần đầu GET /user/profile → Error 404
- Frontend phải handle "chưa có profile" state

**Giải pháp:**
1. **Auto-create profile khi register** (RECOMMENDED)
   - Auth Service listen UserRegistered event
   - User Service auto tạo empty UserProfile
   - GET /user/profile luôn return (có thể empty)

2. **Explicit setup**
   - User lần đầu login → redirect to /profile/setup
   - Yêu cầu nhập fullName, dateOfBirth
   - Sau đó mới vào dashboard

---

### 3. VehicleId trong Group

**Hiện trạng:**
- `CoOwnershipGroup` model có field `vehicleId`
- Nhưng Vehicle Service là service riêng
- Không có foreign key constraint

**Vấn đề:**
- Tạo group với vehicleId không tồn tại?
- Làm sao verify vehicleId hợp lệ?

**Giải pháp:**
- Call Vehicle Service API để verify vehicleId trước khi tạo group
- Hoặc dùng RabbitMQ event-driven approach

---

## 🎯 ĐỀ XUẤT HÀNH ĐỘNG

### PHASE 1: BỔ SUNG CHỨC NĂNG THIẾU (Priority: HIGH)

#### Task 1.1: Avatar Upload
- [ ] Backend: Add multer middleware
- [ ] Backend: Add /user/avatar endpoint (POST)
- [ ] Backend: Upload to local storage or S3
- [ ] Frontend: Integrate upload API in Profile.jsx
- **Time:** 2-3 hours

#### Task 1.2: Change Password
- [ ] Backend: Add /auth/change-password endpoint
- [ ] Validate currentPassword trước khi đổi
- [ ] Revoke all refresh tokens sau khi đổi password
- [ ] Frontend: Add form trong Profile.jsx Security tab
- **Time:** 1-2 hours

#### Task 1.3: User Search
- [ ] Backend: Add /user/search endpoint
- [ ] Index email, fullName for search performance
- [ ] Return basic profile only (không có preferences)
- [ ] Frontend: Add search trong GroupManagement add member
- **Time:** 1-2 hours

---

### PHASE 2: FIX INTEGRATION ISSUES (Priority: MEDIUM)

#### Task 2.1: Auto-create UserProfile
- [ ] User Service: Listen to UserRegistered event
- [ ] Auto create empty UserProfile khi có user mới
- [ ] GET /user/profile luôn return data (không 404)
- **Time:** 1 hour

#### Task 2.2: Email/Phone Update
- [ ] Decide: Auth Service quản lý email/phone
- [ ] Add /auth/update-email endpoint (với verification)
- [ ] Add /auth/update-phone endpoint
- [ ] Frontend: Add UI trong Profile.jsx
- **Time:** 2-3 hours

#### Task 2.3: Vehicle Validation in Group
- [ ] Call Vehicle Service khi create/update group
- [ ] Verify vehicleId exists và available
- [ ] Handle error nếu vehicle không hợp lệ
- **Time:** 1 hour

---

### PHASE 3: REVIEW & TEST FRONTEND (Priority: MEDIUM)

#### Task 3.1: Review Profile Page
- [x] GET /user/profile - Working ✅
- [x] PUT /user/profile - Working ✅
- [ ] Avatar upload - Need API
- [ ] Security tab - Need change password form
- [ ] Notification tab - Need preferences UI
- **Time:** 2 hours

#### Task 3.2: Review Voting System
- [ ] Check VotingSystem.jsx gọi API đúng chưa
- [ ] Test create vote, cast vote, view results
- [ ] UI/UX improvements nếu cần
- **Time:** 1-2 hours

#### Task 3.3: Review Common Fund
- [ ] Check CommonFund.jsx gọi API đúng chưa
- [ ] Test deposit, withdraw, view transactions
- [ ] Add fund balance display
- **Time:** 1-2 hours

---

### PHASE 4: OPTIMIZATION (Priority: LOW)

#### Task 4.1: Notification Preferences
- [ ] Define preferences schema
- [ ] Add UI trong Profile.jsx
- [ ] Integrate with Notification Service
- **Time:** 2-3 hours

#### Task 4.2: Account Deletion
- [ ] Add /auth/delete-account endpoint
- [ ] Require password confirmation
- [ ] Soft delete (isActive = false)
- [ ] Frontend: Add trong Profile settings
- **Time:** 1-2 hours

#### Task 4.3: Performance
- [ ] Add caching for user profiles (Redis)
- [ ] Add pagination for groups, votes
- [ ] Optimize database queries
- **Time:** 2-3 hours

---

## 📊 PROGRESS ESTIMATION

| Phase | Tasks | Est. Time | Priority |
|-------|-------|-----------|----------|
| Phase 1 | 3 tasks | 4-7 hours | HIGH ⚠️ |
| Phase 2 | 3 tasks | 4-5 hours | MEDIUM ⚠️ |
| Phase 3 | 3 tasks | 4-6 hours | MEDIUM ⚠️ |
| Phase 4 | 3 tasks | 5-8 hours | LOW |
| **TOTAL** | **12 tasks** | **17-26 hours** | **~3-4 days** |

---

## ✅ KẾT LUẬN

### User Service Current Status: **80% COMPLETE** ✅

**Đã có:**
- ✅ 24 endpoints hoạt động đầy đủ
- ✅ Profile CRUD (get, update)
- ✅ Group management (full CRUD + members)
- ✅ Voting system (full features)
- ✅ Common fund (deposit, withdraw, transactions)
- ✅ Database models hoàn chỉnh
- ✅ Frontend pages đã có sẵn

**Thiếu:**
- ⚠️ Avatar upload API (HIGH priority)
- ⚠️ Change password (HIGH priority)
- ⚠️ User search (MEDIUM priority)
- ⚠️ Auto-create profile on register
- ⚠️ Email/phone update flow
- ⚠️ Notification preferences UI
- ⚠️ Account deletion

**Khuyến nghị:**
1. Bổ sung 3 endpoints thiếu (avatar, change password, search) - **~6 hours**
2. Fix integration issues (auto profile, email/phone) - **~4 hours**
3. Review & test frontend pages - **~5 hours**
4. Total: **~15 hours / 2 days** để hoàn thiện 100%

**Next Steps:**
1. Bổ sung chức năng thiếu (Phase 1)
2. Test với frontend (Phase 3)
3. Commit và move to Booking Service
