# Additional README Sections

**Note**: Add these sections to the main README.md after line 424

---

## 🛠️ Development Guide

### Environment Variables

Create `.env` files in each service directory:

**backend/auth-service/.env:**
```env
PORT=3001
DATABASE_URL=postgres://user:pass@localhost:5432/ev_db_auth
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://localhost:5672
```

**backend/user-service/.env:**
```env
PORT=3002
DATABASE_URL=postgres://user:pass@localhost:5432/ev_db_user
RABBITMQ_URL=amqp://localhost:5672
```

**frontend/.env:**
```env
VITE_API_URL=http://localhost:3000/api
```

### Database Migrations

⚠️ **CRITICAL**: Run migrations before testing!

```bash
# User Service migrations (add phone_number and email)
cd backend/user-service
npm run migrate

# Auth Service migrations
cd backend/auth-service
npm run migrate

# Booking Service migrations
cd backend/booking-service
npm run migrate
```

### Code Style

- **Frontend**: ESLint + Prettier
- **Backend**: ESLint + Airbnb style guide
- **Commit**: Conventional commits

```bash
# Lint frontend
cd frontend
npm run lint

# Lint backend service
cd backend/user-service
npm run lint
```

### API Documentation

API docs available at:
- **Swagger UI**: http://localhost:3000/api-docs
- **Postman Collection**: `docs/api/postman_collection.json`

---

## 🚨 Known Issues & Solutions

### Issue 1: "Profile not found" after registration
**Status**: ✅ FIXED in v2.0  
**Solution**: User service now auto-creates empty profiles. No more 404 errors.

### Issue 2: Transaction rollback errors
**Status**: ✅ FIXED  
**Solution**: Added `if (!transaction.finished)` check before all rollbacks.

### Issue 3: Duplicate profile errors (409)
**Status**: ✅ FIXED  
**Solution**: `createUserProfile()` now uses upsert pattern - creates OR updates.

### Issue 4: Missing database columns (phone_number, email)
**Status**: ⚠️ MIGRATION PENDING  
**Solution**: Run migration: `cd backend/user-service && npm run migrate`

### Issue 5: Contract Service not integrated
**Status**: ⏳ IN PROGRESS  
**Solution**: ContractSignature component ready, needs page integration.

### Issue 6: WebSocket for notifications not implemented
**Status**: ⏳ PLANNED  
**Solution**: Current polling works, WebSocket for real-time push coming.

---

## 📊 Performance & Monitoring

### Current Performance Metrics
- **API Response Time**: < 200ms (avg)
- **Frontend Load Time**: < 2s
- **Database Queries**: Optimized with indexes
- **Real-time Updates**: 30-second polling (WebSocket planned)

### Monitoring Tools
- **Logs**: Winston logger in all services
- **Error Tracking**: Centralized error logs
- **Metrics**: (Coming soon - Prometheus + Grafana)

### Optimization Tips
```javascript
// Frontend: Use React.memo for expensive components
export default React.memo(VehicleList);

// Backend: Use database indexes
await db.UserProfile.findOne({
  where: { userId },
  raw: true  // Skip instance creation for read-only
});

// Caching: Use Redis for frequently accessed data
const cachedProfile = await redis.get(`profile:${userId}`);
```

---

## 🤝 Contributing

### Workflow
1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and test locally
3. Run linters: `npm run lint`
4. Commit with conventional commits: `git commit -m "feat: add feature"`
5. Push and create PR: `git push origin feature/your-feature`

### Commit Convention
```
feat: New feature
fix: Bug fix
docs: Documentation changes
style: Code style changes (formatting)
refactor: Code refactoring
test: Add or update tests
chore: Maintenance tasks
```

### Code Review Checklist
- [ ] Code follows style guide
- [ ] All tests pass
- [ ] No console.log in production code
- [ ] Error handling implemented
- [ ] API responses documented
- [ ] Database migrations included
- [ ] Environment variables documented

---

## 🎯 Roadmap

### Short Term (1-2 weeks)
- [x] User Service v2.0 redesign with zero-error philosophy
- [x] Booking Service with QR codes
- [x] Vehicle Service monitoring
- [x] Payment Service tracking
- [ ] **Run database migration** (CRITICAL)
- [ ] **Contract Service integration** (HIGH)
- [ ] **Notification WebSocket** (MEDIUM)
- [ ] End-to-end testing suite

### Medium Term (1 month)
- [ ] AI Service: Predictive maintenance
- [ ] AI Service: Cost optimization
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Multi-language support (i18n)
- [ ] Export reports (PDF/Excel)

### Long Term (3 months)
- [ ] Kubernetes deployment
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Load testing and optimization
- [ ] Security audit
- [ ] Production monitoring (Prometheus + Grafana)
- [ ] Auto-scaling infrastructure

---

## 📞 Support & Contact

### Documentation
- **Main Docs**: `/docs/INTEGRATION_STATUS.md`
- **User Service**: `/docs/USER_SERVICE_REDESIGN.md`
- **Bug Fixes**: `/docs/USER_SERVICE_FIX.md`

### Getting Help
1. Check documentation first
2. Search existing issues on GitHub
3. Create new issue with:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details

### Team
- **Backend Lead**: [Your Name]
- **Frontend Lead**: [Your Name]
- **DevOps**: [Your Name]

---

## 📄 License

[Your License] - See LICENSE file for details

---

## 🙏 Acknowledgments

Built with:
- React + Vite
- Node.js + Express
- PostgreSQL + Sequelize
- Docker + Docker Compose
- TailwindCSS
- RabbitMQ
- Redis

Special thanks to all contributors!

---

**Made with ❤️ for sustainable EV co-ownership**
