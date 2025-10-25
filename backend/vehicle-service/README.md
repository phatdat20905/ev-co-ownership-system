# EV Vehicle Service

Microservice quản lý thông tin xe điện cho hệ thống Đồng sở hữu EV.

## 🚗 Tổng quan

Vehicle Service cung cấp các chức năng quản lý toàn diện cho xe điện trong hệ thống đồng sở hữu, bao gồm:

- **Quản lý thông tin xe** - CRUD operations, status management
- **Lịch bảo trì** - Scheduling, reminders, history tracking
- **Bảo hiểm xe** - Policy management, expiry notifications
- **Theo dõi sạc điện** - Session tracking, cost analysis
- **Analytics** - Utilization reports, battery health monitoring

## 🏗️ Kiến trúc

- **Framework**: Node.js + Express.js
- **Database**: PostgreSQL với Sequelize ORM
- **Cache**: Redis cho caching và rate limiting
- **Message Queue**: RabbitMQ cho event-driven architecture
- **Authentication**: JWT thông qua API Gateway

## 📁 Cấu trúc thư mục
```bash
vehicle-service/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── config.js
│   ├── models/
│   │   ├── index.js
│   │   ├── Vehicle.js
│   │   ├── MaintenanceSchedule.js
│   │   ├── MaintenanceHistory.js
│   │   ├── VehicleInsurance.js
│   │   └── ChargingSession.js
│   ├── migrations/
│   │   ├── 001-create-vehicles.js
│   │   ├── 002-create-maintenance-schedules.js
│   │   ├── 003-create-maintenance-history.js
│   │   ├── 004-create-vehicle-insurance.js
│   │   └── 005-create-charging-sessions.js
│   ├── seeders/
│   ├── controllers/
│   │   ├── vehicleController.js
│   │   ├── maintenanceController.js
│   │   ├── insuranceController.js
│   │   ├── chargingController.js
│   │   └── analyticsController.js
│   ├── services/
│   │   ├── vehicleService.js
│   │   ├── maintenanceService.js
│   │   ├── insuranceService.js
│   │   ├── batteryService.js
│   │   ├── adminService.js
│   │   ├── chargingService.js
│   │   ├── analyticsService.js
│   │   └── eventService.js
│   ├── routes/
│   │   ├── index.js
│   │   ├── vehicleRoutes.js
│   │   ├── maintenanceRoutes.js
│   │   ├── insuranceRoutes.js
│   │   ├── chargingRoutes.js
│   │   ├── adminRoutes.js
│   │   └── analyticsRoutes.js
│   ├── middleware/
│   │   ├── groupAccess.js
│   │   └── groupAccess.js
│   ├── validators/
│   │   ├── validators.js
│   │   ├── calculations.js
│   │   ├── constants.js
│   │   └── helpers.js
│   ├── jobs/
│   │   ├── maintenanceReminderJob.js
│   │   ├── insuranceExpiryJob.js
│   │   ├── batteryHealthCheckJob.js
│   │   └── vehicleMetricsJob.js
│   ├── server.js
│   └── app.js
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── Dockerfile.dev
├── Dockerfile
├── package.json
├── .env.example
└── README.md
```