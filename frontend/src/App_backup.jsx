import { Route, BrowserRouter as Router, Routes, Navigate, useLocation } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ScrollToTop from "./components/layout/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import AdminWrapper from "./components/layout/AdminWrapper";
import notificationService from './services/notification.service';
import { useEffect } from 'react';
import { useUserStore } from './stores/useUserStore';

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import DisputeManagement from "./pages/admin/DisputeManagement";
import FinancialReports from "./pages/admin/FinancialReports";
import StaffManagement from "./pages/admin/StaffManagement";
import AdminProfile from "./pages/admin/Profile";
import KYCVerification from "./pages/admin/KYCVerification";

// Shared Pages (dùng chung cho admin và staff)
import ServiceManagement from "./pages/shared/ServiceManagement";
import CheckInOutManagement from "./pages/staff/CheckInOutManagement";

// Auth Pages
import ForgotPassword from "./pages/auth/ForgotPassword";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";

// Dashboard & Co-owner Pages
import Home from "./pages/dashboard/Dashboard";
import CoownerDashboard from "./pages/coowner/Dashboard";
import AIRecommendations from "./pages/coowner/ai/AIRecommendations";
import OwnershipManagement from "./pages/coowner/ownership/OwnershipManagement";
import ContractViewer from "./pages/coowner/ownership/ContractViewer";
import DocumentUpload from "./pages/coowner/ownership/DocumentUpload";
import BookingCalendar from "./pages/coowner/booking/BookingCalendar";
import BookingForm from "./pages/coowner/booking/BookingForm";
import BookingDetails from "./pages/bookings/BookingDetails";
import ScheduleView from "./pages/coowner/booking/ScheduleView";
import VehicleDashboard from "./pages/coowner/vehicles/VehicleDashboard";
import NotificationSettings from "./pages/notifications/NotificationSettings";
import CostBreakdown from "./pages/coowner/financial/CostBreakdown";
import PaymentHistory from "./pages/coowner/financial/PaymentHistory";
import ExpenseTracking from "./pages/coowner/financial/ExpenseTracking";
import PaymentPortal from "./pages/coowner/financial/PaymentPortal";
import PaymentCallback from "./pages/payment/PaymentCallback";
import UsageHistory from "./pages/coowner/history/UsageHistory";
import UsageAnalytics from "./pages/coowner/history/UsageAnalytics";
import GroupManagement from "./pages/coowner/group/GroupManagement";
import VotingSystem from "./pages/coowner/group/VotingSystem";
import VotingManagement from "./pages/coowner/group/VotingManagement";
import CommonFund from "./pages/coowner/group/CommonFund";
import ContractManagement from "./pages/coowner/contracts/ContractManagement";
import Profile from "./pages/coowner/account/Profile";
import KYCStatus from "./pages/profile/KYCStatus";
import ChangePassword from "./pages/profile/ChangePassword";

// Staff Pages
import StaffDashboard from "./pages/staff/Dashboard";
import StaffProfile from "./pages/staff/Profile";

// Policies Pages
import ChinhSachBaoMat from "./pages/policies/ChinhSachBaoMat";
import QuyDinhHoatDong from "./pages/policies/QuyDinhHoatDong";
import QuyenLoiThanhVien from "./pages/policies/QuyenLoiThanhVien";

export default function App() {
  function LegacyCoownerRedirect() {
    const location = useLocation();
    const to = location.pathname.replace(/^\/dashboard\/coowner/, '/coowner');
    return <Navigate to={to + location.search} replace />;
  }

  const user = useUserStore(state => state.user);

  useEffect(() => {
    // Auto-connect to notification socket when user data is present (reactive)
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
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Policy Routes */}
        <Route path="/quy-dinh-hoat-dong" element={<QuyDinhHoatDong />} />
        <Route path="/chinh-sach-bao-mat" element={<ChinhSachBaoMat />} />
        <Route
          path="/bang-quyen-loi-thanh-vien"
          element={<QuyenLoiThanhVien />}
        />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/staff" element={<StaffManagement />} />
        <Route path="/admin/profile" element={<AdminProfile />} />
        <Route path="/admin/disputes" element={<DisputeManagement />} />
        <Route path="/admin/financial-reports" element={<FinancialReports />} />
  <Route path="/admin/cars" element={<AdminWrapper><VehicleDashboard /></AdminWrapper>} />
  <Route path="/admin/contracts" element={<AdminWrapper><ContractManagement /></AdminWrapper>} />
        <Route path="/admin/kyc" element={<KYCVerification />} />

        {/* Shared Management Routes - Dùng chung cho Admin và Staff */}
        <Route path="/admin/services" element={<ServiceManagement />} />
        <Route path="/admin/checkin" element={<CheckInOutManagement />} />

        {/* Staff Routes - Sử dụng cùng các component shared */}
        <Route path="/staff" element={<StaffDashboard />} />
        <Route path="/staff/dashboard" element={<StaffDashboard />} />
        <Route path="/staff/profile" element={<StaffProfile />} />
        <Route path="/staff/services" element={<ServiceManagement />} />
        <Route path="/staff/checkin" element={<CheckInOutManagement />} />

        {/* Co-owner Routes */}
  <Route path="/coowner" element={<CoownerDashboard />} />
  <Route path="/coowner/dashboard" element={<CoownerDashboard />} />
  {/* Legacy route: redirect any /dashboard/coowner/* to /coowner/* */}
  <Route path="/dashboard/coowner/*" element={<LegacyCoownerRedirect />} />
        
        {/* Ownership Routes */}
        <Route path="/coowner/ownership" element={<OwnershipManagement />} />
        <Route path="/coowner/ownership/contracts" element={<ContractViewer />} />
        <Route path="/coowner/ownership/contract" element={<ContractViewer />} />
        <Route path="/coowner/ownership/documents" element={<DocumentUpload />} />
        
        {/* Booking Routes */}
        <Route path="/coowner/booking" element={<BookingCalendar />} />
        <Route path="/coowner/booking/new" element={<BookingForm />} />
        <Route path="/coowner/booking/:bookingId" element={<BookingDetails />} />
        <Route path="/coowner/booking/schedule" element={<ScheduleView />} />
        
        {/* Vehicle Routes */}
        <Route path="/coowner/vehicles" element={<VehicleDashboard />} />
        
        {/* Contract Routes */}
        <Route path="/coowner/contracts" element={<ContractManagement />} />
        
        {/* Financial Routes */}
        <Route path="/coowner/financial" element={<PaymentPortal />} />
        <Route path="/coowner/financial/cost-breakdown" element={<CostBreakdown />} />
        <Route path="/coowner/financial/payment" element={<PaymentHistory />} />
        <Route path="/coowner/financial/payment-portal" element={<PaymentPortal />} />
        <Route path="/coowner/financial/expense-tracking" element={<ExpenseTracking />} />
        <Route path="/payment/callback" element={<PaymentCallback />} />
        
        {/* History Routes */}
        <Route path="/coowner/history" element={<UsageHistory />} />
        <Route path="/coowner/history/analytics" element={<UsageAnalytics />} />
        
        {/* Group Routes */}
        <Route path="/coowner/group" element={<GroupManagement />} />
        <Route path="/coowner/group/voting" element={<VotingSystem />} />
        <Route path="/coowner/group/voting-management" element={<VotingManagement />} />
        <Route path="/coowner/group/fund" element={<CommonFund />} />
        
        {/* Account Routes */}
        <Route path="/coowner/account/profile" element={<Profile />} />
        <Route path="/coowner/account/kyc" element={<KYCStatus />} />
        <Route path="/coowner/settings/notifications" element={<NotificationSettings />} />
        
        {/* AI Routes */}
        <Route path="/coowner/ai-recommendations" element={<AIRecommendations />} />
        
        {/* Profile Routes */}
        <Route path="/kyc-status" element={<KYCStatus />} />
        <Route path="/profile/kyc-status" element={<KYCStatus />} />
        <Route path="/profile/settings" element={<Profile />} />
        <Route path="/profile/change-password" element={<ChangePassword />} />

        {/* Fallback Route */}
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
      
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