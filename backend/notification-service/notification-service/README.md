# Notification Service

**EV Co-ownership System - Notification Service**

## Overview

Microservice responsible for handling all notification delivery across multiple channels (Email, Push, SMS, In-app) for the EV Co-ownership System.

## Features

- **Multi-channel Notifications**: Email, Push (FCM), SMS (Twilio), In-app (Socket.IO)
- **Template System**: Dynamic notification templates with variable substitution
- **User Preferences**: Per-user notification channel preferences
- **Event-driven**: RabbitMQ integration for system-wide events
- **Background Jobs**: Automated retry, cleanup, and metrics aggregation
- **Real-time**: WebSocket support for in-app notifications

## Architecture

```
Client → API Gateway → Notification Service → Providers
↓
PostgreSQL → Redis → RabbitMQ
```

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- RabbitMQ 3.8+

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Service
NODE_ENV=development
PORT=3008
SERVICE_NAME=notification-service

# Database
DB_HOST=localhost
DB_PORT=5439
DB_NAME=notification_db
DB_USER=postgres
DB_PASSWORD=postgres123

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis123

# RabbitMQ
RABBITMQ_URL=amqp://admin:admin123@localhost:5672

# Providers
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="your_private_key"

TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```

### Installation

```bash
# Install dependencies
npm install

# Run database migrations
npm run db:migrate

# Seed demo data
npm run db:seed

# Start development server
npm run dev
```

## API Endpoints

### Notifications

- `POST /api/v1/notifications` - Send notification
- `GET /api/v1/notifications/user/:userId` - Get user notifications
- `PUT /api/v1/notifications/:id/read` - Mark as read
- `DELETE /api/v1/notifications/:id` - Delete notification

### Templates

- `POST /api/v1/templates` - Create template
- `GET /api/v1/templates` - List templates
- `PUT /api/v1/templates/:id` - Update template
- `DELETE /api/v1/templates/:id` - Delete template

### Preferences

- `GET /api/v1/preferences/:userId` - Get user preferences
- `PUT /api/v1/preferences/:userId` - Update preferences
- `POST /api/v1/preferences/devices/register` - Register device

## Event Consumers

The service listens to these events:

- **User Events**: Registration, verification, KYC status
- **Booking Events**: Creation, confirmation, reminders, cancellation
- **Payment Events**: Success, failure, invoice generation
- **Dispute Events**: Creation, resolution, messages

## Database Schema

- **notifications** - Notification history
- **notification_templates** - Template definitions
- **user_preferences** - User notification preferences
- **device_tokens** - Push notification device tokens

## Deployment

### Docker

```bash
docker-compose up -d
```

### Manual

```bash
npm start
```

## Testing

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

## Monitoring

- **Health check**: `GET /health`
- **Metrics**: Available via background job aggregation
- **Logs**: Structured JSON logging

## Security

- JWT authentication
- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection

## TỔNG KẾT HOÀN THÀNH

**Notification Service đã được triển khai ĐẦY ĐỦ** với:

### Kiến trúc hoàn chỉnh:
- Multi-channel providers (Email, Push, SMS, In-app)
- Event-driven architecture với RabbitMQ
- Database models & migrations
- Background jobs & scheduling
- Real-time WebSocket support

### Tính năng chính:
- Send notifications across multiple channels
- Template system với variable substitution
- User preferences management
- Device token management
- Event consumers for system integration
- Background jobs (retry, cleanup, metrics)

### Production-ready:
- Docker containerization
- Health checks
- Graceful shutdown
- Error handling & logging
- Security middleware

### API Endpoints đầy đủ:
- Notification management
- Template CRUD operations
- User preferences
- Device registration

**Service đã sẵn sàng để tích hợp vào hệ thống EV Co-ownership!**