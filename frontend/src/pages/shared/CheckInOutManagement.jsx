import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  QrCode, Plus, Search, Filter, CheckCircle, XCircle, Clock, 
  Calendar, Car, User, MapPin, Download, Eye, Edit, Trash2,
  ChevronDown, X, MoreVertical, Menu, LogOut, Bell, BarChart3, 
  FileText, Users, Wrench, AlertCircle, PieChart, Scan, Key,
  Battery, Zap, Wifi, Camera, Shield
} from "lucide-react";

const CheckInOutManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [currentAction, setCurrentAction] = useState(""); // "checkin" or "checkout"
  const [signature, setSignature] = useState("");

  // State cho user data - Có thể là admin hoặc staff
  const [userData, setUserData] = useState({
    name: "Nguyễn Văn B",
    role: "staff"
  });

  useEffect(() => {
    // Lấy thông tin user từ localStorage
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      try {
        const parsedData = JSON.parse(storedUserData);
        setUserData(parsedData);
      } catch (error) {
        console.error("Lỗi khi parse userData:", error);
      }
    }
  }, []);

  // Menu items cho Admin
  const adminMenuItems = [
    {
      id: "overview",
      label: "Tổng quan",
      icon: <BarChart3 className="w-5 h-5" />,
      link: "/admin",
    },
    {
      id: "cars",
      label: "Quản lý xe",
      icon: <Car className="w-5 h-5" />,
      link: "/admin/cars",
    },
    {
      id: "staff",
      label: "Nhân viên",
      icon: <Users className="w-5 h-5" />,
      link: "/admin/staff",
    },
    {
      id: "contracts",
      label: "Hợp đồng",
      icon: <FileText className="w-5 h-5" />,
      link: "/admin/contracts",
    },
    {
      id: "services",
      label: "Dịch vụ xe",
      icon: <Wrench className="w-5 h-5" />,
      link: "/admin/services",
    },
    {
      id: "checkin",
      label: "Check-in/out",
      icon: <QrCode className="w-5 h-5" />,
      link: "/admin/checkin",
    },
    {
      id: "disputes",
      label: "Tranh chấp",
      icon: <AlertCircle className="w-5 h-5" />,
      link: "/admin/disputes",
    },
    {
      id: "reports",
      label: "Báo cáo TC",
      icon: <PieChart className="w-5 h-5" />,
      link: "/admin/financial-reports",
    },
    
  ];

  // Menu items cho Staff
  const staffMenuItems = [
    { 
      id: "overview", 
      label: "Tổng quan", 
      icon: <BarChart3 className="w-5 h-5" />, 
      link: "/staff" 
    },
    { 
      id: "cars", 
      label: "Quản lý xe", 
      icon: <Car className="w-5 h-5" />, 
      link: "/staff/cars" 
    },
    { 
      id: "contracts", 
      label: "Hợp đồng", 
      icon: <FileText className="w-5 h-5" />, 
      link: "/staff/contracts" 
    },
    { 
      id: "services", 
      label: "Dịch vụ xe", 
      icon: <Wrench className="w-5 h-5" />, 
      link: "/staff/services" 
    },
    { 
      id: "checkin", 
      label: "Check-in/out", 
      icon: <QrCode className="w-5 h-5" />, 
      link: "/staff/checkin" 
    },
  ];

  // Chọn menu items dựa trên role
  const menuItems = userData.role === "admin" ? adminMenuItems : staffMenuItems;

  // Thông báo
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Check-in thành công",
      message: "Minh Nguyễn đã check-in xe VF e34",
      time: "2 giờ trước",
      type: "success",
      read: false,
    },
    {
      id: 2,
      title: "Check-out chờ xác nhận",
      message: "Lan Phương đang chờ xác nhận check-out",
      time: "5 giờ trước",
      type: "warning",
      read: true,
    }
  ]);

  // Dữ liệu mẫu cho check-in/out records
  const checkRecords = [
    {
      id: 1,
      type: "checkin",
      user: "Minh Nguyễn",
      car: "VF e34 - 29A-123.45",
      scheduledDate: "15/11/2024",
      scheduledTime: "08:00 - 18:00",
      actualTime: "15/11/2024 08:15",
      status: "completed",
      location: "Q.1, TP.HCM",
      odometer: 12540,
      battery: 85,
      signature: true,
      notes: "Xe sạch sẽ, đầy đủ phụ kiện",
      qrCode: "VF34-20241115-001",
      staff: "Nguyễn Văn B"
    },
    {
      id: 2,
      type: "checkout",
      user: "Lan Phương",
      car: "VinFast VF 8 - 29A-678.90",
      scheduledDate: "15/11/2024",
      scheduledTime: "09:00 - 17:00",
      actualTime: "15/11/2024 17:30",
      status: "pending",
      location: "Q.3, TP.HCM",
      odometer: 18760,
      battery: 72,
      signature: false,
      notes: "",
      qrCode: "VF8-20241115-002",
      staff: "Trần Thị C"
    },
    {
      id: 3,
      type: "checkin",
      user: "Tuấn Anh",
      car: "VF 9 - 29B-123.45",
      scheduledDate: "14/11/2024",
      scheduledTime: "10:00 - 20:00",
      actualTime: "14/11/2024 10:05",
      status: "completed",
      location: "Q.7, TP.HCM",
      odometer: 8920,
      battery: 91,
      signature: true,
      notes: "Đã kiểm tra nội thất",
      qrCode: "VF9-20241114-003",
      staff: "Nguyễn Văn B"
    },
    {
      id: 4,
      type: "checkout",
      user: "Hồng Nhung",
      car: "VF e34 - 30A-543.21",
      scheduledDate: "14/11/2024",
      scheduledTime: "08:30 - 16:30",
      actualTime: "14/11/2024 16:45",
      status: "completed",
      location: "Q.2, TP.HCM",
      odometer: 15680,
      battery: 68,
      signature: true,
      notes: "Vệ sinh xe trước khi trả",
      qrCode: "VF34-20241114-004",
      staff: "Lê Văn D"
    },
    {
      id: 5,
      type: "checkin",
      user: "Văn Nam",
      car: "VF 8 Eco - 30B-987.65",
      scheduledDate: "16/11/2024",
      scheduledTime: "07:00 - 19:00",
      actualTime: "",
      status: "scheduled",
      location: "Q.1, TP.HCM",
      odometer: 0,
      battery: 0,
      signature: false,
      notes: "",
      qrCode: "VF8E-20241116-005",
      staff: ""
    }
  ];

  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái", color: "gray" },
    { value: "completed", label: "Đã hoàn thành", color: "green" },
    { value: "pending", label: "Chờ xác nhận", color: "amber" },
    { value: "scheduled", label: "Đã lên lịch", color: "blue" },
    { value: "cancelled", label: "Đã hủy", color: "red" }
  ];

  const typeOptions = [
    { value: "all", label: "Tất cả loại", color: "gray" },
    { value: "checkin", label: "Check-in", color: "green" },
    { value: "checkout", label: "Check-out", color: "blue" }
  ];

  // Lọc records dựa trên role
  const filteredRecords = checkRecords.filter(record => {
    const matchesSearch = record.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.car.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || record.status === statusFilter;
    
    // Nếu là staff, chỉ hiển thị records do chính họ xử lý hoặc chưa có staff
    if (userData.role === "staff") {
      const isMyRecord = record.staff === userData.name || record.staff === "";
      return matchesSearch && matchesStatus && isMyRecord;
    }
    
    // Admin xem được tất cả
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalRecords: userData.role === "admin" ? checkRecords.length : filteredRecords.length,
    checkinRecords: filteredRecords.filter(r => r.type === 'checkin').length,
    checkoutRecords: filteredRecords.filter(r => r.type === 'checkout').length,
    completedRecords: filteredRecords.filter(r => r.status === 'completed').length,
    pendingRecords: filteredRecords.filter(r => r.status === 'pending').length
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-amber-600" />;
      case 'scheduled': return <Calendar className="w-4 h-4 text-blue-600" />;
      default: return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'checkin': return 'bg-green-100 text-green-800 border-green-200';
      case 'checkout': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Hàm xử lý quét QR
  const handleQRScan = (action) => {
    setCurrentAction(action);
    setShowQRScanner(true);
  };

  // Hàm giả lập quét QR thành công
  const handleScanSuccess = () => {
    setShowQRScanner(false);
    setShowSignatureModal(true);
  };

  // Hàm xử lý ký số
  const handleSignature = () => {
    if (signature.trim()) {
      setShowSignatureModal(false);
      setSignature("");
      // Ở đây sẽ xử lý logic lưu chữ ký và cập nhật trạng thái
      alert(`${currentAction === 'checkin' ? 'Check-in' : 'Check-out'} thành công với chữ ký số!`);
    } else {
      alert("Vui lòng nhập chữ ký số!");
    }
  };

  // Hàm xác nhận record (chỉ admin hoặc staff có thể xác nhận record của mình)
  const handleConfirmRecord = (record) => {
    if (userData.role === "admin" || record.staff === userData.name) {
      alert(`Đã xác nhận ${record.type} cho ${record.user}`);
      // Logic xác nhận record
    } else {
      alert("Bạn không có quyền xác nhận record này");
    }
  };

  const getActiveTab = () => {
    const currentPath = location.pathname;
    const menuItem = menuItems.find((item) => item.link === currentPath);
    return menuItem ? menuItem.id : "checkin";
  };

  const activeTab = getActiveTab();

  // Hàm xử lý logout
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("authExpires");
    localStorage.removeItem("rememberedLogin");
    window.dispatchEvent(new Event("storage"));
    navigate("/");
  };

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = () => {
      setUserMenuOpen(false);
      setNotificationsOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-white shadow-lg border border-gray-200"
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Sidebar - Hiển thị menu theo role */}
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
                  {userData.role === "admin" ? (
                    <Shield className="w-6 h-6 text-white" />
                  ) : (
                    <User className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">
                    EV Co-ownership
                  </h1>
                  <p className="text-xs text-gray-600">
                    {userData.role === "admin" ? "Admin Dashboard" : "Staff Dashboard"}
                  </p>
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
                  <p className="text-sm font-medium text-gray-900">
                    {userData.name}
                  </p>
                  <p className="text-xs text-gray-600">
                    {userData.role === "admin" ? "Quản trị viên" : "Nhân viên vận hành"}
                  </p>
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
      <div
        className={`flex-1 transition-all ${
          sidebarOpen ? "lg:ml-64" : "lg:ml-0"
        } ${mobileMenuOpen ? "ml-0" : ""}`}
      >
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
              <h2 className="text-xl font-semibold text-gray-900">
                Quản lý Check-in/Check-out
              </h2>
            </div>

            <div className="flex items-center space-x-3">
              {/* Search Bar */}
              <div className="relative hidden md:block">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên, xe hoặc vị trí..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 text-sm bg-gray-50 focus:bg-white transition-colors"
                />
              </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setNotificationsOpen(!notificationsOpen);
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
                >
                  <Bell className="w-5 h-5 text-gray-600" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white text-xs text-white flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {notificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-10"
                    >
                      <div className="p-4 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900">
                          Thông báo
                        </h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                              !notification.read ? "bg-blue-50" : ""
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div
                                className={`w-2 h-2 rounded-full mt-2 ${
                                  notification.type === "success"
                                    ? "bg-green-500"
                                    : notification.type === "warning"
                                    ? "bg-amber-500"
                                    : notification.type === "info"
                                    ? "bg-blue-500"
                                    : "bg-red-500"
                                }`}
                              />
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 text-sm">
                                  {notification.title}
                                </p>
                                <p className="text-gray-600 text-sm mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-gray-400 text-xs mt-2">
                                  {notification.time}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-4 border-t border-gray-100">
                        <button className="text-blue-600 text-sm font-medium w-full text-center hover:text-blue-800 transition-colors">
                          Xem tất cả thông báo
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserMenuOpen(!userMenuOpen);
                  }}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-medium text-gray-900">
                      {userData.name}
                    </p>
                    <p className="text-xs text-gray-600">
                      {userData.role === "admin" ? "Quản trị viên" : "Nhân viên vận hành"}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-600 transition-transform ${
                      userMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-10"
                    >
                      <div className="p-2">
                        <button
                          onClick={() => navigate(userData.role === "admin" ? "/admin/profile" : "/staff/profile")}
                          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700"
                        >
                          <User className="w-4 h-4" />
                          <span>Hồ sơ cá nhân</span>
                        </button>
                        <div className="border-t border-gray-100 my-1" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-sm text-red-600"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Check-in/out Management Content */}
        <div className="p-4 lg:p-8">
          {/* Header Section với nút quét QR */}
          <div className="bg-white shadow-sm border-b border-gray-100 mb-6 lg:mb-8">
            <div className="px-4 lg:px-8 py-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Check-in/Check-out</h1>
                  <p className="text-gray-600 mt-2">
                    {userData.role === "admin" 
                      ? "Quản lý tất cả giao dịch check-in/check-out" 
                      : "Quét QR code và ký số khi nhận/trả xe"
                    }
                  </p>
                </div>
                {/* Chỉ hiển thị nút quét QR cho staff */}
                {userData.role === "staff" && (
                  <div className="mt-4 lg:mt-0 flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleQRScan("checkout")}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      <QrCode className="w-5 h-5" />
                      <span className="font-medium">Check-out</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleQRScan("checkin")}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-green-700 transition-colors shadow-sm"
                    >
                      <QrCode className="w-5 h-5" />
                      <span className="font-medium">Check-in</span>
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-6 mb-6 lg:mb-8">
            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Tổng giao dịch</p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">{stats.totalRecords}</p>
                </div>
                <div className="p-2 lg:p-3 bg-blue-500 rounded-lg text-white shadow-sm">
                  <QrCode className="w-4 h-4 lg:w-6 lg:h-6" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Check-in</p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">{stats.checkinRecords}</p>
                </div>
                <div className="p-2 lg:p-3 bg-green-500 rounded-lg text-white shadow-sm">
                  <CheckCircle className="w-4 h-4 lg:w-6 lg:h-6" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Check-out</p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">{stats.checkoutRecords}</p>
                </div>
                <div className="p-2 lg:p-3 bg-blue-500 rounded-lg text-white shadow-sm">
                  <Key className="w-4 h-4 lg:w-6 lg:h-6" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Đã hoàn thành</p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">{stats.completedRecords}</p>
                </div>
                <div className="p-2 lg:p-3 bg-purple-500 rounded-lg text-white shadow-sm">
                  <CheckCircle className="w-4 h-4 lg:w-6 lg:h-6" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Chờ xác nhận</p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">{stats.pendingRecords}</p>
                </div>
                <div className="p-2 lg:p-3 bg-amber-500 rounded-lg text-white shadow-sm">
                  <Clock className="w-4 h-4 lg:w-6 lg:h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên, xe hoặc vị trí..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 lg:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base bg-gray-50 focus:bg-white transition-colors"
                />
              </div>
              <div className="flex gap-2 lg:gap-3">
                <div className="relative flex-1 lg:flex-none">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base bg-gray-50 focus:bg-white appearance-none"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                <button className="hidden lg:flex items-center space-x-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  <Filter className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
                  <span>Lọc nâng cao</span>
                </button>
              </div>
            </div>
          </div>

          {/* Records Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người dùng</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Xe</th>
                    {userData.role === "admin" && (
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nhân viên</th>
                    )}
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 lg:px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(record.type)}`}>
                          {record.type === 'checkin' ? 'Check-in' : 'Check-out'}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <User className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900 text-sm lg:text-base">{record.user}</div>
                            <div className="text-xs lg:text-sm text-gray-500 flex items-center space-x-1">
                              <MapPin className="w-3 h-3" />
                              <span>{record.location}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.car}
                      </td>
                      {userData.role === "admin" && (
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.staff || "Chưa phân công"}
                        </td>
                      )}
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="text-xs lg:text-sm">Lịch: {record.scheduledDate}</div>
                          <div className="text-xs lg:text-sm">Thực tế: {record.actualTime || 'Chưa thực hiện'}</div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(record.status)}
                          <span className={`text-xs font-medium border px-2 py-1 rounded-full ${getStatusColor(record.status)}`}>
                            {statusOptions.find(s => s.value === record.status)?.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2 lg:space-x-3">
                          <button 
                            onClick={() => setSelectedRecord(record)}
                            className="text-blue-600 hover:text-blue-900 flex items-center space-x-1 text-xs lg:text-sm"
                          >
                            <Eye className="w-3 h-3 lg:w-4 lg:h-4" />
                            <span>Chi tiết</span>
                          </button>
                          {record.status === 'pending' && (
                            <button 
                              onClick={() => handleConfirmRecord(record)}
                              className="text-green-600 hover:text-green-900 flex items-center space-x-1 text-xs lg:text-sm"
                            >
                              <CheckCircle className="w-3 h-3 lg:w-4 lg:h-4" />
                              <span>Xác nhận</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredRecords.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <QrCode className="w-12 h-12 lg:w-16 lg:h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy giao dịch</h3>
                <p className="text-gray-600 max-w-sm mx-auto mb-6">
                  {userData.role === "admin" 
                    ? "Thử thay đổi điều kiện tìm kiếm" 
                    : "Thử thay đổi điều kiện tìm kiếm hoặc quét QR code để tạo giao dịch mới"
                  }
                </p>
                {userData.role === "staff" && (
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => handleQRScan("checkin")}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      Check-in
                    </button>
                    <button
                      onClick={() => handleQRScan("checkout")}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Check-out
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* QR Scanner Modal - Chỉ hiển thị cho staff */}
        <AnimatePresence>
          {showQRScanner && userData.role === "staff" && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-xl lg:rounded-2xl w-full max-w-md"
              >
                <div className="p-4 lg:p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                      {currentAction === 'checkin' ? 'Check-in' : 'Check-out'}
                    </h2>
                    <button
                      onClick={() => setShowQRScanner(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                <div className="p-4 lg:p-6">
                  <div className="text-center mb-6">
                    <div className="w-48 h-48 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <div className="text-center">
                        <Scan className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600 text-sm">Camera QR Scanner</p>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Quét QR code trên xe để {currentAction === 'checkin' ? 'nhận xe' : 'trả xe'}
                    </p>
                  </div>

                  <div className="flex flex-col space-y-3">
                    <button
                      onClick={handleScanSuccess}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <QrCode className="w-5 h-5" />
                      <span>Quét QR Code</span>
                    </button>
                    <button
                      onClick={() => setShowQRScanner(false)}
                      className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Signature Modal - Chỉ hiển thị cho staff */}
        <AnimatePresence>
          {showSignatureModal && userData.role === "staff" && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-xl lg:rounded-2xl w-full max-w-md"
              >
                <div className="p-4 lg:p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                      Ký số xác nhận
                    </h2>
                    <button
                      onClick={() => setShowSignatureModal(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                <div className="p-4 lg:p-6">
                  <div className="mb-6">
                    <p className="text-gray-600 mb-4 text-center">
                      Vui lòng nhập chữ ký số để xác nhận {currentAction === 'checkin' ? 'check-in' : 'check-out'}
                    </p>
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4">
                      <input
                        type="text"
                        placeholder="Nhập chữ ký số của bạn..."
                        value={signature}
                        onChange={(e) => setSignature(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-semibold"
                      />
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 text-blue-800 text-sm">
                        <Key className="w-4 h-4" />
                        <span>Chữ ký số sẽ được mã hóa và lưu trữ an toàn</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-3">
                    <button
                      onClick={handleSignature}
                      className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>Xác nhận & Ký số</span>
                    </button>
                    <button
                      onClick={() => setShowSignatureModal(false)}
                      className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CheckInOutManagement;