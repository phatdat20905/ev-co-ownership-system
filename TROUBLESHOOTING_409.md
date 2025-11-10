# 🔧 Troubleshooting Guide - Registration 409 Conflict

## ❗ Vấn đề

```
POST http://localhost:3000/api/v1/auth/register 409 (Conflict)
```

## 🔍 Nguyên nhân

Lỗi **409 Conflict** xảy ra khi:
1. **Email đã được đăng ký** - Có user khác đã sử dụng email này
2. **Số điện thoại đã được đăng ký** - Có user khác đã sử dụng số điện thoại này

## ✅ Giải pháp

### Option 1: Sử dụng Email/SĐT khác (Khuyến nghị)

Đơn giản là đổi email hoặc số điện thoại khác để đăng ký.

### Option 2: Xóa User cũ trong Database (Development Only)

**⚠️ CHỈ làm trong môi trường development/testing!**

#### Bước 1: Kết nối PostgreSQL

```bash
# Sử dụng psql
psql -U postgres -d ev_auth_db

# Hoặc sử dụng GUI tool như pgAdmin, DBeaver, TablePlus
```

#### Bước 2: Kiểm tra user đã tồn tại

```sql
-- Xem tất cả users
SELECT id, email, phone, role, is_email_verified, created_at 
FROM users 
ORDER BY created_at DESC;

-- Tìm user theo email cụ thể
SELECT * FROM users WHERE email = 'test@example.com';

-- Tìm user theo số điện thoại
SELECT * FROM users WHERE phone = '0901234567';
```

#### Bước 3: Xóa user (nếu cần)

```sql
-- Xóa user theo email
DELETE FROM users WHERE email = 'test@example.com';

-- Hoặc xóa user theo id
DELETE FROM users WHERE id = 'uuid-here';

-- Xóa tất cả users (NGUY HIỂM - chỉ dùng khi reset database)
TRUNCATE TABLE users CASCADE;
```

#### Bước 4: Xóa các bảng liên quan (optional)

```sql
-- Xóa email verifications của user đó
DELETE FROM email_verifications WHERE user_id = 'uuid-here';

-- Xóa refresh tokens của user đó
DELETE FROM refresh_tokens WHERE user_id = 'uuid-here';

-- Xóa KYC verifications (nếu có)
DELETE FROM kyc_verifications WHERE user_id = 'uuid-here';
```

### Option 3: Reset toàn bộ Database (Development Only)

**⚠️ Mất tất cả dữ liệu!**

```bash
# Stop tất cả services
# Ctrl+C trong các terminal đang chạy

# Drop và recreate database
cd backend/auth-service
npm run db:drop
npm run db:create
npm run db:migrate

# Tương tự cho các services khác
cd ../user-service
npm run db:drop
npm run db:create
npm run db:migrate

cd ../booking-service
npm run db:drop
npm run db:create
npm run db:migrate

# ... làm tương tự cho các service khác
```

---

## 📝 Frontend Error Handling (Đã cập nhật)

File `Register.jsx` đã được cập nhật để hiển thị error rõ ràng hơn:

```javascript
catch (error) {
  // Handle specific error codes
  if (error.response?.status === 409) {
    const errorMessage = error.response?.data?.message || 
      "Email hoặc số điện thoại đã được sử dụng";
    showErrorToast(errorMessage);
  } else if (error.response?.status === 400) {
    const errorMessage = error.response?.data?.message || 
      "Thông tin đăng ký không hợp lệ";
    showErrorToast(errorMessage);
  } else {
    showErrorToast(error.response?.data?.message || 
      error.message || 
      "Đăng ký thất bại. Vui lòng thử lại.");
  }
}
```

Bây giờ user sẽ thấy thông báo lỗi rõ ràng:
- **409:** "Email hoặc số điện thoại đã được sử dụng"
- **400:** "Thông tin đăng ký không hợp lệ"
- **Other:** Thông báo cụ thể từ backend

---

## 🧪 Testing Checklist

### Test Case 1: Đăng ký lần đầu
- ✅ Email: `newuser@example.com`
- ✅ Phone: `0909999999`
- **Expected:** 201 Created, redirect to verify-email

### Test Case 2: Đăng ký với email đã tồn tại
- ❌ Email: `test@example.com` (đã đăng ký)
- ✅ Phone: `0909999998` (mới)
- **Expected:** 409 Conflict, toast "Email hoặc số điện thoại đã được sử dụng"

### Test Case 3: Đăng ký với SĐT đã tồn tại
- ✅ Email: `newuser2@example.com` (mới)
- ❌ Phone: `0901234567` (đã đăng ký)
- **Expected:** 409 Conflict, toast "Email hoặc số điện thoại đã được sử dụng"

### Test Case 4: Đăng ký với cả email và SĐT đã tồn tại
- ❌ Email: `test@example.com` (đã đăng ký)
- ❌ Phone: `0901234567` (đã đăng ký)
- **Expected:** 409 Conflict, toast "Email hoặc số điện thoại đã được sử dụng"

---

## 🔐 Backend Validation

Backend đã implement validation đúng:

```javascript
// auth-service/src/services/authService.js
const existingUser = await db.User.findOne({
  where: { email: userData.email },
  transaction
});

if (existingUser) {
  throw new AppError(
    'User with this email already exists', 
    409, 
    'USER_ALREADY_EXISTS'
  );
}
```

**Lưu ý:** Backend hiện tại chỉ check **email**. Nếu cần check cả **phone**, thêm:

```javascript
const existingUser = await db.User.findOne({
  where: {
    [Op.or]: [
      { email: userData.email },
      { phone: userData.phone }
    ]
  },
  transaction
});

if (existingUser) {
  const field = existingUser.email === userData.email ? 'email' : 'phone';
  throw new AppError(
    `User with this ${field} already exists`, 
    409, 
    'USER_ALREADY_EXISTS'
  );
}
```

---

## 🎯 Recommended Solution for Development

**Cách nhanh nhất để test:**

1. **Sử dụng email generator:**
   - `test1@example.com`
   - `test2@example.com`
   - `test3@example.com`
   - Mỗi lần test dùng email khác

2. **Hoặc dùng temp email service:**
   - [Temp Mail](https://temp-mail.org)
   - [Guerrilla Mail](https://www.guerrillamail.com)
   - [10 Minute Mail](https://10minutemail.com)

3. **Hoặc sử dụng + trick với Gmail:**
   - `yourname+test1@gmail.com`
   - `yourname+test2@gmail.com`
   - `yourname+test3@gmail.com`
   - Tất cả đều gửi về `yourname@gmail.com`

---

## 📊 Database Schema

### Table: users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  is_email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Constraints:**
- ✅ `email` - UNIQUE constraint
- ✅ `phone` - UNIQUE constraint (nếu đã implement)

---

## 🚀 Next Steps

1. **Test registration với email mới**
2. **Xác thực email** (check email inbox)
3. **Login** với tài khoản vừa tạo
4. **Test KYC flow** ở trang `/kyc-status`

---

## 📞 Support

Nếu vẫn gặp lỗi:
1. Check terminal logs của `auth-service`
2. Check database có user với email đó không
3. Xem network tab trong DevTools để xem response body đầy đủ

---

**Last Updated:** 2025-11-09  
**Version:** 1.0
