# API Integration Guide
## Hướng dẫn tích hợp API cho Frontend

---

## 📋 Tổng quan

Dự án hiện đã có đầy đủ infrastructure để kết nối với backend API:
- ✅ Axios client đã cấu hình
- ✅ Interceptors cho authentication
- ✅ Error handling tập trung
- ✅ 8 service modules hoàn chỉnh
- ✅ Utilities cho storage và notifications

---

## 🚀 Bắt đầu

### 1. Cài đặt dependencies

```bash
cd frontend
npm install axios
npm install react-toastify  # Optional: for better notifications
```

### 2. Cấu hình Environment Variables

File `.env` đã được tạo với config mặc định:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_TIMEOUT=30000
VITE_APP_ENV=development
```

**Lưu ý:** Điều chỉnh `VITE_API_BASE_URL` theo địa chỉ backend thực tế của bạn.

### 3. Import và sử dụng services

```javascript
// Import một service cụ thể
import { authService } from '../services';

// Hoặc import nhiều services
import { authService, userService, bookingService } from '../services';

// Sử dụng
const response = await authService.login({ email, password });
```

---

## 📝 Ví dụ Migration từ Mock Data sang Real API

### **Ví dụ 1: Login Page**

#### ❌ TRƯỚC (Mock Data):

```jsx
// pages/auth/Login.jsx
const handleSubmit = (e) => {
  e.preventDefault();
  setLoading(true);

  // Giả lập đăng nhập
  setTimeout(() => {
    let userData = null;

    if (identifier === demoAccounts.user.email && password === demoAccounts.user.password) {
      userData = demoAccounts.user;
    }

    if (userData) {
      const authData = {
        token: "demo-token-" + Date.now(),
        user: userData,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };

      localStorage.setItem("authToken", authData.token);
      localStorage.setItem("userData", JSON.stringify(authData.user));
      
      navigate("/dashboard/coowner");
    } else {
      alert("Email hoặc mật khẩu không đúng!");
      setLoading(false);
    }
  }, 1500);
};
```

#### ✅ SAU (Real API):

```jsx
// pages/auth/Login.jsx
import { authService } from '../../services';
import { showSuccessToast, showErrorToast } from '../../utils/toast';

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    // Gọi API login thực
    const response = await authService.login({
      email: identifier,
      password: password,
    });

    // authService đã tự động lưu token và user data
    if (response.success) {
      showSuccessToast('Đăng nhập thành công!');
      
      // Điều hướng dựa trên role
      const { role } = response.data.user;
      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'staff') {
        navigate('/staff');
      } else {
        navigate('/dashboard/coowner');
      }
    }
  } catch (error) {
    // Error đã được xử lý bởi interceptor
    // Có thể thêm xử lý bổ sung nếu cần
    console.error('Login error:', error);
  } finally {
    setLoading(false);
  }
};
```

---

### **Ví dụ 2: User Profile Page**

#### ❌ TRƯỚC (Mock Data):

```jsx
// pages/dashboard/coowner/account/Profile.jsx
const fetchUserData = async () => {
  setLoading(true);
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser = {
      id: 1,
      name: "Nguyễn Văn A",
      email: "user@evcoownership.com",
      phone: "0901234567",
      // ... more fields
    };
    
    setUserData(mockUser);
  } finally {
    setLoading(false);
  }
};
```

#### ✅ SAU (Real API):

```jsx
// pages/dashboard/coowner/account/Profile.jsx
import { userService } from '../../../../services';
import { showSuccessToast, showErrorToast } from '../../../../utils/toast';

const fetchUserData = async () => {
  setLoading(true);
  try {
    const response = await userService.getProfile();
    
    if (response.success) {
      setUserData(response.data);
    }
  } catch (error) {
    showErrorToast('Không thể tải thông tin người dùng');
  } finally {
    setLoading(false);
  }
};

// Update profile
const handleSaveProfile = async () => {
  setLoading(true);
  try {
    const response = await userService.updateProfile(formData);
    
    if (response.success) {
      showSuccessToast('Cập nhật thông tin thành công!');
      setUserData(response.data);
      setIsEditing(false);
    }
  } catch (error) {
    // Error handled by interceptor
  } finally {
    setLoading(false);
  }
};
```

---

### **Ví dụ 3: Booking Form**

#### ❌ TRƯỚC (Mock Data):

```jsx
// pages/dashboard/coowner/booking/BookingForm.jsx
const handleSubmit = (e) => {
  e.preventDefault();
  // Xử lý đặt lịch
  setTimeout(() => {
    navigate('/dashboard/coowner/booking');
  }, 1500);
};
```

#### ✅ SAU (Real API):

```jsx
// pages/dashboard/coowner/booking/BookingForm.jsx
import { bookingService } from '../../../../services';
import { showSuccessToast, showErrorToast } from '../../../../utils/toast';

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    // Kiểm tra xung đột trước
    const conflicts = await bookingService.checkConflicts(
      formData.car,
      formData.startDate,
      formData.endDate
    );

    if (conflicts.data && conflicts.data.length > 0) {
      showWarningToast('Xe đã có lịch đặt trong khoảng thời gian này!');
      return;
    }

    // Tạo booking
    const response = await bookingService.createBooking({
      vehicleId: formData.car,
      startTime: `${formData.startDate}T${formData.startTime}`,
      endTime: `${formData.endDate}T${formData.endTime}`,
      purpose: formData.purpose,
      passengers: formData.passengers,
      notes: formData.notes,
    });

    if (response.success) {
      showSuccessToast('Đặt lịch thành công!');
      navigate('/dashboard/coowner/booking');
    }
  } catch (error) {
    // Error handled by interceptor
  } finally {
    setLoading(false);
  }
};

// Load vehicles for selection
useEffect(() => {
  const loadVehicles = async () => {
    try {
      const response = await vehicleService.getVehicles({ status: 'available' });
      if (response.success) {
        setCars(response.data);
      }
    } catch (error) {
      console.error('Failed to load vehicles:', error);
    }
  };

  loadVehicles();
}, []);
```

---

### **Ví dụ 4: Group Management**

#### ❌ TRƯỚC (Mock Data):

```jsx
// pages/dashboard/coowner/group/GroupManagement.jsx
const fetchGroupData = async () => {
  setLoading(true);
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockGroups = [
      {
        id: 1,
        name: "Nhóm Tesla Model 3",
        members: 4,
        vehicles: 1,
        // ...
      }
    ];
    
    setGroups(mockGroups);
  } finally {
    setLoading(false);
  }
};
```

#### ✅ SAU (Real API):

```jsx
// pages/dashboard/coowner/group/GroupManagement.jsx
import { userService } from '../../../../services';
import { showSuccessToast, showErrorToast } from '../../../../utils/toast';

const fetchGroupData = async () => {
  setLoading(true);
  try {
    const response = await userService.getUserGroups();
    
    if (response.success) {
      setGroups(response.data);
    }
  } catch (error) {
    showErrorToast('Không thể tải danh sách nhóm');
  } finally {
    setLoading(false);
  }
};

// Get group details with members
const loadGroupDetails = async (groupId) => {
  try {
    const [groupResponse, membersResponse] = await Promise.all([
      userService.getGroupById(groupId),
      userService.getGroupMembers(groupId),
    ]);

    if (groupResponse.success && membersResponse.success) {
      setSelectedGroup({
        ...groupResponse.data,
        members: membersResponse.data,
      });
    }
  } catch (error) {
    showErrorToast('Không thể tải thông tin nhóm');
  }
};
```

---

### **Ví dụ 5: Expense Tracking**

#### ❌ TRƯỚC (Mock Data):

```jsx
// pages/dashboard/coowner/financial/ExpenseTracking.jsx
const fetchExpenseData = async () => {
  setLoading(true);
  try {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockExpenses = [
      { id: 1, date: "2025-11-01", category: "Sạc điện", amount: 150000 },
      // ...
    ];
    
    setExpenses(mockExpenses);
  } finally {
    setLoading(false);
  }
};
```

#### ✅ SAU (Real API):

```jsx
// pages/dashboard/coowner/financial/ExpenseTracking.jsx
import { costService } from '../../../../services';
import { showErrorToast } from '../../../../utils/toast';

const fetchExpenseData = async () => {
  setLoading(true);
  try {
    const groupId = getCurrentGroupId(); // Get from context or props
    
    const response = await costService.getCostsByGroup(groupId, {
      startDate: filterStartDate,
      endDate: filterEndDate,
      category: selectedCategory,
    });

    if (response.success) {
      setExpenses(response.data);
      
      // Get cost summary
      const summaryResponse = await costService.getCostSummary(
        groupId,
        filterStartDate,
        filterEndDate
      );
      
      if (summaryResponse.success) {
        setSummary(summaryResponse.data);
      }
    }
  } catch (error) {
    showErrorToast('Không thể tải dữ liệu chi phí');
  } finally {
    setLoading(false);
  }
};

// Create new expense
const handleCreateExpense = async (expenseData) => {
  try {
    const response = await costService.createCost({
      groupId: getCurrentGroupId(),
      ...expenseData,
    });

    if (response.success) {
      showSuccessToast('Thêm chi phí thành công!');
      fetchExpenseData(); // Reload data
    }
  } catch (error) {
    // Error handled by interceptor
  }
};
```

---

## 🔐 Authentication Flow

### Protected Routes

```jsx
// App.jsx or similar
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUserRole } from './utils/storage';

const ProtectedRoute = ({ children, allowedRoles }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const userRole = getUserRole();
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Usage
<Route 
  path="/admin/*" 
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminLayout />
    </ProtectedRoute>
  } 
/>
```

### Auto Token Refresh

Interceptor đã tự động xử lý token expired (401). Nếu cần implement refresh token:

```jsx
// services/api/interceptors.js
// Add to response interceptor error handling:

if (status === 401 && !originalRequest._retry) {
  originalRequest._retry = true;
  
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await authService.refreshToken(refreshToken);
    
    if (response.success) {
      originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
      return apiClient(originalRequest);
    }
  } catch (refreshError) {
    clearAuth();
    window.location.href = '/login';
    return Promise.reject(refreshError);
  }
}
```

---

## 📊 Error Handling Best Practices

### Global Error Handling (Already Implemented)

Interceptor tự động xử lý các lỗi phổ biến:
- 401: Token expired → Redirect to login
- 403: Forbidden → Show error message
- 404: Not found → Show error message
- 422: Validation error → Show first error
- 500: Server error → Show generic error

### Component-level Error Handling

```jsx
try {
  const response = await someService.someMethod();
  
  if (response.success) {
    // Handle success
  }
} catch (error) {
  // Global error handler đã xử lý
  // Chỉ cần handle logic bổ sung nếu cần
  if (error.response?.status === 404) {
    // Navigate to not found page
    navigate('/not-found');
  }
}
```

---

## 🎯 Next Steps

### 1. Install React Toastify (Recommended)

```bash
npm install react-toastify
```

Then update `src/utils/toast.js` with proper implementation (instructions in file).

### 2. Migration Checklist

- [ ] Update all Login/Register pages
- [ ] Update Profile pages
- [ ] Update Booking components
- [ ] Update Financial/Cost tracking
- [ ] Update Group management
- [ ] Update Vehicle management
- [ ] Update Contract management
- [ ] Update Admin pages
- [ ] Add loading states
- [ ] Add error boundaries
- [ ] Test all API calls

### 3. Testing

```bash
# Start backend services first
cd backend
# Start all services...

# Start frontend
cd frontend
npm run dev
```

---

## 📚 Available Services

| Service | Description | Key Methods |
|---------|-------------|-------------|
| `authService` | Authentication | `login`, `register`, `logout`, `verifyEmail`, `resetPassword` |
| `userService` | User & Groups | `getProfile`, `updateProfile`, `getUserGroups`, `createGroup` |
| `bookingService` | Bookings | `createBooking`, `getUserBookings`, `checkIn`, `checkOut` |
| `costService` | Costs & Payments | `createCost`, `getCostsByGroup`, `createPayment`, `paySplit` |
| `vehicleService` | Vehicles | `getVehicles`, `getVehicle`, `updateVehicleStatus`, `getMaintenanceRecords` |
| `contractService` | Contracts | `createContract`, `signContract`, `downloadContractPDF` |
| `adminService` | Admin Panel | `getDashboardStats`, `listStaff`, `listDisputes`, `approveKYC` |
| `aiService` | AI Features | `optimizeSchedule`, `predictCosts`, `analyzeDispute` |

---

## 🐛 Common Issues

### Issue: CORS Error

**Solution:** Ensure backend API has proper CORS configuration.

### Issue: Token not attached

**Solution:** Import interceptor version, not base config:
```javascript
// ✅ Correct
import apiClient from './services/api/interceptors.js';

// ❌ Wrong
import apiClient from './services/api/config.js';
```

### Issue: Response format mismatch

**Solution:** Backend should return consistent format:
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```

---

## 📞 Support

For issues or questions, check:
1. Backend API documentation
2. Service method comments
3. Error logs in browser console
4. Network tab in DevTools

---

**Happy Coding! 🚀**
