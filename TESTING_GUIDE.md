# 🚀 Quick Start Guide - Testing Registration

## Prerequisites
- ✅ PostgreSQL running (auth-service DB + user-service DB)
- ✅ RabbitMQ running (for events between services)
- ✅ Node.js installed

---

## Step 1: Start Backend Services

### Terminal 1 - Auth Service
```bash
cd backend/auth-service
npm install
npm run dev
```
**Expected Output:**
```
[INFO] Auth Service listening on port 3001
[INFO] Connected to PostgreSQL database
[INFO] Connected to RabbitMQ
```

### Terminal 2 - User Service
```bash
cd backend/user-service
npm install
npm run dev
```
**Expected Output:**
```
[INFO] User Service listening on port 3002
[INFO] Connected to PostgreSQL database
[INFO] Connected to RabbitMQ
```

### Terminal 3 - API Gateway
```bash
cd backend/api-gateway
npm install
npm run dev
```
**Expected Output:**
```
[INFO] API Gateway listening on port 3000
[INFO] Proxy routes registered
```

---

## Step 2: Start Frontend

### Terminal 4 - Frontend
```bash
cd frontend
npm install
npm run dev
```
**Expected Output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## Step 3: Test Registration Flow

### 1. Open Browser
Navigate to: **http://localhost:5173/register**

### 2. Fill Step 1 - Basic Info
```
Full Name:         Nguyen Van A
Email:            test@example.com
Phone Number:     0901234567
Date of Birth:    01/01/2000
Gender:           Male
Password:         Test@123456
Confirm Password: Test@123456
```

**Click:** "Next Step"

### 3. Fill Step 2 - Documents
```
Address:                  123 Nguyen Hue Street
City:                     Ho Chi Minh City
ID Card Number:           123456789012
Driver License Number:    DL123456789
Emergency Contact Name:   Tran Van B
Emergency Phone:          0912345678
```

**Click:** "Complete Registration"

### 4. Expected API Calls

**Call 1: POST /auth/register**
```json
Request:
{
  "email": "test@example.com",
  "phone": "0901234567",
  "password": "Test@123456",
  "role": "co-owner"
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "test@example.com",
      "phone": "0901234567",
      "role": "co-owner"
    },
    "token": "jwt-token-here"
  }
}
```

**Call 2: POST /user/profile**
```json
Request Headers:
{
  "Authorization": "Bearer jwt-token-here"
}

Request Body:
{
  "fullName": "Nguyen Van A",
  "dateOfBirth": "2000-01-01",
  "gender": "male",
  "address": "123 Nguyen Hue Street",
  "city": "Ho Chi Minh City",
  "idCardNumber": "123456789012",
  "driverLicenseNumber": "DL123456789",
  "emergencyContact": "Tran Van B",
  "emergencyPhone": "0912345678",
  "isProfileComplete": true
}

Response:
{
  "success": true,
  "message": "Profile created successfully",
  "data": {
    "id": "uuid-here",
    "userId": "uuid-here",
    "fullName": "Nguyen Van A",
    "dateOfBirth": "2000-01-01",
    ...
  }
}
```

### 5. Check Step 3 - Email Verification
- Should display: "We've sent a verification email to test@example.com"
- Has button: "Resend Verification Email"
- Has button: "I've Verified My Email"

**Click:** "I've Verified My Email"

### 6. Check Step 4 - Success
- Should display: "Registration Complete!"
- Has button: "Go to Login"

**Click:** "Go to Login"

### 7. Test Login
Navigate to: **http://localhost:5173/login**
```
Email/Phone: test@example.com
Password:    Test@123456
```

**Click:** "Login"

---

## Step 4: Verify Database

### Auth Service Database
```sql
SELECT * FROM users WHERE email = 'test@example.com';
```

**Expected Result:**
```
id                                   | email              | phone      | role      | is_email_verified
uuid-here                            | test@example.com   | 0901234567 | co-owner  | false
```

### User Service Database
```sql
SELECT * FROM user_profiles WHERE user_id = 'uuid-from-auth-service';
```

**Expected Result:**
```
id        | user_id   | full_name    | date_of_birth | gender | address                | city            | id_card_number | driver_license_number | emergency_contact | emergency_phone | is_profile_complete
uuid-here | uuid-here | Nguyen Van A | 2000-01-01    | male   | 123 Nguyen Hue Street | Ho Chi Minh City | 123456789012   | DL123456789           | Tran Van B        | 0912345678      | true
```

---

## Step 5: Check Backend Logs

### Auth Service Logs
```
[INFO] User registration initiated { email: 'test@example.com', phone: '0901234567' }
[INFO] User created successfully { userId: 'uuid-here' }
[INFO] Verification email sent { userId: 'uuid-here', email: 'test@example.com' }
[INFO] UserRegistered event published { userId: 'uuid-here' }
```

### User Service Logs
```
[INFO] UserRegistered event received { userId: 'uuid-here' }
[INFO] Auto-creating user profile { userId: 'uuid-here' }
[INFO] User profile created via event { userId: 'uuid-here' }
[INFO] User profile created successfully { userId: 'uuid-here' }
[INFO] UserProfileCreated event published { userId: 'uuid-here' }
```

---

## Troubleshooting

### Problem 1: "Failed to resolve import react-hot-toast"
**Solution:** Already fixed - now using `import { showSuccessToast, showErrorToast } from '../../utils/toast'`

### Problem 2: "Profile already exists"
**Solution:** 
1. Delete test user from both databases
2. Or use a different email address

### Problem 3: "Network Error"
**Check:**
- Auth service running on port 3001?
- User service running on port 3002?
- API Gateway running on port 3000?
- Frontend running on port 5173?

### Problem 4: "Token not found"
**Solution:**
- Check that authService.register() returns token
- Check that token is stored in localStorage
- Check Authorization header in createProfile request

### Problem 5: Database Connection Failed
**Check:**
- PostgreSQL running?
- Database exists?
- Connection string correct in .env?

### Problem 6: RabbitMQ Connection Failed
**Check:**
- RabbitMQ running on localhost:5672?
- Credentials correct in .env?

---

## Success Indicators

✅ **Frontend:**
- All 4 steps render correctly
- Form validation works
- Toast notifications appear
- Smooth animations between steps
- Redirect to login after success

✅ **Backend:**
- No errors in terminal logs
- Both API calls return 200/201
- Events published successfully
- Data saved to both databases

✅ **Database:**
- User record in auth-service DB
- UserProfile record in user-service DB
- userId matches in both tables
- isProfileComplete = true

---

## Next Steps After Testing

1. **Email Verification:**
   - Click verification link in email
   - User.is_email_verified should become true

2. **Login:**
   - Use registered email + password
   - Should navigate to dashboard
   - Profile should load correctly

3. **Profile Page:**
   - Navigate to /profile
   - Should display all saved data
   - Should be able to update profile

---

## Performance Metrics

**Expected Response Times:**
- POST /auth/register: < 500ms
- POST /user/profile: < 300ms
- Total registration time: < 1 second

**Expected Database Writes:**
- Auth Service: 1 INSERT (users table)
- User Service: 1 INSERT (user_profiles table)

**Expected Events:**
- UserRegistered (auth → user)
- UserProfileCreated (user → other services)

---

**Test Date:** _____________
**Tested By:** _____________
**Status:** [ ] Pass  [ ] Fail
**Notes:** _____________________________________________
