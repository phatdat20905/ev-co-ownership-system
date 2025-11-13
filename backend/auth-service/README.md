# EV Co-ownership Auth Service

Authentication service for EV Co-ownership System built with Node.js, Express, and PostgreSQL.

## Features

- User registration and authentication
- JWT with refresh tokens
- KYC verification system
- Email verification
- Password reset functionality
- Role-based access control
- Rate limiting
- Redis caching
- RabbitMQ event system

## Quick Start

### Using Docker (Recommended)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f auth-service
```

### Manual Setup
```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Run migrations
npm run migrate

# Run seeders (development)
npm run seed

# Start development server
npm run dev
```

## API Documentation

### Authentication Endpoints
- POST /api/v1/auth/register - Register new user
- POST /api/v1/auth/login - Login user
- POST /api/v1/auth/refresh-token - Refresh access token
- POST /api/v1/auth/verify-email - Verify email address
- POST /api/v1/auth/forgot-password - Request password reset
- POST /api/v1/auth/reset-password - Reset password

### KYC Endpoints
- POST /api/v1/kyc/submit - Submit KYC documents
- GET /api/v1/kyc/status - Get KYC status
- PUT /api/v1/kyc/verify/:id - Verify KYC (Admin)

## Testing
```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run tests with coverage
npm test -- --coverage
```

## Deployment
```bash
# Production deployment
docker-compose -f docker-compose.prod.yml up -d
```

## Kiểm tra tổng quan

Sau khi triển khai các file bổ sung và cải tiến, Auth Service hiện đã có:

✅ **Đầy đủ endpoints** theo yêu cầu, bao gồm verify-email  
✅ **File cấu hình** được cải tiến với cấu trúc rõ ràng  
✅ **Database connection** với error handling tốt  
✅ **Seeders** cho dữ liệu demo  
✅ **Unit tests** cơ bản  
✅ **Docker-compose** riêng cho development và production  
✅ **Migrations** đã được kiểm tra và đúng với schema  
✅ **Scripts** để chạy ứng dụng và tests  
✅ **Documentation** đầy đủ  

Service đã sẵn sàng cho development và deployment!