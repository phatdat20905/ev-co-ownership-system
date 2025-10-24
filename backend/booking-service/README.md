booking-service/
├── src/
│   ├── config/
│   │   ├── config.js
│   │   └── database.js
│   ├── models/
│   │   ├── index.js
│   │   ├── Vehicle.js
│   │   ├── Booking.js
│   │   ├── CheckInOutLog.js
│   │   ├── BookingConflict.js
│   │   └── CalendarCache.js
│   ├── migrations/
│   │   ├── 001-create-vehicles.js
│   │   ├── 002-create-bookings.js
│   │   ├── 003-create-check-in-out-logs.js
│   │   ├── 004-create-booking-conflicts.js
│   │   └── 005-create-calendar-cache.js
│   ├── seeders/
│   │   ├── 001-demo-vehicles.js
│   │   ├── 002-demo-bookings.js
│   │   └── 003-demo-checkinout-logs.js
│   ├── controllers/
│   │   ├── bookingController.js
│   │   ├── calendarController.js
│   │   ├── checkInOutController.js
│   │   ├── conflictController.js
│   │   └── adminController.js
│   ├── services/
│   │   ├── bookingService.js
│   │   ├── calendarService.js
│   │   ├── availabilityService.js
│   │   ├── conflictService.js
│   │   ├── priorityService.js
│   │   ├── qrService.js
│   │   ├── validationService.js
│   │   ├── analyticsService.js
│   │   └── cacheService.js
│   ├── routes/
│   │   ├── index.js
│   │   ├── bookingRoutes.js
│   │   ├── calendarRoutes.js
│   │   ├── checkInOutRoutes.js
│   │   ├── conflictRoutes.js
│   │   └── adminRoutes.js
│   ├── jobs/
│   │   ├── bookingReminderJob.js
│   │   ├── cacheWarmupJob.js
│   │   ├── conflictDetectionJob.js
│   │   └── cleanupJob.js
│   ├── events/
│   │   └── eventService.js
│   ├── middleware/
│   │   └── groupAccess.js
│   ├── validators/
│   │   └── bookingValidators.js
│   ├── app.js
│   └── server.js
├── tests/
├── docker-compose.yml
├── Dockerfile
├── package.json
├── .env.example
└── README.md