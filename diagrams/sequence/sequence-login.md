# Sequence Diagram - Đăng nhập

> Quy trình đăng nhập với JWT authentication

```mermaid
sequenceDiagram
    actor User as Người dùng
    participant FE as Frontend<br/>(React)
    participant GW as API Gateway
    participant Auth as Auth Service
    participant Redis as Redis Cache
    participant DB as PostgreSQL
    participant User_Svc as User Service

    User->>FE: Nhập email & mật khẩu
    FE->>FE: Validate form
    
    alt Validation lỗi
        FE-->>User: Hiển thị lỗi validation
    end
    
    FE->>GW: POST /api/auth/login<br/>{email, password}
    GW->>GW: Rate limiting check
    
    alt Vượt giới hạn
        GW-->>FE: 429 Too Many Requests
        FE-->>User: Vui lòng thử lại sau
    end
    
    GW->>Auth: Forward request
    Auth->>DB: SELECT * FROM users<br/>WHERE email = ?
    
    alt User không tồn tại
        DB-->>Auth: NULL
        Auth-->>GW: 401 Unauthorized
        GW-->>FE: Email hoặc mật khẩu sai
        FE-->>User: Đăng nhập thất bại
    end
    
    DB-->>Auth: User record
    
    Auth->>Auth: Kiểm tra isActive
    alt Tài khoản bị vô hiệu hóa
        Auth-->>GW: 403 Forbidden
        GW-->>FE: Tài khoản đã bị khóa
        FE-->>User: Liên hệ admin
    end
    
    Auth->>Auth: bcrypt.compare(password, hash)
    
    alt Mật khẩu sai
        Auth->>DB: Ghi log đăng nhập thất bại
        Auth-->>GW: 401 Unauthorized
        GW-->>FE: Email hoặc mật khẩu sai
        FE-->>User: Đăng nhập thất bại
    end
    
    Auth->>Auth: Tạo Access Token (JWT)<br/>exp: 15 phút
    Auth->>Auth: Tạo Refresh Token (JWT)<br/>exp: 7 ngày
    
    Auth->>DB: INSERT INTO refresh_tokens<br/>(user_id, token, expires_at)
    DB-->>Auth: Token saved
    
    Auth->>Redis: SET session:{user_id}<br/>{...user_data}<br/>EX 900
    Redis-->>Auth: OK
    
    Auth->>DB: UPDATE users<br/>SET last_login_at = NOW()<br/>WHERE id = user_id
    
    Auth->>User_Svc: GET /api/users/{user_id}/profile
    User_Svc->>DB: SELECT * FROM user_profiles
    
    alt Profile không tồn tại
        User_Svc->>DB: INSERT INTO user_profiles<br/>(user_id, ...defaults)
        DB-->>User_Svc: Profile created
    end
    
    User_Svc-->>Auth: {profile_data}
    
    Auth-->>GW: 200 OK<br/>{<br/>  accessToken,<br/>  refreshToken,<br/>  user: {...},<br/>  profile: {...}<br/>}
    
    GW-->>FE: Response
    
    FE->>FE: Lưu tokens vào localStorage
    FE->>FE: Lưu user vào Zustand store
    FE->>FE: Redirect to dashboard
    
    FE-->>User: Đăng nhập thành công
    
    Note over FE,Redis: Sau 15 phút, access token hết hạn
    
    User->>FE: Request API (với expired token)
    FE->>GW: GET /api/... <br/>Authorization: Bearer {expired_token}
    GW->>Auth: Verify token
    Auth->>Auth: JWT verify
    
    alt Token hết hạn
        Auth-->>GW: 401 Token expired
        GW-->>FE: 401 Unauthorized
        FE->>FE: Phát hiện token hết hạn
        FE->>GW: POST /api/auth/refresh<br/>{refreshToken}
        GW->>Auth: Refresh request
        Auth->>DB: SELECT * FROM refresh_tokens<br/>WHERE token = ?
        
        alt Refresh token không hợp lệ
            Auth-->>GW: 401 Invalid refresh token
            GW-->>FE: Yêu cầu đăng nhập lại
            FE->>FE: Clear localStorage
            FE->>FE: Redirect to /login
            FE-->>User: Phiên làm việc hết hạn
        end
        
        DB-->>Auth: Token record
        Auth->>Auth: Tạo Access Token mới
        Auth-->>GW: 200 OK {accessToken}
        GW-->>FE: New access token
        FE->>FE: Cập nhật token
        FE->>GW: Retry request với token mới
        GW-->>FE: Success
    end
```

## Ghi chú

### Luồng chính:

1. **Người dùng nhập thông tin**: Email + Password
2. **Frontend validation**: Kiểm tra định dạng trước khi gửi
3. **API Gateway**: Rate limiting (tối đa 5 requests/phút)
4. **Auth Service kiểm tra**:
   - User tồn tại trong DB
   - Tài khoản đang active
   - Mật khẩu đúng (bcrypt compare)
5. **Tạo tokens**:
   - **Access Token**: JWT, exp 15 phút, chứa {user_id, email, role}
   - **Refresh Token**: JWT, exp 7 ngày, lưu vào DB
6. **Lưu session**: Redis cache (15 phút)
7. **Lấy profile**: Từ User Service (tạo mới nếu chưa có)
8. **Trả về**: Tokens + user data + profile
9. **Frontend lưu**: localStorage + Zustand store
10. **Redirect**: Dashboard

### Xử lý token hết hạn:

**Khi Access Token hết hạn (sau 15 phút)**:
1. API trả về 401
2. Frontend tự động gọi `/auth/refresh` với Refresh Token
3. Nhận Access Token mới
4. Retry request ban đầu

**Nếu Refresh Token cũng hết hạn (sau 7 ngày)**:
- Yêu cầu đăng nhập lại
- Clear localStorage
- Redirect to /login

### Bảo mật:

- **Password**: Bcrypt hash với salt 10 rounds
- **JWT**: Signed với secret key
- **Rate Limiting**: 5 login attempts/phút
- **Session**: Redis cache với TTL 15 phút
- **Refresh Token**: Lưu DB, có thể revoke

### Redis Session:
```json
{
  "user_id": "uuid",
  "email": "user@example.com",
  "role": "co_owner",
  "is_verified": true,
  "last_activity": "2025-01-20T10:30:00Z"
}
```

### Response thành công:
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "co_owner",
    "isVerified": true,
    "isActive": true
  },
  "profile": {
    "full_name": "Nguyễn Văn A",
    "phone": "0123456789",
    "avatar": "https://..."
  }
}
```

### Xử lý lỗi:

- **401**: Email/password sai hoặc token hết hạn
- **403**: Tài khoản bị khóa
- **429**: Quá nhiều requests
- **500**: Lỗi server
