# Registration Architecture & Flow

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React)                          │
│                         http://localhost:5173                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │                  Register Component                      │     │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐       │     │
│  │  │ Step 1 │→ │ Step 2 │→ │ Step 3 │→ │ Step 4 │       │     │
│  │  │ Basic  │  │Document│  │ Email  │  │Complete│       │     │
│  │  └────────┘  └────────┘  └────────┘  └────────┘       │     │
│  └──────────────────────────────────────────────────────────┘     │
│                      │                    │                         │
│                      ▼                    ▼                         │
│            ┌─────────────────┐  ┌──────────────────┐              │
│            │ authService.js  │  │ userService.js   │              │
│            │ - register()    │  │ - createProfile()│              │
│            └─────────────────┘  └──────────────────┘              │
│                      │                    │                         │
└──────────────────────┼────────────────────┼─────────────────────────┘
                       │                    │
                       ▼                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        API GATEWAY (Express)                        │
│                       http://localhost:3000                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  POST /auth/register    ────────────►  Auth Service Proxy          │
│  POST /user/profile     ────────────►  User Service Proxy          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                       │                    │
         ┌─────────────┘                    └─────────────┐
         ▼                                                 ▼
┌──────────────────────────┐                  ┌──────────────────────────┐
│   AUTH SERVICE (3001)    │                  │   USER SERVICE (3002)    │
├──────────────────────────┤                  ├──────────────────────────┤
│                          │                  │                          │
│  POST /auth/register     │                  │  POST /user/profile      │
│        ↓                 │                  │        ↓                 │
│  authController          │                  │  userController          │
│        ↓                 │                  │        ↓                 │
│  authService             │                  │  userService             │
│        ↓                 │                  │        ↓                 │
│  Create User             │                  │  Create Profile          │
│        ↓                 │                  │        ↓                 │
│  Hash Password           │                  │  Validate Data           │
│        ↓                 │                  │        ↓                 │
│  Generate JWT            │   RabbitMQ       │  Save to DB              │
│        ↓                 │  ───────────►    │        ↓                 │
│  Send Verification Email │  UserRegistered  │  Publish Event           │
│        ↓                 │     Event        │                          │
│  Publish Event           │                  │                          │
│        ↓                 │                  │                          │
│  Return { user, token }  │                  │  Return { profile }      │
│                          │                  │                          │
└──────────────────────────┘                  └──────────────────────────┘
         │                                                 │
         ▼                                                 ▼
┌──────────────────────────┐                  ┌──────────────────────────┐
│   PostgreSQL (Auth DB)   │                  │   PostgreSQL (User DB)   │
├──────────────────────────┤                  ├──────────────────────────┤
│                          │                  │                          │
│  Table: users            │                  │  Table: user_profiles    │
│  ┌──────────────────┐   │                  │  ┌──────────────────┐   │
│  │ id (PK)          │   │                  │  │ id (PK)          │   │
│  │ email (UNIQUE)   │   │                  │  │ user_id (FK)     │   │
│  │ phone (UNIQUE)   │   │                  │  │ full_name        │   │
│  │ password (HASH)  │   │                  │  │ date_of_birth    │   │
│  │ role             │   │                  │  │ gender           │   │
│  │ is_email_verified│   │                  │  │ address          │   │
│  │ created_at       │   │                  │  │ city             │   │
│  │ updated_at       │   │                  │  │ id_card_number   │   │
│  └──────────────────┘   │                  │  │ driver_license_# │   │
│                          │                  │  │ emergency_contact│   │
└──────────────────────────┘                  │  │ emergency_phone  │   │
                                               │  │ is_profile_comp. │   │
                                               │  │ created_at       │   │
                                               │  │ updated_at       │   │
                                               │  └──────────────────┘   │
                                               │                          │
                                               └──────────────────────────┘
```

---

## Registration Flow Sequence Diagram

```
User          Frontend         API Gateway      Auth Service     User Service      Database
 │                │                 │                │                │                │
 │  Fill Step 1   │                 │                │                │                │
 │───────────────►│                 │                │                │                │
 │                │                 │                │                │                │
 │  Fill Step 2   │                 │                │                │                │
 │───────────────►│                 │                │                │                │
 │                │                 │                │                │                │
 │  Click Submit  │                 │                │                │                │
 │───────────────►│                 │                │                │                │
 │                │                 │                │                │                │
 │                │ POST /auth/register             │                │                │
 │                │─────────────────►                │                │                │
 │                │                 │                │                │                │
 │                │                 │  POST /auth/register            │                │
 │                │                 │────────────────►                │                │
 │                │                 │                │                │                │
 │                │                 │                │  Hash Password │                │
 │                │                 │                │────────────────►                │
 │                │                 │                │                │                │
 │                │                 │                │  Create User   │                │
 │                │                 │                │──────────────────────────────►│
 │                │                 │                │                │                │
 │                │                 │                │  User Created  │                │
 │                │                 │                │◄──────────────────────────────│
 │                │                 │                │                │                │
 │                │                 │                │  Generate JWT  │                │
 │                │                 │                │────────┐       │                │
 │                │                 │                │        │       │                │
 │                │                 │                │◄───────┘       │                │
 │                │                 │                │                │                │
 │                │                 │                │  Send Email    │                │
 │                │                 │                │────────┐       │                │
 │                │                 │                │        │       │                │
 │                │                 │                │◄───────┘       │                │
 │                │                 │                │                │                │
 │                │                 │                │  Publish Event │                │
 │                │                 │                │ (UserRegistered)                │
 │                │                 │                │────────────────►                │
 │                │                 │                │                │                │
 │                │                 │  { user, token }                │                │
 │                │                 │◄────────────────                │                │
 │                │                 │                │                │                │
 │                │  { user, token }│                │                │                │
 │                │◄─────────────────                │                │                │
 │                │                 │                │                │                │
 │                │  Store token    │                │                │                │
 │                │────────┐        │                │                │                │
 │                │        │        │                │                │                │
 │                │◄───────┘        │                │                │                │
 │                │                 │                │                │                │
 │                │ POST /user/profile              │                │                │
 │                │─────────────────►                │                │                │
 │                │  (with token)   │                │                │                │
 │                │                 │                │                │                │
 │                │                 │  POST /user/profile             │                │
 │                │                 │─────────────────────────────────►                │
 │                │                 │  (with token)   │                │                │
 │                │                 │                │                │                │
 │                │                 │                │  Verify Token  │                │
 │                │                 │                │◄────────────────                │
 │                │                 │                │                │                │
 │                │                 │                │  Extract userId│                │
 │                │                 │                │                │                │
 │                │                 │                │                │  Check Profile │
 │                │                 │                │                │──────────────►│
 │                │                 │                │                │                │
 │                │                 │                │                │  Not Found     │
 │                │                 │                │                │◄──────────────│
 │                │                 │                │                │                │
 │                │                 │                │                │  Create Profile│
 │                │                 │                │                │──────────────►│
 │                │                 │                │                │                │
 │                │                 │                │                │  Profile Created│
 │                │                 │                │                │◄──────────────│
 │                │                 │                │                │                │
 │                │                 │                │  Publish Event │                │
 │                │                 │                │  (ProfileCreated)               │
 │                │                 │                │◄────────────────                │
 │                │                 │                │                │                │
 │                │                 │  { profile }   │                │                │
 │                │                 │◄─────────────────────────────────                │
 │                │                 │                │                │                │
 │                │  { profile }    │                │                │                │
 │                │◄─────────────────                │                │                │
 │                │                 │                │                │                │
 │  Show Step 3   │                 │                │                │                │
 │◄───────────────│                 │                │                │                │
 │  (Email Verify)│                 │                │                │                │
 │                │                 │                │                │                │
 │  Click Verified│                 │                │                │                │
 │───────────────►│                 │                │                │                │
 │                │                 │                │                │                │
 │  Show Step 4   │                 │                │                │                │
 │◄───────────────│                 │                │                │                │
 │  (Success)     │                 │                │                │                │
 │                │                 │                │                │                │
 │  Redirect to   │                 │                │                │                │
 │  /login        │                 │                │                │                │
 │◄───────────────│                 │                │                │                │
 │                │                 │                │                │                │
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER INPUT (Step 1)                          │
├─────────────────────────────────────────────────────────────────────┤
│  - Full Name                                                        │
│  - Email                                                            │
│  - Phone                                                            │
│  - Date of Birth                                                    │
│  - Gender                                                           │
│  - Password                                                         │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        USER INPUT (Step 2)                          │
├─────────────────────────────────────────────────────────────────────┤
│  - Address                                                          │
│  - City                                                             │
│  - ID Card Number                                                   │
│  - Driver License Number                                            │
│  - Emergency Contact                                                │
│  - Emergency Phone                                                  │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         FORM VALIDATION                             │
├─────────────────────────────────────────────────────────────────────┤
│  ✓ Email format                                                     │
│  ✓ Phone format (10-11 digits)                                     │
│  ✓ Age >= 18                                                        │
│  ✓ Password strength >= 3/5                                        │
│  ✓ Passwords match                                                  │
│  ✓ ID Card format (9-12 digits)                                    │
│  ✓ All required fields filled                                       │
└─────────────────────────────────────────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
    ┌────────────────────────┐  ┌────────────────────────┐
    │  DATA TO AUTH SERVICE  │  │  DATA TO USER SERVICE  │
    ├────────────────────────┤  ├────────────────────────┤
    │  - email               │  │  - fullName            │
    │  - phone               │  │  - dateOfBirth         │
    │  - password            │  │  - gender              │
    │  - role: "co-owner"    │  │  - address             │
    └────────────────────────┘  │  - city                │
                                │  - idCardNumber        │
                                │  - driverLicenseNumber │
                                │  - emergencyContact    │
                                │  - emergencyPhone      │
                                │  - isProfileComplete   │
                                └────────────────────────┘
                    │                       │
                    ▼                       ▼
    ┌────────────────────────┐  ┌────────────────────────┐
    │   AUTH SERVICE DB      │  │   USER SERVICE DB      │
    ├────────────────────────┤  ├────────────────────────┤
    │  Table: users          │  │  Table: user_profiles  │
    │                        │  │                        │
    │  id: UUID              │  │  id: UUID              │
    │  email: VARCHAR        │  │  user_id: UUID (FK)    │
    │  phone: VARCHAR        │  │  full_name: VARCHAR    │
    │  password: HASH        │  │  date_of_birth: DATE   │
    │  role: VARCHAR         │  │  gender: VARCHAR       │
    │  is_email_verified: NO │  │  address: TEXT         │
    │  created_at: NOW()     │  │  city: VARCHAR         │
    │  updated_at: NOW()     │  │  id_card_number: VAR   │
    └────────────────────────┘  │  driver_license_#: VAR │
                                │  emergency_contact:VAR │
                                │  emergency_phone: VAR  │
                                │  is_profile_complete:Y │
                                │  created_at: NOW()     │
                                │  updated_at: NOW()     │
                                └────────────────────────┘
```

---

## Event Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           RabbitMQ Events                           │
└─────────────────────────────────────────────────────────────────────┘

Auth Service                RabbitMQ                User Service
     │                          │                          │
     │  UserRegistered          │                          │
     │  {                       │                          │
     │    userId: UUID,         │                          │
     │    email: string,        │                          │
     │    phone: string,        │                          │
     │    role: string          │                          │
     │  }                       │                          │
     │─────────────────────────►│                          │
     │                          │  UserRegistered          │
     │                          │─────────────────────────►│
     │                          │                          │
     │                          │                          │  Auto-create
     │                          │                          │  empty profile
     │                          │                          │  (fallback)
     │                          │                          │
     │                          │  UserProfileCreated      │
     │                          │◄─────────────────────────│
     │  UserProfileCreated      │                          │
     │◄─────────────────────────│                          │
     │  {                       │                          │
     │    userId: UUID,         │                          │
     │    profile: {            │                          │
     │      id: UUID,           │                          │
     │      fullName: string,   │                          │
     │      ...                 │                          │
     │    }                     │                          │
     │  }                       │                          │
     │                          │                          │
```

---

## Component Hierarchy

```
Register.jsx
├── renderStepIndicator()
│   ├── Step 1 Icon (User)
│   ├── Step 2 Icon (CreditCard)
│   ├── Step 3 Icon (Mail)
│   └── Step 4 Icon (Check)
│
├── renderStep1()
│   ├── Full Name Input
│   ├── Email Input
│   ├── Phone Input
│   ├── Date of Birth Input
│   ├── Gender Select
│   ├── Password Input
│   │   └── Password Strength Meter
│   ├── Confirm Password Input
│   └── Next Button
│
├── renderStep2()
│   ├── Address Input
│   ├── City Input
│   ├── ID Card Input
│   ├── Driver License Input
│   ├── Emergency Contact Input
│   ├── Emergency Phone Input
│   ├── Back Button
│   └── Complete Registration Button
│
├── renderStep3()
│   ├── Email Icon
│   ├── Verification Message
│   ├── Resend Email Button
│   └── I've Verified Button
│
└── renderStep4()
    ├── Success Icon (animated)
    ├── Success Message
    └── Go to Login Button
```

---

## State Management

```javascript
// Component State
const [currentStep, setCurrentStep] = useState(1);  // 1, 2, 3, or 4
const [loading, setLoading] = useState(false);      // API loading state
const [userId, setUserId] = useState(null);         // After registration

const [formData, setFormData] = useState({
  // Step 1 fields
  fullName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: 'male',
  password: '',
  confirmPassword: '',
  
  // Step 2 fields
  address: '',
  city: '',
  idCardNumber: '',
  driverLicenseNumber: '',
  emergencyContact: '',
  emergencyPhone: ''
});

const [passwordStrength, setPasswordStrength] = useState({
  score: 0,        // 0-5
  feedback: ''     // "Weak", "Fair", "Good", "Strong"
});

// Steps configuration
const steps = [
  { number: 1, title: 'Basic Info', icon: User },
  { number: 2, title: 'Documents', icon: CreditCard },
  { number: 3, title: 'Verification', icon: Mail },
  { number: 4, title: 'Complete', icon: Check }
];
```

---

## API Endpoints Summary

```
┌──────────────────────────────────────────────────────────────────┐
│                    API Endpoints Used                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. POST /auth/register                                          │
│     Request:  { email, phone, password, role }                   │
│     Response: { user: { id, email, phone, role }, token }       │
│     Status:   201 Created                                        │
│                                                                  │
│  2. POST /user/profile                                           │
│     Headers:  { Authorization: Bearer <token> }                  │
│     Request:  { fullName, dateOfBirth, gender, address, ... }   │
│     Response: { id, userId, fullName, ... }                      │
│     Status:   201 Created                                        │
│                                                                  │
│  3. POST /auth/resend-verification (optional)                    │
│     Request:  { userId }                                         │
│     Response: { message: "Email sent" }                          │
│     Status:   200 OK                                             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Error Handling Flow

```
User Input
    │
    ▼
Frontend Validation
    │
    ├─► Invalid? ──► Show Error Toast ──► User corrects ──┐
    │                                                       │
    ▼                                                       │
API Call ◄──────────────────────────────────────────────────┘
    │
    ├─► Network Error? ──► Show Error Toast ──► Retry
    │
    ├─► 400 Bad Request? ──► Show Validation Errors
    │
    ├─► 409 Conflict? ──► Show "Email/Phone already exists"
    │
    ├─► 500 Server Error? ──► Show "Server error, try again"
    │
    ▼
Success
    │
    ▼
Next Step
```

---

## Security Flow

```
Password Input
    │
    ▼
Frontend Validation
    │
    ├─► Min 8 characters
    ├─► Contains uppercase
    ├─► Contains lowercase
    ├─► Contains number
    ├─► Contains special char
    │
    ▼
Send to Backend
    │
    ▼
Bcrypt Hash
    │
    ▼
Store Hash in Database
    │
    ▼
Generate JWT
    │
    ├─► Payload: { userId, email, role }
    ├─► Secret: process.env.JWT_SECRET
    ├─► Expiration: 7 days
    │
    ▼
Return Token to Frontend
    │
    ▼
Store in localStorage
    │
    ▼
Include in Authorization Header
for subsequent requests
```

---

**Created:** November 9, 2025
**Version:** 1.0.0
