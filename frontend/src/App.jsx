import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ScrollToTop from "./components/layout/ScrollToTop";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import DisputeManagement from "./pages/admin/DisputeManagement";
import FinancialReports from "./pages/admin/FinancialReports";
import StaffManagement from "./pages/admin/StaffManagement";
import AdminProfile from "./pages/admin/AdminProfile";
import KYCVerification from "./pages/admin/KYCVerification";

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
import Onboarding from "./pages/auth/Onboarding";

// Dashboard & Co-owner Pages
import Home from "./pages/dashboard/Dashboard";
import CoownerDashboard from "./pages/dashboard/coowner/CoownerDashboard";
import AIRecommendations from "./pages/dashboard/coowner/AIRecommendations";
import OwnershipManagement from "./pages/dashboard/coowner/ownership/OwnershipManagement";
import ContractViewer from "./pages/dashboard/coowner/ownership/ContractViewer";
import DocumentUpload from "./pages/dashboard/coowner/ownership/DocumentUpload";
import BookingCalendar from "./pages/dashboard/coowner/booking/BookingCalendar";
import BookingForm from "./pages/dashboard/coowner/booking/BookingForm";
import ScheduleView from "./pages/dashboard/coowner/booking/ScheduleView";
import CostBreakdown from "./pages/dashboard/coowner/financial/CostBreakdown";
import PaymentHistory from "./pages/dashboard/coowner/financial/PaymentHistory";
import ExpenseTracking from "./pages/dashboard/coowner/financial/ExpenseTracking";
import UsageHistory from "./pages/dashboard/coowner/history/UsageHistory";
import UsageAnalytics from "./pages/dashboard/coowner/history/UsageAnalytics";
import GroupManagement from "./pages/dashboard/coowner/group/GroupManagement";
import VotingSystem from "./pages/dashboard/coowner/group/VotingSystem";
import VotingManagement from "./pages/dashboard/coowner/group/VotingManagement";
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
        <Route path="/onboarding" element={<Onboarding />} />

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
        <Route path="/admin/kyc" element={<KYCVerification />} />

        {/* Shared Management Routes - Dùng chung cho Admin và Staff */}
        <Route path="/admin/cars" element={<CarManagement />} />
        <Route path="/admin/contracts" element={<ContractManagement />} />
        <Route path="/admin/services" element={<ServiceManagement />} />
        <Route path="/admin/checkin" element={<CheckInOutManagement />} />

        {/* Staff Routes - Sử dụng cùng các component shared */}
        <Route path="/staff" element={<StaffDashboard />} />
        <Route path="/staff/dashboard" element={<StaffDashboard />} />
        <Route path="/staff/profile" element={<StaffProfile />} />
        <Route path="/staff/cars" element={<CarManagement />} />
        <Route path="/staff/contracts" element={<ContractManagement />} />
        <Route path="/staff/services" element={<ServiceManagement />} />
        <Route path="/staff/checkin" element={<CheckInOutManagement />} />

        {/* Co-owner Routes */}
        <Route path="/dashboard/coowner" element={<CoownerDashboard />} />
        <Route
          path="/dashboard/coowner/ownership"
          element={<OwnershipManagement />}
        />
        <Route
          path="/dashboard/coowner/ownership/contracts"
          element={<ContractViewer />}
        />
        <Route
          path="/dashboard/coowner/ownership/contract"
          element={<ContractViewer />}
        />
        <Route
          path="/dashboard/coowner/ownership/documents"
          element={<DocumentUpload />}
        />
        <Route
          path="/dashboard/coowner/booking"
          element={<BookingCalendar />}
        />
        <Route
          path="/dashboard/coowner/booking/new"
          element={<BookingForm />}
        />
        <Route
          path="/dashboard/coowner/booking/schedule"
          element={<ScheduleView />}
        />
        <Route
          path="/dashboard/coowner/financial"
          element={<CostBreakdown />}
        />
        <Route
          path="/dashboard/coowner/financial/cost-breakdown"
          element={<CostBreakdown />}
        />
        <Route
          path="/dashboard/coowner/financial/payment"
          element={<PaymentHistory />}
        />
        <Route
          path="/dashboard/coowner/financial/expense-tracking"
          element={<ExpenseTracking />}
        />
        <Route path="/dashboard/coowner/history" element={<UsageHistory />} />
        <Route
          path="/dashboard/coowner/history/analytics"
          element={<UsageAnalytics />}
        />
        <Route path="/dashboard/coowner/group" element={<GroupManagement />} />
        <Route
          path="/dashboard/coowner/group/voting"
          element={<VotingSystem />}
        />
        <Route
          path="/dashboard/coowner/group/voting-management"
          element={<VotingManagement />}
        />
        <Route path="/dashboard/coowner/group/fund" element={<CommonFund />} />
        <Route
          path="/dashboard/coowner/account/profile"
          element={<Profile />}
        />
        <Route
          path="/dashboard/coowner/ai-recommendations"
          element={<AIRecommendations />}
        />

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
  );
}
