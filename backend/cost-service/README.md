# Cost Service - EV Co-ownership System

Microservice quản lý chi phí, thanh toán, ví và hóa đơn cho hệ thống đồng sở hữu xe điện.

## Tính năng

- **Quản lý Chi phí**: Tạo, theo dõi và chia chi phí theo nhiều phương pháp
- **Hệ thống Thanh toán**: Đa phương thức (MoMo, VNPay, VietQR, ví nội bộ)
- **Ví điện tử**: Cho người dùng và nhóm
- **Hóa đơn**: Tự động tạo và quản lý hóa đơn
- **Báo cáo**: Phân tích chi phí và thanh toán
- **Event-driven**: Kiến trúc microservice với RabbitMQ

## Kiến trúc

```
cost-service/
├── src/
│   ├── config/          # Cấu hình
│   ├── models/          # Sequelize models
│   ├── repositories/    # Data access layer
│   ├── services/        # Business logic
│   ├── controllers/     # HTTP handlers
│   ├── routes/          # API routes
│   ├── events/          # Event consumers/publishers
│   ├── utils/           # Utility functions
│   ├── jobs/            # Background jobs
│   └── validators/      # Request validation
```

## Cài đặt

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd cost-service
   ```

2. **Cài đặt dependencies**
   ```bash
   npm install
   ```

3. **Cấu hình environment**
   ```bash
   cp .env.example .env
   # Chỉnh sửa .env với cấu hình của bạn
   ```

4. **Chạy migrations**
   ```bash
   npm run db:migrate
   ```

5. **Chạy seeders (optional)**
   ```bash
   npm run db:seed
   ```

6. **Khởi chạy service**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## API Documentation

### Cost Management
- `POST /api/v1/costs` - Tạo chi phí mới
- `GET /api/v1/costs/group/:groupId` - Lấy chi phí theo nhóm
- `GET /api/v1/costs/:id/splits` - Tính toán chia chi phí

### Payment
- `POST /api/v1/payments/create` - Tạo thanh toán
- `GET /api/v1/payments/user` - Lịch sử thanh toán
- **Webhooks**: MoMo, VNPay, VietQR

### Wallet
- `GET /api/v1/wallets` - Thông tin ví
- `POST /api/v1/wallets/deposit` - Nạp tiền
- `POST /api/v1/wallets/withdraw` - Rút tiền

## Environment Variables

Xem file `.env.example` để biết đầy đủ các biến môi trường cần thiết.

## Docker

```bash
# Build image
docker build -t cost-service .

# Run with docker-compose
docker-compose up -d
```

## Testing

```bash
# Unit tests
npm test

# Test with coverage
npm run test:coverage

# Integration tests
npm run test:integration
```

## Monitoring

- **Health check**: `GET /health`
- **Metrics endpoint**: `GET /metrics` (nếu tích hợp Prometheus)

## Contributing

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## License

MIT License

## TỔNG KẾT HOÀN THIỆN

**Cost Service đã được HOÀN THIỆN ĐẦY ĐỦ** với:

### Core Features
- Quản lý chi phí & chia chi phí
- Hệ thống thanh toán đa phương thức
- Ví điện tử user/group
- Hóa đơn tự động
- Báo cáo & analytics

### Technical Stack
- Node.js + Express + Sequelize
- PostgreSQL database
- Redis caching & queues
- RabbitMQ event-driven
- Docker containerization
- JWT authentication

### Payment Integration
- **MoMo** - Ví điện tử
- **VNPay** - Cổng thanh toán
- **VietQR** - Chuyển khoản ngân hàng
- **Ví nội bộ** - Internal wallet

### Background Jobs
- Tạo hóa đơn định kỳ
- Nhắc nhở quá hạn
- Xử lý thanh toán tự động

### Production Ready
- Health checks
- Error handling
- Logging & monitoring
- Security middleware
- Rate limiting
- Database migrations

**Service đã sẵn sàng cho development và deployment!**