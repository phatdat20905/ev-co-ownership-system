import { Route, BrowserRouter as Router, Routes, Navigate, useLocation } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect, Suspense, lazy } from 'react';
import ScrollToTop from "./components/layout/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingSkeleton from "./components/LoadingSkeleton";
import AdminWrapper from "./components/layout/AdminWrapper";
import notificationService from './services/notification.service';
import { useUserStore } from './stores/useUserStore';
import { useAuthStore } from './stores/useAuthStore';

// Lazy load pages for better performance
// Auth Pages
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/auth/VerifyEmail"));

// Public Pages
const Home = lazy(() => import("./pages/dashboard/Dashboard"));
const ChinhSachBaoMat = lazy(() => import("./pages/policies/ChinhSachBaoMat"));
const QuyDinhHoatDong = lazy(() => import("./pages/policies/QuyDinhHoatDong"));
const QuyenLoiThanhVien = lazy(() => import("./pages/policies/QuyenLoiThanhVien"));

// Admin Pages
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const DisputeManagement = lazy(() => import("./pages/admin/DisputeManagement"));
const FinancialReports = lazy(() => import("./pages/admin/FinancialReports"));
const StaffManagement = lazy(() => import("./pages/admin/StaffManagement"));
const AdminProfile = lazy(() => import("./pages/admin/Profile"));
const KYCVerification = lazy(() => import("./pages/admin/KYCVerification"));

// Shared Pages
const ServiceManagement = lazy(() => import("./pages/shared/ServiceManagement"));
const CheckInOutManagement = lazy(() => import("./pages/staff/CheckInOutManagement"));

// Co-owner Pages
const CoownerDashboard = lazy(() => import("./pages/coowner/Dashboard"));
const AIRecommendations = lazy(() => import("./pages/coowner/ai/AIRecommendations"));
const OwnershipManagement = lazy(() => import("./pages/coowner/ownership/OwnershipManagement"));
const ContractViewer = lazy(() => import("./pages/coowner/ownership/ContractViewer"));
const DocumentUpload = lazy(() => import("./pages/coowner/ownership/DocumentUpload"));
const BookingCalendar = lazy(() => import("./pages/coowner/booking/BookingCalendar"));
const BookingForm = lazy(() => import("./pages/coowner/booking/BookingForm"));
const BookingDetails = lazy(() => import("./pages/bookings/BookingDetails"));
const ScheduleView = lazy(() => import("./pages/coowner/booking/ScheduleView"));
const VehicleDashboard = lazy(() => import("./pages/coowner/vehicles/VehicleDashboard"));
const NotificationSettings = lazy(() => import("./pages/notifications/NotificationSettings"));
const CostBreakdown = lazy(() => import("./pages/coowner/financial/CostBreakdown"));
const PaymentHistory = lazy(() => import("./pages/coowner/financial/PaymentHistory"));
const ExpenseTracking = lazy(() => import("./pages/coowner/financial/ExpenseTracking"));
const PaymentPortal = lazy(() => import("./pages/coowner/financial/PaymentPortal"));
const PaymentCallback = lazy(() => import("./pages/payment/PaymentCallback"));
const UsageHistory = lazy(() => import("./pages/coowner/history/UsageHistory"));
const UsageAnalytics = lazy(() => import("./pages/coowner/history/UsageAnalytics"));
const GroupManagement = lazy(() => import("./pages/coowner/group/GroupManagement"));
const VotingSystem = lazy(() => import("./pages/coowner/group/VotingSystem"));
const VotingManagement = lazy(() => import("./pages/coowner/group/VotingManagement"));
const CommonFund = lazy(() => import("./pages/coowner/group/CommonFund"));
const ContractManagement = lazy(() => import("./pages/coowner/contracts/ContractManagement"));
const Profile = lazy(() => import("./pages/coowner/account/Profile"));
const KYCStatus = lazy(() => import("./pages/profile/KYCStatus"));
const ChangePassword = lazy(() => import("./pages/profile/ChangePassword"));

// Staff Pages
const StaffDashboard = lazy(() => import("./pages/staff/Dashboard"));
const StaffProfile = lazy(() => import("./pages/staff/Profile"));

// Protected Route Component
function ProtectedRoute({ children, allowedRoles = [] }) {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated());
  const user = useUserStore(state => state.user);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Public Route Component (redirect if authenticated)
function PublicRoute({ children }) {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated());
  
  if (isAuthenticated) {
    return <Navigate to="/coowner" replace />;
  }

  return children;
}

export default function App() {
  function LegacyCoownerRedirect() {
    const location = useLocation();
    const to = location.pathname.replace(/^\/dashboard\/coowner/, '/coowner');
    return <Navigate to={to + location.search} replace />;
  }

  const user = useUserStore(state => state.user);

  useEffect(() => {
    // Auto-connect to notification socket when user data is present
    let socketHandle = null;
    if (user && user.id) {
      notificationService.connectWebSocket(user.id, (msg) => {
        window.dispatchEvent(new CustomEvent('notification:received', { detail: msg }));
      }, (err) => {
        console.error('Notification WS error', err);
      }).then((s) => {
        socketHandle = s;
      }).catch(() => {});
    }

    return () => {
      try { notificationService.disconnectWebSocket(); } catch (e) {}
    };
  }, [user]);

  return (
    <ErrorBoundary>
      <Router>
        <ScrollToTop />
        <Suspense fallback={<LoadingSkeleton />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
            <Route path="/verify-email" element={<PublicRoute><VerifyEmail /></PublicRoute>} />

            {/* Policy Routes */}
            <Route path="/quy-dinh-hoat-dong" element={<QuyDinhHoatDong />} />
            <Route path="/chinh-sach-bao-mat" element={<ChinhSachBaoMat />} />
            <Route path="/bang-quyen-loi-thanh-vien" element={<QuyenLoiThanhVien />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/staff" element={<ProtectedRoute allowedRoles={['admin']}><StaffManagement /></ProtectedRoute>} />
            <Route path="/admin/profile" element={<ProtectedRoute allowedRoles={['admin']}><AdminProfile /></ProtectedRoute>} />
            <Route path="/admin/disputes" element={<ProtectedRoute allowedRoles={['admin']}><DisputeManagement /></ProtectedRoute>} />
            <Route path="/admin/financial-reports" element={<ProtectedRoute allowedRoles={['admin']}><FinancialReports /></ProtectedRoute>} />
            <Route path="/admin/cars" element={<ProtectedRoute allowedRoles={['admin']}><AdminWrapper><VehicleDashboard /></AdminWrapper></ProtectedRoute>} />
            <Route path="/admin/contracts" element={<ProtectedRoute allowedRoles={['admin']}><AdminWrapper><ContractManagement /></AdminWrapper></ProtectedRoute>} />
            <Route path="/admin/kyc" element={<ProtectedRoute allowedRoles={['admin']}><KYCVerification /></ProtectedRoute>} />
            <Route path="/admin/services" element={<ProtectedRoute allowedRoles={['admin']}><ServiceManagement /></ProtectedRoute>} />
            <Route path="/admin/checkin" element={<ProtectedRoute allowedRoles={['admin']}><CheckInOutManagement /></ProtectedRoute>} />

            {/* Staff Routes */}
            <Route path="/staff" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><StaffDashboard /></ProtectedRoute>} />
            <Route path="/staff/dashboard" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><StaffDashboard /></ProtectedRoute>} />
            <Route path="/staff/profile" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><StaffProfile /></ProtectedRoute>} />
            <Route path="/staff/services" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><ServiceManagement /></ProtectedRoute>} />
            <Route path="/staff/checkin" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><CheckInOutManagement /></ProtectedRoute>} />

            {/* Co-owner Routes */}
            <Route path="/coowner" element={<ProtectedRoute allowedRoles={['co-owner']}><CoownerDashboard /></ProtectedRoute>} />
            <Route path="/coowner/dashboard" element={<ProtectedRoute allowedRoles={['co-owner']}><CoownerDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/coowner/*" element={<LegacyCoownerRedirect />} />
            
            {/* Ownership Routes */}
            <Route path="/coowner/ownership" element={<ProtectedRoute allowedRoles={['co-owner']}><OwnershipManagement /></ProtectedRoute>} />
            <Route path="/coowner/ownership/contracts" element={<ProtectedRoute allowedRoles={['co-owner']}><ContractViewer /></ProtectedRoute>} />
            <Route path="/coowner/ownership/documents" element={<ProtectedRoute allowedRoles={['co-owner']}><DocumentUpload /></ProtectedRoute>} />
            
            {/* Booking Routes */}
            <Route path="/coowner/booking" element={<ProtectedRoute allowedRoles={['co-owner']}><BookingCalendar /></ProtectedRoute>} />
            <Route path="/coowner/booking/new" element={<ProtectedRoute allowedRoles={['co-owner']}><BookingForm /></ProtectedRoute>} />
            <Route path="/coowner/booking/:bookingId" element={<ProtectedRoute allowedRoles={['co-owner']}><BookingDetails /></ProtectedRoute>} />
            <Route path="/coowner/booking/schedule" element={<ProtectedRoute allowedRoles={['co-owner']}><ScheduleView /></ProtectedRoute>} />
            
            {/* Vehicle Routes */}
            <Route path="/coowner/vehicles" element={<ProtectedRoute allowedRoles={['co-owner']}><VehicleDashboard /></ProtectedRoute>} />
            
            {/* Contract Routes */}
            <Route path="/coowner/contracts" element={<ProtectedRoute allowedRoles={['co-owner']}><ContractManagement /></ProtectedRoute>} />
            
            {/* Financial Routes */}
            <Route path="/coowner/financial" element={<ProtectedRoute allowedRoles={['co-owner']}><PaymentPortal /></ProtectedRoute>} />
            <Route path="/coowner/financial/cost-breakdown" element={<ProtectedRoute allowedRoles={['co-owner']}><CostBreakdown /></ProtectedRoute>} />
            <Route path="/coowner/financial/payment" element={<ProtectedRoute allowedRoles={['co-owner']}><PaymentHistory /></ProtectedRoute>} />
            <Route path="/coowner/financial/payment-portal" element={<ProtectedRoute allowedRoles={['co-owner']}><PaymentPortal /></ProtectedRoute>} />
            <Route path="/coowner/financial/expense-tracking" element={<ProtectedRoute allowedRoles={['co-owner']}><ExpenseTracking /></ProtectedRoute>} />
            <Route path="/payment/callback" element={<PaymentCallback />} />
            
            {/* History Routes */}
            <Route path="/coowner/history" element={<ProtectedRoute allowedRoles={['co-owner']}><UsageHistory /></ProtectedRoute>} />
            <Route path="/coowner/history/analytics" element={<ProtectedRoute allowedRoles={['co-owner']}><UsageAnalytics /></ProtectedRoute>} />
            
            {/* Group Routes */}
            <Route path="/coowner/group" element={<ProtectedRoute allowedRoles={['co-owner']}><GroupManagement /></ProtectedRoute>} />
            <Route path="/coowner/group/voting" element={<ProtectedRoute allowedRoles={['co-owner']}><VotingSystem /></ProtectedRoute>} />
            <Route path="/coowner/group/voting-management" element={<ProtectedRoute allowedRoles={['co-owner']}><VotingManagement /></ProtectedRoute>} />
            <Route path="/coowner/group/fund" element={<ProtectedRoute allowedRoles={['co-owner']}><CommonFund /></ProtectedRoute>} />
            
            {/* Account Routes */}
            <Route path="/coowner/account/profile" element={<ProtectedRoute allowedRoles={['co-owner']}><Profile /></ProtectedRoute>} />
            <Route path="/coowner/account/kyc" element={<ProtectedRoute allowedRoles={['co-owner']}><KYCStatus /></ProtectedRoute>} />
            <Route path="/coowner/settings/notifications" element={<ProtectedRoute allowedRoles={['co-owner']}><NotificationSettings /></ProtectedRoute>} />
            
            {/* AI Routes */}
            <Route path="/coowner/ai-recommendations" element={<ProtectedRoute allowedRoles={['co-owner']}><AIRecommendations /></ProtectedRoute>} />
            
            {/* Profile Routes (accessible to all authenticated users) */}
            <Route path="/profile/kyc-status" element={<ProtectedRoute><KYCStatus /></ProtectedRoute>} />
            <Route path="/profile/settings" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/profile/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />

            {/* Fallback Route */}
            <Route path="*" element={<div className="flex items-center justify-center h-screen"><h1 className="text-2xl">404 - Page Not Found</h1></div>} />
          </Routes>
        </Suspense>
        
        {/* Toast Notification Container */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </Router>
    </ErrorBoundary>
  );
}
