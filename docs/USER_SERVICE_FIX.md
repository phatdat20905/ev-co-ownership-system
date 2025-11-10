# USER SERVICE - ISSUE ANALYSIS & FIXES

## Date: November 10, 2025

## Issue Identified

### Error Message
```
Transaction cannot be rolled back because it has been finished with state: rollback
```

### Root Cause
In `userService.js`, both `createUserProfile()` and `updateUserProfile()` methods had a **double rollback issue**:

1. When validation failed (e.g., profile not found, profile already exists)
2. Code would explicitly call `await transaction.rollback()`
3. Then throw an error
4. The catch block would try to rollback again → **Error: already rolled back**

### Code Pattern (BEFORE FIX)
```javascript
async createUserProfile(userId, profileData) {
  const transaction = await db.sequelize.transaction();
  
  try {
    const existingProfile = await db.UserProfile.findOne({
      where: { userId },
      transaction
    });
    
    if (existingProfile) {
      await transaction.rollback();  // ❌ First rollback
      throw new AppError('Profile already exists', 409, 'PROFILE_EXISTS');
    }
    
    // ... create profile logic
    await transaction.commit();
    return profile.toJSON();
  } catch (error) {
    await transaction.rollback();  // ❌ Second rollback - CRASHES!
    throw error;
  }
}
```

---

## Solution Implemented

### Fix: Check Transaction Status Before Rollback

Updated both methods to check `transaction.finished` before attempting rollback:

```javascript
async createUserProfile(userId, profileData) {
  const transaction = await db.sequelize.transaction();
  
  try {
    const existingProfile = await db.UserProfile.findOne({
      where: { userId },
      transaction
    });
    
    if (existingProfile) {
      throw new AppError('Profile already exists', 409, 'PROFILE_EXISTS');  // ✅ Just throw
    }
    
    // ... create profile logic
    await transaction.commit();
    return profile.toJSON();
  } catch (error) {
    // ✅ Check status before rollback
    if (!transaction.finished) {
      await transaction.rollback();
    }
    throw error;
  }
}
```

### Files Modified
1. **backend/user-service/src/services/userService.js**
   - Method: `createUserProfile(userId, profileData)` - Line 34-82
   - Method: `updateUserProfile(userId, updateData)` - Line 86-151
   
### Changes Made
- **Removed explicit rollback before throwing errors** in validation blocks
- **Added transaction status check** in catch blocks: `if (!transaction.finished)`
- This prevents double rollback attempts

---

## Testing Checklist

### Registration Flow
- [x] Register new user → Email sent
- [x] Verify email → Profile auto-created
- [ ] Login → Access dashboard
- [ ] View profile data

### Profile Operations
- [ ] **GET /user/profile** - Fetch profile (with auth token)
- [ ] **PUT /user/profile** - Update profile fields
- [ ] **POST /user/avatar** - Upload avatar image
- [ ] **GET /user/search?q=name** - Search users
- [ ] **GET /user/:userId** - Get user by ID

### Error Scenarios
- [ ] Update profile that doesn't exist → Should return 404
- [ ] Create duplicate profile → Should return 409
- [ ] Update profile without auth → Should return 401
- [ ] Update with invalid data → Should return 400

### Expected Behavior
✅ All operations should complete without transaction errors
✅ Proper error messages returned (404, 409, 401, 400)
✅ Profile data persists in database
✅ Events published successfully

---

## Database Schema

### user_profiles Table
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id),
  full_name VARCHAR(100),
  date_of_birth DATE,
  gender VARCHAR(10),
  phone_number VARCHAR(20),     -- ⚠️ Migration pending
  email VARCHAR(255),            -- ⚠️ Migration pending
  address TEXT,
  avatar_url VARCHAR(500),
  bio TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Migration Status
⚠️ **PENDING**: Run migration to add `phone_number` and `email` columns

```bash
cd backend/user-service
npm run migrate
```

Migration file: `backend/user-service/src/migrations/20251110-add-phone-to-user-profile.js`

---

## API Endpoints Summary

### Public Endpoints (No Auth)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/user/profile/create` | Create profile after email verification |

### Protected Endpoints (Require Bearer Token)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/user/profile` | Get current user profile |
| PUT | `/user/profile` | Update profile |
| POST | `/user/avatar` | Upload avatar image |
| GET | `/user/search?q=keyword` | Search users by name |
| GET | `/user/:userId` | Get user profile by ID |

---

## Frontend Integration Status

### Components Status
✅ **VerifyEmail.jsx** - Auto-creates profile after verification
✅ **Profile.jsx** - View and edit profile with avatar upload
✅ **user.service.js** - API client wrapper with proper endpoints

### localStorage Integration
- Profile data synced to `localStorage.userData`
- `storage` event dispatched on updates
- Header component listens for changes

---

## Next Steps

### Immediate (Critical)
1. ✅ **Fix transaction rollback** - COMPLETED
2. ⏳ **Run database migration** - Add phone_number and email columns
3. ⏳ **Restart user-service** - Apply fixes
4. ⏳ **Test registration flow** - End-to-end verification

### Service Integration (In Progress)
1. ✅ **Booking Service** - QR codes, calendar, check-in/out - COMPLETED
2. 🔄 **Vehicle Service** - Status monitoring, GPS tracking - IN PROGRESS
3. ⏳ **Payment Service** - Cost breakdown, invoices, payments
4. ⏳ **Contract Service** - Digital signatures, PDF generation
5. ⏳ **Notification Service** - Real-time updates, preferences

### Quality Assurance
- Add comprehensive error handling
- Add loading states and spinners
- Add success/error toast notifications
- Add input validation on frontend
- Add retry logic for failed requests

---

## Known Limitations

### Current Constraints
1. **Avatar upload size**: Limited to 5MB
2. **Image formats**: Only accepts image/* MIME types
3. **Profile uniqueness**: One profile per userId (enforced by DB)
4. **Public API security**: `/profile/create` requires valid userId but no auth

### Security Considerations
- ✅ Public profile creation is secure (one-time, after email verification)
- ✅ Protected routes require valid JWT token
- ✅ User can only access/update their own profile
- ⚠️ No rate limiting implemented yet
- ⚠️ No file type validation on backend for avatars

---

## Lessons Learned

### Transaction Management Best Practices
1. **Never rollback before throwing** - Let catch block handle it
2. **Always check transaction status** before rollback
3. **Use transaction.finished** property to prevent double rollback
4. **Commit explicitly** after successful operations
5. **Rollback only in catch blocks** with status check

### Sequelize Transaction Patterns
```javascript
// ✅ GOOD PATTERN
try {
  // operations with transaction
  await transaction.commit();
} catch (error) {
  if (!transaction.finished) {
    await transaction.rollback();
  }
  throw error;
}

// ❌ BAD PATTERN
try {
  if (error) {
    await transaction.rollback();
    throw error;
  }
} catch (error) {
  await transaction.rollback(); // Will crash!
}
```

---

## References

### Documentation
- [Sequelize Transactions](https://sequelize.org/docs/v6/other-topics/transactions/)
- [Node.js Transaction Patterns](https://nodejs.org/en/docs/guides/simple-profiling/)

### Related Files
- `backend/user-service/src/services/userService.js` - Core business logic
- `backend/user-service/src/controllers/userController.js` - HTTP handlers
- `backend/user-service/src/routes/userRoutes.js` - Route definitions
- `backend/user-service/src/models/UserProfile.js` - Database model
- `docs/REGISTRATION_FLOW.md` - Complete registration documentation

---

## Support

### If Issues Persist
1. Check logs: `backend/user-service/logs/combined.log`
2. Verify database connection
3. Ensure migration has run
4. Check API Gateway routing (port 3000 → 3002)
5. Verify JWT token is valid and not expired

### Debugging Commands
```bash
# Check service logs
tail -f backend/user-service/logs/combined.log

# Run migration
cd backend/user-service && npm run migrate

# Test API directly (bypass gateway)
curl http://localhost:3002/api/v1/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

**Status**: ✅ FIXED - Ready for testing
**Last Updated**: November 10, 2025
**Version**: 1.0.0
