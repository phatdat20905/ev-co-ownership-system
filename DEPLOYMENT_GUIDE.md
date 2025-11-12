# 📚 HƯỚNG DẪN DEPLOYMENT & SỬ DỤNG
## EV Co-ownership & Cost-sharing System

---

## 🚀 HƯỚNG DẪN DEPLOYMENT

### Prerequisites (Yêu cầu)

**Phần mềm cần cài đặt:**
- Node.js >= 18.x
- PostgreSQL >= 14.x
- Docker & Docker Compose (optional, khuyến nghị)
- Git
- npm hoặc yarn

**Tài khoản dịch vụ:**
- SMTP server (email gửi xác thực)
- Redis (optional, cho session management)
- Cloud storage (AWS S3, Google Cloud Storage, etc.) cho lưu trữ file

---

### 1. Clone Repository

```bash
git clone https://github.com/your-org/ev-co-ownership-system.git
cd ev-co-ownership-system
```

---

### 2. Cấu hình Backend

#### 2.1. Tạo Database PostgreSQL

```sql
-- Tạo database cho các services
CREATE DATABASE ev_auth;
CREATE DATABASE ev_user;
CREATE DATABASE ev_booking;
CREATE DATABASE ev_cost;
CREATE DATABASE ev_vehicle;
CREATE DATABASE ev_contract;
CREATE DATABASE ev_notification;
CREATE DATABASE ev_ai;
CREATE DATABASE ev_admin;

-- Hoặc dùng 1 database chung (đơn giản hơn)
CREATE DATABASE ev_coownership;
```

#### 2.2. Cấu hình Environment Variables

**Tạo file `.env` trong mỗi service:**

**Backend/auth-service/.env:**
```env
PORT=3001
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ev_auth
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRES_IN=7d

# SMTP (Email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_NAME=EV Co-ownership
SMTP_FROM_EMAIL=noreply@evcoownership.com

# Frontend URL
FRONTEND_URL=http://localhost:5173

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

**Backend/user-service/.env:**
```env
PORT=3002
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=ev_user
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Service URLs (for inter-service communication)
AUTH_SERVICE_URL=http://localhost:3001
NOTIFICATION_SERVICE_URL=http://localhost:3007
```

**Backend/booking-service/.env:**
```env
PORT=3003
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=ev_booking
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# QR Code
QR_CODE_SECRET=your_qr_code_secret
QR_CODE_EXPIRES_IN=15m

# Service URLs
USER_SERVICE_URL=http://localhost:3002
VEHICLE_SERVICE_URL=http://localhost:3005
NOTIFICATION_SERVICE_URL=http://localhost:3007
```

**Backend/cost-service/.env:**
```env
PORT=3004
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=ev_cost
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Payment Gateways
MOMO_PARTNER_CODE=your_momo_partner_code
MOMO_ACCESS_KEY=your_momo_access_key
MOMO_SECRET_KEY=your_momo_secret_key
MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api

VNPAY_TMN_CODE=your_vnpay_tmn_code
VNPAY_HASH_SECRET=your_vnpay_hash_secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:5173/payment/callback
```

**Backend/vehicle-service/.env:**
```env
PORT=3005
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=ev_vehicle
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

**Backend/contract-service/.env:**
```env
PORT=3006
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=ev_contract
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Digital Signature
SIGNATURE_SECRET=your_signature_secret
CONTRACT_STORAGE_PATH=./contracts
```

**Backend/notification-service/.env:**
```env
PORT=3007
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=ev_notification
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# WebSocket
SOCKET_IO_CORS_ORIGIN=http://localhost:5173

# Firebase (for push notifications)
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
```

**Backend/ai-service/.env:**
```env
PORT=3008
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=ev_ai
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# AI/ML Models
OPENAI_API_KEY=your_openai_api_key
ML_MODEL_PATH=./models
```

**Backend/admin-service/.env:**
```env
PORT=3009
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=ev_admin
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# All service URLs for admin monitoring
AUTH_SERVICE_URL=http://localhost:3001
USER_SERVICE_URL=http://localhost:3002
BOOKING_SERVICE_URL=http://localhost:3003
COST_SERVICE_URL=http://localhost:3004
VEHICLE_SERVICE_URL=http://localhost:3005
CONTRACT_SERVICE_URL=http://localhost:3006
NOTIFICATION_SERVICE_URL=http://localhost:3007
AI_SERVICE_URL=http://localhost:3008
```

**Backend/api-gateway/.env:**
```env
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Service URLs
AUTH_SERVICE_URL=http://localhost:3001
USER_SERVICE_URL=http://localhost:3002
BOOKING_SERVICE_URL=http://localhost:3003
COST_SERVICE_URL=http://localhost:3004
VEHICLE_SERVICE_URL=http://localhost:3005
CONTRACT_SERVICE_URL=http://localhost:3006
NOTIFICATION_SERVICE_URL=http://localhost:3007
AI_SERVICE_URL=http://localhost:3008
ADMIN_SERVICE_URL=http://localhost:3009
```

#### 2.3. Cài đặt Dependencies & Chạy Migrations

```bash
# Cài dependencies cho từng service
cd backend/auth-service && npm install
cd backend/user-service && npm install
cd backend/booking-service && npm install
cd backend/cost-service && npm install
cd backend/vehicle-service && npm install
cd backend/contract-service && npm install
cd backend/notification-service && npm install
cd backend/ai-service && npm install
cd backend/admin-service && npm install
cd backend/api-gateway && npm install

# Cài shared package
cd backend/shared && npm install

# Chạy migrations
cd backend/auth-service && npx sequelize-cli db:migrate
cd backend/user-service && npx sequelize-cli db:migrate
cd backend/booking-service && npx sequelize-cli db:migrate
cd backend/cost-service && npx sequelize-cli db:migrate
cd backend/vehicle-service && npx sequelize-cli db:migrate
cd backend/contract-service && npx sequelize-cli db:migrate
cd backend/notification-service && npx sequelize-cli db:migrate
cd backend/ai-service && npx sequelize-cli db:migrate
cd backend/admin-service && npx sequelize-cli db:migrate

# Seed initial data (optional)
cd backend/auth-service && npx sequelize-cli db:seed:all
cd backend/user-service && npx sequelize-cli db:seed:all
```

#### 2.4. Khởi động Backend Services

**Option 1: Chạy từng service riêng (Development)**

```bash
# Terminal 1: API Gateway
cd backend/api-gateway && npm run dev

# Terminal 2: Auth Service
cd backend/auth-service && npm run dev

# Terminal 3: User Service
cd backend/user-service && npm run dev

# Terminal 4: Booking Service
cd backend/booking-service && npm run dev

# Terminal 5: Cost Service
cd backend/cost-service && npm run dev

# Terminal 6: Vehicle Service
cd backend/vehicle-service && npm run dev

# Terminal 7: Contract Service
cd backend/contract-service && npm run dev

# Terminal 8: Notification Service
cd backend/notification-service && npm run dev

# Terminal 9: AI Service
cd backend/ai-service && npm run dev

# Terminal 10: Admin Service
cd backend/admin-service && npm run dev
```

**Option 2: Dùng Docker Compose (Khuyến nghị)**

```bash
# Development
docker-compose -f docker-compose.dev.yml up

# Production
docker-compose -f docker-compose.prod.yml up -d
```

---

### 3. Cấu hình Frontend

#### 3.1. Environment Variables

**Tạo file `frontend/.env`:**

```env
# API Base URL
VITE_API_BASE_URL=http://localhost:3000/api/v1

# API Timeout
VITE_API_TIMEOUT=30000

# WebSocket URL
VITE_SOCKET_URL=http://localhost:3007

# Google Maps API (optional)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Firebase (for push notifications)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id

# App Info
VITE_APP_NAME=EV Co-ownership System
VITE_APP_VERSION=1.0.0
```

#### 3.2. Cài đặt & Chạy Frontend

```bash
cd frontend

# Install dependencies
npm install

# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Frontend sẽ chạy tại: **http://localhost:5173**

---

### 4. Production Deployment

#### 4.1. Frontend (Vercel/Netlify)

**Build:**
```bash
cd frontend
npm run build
```

**Deploy to Vercel:**
```bash
npm install -g vercel
vercel --prod
```

**Deploy to Netlify:**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

#### 4.2. Backend (AWS/Google Cloud/Azure)

**Docker Build:**
```bash
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

**PM2 (Alternative):**
```bash
# Install PM2
npm install -g pm2

# Start all services
pm2 start ecosystem.config.js

# Monitor
pm2 monit

# Save configuration
pm2 save
pm2 startup
```

**Nginx Reverse Proxy:**
```nginx
server {
    listen 80;
    server_name api.evcoownership.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name app.evcoownership.com;

    root /var/www/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 📖 HƯỚNG DẪN SỬ DỤNG

### 1. Đăng ký & Đăng nhập

#### Đăng ký tài khoản mới:
1. Truy cập **http://localhost:5173/auth/register**
2. Điền đầy đủ thông tin:
   - Họ và tên
   - Email hoặc Số điện thoại
   - Mật khẩu (tối thiểu 8 ký tự)
   - Ngày sinh
   - Địa chỉ
3. Nhấn **"Đăng ký"**
4. Kiểm tra email để xác thực tài khoản

#### Đăng nhập:
1. Truy cập **http://localhost:5173/auth/login**
2. Nhập Email/SĐT và Mật khẩu
3. Tích **"Ghi nhớ đăng nhập"** nếu muốn
4. Nhấn **"Đăng nhập"**

---

### 2. Xác thực KYC (Know Your Customer)

Sau khi đăng nhập lần đầu, bạn cần hoàn tất KYC:

1. Vào **Hồ sơ → KYC Verification**
2. Upload các giấy tờ:
   - CMND/CCCD (Mặt trước & mặt sau)
   - Giấy phép lái xe
   - Ảnh selfie cầm CMND
3. Nhấn **"Gửi yêu cầu xác minh"**
4. Chờ Admin phê duyệt (1-2 ngày làm việc)

---

### 3. Quản lý Nhóm Đồng Sở Hữu

#### 3.1. Tạo Nhóm Mới

1. Vào **Dashboard → Quản lý Nhóm → Tạo Nhóm**
2. Điền thông tin:
   - Tên nhóm
   - Mô tả
   - Quy định nhóm (tuỳ chọn)
3. Nhấn **"Tạo nhóm"**

#### 3.2. Thêm Thành Viên

1. Vào **Quản lý Nhóm → Chi tiết nhóm**
2. Tab **"Thành viên"** → **"Thêm thành viên"**
3. Nhập Email/SĐT của người muốn mời
4. Thiết lập **Tỷ lệ sở hữu** (VD: 40%, 30%, 30%)
   - **Lưu ý:** Tổng phải bằng 100%
5. Phân quyền: **Admin, Moderator, Member**
6. Nhấn **"Gửi lời mời"**

#### 3.3. Quản lý Tỷ Lệ Sở Hữu

1. Vào **Quản lý Nhóm → Thành viên**
2. Nhấn icon **"Edit"** bên cạnh tên thành viên
3. Điều chỉnh % sở hữu
4. Nhấn **"Cập nhật"**

---

### 4. Đặt Lịch & Sử Dụng Xe

#### 4.1. Xem Lịch Chung

1. Vào **Dashboard → Đặt Xe → Lịch**
2. Chọn **Tháng/Tuần/Ngày** để xem
3. Các màu sắc:
   - 🟢 **Xanh:** Xe trống
   - 🔴 **Đỏ:** Đã được đặt
   - 🟡 **Vàng:** Đang sử dụng

#### 4.2. Đặt Lịch Mới

1. Nhấn vào **ô thời gian trống** trên lịch
2. Hoặc vào **"Đặt xe mới"**
3. Điền thông tin:
   - Xe (nếu nhóm có nhiều xe)
   - Ngày & Giờ bắt đầu
   - Ngày & Giờ kết thúc
   - Mục đích (Công việc/Cá nhân/Khác)
   - Ghi chú (tuỳ chọn)
4. Hệ thống sẽ kiểm tra:
   - **Xung đột lịch:** Nếu trùng, sẽ hiển thị thông báo
   - **Fair Scheduling:** Điểm ưu tiên dựa trên % sở hữu & lịch sử
5. Nhấn **"Đặt lịch"**

#### 4.3. Fair Scheduling (Ưu tiên công bằng)

**Công thức tính điểm ưu tiên:**
```
Điểm = (% sở hữu × 0.4) + (Mức thiếu hụt sử dụng × 0.6)

Ví dụ:
- Thành viên A: 40% sở hữu, đã dùng 10% tổng giờ
  → Thiếu hụt = 40% - 10% = +30%
  → Điểm = 16 + 18 = 34 (CAO)

- Thành viên C: 30% sở hữu, đã dùng 50% tổng giờ
  → Thiếu hụt = 30% - 50% = -20% (vượt)
  → Điểm = 12 - 12 = 0 (THẤP, bị chặn nếu > 150%)
```

**Quy tắc:**
- ⛔ **Chặn đặt lịch:** Nếu đã sử dụng vượt >150% tỷ lệ sở hữu
- ⚠️ **Cảnh báo:** Nếu sử dụng vượt >120%
- ✅ **Ưu tiên cao:** Người ít dùng hơn được ưu tiên

---

### 5. Check-in & Check-out (Dành cho Staff)

#### 5.1. Check-in (Nhận xe)

1. Staff đăng nhập → **Dashboard Staff → Check-in/Check-out**
2. Tab **"Check-in"**
3. **Quét mã QR** của booking (khách hàng hiển thị từ app)
   - Hoặc nhập **Mã booking** thủ công
4. Điền thông tin:
   - **Số km hiện tại**
   - **% pin còn lại**
   - **Chụp 4-6 ảnh xe** (trước, sau, 4 góc)
   - **Ghi chú tình trạng xe**
5. Nhấn **"Ký số"** (digital signature)
6. Nhấn **"Xác nhận Check-in"**

#### 5.2. Check-out (Trả xe)

1. Tab **"Check-out"**
2. Quét QR hoặc nhập mã booking
3. Điền thông tin:
   - **Số km sau khi dùng**
   - **% pin hiện tại**
   - **Chụp ảnh xe**
   - **Báo cáo hư hỏng** (nếu có):
     - Vị trí hư hỏng
     - Mức độ: Nhỏ/Trung bình/Nghiêm trọng
     - Mô tả chi tiết
     - Chụp ảnh hư hỏng
4. **Ký số xác nhận**
5. Nhấn **"Hoàn tất Check-out"**

---

### 6. Chia Chi Phí & Thanh Toán

#### 6.1. Xem Chi Phí Cá Nhân

1. Vào **Dashboard → Tài Chính → Chi Phí Của Tôi**
2. Xem các khoản chi phí:
   - 🔋 **Sạc điện:** Tính theo kWh
   - 🔧 **Bảo dưỡng:** Chia theo % sở hữu
   - 🛡️ **Bảo hiểm:** Định kỳ hàng tháng
   - 🧼 **Vệ sinh xe:** Chia đều hoặc theo người sử dụng
   - 🚗 **Khác:** Sửa chữa, nâng cấp, v.v.

#### 6.2. Phương Thức Chia Chi Phí

**Hệ thống hỗ trợ 7 phương pháp:**

1. **Theo % sở hữu:**
   ```
   Chi phí bảo hiểm 10tr:
   - A (40%) → 4tr
   - B (30%) → 3tr
   - C (30%) → 3tr
   ```

2. **Theo mức sử dụng:**
   ```
   Chi phí sạc điện 1tr (500 kWh):
   - A dùng 200 kWh → 400k
   - B dùng 150 kWh → 300k
   - C dùng 150 kWh → 300k
   ```

3. **Hybrid (50% sở hữu + 50% sử dụng):**
   ```
   Bảo dưỡng 1tr:
   - A = (1tr × 50% × 40%) + (1tr × 50% × 40% sử dụng) = 400k
   ```

4. **Chi phí định kỳ:** Bảo hiểm, phí đường bộ
5. **Chi phí một lần:** Sửa lốp, thay pin
6. **Chi phí sạc:** Theo kWh tiêu thụ
7. **Báo cáo tháng:** Tự động tổng hợp tất cả

#### 6.3. Thanh Toán

1. Vào **Tài Chính → Thanh Toán**
2. Chọn khoản cần thanh toán
3. Chọn phương thức:
   - 💳 **VNPay**
   - 📱 **MoMo**
   - 🏦 **Chuyển khoản ngân hàng**
   - 💰 **Ví điện tử**
4. Nhấn **"Thanh toán"**
5. Hoàn tất theo hướng dẫn của cổng thanh toán

---

### 7. Bỏ Phiếu Nhóm

#### 7.1. Tạo Bỏ Phiếu

1. Vào **Quản lý Nhóm → Bỏ Phiếu → Tạo bỏ phiếu mới**
2. Điền:
   - **Tiêu đề:** "Nâng cấp hệ thống âm thanh"
   - **Mô tả:** "Đề xuất lắp loa JBL với chi phí 8.000.000đ"
   - **Loại quyết định:** Nâng cấp xe/Bảo hiểm/Bán xe/Khác
   - **Thời hạn:** Deadline bỏ phiếu
   - **Lựa chọn:**
     - Option 1: "Đồng ý"
     - Option 2: "Không đồng ý"
     - (Có thể thêm nhiều lựa chọn)
3. Nhấn **"Tạo bỏ phiếu"**

#### 7.2. Bỏ Phiếu

1. Vào **Bỏ Phiếu → Đang hoạt động**
2. Nhấn vào bỏ phiếu muốn tham gia
3. Đọc kỹ nội dung
4. Chọn 1 lựa chọn
5. Nhấn **"Xác nhận"**

#### 7.3. Xem Kết Quả

1. Tab **"Đã hoàn thành"**
2. Xem kết quả realtime:
   - Tỷ lệ % mỗi lựa chọn
   - Số lượng người đã bỏ phiếu
   - Kết quả: **Thông qua/Từ chối/Chưa đủ phiếu**

---

### 8. Quỹ Chung (Common Fund)

#### 8.1. Nộp Tiền Vào Quỹ

1. Vào **Quản lý Nhóm → Quỹ Chung → Nộp tiền**
2. Nhập số tiền
3. Chọn phương thức thanh toán
4. Nhấn **"Xác nhận nộp"**
5. Tiền sẽ được cộng vào quỹ chung

#### 8.2. Rút Tiền

1. **Quỹ Chung → Rút tiền**
2. Nhập số tiền muốn rút
3. Nhập lý do
4. Nhấn **"Gửi yêu cầu"**
5. **Admin nhóm** sẽ phê duyệt
6. Sau khi duyệt, tiền sẽ được chuyển về tài khoản

#### 8.3. Xem Lịch Sử Giao Dịch

1. Tab **"Lịch sử"**
2. Xem tất cả giao dịch:
   - 💵 **Nộp tiền**
   - 💸 **Rút tiền**
   - 🔧 **Chi phí bảo dưỡng**
   - 🛡️ **Chi phí bảo hiểm**
   - 🔋 **Chi phí sạc điện**
3. Filter theo:
   - Loại giao dịch
   - Thời gian
   - Thành viên

---

### 9. AI Recommendations (Đề xuất AI)

#### 9.1. Đề Xuất Lịch Sử Dụng

1. Vào **Dashboard → AI Recommendations → Lịch sử dụng**
2. Xem gợi ý:
   - 📅 **Thời gian tối ưu:** Khi nào nên đặt lịch
   - 🎯 **Mục tiêu sử dụng:** Số giờ khuyến nghị/tháng
   - ⚠️ **Cảnh báo:** Nếu sử dụng quá nhiều/ít

#### 9.2. Tối Ưu Chi Phí

1. Tab **"Tối ưu chi phí"**
2. Xem phân tích:
   - 💰 **Dự báo chi phí:** Tháng tới sẽ tốn bao nhiêu
   - 📊 **So sánh:** Chi phí tháng này vs tháng trước
   - 💡 **Gợi ý tiết kiệm:** Cách giảm chi phí

#### 9.3. Phân Tích Hành Vi

1. Tab **"Hành vi"**
2. Xem:
   - 🚗 **Thói quen sử dụng:** Thường dùng xe lúc nào
   - 📍 **Địa điểm phổ biến:** Hay đi đâu
   - ⏱️ **Thời lượng trung bình:** Mỗi lần dùng bao lâu

---

### 10. Chức Năng Admin

#### 10.1. Xác Minh KYC

1. **Admin Dashboard → KYC Verification**
2. Xem danh sách chờ duyệt
3. Nhấn **"Chi tiết"** từng yêu cầu
4. Kiểm tra giấy tờ:
   - CMND/CCCD hợp lệ?
   - Ảnh selfie rõ ràng?
   - Giấy phép lái xe còn hạn?
5. Quyết định:
   - ✅ **Phê duyệt:** Nhấn "Approve"
   - ❌ **Từ chối:** Nhập lý do → "Reject"

#### 10.2. Quản Lý Nhân Viên

1. **Admin → Staff Management → Thêm nhân viên**
2. Điền thông tin:
   - Họ tên, Email, SĐT
   - Vai trò: Staff/Manager
   - Phân quyền:
     - Check-in/Check-out
     - Quản lý dịch vụ
     - Xem báo cáo
3. Nhấn **"Tạo tài khoản staff"**

#### 10.3. Báo Cáo Tài Chính

1. **Admin → Financial Reports**
2. Chọn:
   - **Khoảng thời gian:** Tháng/Quý/Năm
   - **Nhóm:** Tất cả hoặc chọn nhóm cụ thể
3. Xem báo cáo:
   - 💵 **Tổng doanh thu**
   - 💸 **Tổng chi phí**
   - 📊 **Biểu đồ xu hướng**
   - 👥 **Chi tiết từng thành viên**
4. **Xuất báo cáo:**
   - 📄 **PDF**
   - 📊 **Excel**

#### 10.4. Theo Dõi Tranh Chấp

1. **Admin → Dispute Management**
2. Xem các tranh chấp:
   - 🚗 **Lịch sử dụng**
   - 💰 **Chi phí**
   - 🔧 **Hư hỏng xe**
3. Xử lý:
   - Xem lịch sử & bằng chứng
   - Phân tích AI (nếu có)
   - Đưa ra phán quyết
   - Gửi thông báo cho các bên

---

## 🔐 BẢO MẬT & AN TOÀN

### Mật Khẩu
- Tối thiểu 8 ký tự
- Nên có: chữ hoa, chữ thường, số, ký tự đặc biệt
- Thay đổi định kỳ 3 tháng/lần

### Xác Thực 2 Bước (2FA)
1. Vào **Hồ sơ → Bảo mật → Bật 2FA**
2. Quét mã QR bằng Google Authenticator
3. Nhập mã xác thực
4. Lưu mã dự phòng

### Quyền Riêng Tư
- Thông tin cá nhân được mã hóa
- Chỉ admin nhóm mới thấy % sở hữu
- Lịch sử chỉ thành viên cùng nhóm mới xem được

---

## 🆘 TROUBLESHOOTING

### 1. Không đăng nhập được
- Kiểm tra Email/SĐT & Mật khẩu
- Nhấn **"Quên mật khẩu"** để reset
- Xóa cache trình duyệt: Ctrl + Shift + Delete

### 2. KYC bị từ chối
- Kiểm tra email lý do từ chối
- Upload lại giấy tờ rõ nét hơn
- Liên hệ Support: support@evcoownership.com

### 3. Không đặt được lịch
- Kiểm tra xung đột thời gian
- Kiểm tra % sử dụng (có thể bị chặn do vượt quá)
- Liên hệ Admin nhóm

### 4. Thanh toán thất bại
- Kiểm tra số dư tài khoản
- Thử phương thức thanh toán khác
- Liên hệ ngân hàng/ví điện tử

### 5. Không nhận được thông báo
- Vào **Cài đặt → Thông báo**
- Bật Email/SMS/Push notification
- Kiểm tra hộp thư spam

---

## 📞 HỖ TRỢ

**Hotline:** 1900-xxxx-xx (24/7)
**Email:** support@evcoownership.com
**Live Chat:** Góc dưới bên phải màn hình

**Giờ làm việc:**
- Thứ 2 - Thứ 6: 8:00 - 18:00
- Thứ 7: 9:00 - 17:00
- Chủ nhật: Nghỉ (chỉ hỗ trợ khẩn cấp qua hotline)

---

**Chúc bạn sử dụng hệ thống hiệu quả! 🚗⚡**
