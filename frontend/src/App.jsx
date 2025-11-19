import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ScrollToTop from "./components/layout/ScrollToTop";
import { ProtectedRoute } from "./components/common";
import { useAuthInit } from "./hooks";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import DisputeManagement from "./pages/admin/DisputeManagement";
import FinancialReports from "./pages/admin/FinancialReports";
import StaffManagement from "./pages/admin/StaffManagement";
import AdminProfile from "./pages/admin/AdminProfile";

// Shared Pages (dùng chung cho admin và staff)
import CarManagement from "./pages/shared/CarManagement";
import ContractManagement from "./pages/shared/ContractManagement";
import ServiceManagement from "./pages/shared/ServiceManagement";
import CheckInOutManagement from "./pages/shared/CheckInOutManagement";

// Auth Pages
import ForgotPassword from "./pages/auth/ForgotPassword";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";

// Dashboard & Co-owner Pages
import Home from "./pages/dashboard/Dashboard";
import CoownerDashboard from "./pages/dashboard/coowner/CoownerDashboard";
import OwnershipManagement from "./pages/dashboard/coowner/ownership/OwnershipManagement";
import ContractViewer from "./pages/dashboard/coowner/ownership/ContractViewer";
import DocumentUpload from "./pages/dashboard/coowner/ownership/DocumentUpload";
import BookingCalendar from "./pages/dashboard/coowner/booking/BookingCalendar";
import BookingForm from "./pages/dashboard/coowner/booking/BookingForm";
import ScheduleView from "./pages/dashboard/coowner/booking/ScheduleView";
import CostBreakdown from "./pages/dashboard/coowner/financial/CostBreakdown";
import PaymentHistory from "./pages/dashboard/coowner/financial/PaymentHistory";
import PaymentDetail from "./pages/dashboard/coowner/financial/PaymentDetail";
import ExpenseTracking from "./pages/dashboard/coowner/financial/ExpenseTracking";
import UsageHistory from "./pages/dashboard/coowner/history/UsageHistory";
import UsageAnalytics from "./pages/dashboard/coowner/history/UsageAnalytics";
import GroupManagement from "./pages/dashboard/coowner/group/GroupManagement";
import VotingSystem from "./pages/dashboard/coowner/group/VotingSystem";
import CommonFund from "./pages/dashboard/coowner/group/CommonFund";
import Profile from "./pages/dashboard/coowner/account/Profile";

// Staff Pages
import StaffDashboard from "./pages/staff/StaffDashboard";
import StaffProfile from "./pages/staff/StaffProfile";

// Policies Pages
import ChinhSachBaoMat from "./pages/policies/ChinhSachBaoMat";
import QuyDinhHoatDong from "./pages/policies/QuyDinhHoatDong";
import QuyenLoiThanhVien from "./pages/policies/QuyenLoiThanhVien";

export default function App() {
  // Initialize auth from localStorage
  useAuthInit();

  return (
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

        {/* Admin Routes - Protected */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/staff" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <StaffManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/profile" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminProfile />
          </ProtectedRoute>
        } />
        <Route path="/admin/disputes" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DisputeManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/financial-reports" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <FinancialReports />
          </ProtectedRoute>
        } />

        {/* Shared Management Routes - Admin and Staff */}
        <Route path="/admin/cars" element={
          <ProtectedRoute allowedRoles={['admin', 'staff']}>
            <CarManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/contracts" element={
          <ProtectedRoute allowedRoles={['admin', 'staff']}>
            <ContractManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/services" element={
          <ProtectedRoute allowedRoles={['admin', 'staff']}>
            <ServiceManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/checkin" element={
          <ProtectedRoute allowedRoles={['admin', 'staff']}>
            <CheckInOutManagement />
          </ProtectedRoute>
        } />

        {/* Staff Routes - Protected */}
        <Route path="/staff" element={
          <ProtectedRoute allowedRoles={['staff']}>
            <StaffDashboard />
          </ProtectedRoute>
        } />
        <Route path="/staff/dashboard" element={
          <ProtectedRoute allowedRoles={['staff']}>
            <StaffDashboard />
          </ProtectedRoute>
        } />
        <Route path="/staff/profile" element={
          <ProtectedRoute allowedRoles={['staff']}>
            <StaffProfile />
          </ProtectedRoute>
        } />
        <Route path="/staff/cars" element={
          <ProtectedRoute allowedRoles={['staff']}>
            <CarManagement />
          </ProtectedRoute>
        } />
        <Route path="/staff/contracts" element={
          <ProtectedRoute allowedRoles={['staff']}>
            <ContractManagement />
          </ProtectedRoute>
        } />
        <Route path="/staff/services" element={
          <ProtectedRoute allowedRoles={['staff']}>
            <ServiceManagement />
          </ProtectedRoute>
        } />
        <Route path="/staff/checkin" element={
          <ProtectedRoute allowedRoles={['staff']}>
            <CheckInOutManagement />
          </ProtectedRoute>
        } />

        {/* Co-owner Routes - Protected */}
        <Route path="/dashboard/coowner" element={
          <ProtectedRoute allowedRoles={['co-owner']}>
            <CoownerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/coowner/ownership" element={
          <ProtectedRoute allowedRoles={['co-owner']}>
            <OwnershipManagement />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/coowner/ownership/contracts" element={
          <ProtectedRoute allowedRoles={['co-owner']}>
            <ContractViewer />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/coowner/ownership/contract" element={
          <ProtectedRoute allowedRoles={['co-owner']}>
            <ContractViewer />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/coowner/ownership/documents" element={
          <ProtectedRoute allowedRoles={['co-owner']}>
            <DocumentUpload />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/coowner/booking" element={
          <ProtectedRoute allowedRoles={['co-owner']}>
            <BookingCalendar />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/coowner/booking/new" element={
          <ProtectedRoute allowedRoles={['co-owner']}>
            <BookingForm />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/coowner/booking/schedule" element={
          <ProtectedRoute allowedRoles={['co-owner']}>
            <ScheduleView />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/coowner/financial" element={
          <ProtectedRoute allowedRoles={['co-owner']}>
            <CostBreakdown />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/coowner/financial/cost-breakdown" element={
          <ProtectedRoute allowedRoles={['co-owner']}>
            <CostBreakdown />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/coowner/financial/payment" element={
          <ProtectedRoute allowedRoles={['co-owner']}>
            <PaymentHistory />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/coowner/financial/payment/:id" element={
          <ProtectedRoute allowedRoles={['co-owner']}>
            <PaymentDetail />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/coowner/financial/expense-tracking" element={
          <ProtectedRoute allowedRoles={['co-owner']}>
            <ExpenseTracking />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/coowner/history" element={
          <ProtectedRoute allowedRoles={['co-owner']}>
            <UsageHistory />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/coowner/history/analytics" element={
          <ProtectedRoute allowedRoles={['co-owner']}>
            <UsageAnalytics />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/coowner/group" element={
          <ProtectedRoute allowedRoles={['co-owner']}>
            <GroupManagement />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/coowner/group/voting" element={
          <ProtectedRoute allowedRoles={['co-owner']}>
            <VotingSystem />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/coowner/group/fund" element={
          <ProtectedRoute allowedRoles={['co-owner']}>
            <CommonFund />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/coowner/account/profile" element={
          <ProtectedRoute allowedRoles={['co-owner']}>
            <Profile />
          </ProtectedRoute>
        } />

        {/* Fallback Route */}
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Router>
  );
}
