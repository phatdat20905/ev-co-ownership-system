import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import ScrollToTop from "./components/layout/ScrollToTop";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CarManagement from "./pages/admin/CarManagement";
import ContractManagement from "./pages/admin/ContractManagement";
import DisputeManagement from "./pages/admin/DisputeManagement";
import FinancialReports from "./pages/admin/FinancialReports";
import ServiceManagement from "./pages/admin/ServiceManagement";
import StaffManagement from "./pages/admin/StaffManagement";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";
import VerifyIdentity from "./pages/auth/VerifyIdentity";
import VerifyOtp from "./pages/auth/VerifyOTP";
import VerifyPhone from "./pages/auth/VerifyPhone";
import VerifySuccess from "./pages/auth/VerifySuccess";
import Home from "./pages/dashboard/Dashboard";
import ChinhSachBaoMat from "./pages/policies/ChinhSachBaoMat";
import QuyDinhHoatDong from "./pages/policies/QuyDinhHoatDong";
import QuyenLoiThanhVien from "./pages/policies/QuyenLoiThanhVien";

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-identity" element={<VerifyIdentity />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-success" element={<VerifySuccess />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/verify-phone" element={<VerifyPhone />} />
        <Route path="/quy-dinh-hoat-dong" element={<QuyDinhHoatDong />} />
        <Route path="/chinh-sach-bao-mat" element={<ChinhSachBaoMat />} />
        <Route path="/bang-quyen-loi-thanh-vien" element={<QuyenLoiThanhVien />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/staff" element={<StaffManagement />} />
        <Route path="/admin/disputes" element={<DisputeManagement />} />
        <Route path="/admin/cars" element={<CarManagement />} />
        <Route path="/admin/contracts" element={<ContractManagement />} />
        <Route path="/admin/services" element={<ServiceManagement />} />
        <Route path="/admin/financial-reports" element={<FinancialReports />} />
      </Routes>
    </Router>
  );
}
