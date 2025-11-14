import { Route, BrowserRouter as Router, Routes, Navigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Suspense, lazy } from 'react';
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingSkeleton from "./components/LoadingSkeleton";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicRoute from "./components/auth/PublicRoute";

// Lazy load pages
// Auth Pages
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/auth/VerifyEmail"));

// Dashboard Pages
const CoownerDashboard = lazy(() => import("./pages/dashboard/CoownerDashboard"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const StaffDashboard = lazy(() => import("./pages/dashboard/StaffDashboard"));

// Group Pages
const GroupList = lazy(() => import("./pages/groups/GroupList"));
const GroupDetail = lazy(() => import("./pages/groups/GroupDetail"));
const GroupCreate = lazy(() => import("./pages/groups/GroupCreate"));

// Booking Pages
const BookingCalendar = lazy(() => import("./pages/bookings/BookingCalendar"));
const BookingList = lazy(() => import("./pages/bookings/BookingList"));
const BookingDetail = lazy(() => import("./pages/bookings/BookingDetail"));
const BookingCreate = lazy(() => import("./pages/bookings/BookingCreate"));

// Cost Pages
const CostList = lazy(() => import("./pages/costs/CostList"));
const CostDetail = lazy(() => import("./pages/costs/CostDetail"));
const CostSummary = lazy(() => import("./pages/costs/CostSummary"));

// Vehicle Pages
const VehicleList = lazy(() => import("./pages/vehicles/VehicleList"));
const VehicleDetail = lazy(() => import("./pages/vehicles/VehicleDetail"));

// Contract Pages
const ContractList = lazy(() => import("./pages/contracts/ContractList"));
const ContractDetail = lazy(() => import("./pages/contracts/ContractDetail"));

// Profile Pages
const Profile = lazy(() => import("./pages/profile/Profile"));

// Admin Pages
const AdminGroups = lazy(() => import("./pages/admin/AdminGroups"));
const AdminVehicles = lazy(() => import("./pages/admin/AdminVehicles"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));
const AdminStaff = lazy(() => import("./pages/admin/AdminStaff"));
const AdminDisputes = lazy(() => import("./pages/admin/AdminDisputes"));
const AdminKYC = lazy(() => import("./pages/admin/AdminKYC"));

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Suspense fallback={<LoadingSkeleton />}>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
            </Route>

            {/* Protected Routes - Co-owner */}
            <Route element={<ProtectedRoute allowedRoles={['co-owner', 'user']} />}>
              <Route path="/dashboard" element={<CoownerDashboard />} />
              
              {/* Groups */}
              <Route path="/groups" element={<GroupList />} />
              <Route path="/groups/create" element={<GroupCreate />} />
              <Route path="/groups/:groupId" element={<GroupDetail />} />

              {/* Bookings */}
              <Route path="/bookings" element={<BookingList />} />
              <Route path="/bookings/calendar" element={<BookingCalendar />} />
              <Route path="/bookings/create" element={<BookingCreate />} />
              <Route path="/bookings/:bookingId" element={<BookingDetail />} />

              {/* Costs */}
              <Route path="/costs" element={<CostList />} />
              <Route path="/costs/summary" element={<CostSummary />} />
              <Route path="/costs/:costId" element={<CostDetail />} />

              {/* Vehicles */}
              <Route path="/vehicles" element={<VehicleList />} />
              <Route path="/vehicles/:vehicleId" element={<VehicleDetail />} />

              {/* Contracts */}
              <Route path="/contracts" element={<ContractList />} />
              <Route path="/contracts/:contractId" element={<ContractDetail />} />

              {/* Profile */}
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Protected Routes - Admin */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/groups" element={<AdminGroups />} />
              <Route path="/admin/vehicles" element={<AdminVehicles />} />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/admin/staff" element={<AdminStaff />} />
              <Route path="/admin/disputes" element={<AdminDisputes />} />
              <Route path="/admin/kyc" element={<AdminKYC />} />
            </Route>

            {/* Protected Routes - Staff */}
            <Route element={<ProtectedRoute allowedRoles={['staff']} />}>
              <Route path="/staff/dashboard" element={<StaffDashboard />} />
            </Route>

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </Router>
    </ErrorBoundary>
  );
}
