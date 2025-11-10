# Registration Flow - Hoàn chỉnh

## Luồng đăng ký đầy đủ

### 1. Người dùng điền form đăng ký (Register.jsx)
```javascript
// frontend/src/pages/auth/Register.jsx
const profileData = {
  fullName: formData.fullName,
  phone: formData.phone,
  dateOfBirth: formData.dateOfBirth,
  gender: formData.gender,
  address: formData.address
};

// Store in localStorage for later
localStorage.setItem('pendingProfileData', JSON.stringify(profileData));

// Call register API
await authService.register({
  email,
  password,
  role
});
```

### 2. Backend tạo user và gửi email (Auth Service)
```javascript
// backend/auth-service/src/services/authService.js
// - Tạo User trong database
// - Hash password
// - Tạo EmailVerification token
// - Gửi email xác thực
```

### 3. Người dùng click link trong email
```
Email chứa: https://frontend.com/verify-email?token=abc123
```

### 4. Frontend verify email (VerifyEmail.jsx)
```javascript
// Gọi API verify
const response = await authService.verifyEmail(token);
// Response: { userId, email }

// Lấy profile data từ localStorage
const profileData = JSON.parse(localStorage.getItem('pendingProfileData'));
profileData.userId = response.data.userId;
profileData.email = response.data.email;

// Tạo profile qua public API
await userService.createProfile(profileData);
localStorage.removeItem('pendingProfileData');
```

### 5. Backend verify email và trả userId (Auth Service)
```javascript
// backend/auth-service/src/services/authService.js
return {
  message: 'Email verified successfully',
  userId: verification.userId,
  email: verification.user.email
};
```

### 6. Frontend tạo profile (User Service - PUBLIC API)
```javascript
// frontend calls: POST /user/profile/create
// backend: backend/user-service/src/routes/userRoutes.js
// Public route (no auth required)
router.post('/profile/create', validate(userValidators.createProfile), userController.createProfile);
```

### 7. Backend lưu profile (User Service)
```javascript
// backend/user-service/src/services/userService.js
const profile = await db.UserProfile.create({
  userId,
  fullName,
  dateOfBirth,
  gender,
  phoneNumber,
  email,
  address,
  avatarUrl,
  bio,
  preferences
});
```

### 8. Redirect to Login
```javascript
// Sau 3 giây tự động chuyển về /login
setTimeout(() => navigate('/login'), 3000);
```

## API Endpoints

### Auth Service (Port 3001)
- `POST /api/v1/auth/register` - Đăng ký user mới
- `POST /api/v1/auth/verify-email` - Xác thực email
- `POST /api/v1/auth/login` - Đăng nhập

### User Service (Port 3002)
- `POST /api/v1/user/profile/create` - Tạo profile (PUBLIC - không cần auth)
- `GET /api/v1/user/profile` - Lấy profile (PROTECTED - cần auth)
- `PUT /api/v1/user/profile` - Cập nhật profile (PROTECTED - cần auth)

## Database Schema

### users (Auth Service)
```sql
id UUID PRIMARY KEY
email VARCHAR(255) UNIQUE
password_hash VARCHAR(255)
is_verified BOOLEAN
role ENUM('guest', 'co-owner', 'admin')
created_at TIMESTAMP
updated_at TIMESTAMP
```

### user_profiles (User Service)
```sql
id UUID PRIMARY KEY
user_id UUID UNIQUE -- FK to auth service
full_name VARCHAR(255)
date_of_birth DATE
gender ENUM('male', 'female', 'other')
phone_number VARCHAR(20)
email VARCHAR(255)
address TEXT
avatar_url VARCHAR(500)
bio TEXT
preferences JSONB
created_at TIMESTAMP
updated_at TIMESTAMP
```

## Testing Flow

1. **Register**: POST `/api/v1/auth/register`
```json
{
  "email": "test@example.com",
  "password": "Test@123",
  "role": "guest"
}
```

2. **Check email** for verification link

3. **Verify**: POST `/api/v1/auth/verify-email`
```json
{
  "token": "verification-token-from-email"
}
```
Response:
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "userId": "uuid-here",
    "email": "test@example.com"
  }
}
```

4. **Create Profile**: POST `/api/v1/user/profile/create`
```json
{
  "userId": "uuid-from-verify",
  "email": "test@example.com",
  "fullName": "Nguyen Van A",
  "phoneNumber": "0123456789",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "address": "123 ABC Street"
}
```

5. **Login**: POST `/api/v1/auth/login`
```json
{
  "email": "test@example.com",
  "password": "Test@123"
}
```

6. **Get Profile**: GET `/api/v1/user/profile` (with Bearer token)

## Error Handling

### Registration Errors
- Email already exists → 409 Conflict
- Invalid email format → 400 Bad Request
- Weak password → 400 Bad Request

### Verification Errors
- Invalid token → 400 Bad Request
- Expired token → 400 Bad Request
- Token already used → 400 Bad Request

### Profile Creation Errors
- Profile already exists → 409 Conflict
- Missing userId → 400 Bad Request
- Invalid data format → 400 Bad Request

## Frontend State Management

### LocalStorage Keys
- `pendingProfileData` - Dữ liệu profile chờ tạo sau verify
- `authToken` - JWT token sau login
- `userData` - Thông tin user đã login

### Flow States
1. **Registration**: Form → Store data → Register API → Redirect to verify notice
2. **Verification**: Click email link → Verify API → Create Profile API → Success message
3. **Login**: Login form → Login API → Store token → Redirect to dashboard

## Security Notes

1. **Public API** (`/profile/create`) không cần auth vì:
   - Chỉ gọi 1 lần sau verify email
   - Yêu cầu userId hợp lệ từ verify response
   - Không thể tạo profile trùng (unique constraint)

2. **Protected APIs** cần Bearer token:
   - GET/PUT /profile
   - All dashboard APIs
   - User management APIs

3. **Email Verification** bảo mật:
   - Token unique và random
   - Token có thời hạn (24h)
   - Token chỉ dùng 1 lần
   - Token stored hashed in DB
