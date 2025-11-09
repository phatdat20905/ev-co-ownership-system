import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  Shield, CheckCircle, XCircle, Eye, Clock, AlertTriangle, 
  User, FileText, Image, MapPin, Calendar, Phone, Mail,
  X, Menu, Bell, LogOut, BarChart3, Car, Users, QrCode, 
  Wrench, PieChart 
} from "lucide-react";
import adminService from "../../services/admin.service";
import { toast } from "../../utils/toast";

const KYCVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedKYC, setSelectedKYC] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // API State
  const [kycSubmissions, setKycSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  // Dropdown menus
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);

  // Notifications
  const [notifications, setNotifications] = useState([
    { id: 1, title: "KYC mới", message: "Có 3 yêu cầu KYC mới chờ xác minh", time: "5 phút trước", type: "info", read: false },
    { id: 2, title: "KYC hoàn thành", message: "Đã phê duyệt KYC cho Nguyễn Văn A", time: "1 giờ trước", type: "success", read: true }
  ]);

  useEffect(() => {
    fetchPendingKYC();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchPendingKYC = async () => {
    try {
      setLoading(true);
      const response = await adminService.getPendingKYC();
      setKycSubmissions(response.data.submissions || []);
    } catch (error) {
      console.error("Error fetching KYC:", error);
      toast.error("Không thể tải danh sách KYC");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (submission) => {
    try {
      const response = await adminService.getKYCSubmission(submission._id);
      setSelectedKYC(response.data.submission);
      setShowDetailModal(true);
    } catch (error) {
      console.error("Error fetching KYC details:", error);
      toast.error("Không thể tải chi tiết KYC");
    }
  };

  const handleApprove = async (submissionId) => {
    if (!confirm("Bạn có chắc chắn muốn phê duyệt KYC này?")) return;

    try {
      setProcessingId(submissionId);
      await adminService.approveKYC(submissionId);
      toast.success("Đã phê duyệt KYC thành công");
      setShowDetailModal(false);
      fetchPendingKYC();
    } catch (error) {
      console.error("Error approving KYC:", error);
      toast.error(error.response?.data?.message || "Không thể phê duyệt KYC");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }

    try {
      setProcessingId(selectedKYC._id);
      await adminService.rejectKYC(selectedKYC._id, rejectReason);
      toast.success("Đã từ chối KYC");
      setShowRejectModal(false);
      setShowDetailModal(false);
      setRejectReason("");
      fetchPendingKYC();
    } catch (error) {
      console.error("Error rejecting KYC:", error);
      toast.error(error.response?.data?.message || "Không thể từ chối KYC");
    } finally {
      setProcessingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("authExpires");
    localStorage.removeItem("rememberedLogin");
    window.dispatchEvent(new Event('storage'));
    navigate("/");
  };

  const menuItems = [
    { id: "overview", label: "Tổng quan", icon: <BarChart3 className="w-5 h-5" />, link: "/admin" },
    { id: "cars", label: "Quản lý xe", icon: <Car className="w-5 h-5" />, link: "/admin/cars" },
    { id: "staff", label: "Nhân viên", icon: <Users className="w-5 h-5" />, link: "/admin/staff" },
    { id: "contracts", label: "Hợp đồng", icon: <FileText className="w-5 h-5" />, link: "/admin/contracts" },
    { id: "services", label: "Dịch vụ xe", icon: <Wrench className="w-5 h-5" />, link: "/admin/services" },
    { id: "checkinout", label: "Check in/out", icon: <QrCode className="w-5 h-5" />, link: "/admin/checkin" },
    { id: "disputes", label: "Tranh chấp", icon: <AlertTriangle className="w-5 h-5" />, link: "/admin/disputes" },
    { id: "reports", label: "Báo cáo TC", icon: <PieChart className="w-5 h-5" />, link: "/admin/financial-reports" },
    { id: "kyc", label: "KYC", icon: <Shield className="w-5 h-5" />, link: "/admin/kyc" }
  ];

  const getActiveTab = () => {
    const currentPath = location.pathname;
    const menuItem = menuItems.find(item => item.link === currentPath);
    return menuItem ? menuItem.id : "overview";
  };

  const activeTab = getActiveTab();
  const unreadNotifications = notifications.filter(n => !n.read).length;

  const stats = {
    pending: kycSubmissions.filter(k => k.status === 'pending').length,
    approved: kycSubmissions.filter(k => k.status === 'approved').length,
    rejected: kycSubmissions.filter(k => k.status === 'rejected').length,
    total: kycSubmissions.length
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'approved': return 'text-green-600 bg-green-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ xác minh';
      case 'approved': return 'Đã phê duyệt';
      case 'rejected': return 'Đã từ chối';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-white shadow-lg border border-gray-200"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || mobileMenuOpen) && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 30 }}
            className="w-64 bg-white shadow-xl fixed h-full z-40 lg:z-30"
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                  <Car className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">EV Co-ownership</h1>
                  <p className="text-xs text-gray-600">Admin Dashboard</p>
                </div>
              </div>
            </div>

            <nav className="p-4 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.link}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === item.id
                      ? "bg-blue-50 text-blue-600 border border-blue-100 shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* User Info */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Admin</p>
                  <p className="text-xs text-gray-600">Quản trị viên</p>
                </div>
                <button 
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`flex-1 transition-all ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'} ${mobileMenuOpen ? 'ml-0' : ''}`}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-20">
          <div className="px-4 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors hidden lg:block"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Xác minh KYC</h1>
                <p className="text-sm text-gray-600 hidden lg:block">Quản lý xác minh danh tính người dùng</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 lg:space-x-4">
              {/* Notifications */}
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
                >
                  <Bell className="w-5 h-5 text-gray-600" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>

                <AnimatePresence>
                  {notificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                    >
                      <div className="p-4 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900">Thông báo</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map(notif => (
                          <div key={notif.id} className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${!notif.read ? 'bg-blue-50' : ''}`}>
                            <p className="font-medium text-gray-900 text-sm">{notif.title}</p>
                            <p className="text-gray-600 text-sm mt-1">{notif.message}</p>
                            <p className="text-gray-400 text-xs mt-2">{notif.time}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                    >
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center space-x-2 text-red-600"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-sm text-gray-600 mt-1">Chờ xác minh</p>
            </div>

            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.approved}</p>
              <p className="text-sm text-gray-600 mt-1">Đã phê duyệt</p>
            </div>

            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.rejected}</p>
              <p className="text-sm text-gray-600 mt-1">Đã từ chối</p>
            </div>

            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <Shield className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600 mt-1">Tổng yêu cầu</p>
            </div>
          </div>

          {/* KYC List */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Đang tải danh sách KYC...</p>
            </div>
          )}

          {!loading && kycSubmissions.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
              <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có yêu cầu KYC</h3>
              <p className="text-gray-600">Các yêu cầu xác minh KYC sẽ xuất hiện tại đây</p>
            </div>
          )}

          {!loading && kycSubmissions.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người dùng</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số điện thoại</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày gửi</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {kycSubmissions.map((submission) => (
                      <tr key={submission._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {submission.user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">{submission.user?.name || 'N/A'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-900">{submission.user?.email || 'N/A'}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-900">{submission.user?.phone || 'N/A'}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-900">
                            {new Date(submission.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                            {getStatusText(submission.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleViewDetails(submission)}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center space-x-1"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Xem chi tiết</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedKYC && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Chi tiết xác minh KYC</h2>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* User Info */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin người dùng</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Họ tên</p>
                        <p className="font-medium text-gray-900">{selectedKYC.user?.name || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium text-gray-900">{selectedKYC.user?.email || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Số điện thoại</p>
                        <p className="font-medium text-gray-900">{selectedKYC.user?.phone || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Ngày gửi</p>
                        <p className="font-medium text-gray-900">
                          {new Date(selectedKYC.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tài liệu xác minh</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedKYC.documents?.idCard && (
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <FileText className="w-5 h-5 text-blue-500" />
                          <p className="font-medium text-gray-900">CMND/CCCD</p>
                        </div>
                        <img 
                          src={selectedKYC.documents.idCard} 
                          alt="ID Card" 
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    {selectedKYC.documents?.selfie && (
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Image className="w-5 h-5 text-green-500" />
                          <p className="font-medium text-gray-900">Ảnh chân dung</p>
                        </div>
                        <img 
                          src={selectedKYC.documents.selfie} 
                          alt="Selfie" 
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    {selectedKYC.documents?.addressProof && (
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <MapPin className="w-5 h-5 text-purple-500" />
                          <p className="font-medium text-gray-900">Giấy xác nhận địa chỉ</p>
                        </div>
                        <img 
                          src={selectedKYC.documents.addressProof} 
                          alt="Address Proof" 
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {selectedKYC.status === 'pending' && (
                  <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => setShowRejectModal(true)}
                      disabled={processingId === selectedKYC._id}
                      className="flex-1 px-6 py-3 border border-red-200 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium disabled:opacity-50"
                    >
                      Từ chối
                    </button>
                    <button
                      onClick={() => handleApprove(selectedKYC._id)}
                      disabled={processingId === selectedKYC._id}
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                    >
                      {processingId === selectedKYC._id ? 'Đang xử lý...' : 'Phê duyệt'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl w-full max-w-md"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Từ chối KYC</h2>
                  <button
                    onClick={() => setShowRejectModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do từ chối
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Nhập lý do từ chối KYC..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setShowRejectModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={processingId === selectedKYC._id || !rejectReason.trim()}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {processingId === selectedKYC._id ? 'Đang xử lý...' : 'Xác nhận từ chối'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KYCVerification;
