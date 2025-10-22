import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/layout/ScrollToTop";
import Home from "./pages/Home";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";
import VerifyPhone from "./pages/auth/VerifyPhone";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyIdentity from "./pages/auth/VerifyIdentity";
import VerifyOtp from "./pages/auth/VerifyOTP";
import VerifySuccess from "./pages/auth/VerifySuccess";
import QuyDinhHoatDong from "./pages/policies/QuyDinhHoatDong";
import ChinhSachBaoMat from "./pages/policies/ChinhSachBaoMat";
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
      </Routes>
    </Router>
  );
}
