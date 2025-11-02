# AI Service - EV Co-ownership System

AI Service cung cấp các tính năng thông minh cho hệ thống đồng sở hữu xe điện, sử dụng Google Gemini API.

## 🚀 Tính năng chính

1. **Tối ưu lịch trình** - Phân bổ thời gian sử dụng xe công bằng
2. **Phân tích chi phí** - Dự đoán và phát hiện bất thường
3. **Phân tích tranh chấp** - Đề xuất giải pháp xung đột
4. **Analytics sử dụng** - Phân tích hành vi và tối ưu hóa

## 🛠 Công nghệ

- **Node.js + Express** - Backend framework
- **Google Gemini API** - AI engine
- **MongoDB** - Database (2 collections)
- **Redis** - Caching
- **RabbitMQ** - Message queue
- **Docker** - Containerization

## 📁 Cấu trúc dự án

```
ai-service/
├── src/
│   ├── config/          # Cấu hình hệ thống
│   ├── models/          # MongoDB models (2 collections)
│   ├── services/        # Business logic & AI integration
│   ├── controllers/     # Request handlers
│   ├── routes/          # API routes
│   ├── events/          # Event-driven architecture
│   └── utils/           # Utilities
```

## 🔧 Cài đặt

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd ai-service
   ```

2. **Cài đặt dependencies**
   ```bash
   npm install
   ```

3. **Cấu hình environment**
   ```bash
   cp .env.example .env
   # Chỉnh sửa .env với các giá trị thực tế
   ```

4. **Chạy với Docker**
   ```bash
   docker-compose up -d
   ```

## 🔑 Environment Variables

| Variable          | Description                        | Default |
|-------------------|------------------------------------|---------|
| PORT              | Service port                       | 3010    |
| GEMINI_API_KEY    | Google AI API key                  | -       |
| MONGODB_URL       | MongoDB connection string          | -       |
| REDIS_HOST        | Redis host                         | localhost |
| RABBITMQ_URL      | RabbitMQ connection string         | -       |

## 📚 API Documentation

### Health Check
```
GET /api/v1/health
```

### Schedule Optimization
```
POST /api/v1/schedule/optimize
Content-Type: application/json

{
  "group_data": {
    "group_id": "uuid",
    "members": [
      {
        "user_id": "uuid",
        "ownership_percentage": 40,
        "recent_usage_hours": 10
      }
    ]
  }
}
```

### Cost Analysis
```
POST /api/v1/cost/analyze
Content-Type: application/json

{
  "cost_data": {
    "group_id": "uuid",
    "history": [...],
    "current": {...}
  }
}
```

## 🐳 Docker Deployment

```bash
# Build và chạy
docker-compose up -d --build

# Xem logs
docker-compose logs -f ai-service

# Dừng service
docker-compose down
```

## 🧪 Testing

```bash
# Chạy unit tests
npm test

# Chạy tests với coverage
npm run test:coverage

# Chạy tests trong watch mode
npm run test:watch
```

## 📊 Monitoring

Service cung cấp các endpoints monitoring:

- `GET /api/v1/health` - Health check
- `GET /api/v1/analytics/metrics` - Service metrics
- Event-driven logging với structured logs

## 🔄 Event-Driven Architecture

Service tự động xử lý các events:

- `booking.created` → Re-optimize schedule
- `cost.created` → Detect anomalies
- `dispute.created` → Analyze conflicts

## 🚀 Production Notes

- Sử dụng Redis cho caching để giảm API calls
- Implement rate limiting cho Gemini API
- Sử dụng fallback mechanisms khi AI service unavailable
- Structured logging cho debugging và monitoring

## 📞 Support

Liên hệ development team để được hỗ trợ.

## 🎯 HOÀN THÀNH AI SERVICE!

Tôi đã triển khai hoàn chỉnh AI Service với:

### Core Features:
- 4 tính năng AI chính với Google Gemini
- Database đơn giản với 2 collections
- Caching với Redis
- Event-driven architecture với RabbitMQ

### API Endpoints:
- Schedule optimization
- Cost analysis & anomaly detection  
- Dispute analysis & resolution
- Usage analytics & insights
- Feedback system

### Production Ready:
- Docker containerization
- Health monitoring
- Error handling & fallbacks
- Rate limiting
- Structured logging

### Integration:
- Event consumers cho auto-triggered AI
- Shared utilities từ core system
- Standardized response formats
- Validation & security

**Service đã sẵn sàng để tích hợp vào hệ thống EV Co-ownership!** 🚀