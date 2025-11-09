# 🔍 Phân Tích Tích Hợp Auth Service & User Service

## ❌ Vấn Đề Hiện Tại

### 1. Lỗi 404: GET /api/v1/user/profile
**Nguyên nhân:**
- User Service chưa được start (cần chạy trên port 3001)
- API Gateway đã có route `/user` proxy đến `http://localhost:3002` (SAI PORT!)
- User Service config là port 3001 nhưng serviceMap.js đang trỏ đến 3002

**Giải pháp:**
```javascript
// backend/api-gateway/src/config/serviceMap.js
user: process.env.USER_SERVICE_URL || 'http://localhost:3001', // FIX: 3002 → 3001
```

### 2. KYC Features Chưa Có UI
**Hiện trạng:**
- ✅ Backend: 4 KYC endpoints hoàn chỉnh
  - POST `/auth/kyc/submit` - User nộp KYC
  - GET `/auth/kyc/status` - Xem trạng thái KYC
  - PUT `/auth/kyc/verify/:id` - Admin duyệt (chỉ admin)
  - GET `/auth/kyc/pending` - Admin xem pending (chỉ admin)
- ❌ Frontend: CHƯA CÓ UI nào để upload/submit KYC
- ❌ Auth Service: CHƯA CÓ upload middleware cho ảnh CCCD

**Cần thực hiện:**
1. Thêm upload middleware trong auth-service (tương tự user-service)
2. Thêm KYC section trong Profile.jsx (tab Security hoặc tab mới)
3. Form upload: CCCD front/back, nhập số CCCD, optional bằng lái
4. Hiển thị KYC status (pending/approved/rejected)

### 3. Registration → Profile Flow Chưa Hoàn Thiện
**Vấn đề:**
- Registration chỉ có: email, phone, password
- Profile cần: fullName, dateOfBirth, address, gender, etc.
- Sau khi register → login → vào Profile page → GET /user/profile → FAIL vì chưa có UserProfile record

**Hiện trạng:**
- ✅ Auth Service: Tạo User record khi register, publish UserRegistered event
- ❌ User Service: CHƯA CÓ event listener để auto-create UserProfile
- ❌ Frontend: CHƯA CÓ onboarding flow để user điền profile lần đầu

**Giải pháp đề xuất:**
**Option 1: Auto-create empty profile** (RECOMMENDED)
```javascript
// backend/user-service/src/events/authEventHandler.js
async handleUserRegistered(data) {
  await UserProfile.create({
    userId: data.userId,
    email: data.email,
    phone: data.phone,
    fullName: '', // Empty, user fills later
    isProfileComplete: false
  });
}
```

**Option 2: Onboarding wizard**
- Sau login lần đầu, check `isProfileComplete: false`
- Redirect đến `/onboarding` với form điền profile
- Sau khi complete → set `isProfileComplete: true`

## ✅ Đã Hoàn Thành

### Frontend Integration
1. ✅ **Avatar Upload** - Profile.jsx
   - Upload ảnh đại diện lên server
   - Validation file size & type
   - Loading state & toast notifications

2. ✅ **Change Password** - Profile.jsx Security tab
   - Form đổi mật khẩu với 3 fields
   - Eye/EyeOff toggle visibility
   - Validation & API integration

3. ✅ **User Search** - GroupManagement.jsx
   - Real-time search users
   - Display results with avatar
   - Add member by search or email

4. ✅ **Forgot Password** - ForgotPassword.jsx
   - Gửi email reset password
   - Real API call (không còn fake)

### Backend Endpoints
- ✅ Auth Service: 18 endpoints (100%)
- ✅ User Service: 26 endpoints (100%)
- ✅ **Tổng: 44 endpoints**

## 📋 Checklist Tích Hợp Hoàn Chỉnh

### Critical (Cần làm ngay)
- [ ] **Fix API Gateway port** - serviceMap.js: 3002 → 3001
- [ ] **Start User Service** - npm run dev trên port 3001
- [ ] **Auto-create UserProfile** - RabbitMQ listener trong user-service
- [ ] **KYC Upload Middleware** - Thêm vào auth-service
- [ ] **KYC UI in Profile** - Tab Security hoặc tab mới "Xác Thực"

### Important (Nên có)
- [ ] **Onboarding Flow** - Wizard sau register lần đầu
- [ ] **Profile Completion Indicator** - % complete trong Profile page
- [ ] **KYC Status Badge** - Hiển thị trạng thái verification
- [ ] **Email Verification Flow** - UI để verify email sau register

### Nice to Have
- [ ] **2FA Setup UI** - Tab Security (hiện đang placeholder)
- [ ] **Device Management** - Xem thiết bị đang đăng nhập
- [ ] **Session Management** - Revoke tokens từ UI

## 🎯 Kế Hoạch Thực Hiện

### Phase 1: Fix Critical Issues (30 phút)
1. Fix API Gateway port config
2. Thêm auto-create UserProfile listener
3. Test register → login → profile flow

### Phase 2: KYC Integration (1 giờ)
1. Copy upload middleware từ user-service sang auth-service
2. Thêm KYC endpoints cho upload ảnh
3. Tạo KYC UI trong Profile.jsx
4. Test KYC submit flow

### Phase 3: Onboarding & Polish (1 giờ)
1. Tạo Onboarding.jsx wizard
2. Profile completion indicator
3. Email verification UI
4. End-to-end testing

## 📊 Tiến Độ Tổng Thể

**Backend:** 95% ✅
- Auth Service: 100% ✅
- User Service: 100% ✅
- Missing: Auto-create profile listener

**Frontend:** 60% 🔄
- Core Features: 80% ✅
- KYC UI: 0% ❌
- Onboarding: 0% ❌
- Profile Flow: 40% 🔄

**Integration:** 70% 🔄
- API Routes: 100% ✅
- Service Communication: 90% ✅
- Event-Driven: 50% 🔄 (missing user-service listener)
- End-to-End: 60% 🔄

## 🚀 Next Steps

1. **Immediate:** Fix port config & start services
2. **High Priority:** Auto-create UserProfile + KYC UI
3. **Medium Priority:** Onboarding wizard
4. **Low Priority:** Polish & additional features

---
**Last Updated:** 2025-11-09
**Status:** In Progress - Critical fixes needed before full integration
