import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Car,
  Search,
  Filter,
  Users,
  BarChart3,
  QrCode,
  ChevronDown,
  X,
  Menu,
  LogOut,
  User,
  Bell,
  Shield,
  FileText,
  Wrench,
  AlertCircle,
  PieChart,
  CheckCircle,
  Clock,
  MapPin,
  Camera,
  Loader2,
  Edit,
  ScanLine,
} from "lucide-react";
import { useBookingStore } from "../../store/bookingStore";
import { useAuthStore } from "../../store/authStore";
import { showToast } from "../../utils/toast";
import QRScanner from "../../components/QRScanner";

const CheckInOutManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const {
    bookings,
    isLoading,
    error,
    fetchBookings,
    checkIn,
    checkOut,
    generateQRCode,
    validateQRCode,
    getCheckLogs,
    clearError,
  } = useBookingStore();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [currentAction, setCurrentAction] = useState("");
  const [checkLogs, setCheckLogs] = useState([]);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQrData] = useState(null);
  
  // Check-in/out form data
  const [checkData, setCheckData] = useState({
    odometerReading: "",
    fuelLevel: "",
    notes: "",
    images: [], // array of data-URL strings or remote URLs
  });

  // Handle image selection and convert to data URLs for submission
  const handleImageSelect = (files) => {
    if (!files || files.length === 0) return;

    const maxFiles = 5;
    const existing = checkData.images || [];
    if (existing.length + files.length > maxFiles) {
      showToast.error(`Tối đa ${maxFiles} ảnh cho một lần check-in/out`);
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];

    Array.from(files).forEach((file) => {
      if (!validTypes.includes(file.type)) {
        showToast.error('Chỉ chấp nhận ảnh JPG/PNG');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        setCheckData((prev) => ({ ...prev, images: [...(prev.images || []), dataUrl] }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImageAt = (idx) => {
    setCheckData((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  // State cho user data
  const [userRole, setUserRole] = useState("staff");
  const [userData, setUserData] = useState({
    name: user?.fullName || "User",
    role: user?.role || "staff",
  });

  // Load bookings khi component mount
  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    // booking-service validator does not accept `includeCheckLogs` as a query param
    // so fetch bookings normally and load logs on demand per booking.
    // If current user is staff/admin we must call the admin bookings endpoint
    // (booking-service mounts admin routes at /bookings/admin) because
    // the general /bookings route requires certain query params (e.g. vehicleId)
    const role = (user?.role || '').toString().trim().toLowerCase();
    const useAdmin = role === 'admin' || role === 'staff';
    await fetchBookings(useAdmin ? { admin: true } : {});
  };

  useEffect(() => {
    if (user) {
      setUserData({
        name: user.fullName || user.email,
        role: user.role,
      });
      const cleanRole = (user.role || "staff").toString().trim().toLowerCase();
      setUserRole(cleanRole);
    }
  }, [user]);

  // Show error toast
  useEffect(() => {
    if (error) {
      showToast.error(error);
      clearError();
    }
  }, [error]);

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
    },
  ]);

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
      link: "/staff",
    },
    {
      id: "cars",
      label: "Quản lý xe",
      icon: <Car className="w-5 h-5" />,
      link: "/staff/cars",
    },
    {
      id: "contracts",
      label: "Hợp đồng",
      icon: <FileText className="w-5 h-5" />,
      link: "/staff/contracts",
    },
    {
      id: "services",
      label: "Dịch vụ xe",
      icon: <Wrench className="w-5 h-5" />,
      link: "/staff/services",
    },
    {
      id: "checkin",
      label: "Check-in/out",
      icon: <QrCode className="w-5 h-5" />,
      link: "/staff/checkin",
    },
  ];

  const menuItems = userRole === "admin" ? adminMenuItems : staffMenuItems;

  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái", color: "gray" },
    { value: "confirmed", label: "Đã xác nhận", color: "blue" },
    { value: "in_progress", label: "Đang diễn ra", color: "green" },
    { value: "completed", label: "Đã hoàn thành", color: "green" },
    { value: "cancelled", label: "Đã hủy", color: "red" },
  ];

  // Filter bookings - chỉ lấy những booking cần check-in/out
  const checkRecords = bookings.filter((booking) => {
    const now = new Date();
    const startTime = new Date(booking.startTime);
    const endTime = new Date(booking.endTime);
    
    // Chỉ hiển thị booking trong khoảng thời gian check-in/out
    return (
      (booking.status === 'confirmed' && startTime <= now) ||
      booking.status === 'in_progress' ||
      booking.status === 'completed'
    );
  });

  const filteredRecords = checkRecords.filter((record) => {
    const vehicleInfo = record.vehicle || record.vehicleDetails || {};
    const matchesSearch =
      vehicleInfo.vehicleName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicleInfo.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalRecords: filteredRecords.length,
    checkinRecords: filteredRecords.filter((r) => r.status === "confirmed").length,
    inProgress: filteredRecords.filter((r) => r.status === "in_progress").length,
    completedRecords: filteredRecords.filter((r) => r.status === "completed").length,
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "in_progress":
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "confirmed":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Hàm xử lý check-in
  const handleCheckIn = async (booking) => {
    setSelectedRecord(booking);
    setCurrentAction("checkin");
    setShowCheckInModal(true);
    setCheckData({
      odometerReading: "",
      fuelLevel: "",
      notes: "",
      images: [],
    });
    // Fetch check logs for this booking on demand
    try {
      const logs = await getCheckLogs(booking.id);
      setCheckLogs(logs || []);
    } catch (err) {
      setCheckLogs([]);
    }
  };

  const handleCheckOut = async (booking) => {
    setSelectedRecord(booking);
    setCurrentAction("checkout");
    setShowCheckOutModal(true);
    setCheckData({
      odometerReading: "",
      fuelLevel: "",
      notes: "",
      images: [],
    });
    // Fetch check logs for this booking on demand
    try {
      const logs = await getCheckLogs(booking.id);
      setCheckLogs(logs || []);
    } catch (err) {
      setCheckLogs([]);
    }
  };

  const submitCheckIn = async () => {
    if (!selectedRecord) return;

    const result = await checkIn(selectedRecord.id, {
      odometerReading: parseInt(checkData.odometerReading),
      fuelLevel: parseFloat(checkData.fuelLevel),
      notes: checkData.notes,
      images: checkData.images,
    });

    if (result.success) {
      showToast.success(result.message);
      setShowCheckInModal(false);
      setSelectedRecord(null);
      loadBookings();
    } else {
      showToast.error(result.message);
    }
  };

  const submitCheckOut = async () => {
    if (!selectedRecord) return;

    const result = await checkOut(selectedRecord.id, {
      odometerReading: parseInt(checkData.odometerReading),
      fuelLevel: parseFloat(checkData.fuelLevel),
      notes: checkData.notes,
      images: checkData.images,
    });

    if (result.success) {
      showToast.success(result.message);
      setShowCheckOutModal(false);
      setSelectedRecord(null);
      loadBookings();
    } else {
      showToast.error(result.message);
    }
  };

  // Hàm xử lý QR
  const handleGenerateQR = async (booking) => {
    const data = await generateQRCode(booking.id);
    if (data) {
      showToast.success("Tạo QR code thành công");
      setQrData(data);
      setShowQRModal(true);
    } else {
      showToast.error("Không tạo được QR code");
    }
  };

  const handleQRScanSuccess = async (qrData) => {
    try {
      showToast.info("Đang xác thực QR code...");
      
      // Validate QR code with backend
      const validation = await validateQRCode(qrData.qrCode || JSON.stringify(qrData));
      
      if (validation && validation.valid) {
        const booking = validation.booking;
        showToast.success("QR code hợp lệ!");
        
        // Auto-fill check-in modal with booking info
        setSelectedRecord({
          id: booking.id,
          ...booking
        });
        
        // Determine if check-in or check-out based on status
        if (booking.status === 'confirmed') {
          setShowCheckInModal(true);
        } else if (booking.status === 'in_progress') {
          setShowCheckOutModal(true);
        } else {
          showToast.error("Booking không ở trạng thái phù hợp để check-in/out");
        }
        
        setCheckData({
          odometerReading: "",
          fuelLevel: "",
          notes: "",
          images: [],
        });
        
        // Load check logs
        try {
          const logs = await getCheckLogs(booking.id);
          setCheckLogs(logs || []);
        } catch (err) {
          setCheckLogs([]);
        }
      } else {
        showToast.error(validation?.error || "QR code không hợp lệ");
      }
    } catch (error) {
      console.error('QR validation error:', error);
      showToast.error("Lỗi xác thực QR code");
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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
                  {userRole === "admin" ? (
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
                    {userRole === "admin"
                      ? "Admin Dashboard"
                      : "Staff Dashboard"}
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
                    {userRole === "admin"
                      ? "Quản trị viên"
                      : "Nhân viên vận hành"}
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
                {menuItems.find((item) => item.id === activeTab)?.label ||
                  "Check-in/out"}
              </h2>
            </div>

            <div className="flex items-center space-x-3">
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
                      {userRole === "admin"
                        ? "Quản trị viên"
                        : "Nhân viên vận hành"}
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
                          onClick={() =>
                            navigate(
                              userRole === "admin"
                                ? "/admin/profile"
                                : "/staff/profile"
                            )
                          }
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

        {/* Check-in/out Content */}
        <div className="p-4 lg:p-8">
          {/* Stats Overview */}
          <div className="grid gap-3 lg:gap-6 mb-6 lg:mb-8 grid-cols-2 lg:grid-cols-4">
            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">
                    Tổng số
                  </p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">
                    {stats.totalRecords}
                  </p>
                </div>
                <div className="p-2 lg:p-3 bg-blue-500 rounded-lg text-white shadow-sm">
                  <QrCode className="w-4 h-4 lg:w-6 lg:h-6" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">
                    Chờ check-in
                  </p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">
                    {stats.checkinRecords}
                  </p>
                </div>
                <div className="p-2 lg:p-3 bg-amber-500 rounded-lg text-white shadow-sm">
                  <Clock className="w-4 h-4 lg:w-6 lg:h-6" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">
                    Đang diễn ra
                  </p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">
                    {stats.inProgress}
                  </p>
                </div>
                <div className="p-2 lg:p-3 bg-green-500 rounded-lg text-white shadow-sm">
                  <Car className="w-4 h-4 lg:w-6 lg:h-6" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">
                    Đã hoàn thành
                  </p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">
                    {stats.completedRecords}
                  </p>
                </div>
                <div className="p-2 lg:p-3 bg-purple-500 rounded-lg text-white shadow-sm">
                  <CheckCircle className="w-4 h-4 lg:w-6 lg:h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div className="flex-1">
              <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
                {/* Search Bar */}
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo xe hoặc biển số..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 lg:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base bg-gray-50 focus:bg-white transition-colors"
                  />
                </div>

                {/* Filters */}
                <div className="flex gap-2 lg:gap-3">
                  {/* Scan QR Button */}
                  <button
                    onClick={() => setShowQRScanner(true)}
                    className="flex items-center space-x-2 px-4 py-2 lg:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm lg:text-base font-medium shadow-sm"
                  >
                    <ScanLine className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span className="hidden sm:inline">Scan QR</span>
                  </button>
                  
                  <div className="relative flex-1 lg:flex-none">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base bg-gray-50 focus:bg-white appearance-none"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
            </div>
          )}

          {/* Records List */}
          {!isLoading && (
            <div className="space-y-4">
              {filteredRecords.map((record) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            record.status
                          )}`}
                        >
                          {getStatusIcon(record.status)}
                          <span className="ml-1">
                            {
                              statusOptions.find((s) => s.value === record.status)
                                ?.label
                            }
                          </span>
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {(record.vehicle || record.vehicleDetails)?.vehicleName || "N/A"} -{" "}
                        {(record.vehicle || record.vehicleDetails)?.licensePlate || "N/A"}
                      </h3>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            Bắt đầu: {formatDate(record.startTime)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            Kết thúc: {formatDate(record.endTime)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            {record.destination || record.pickupLocation || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            {(record.user || record.userDetails)?.fullName || record.userId || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2 mt-4 lg:mt-0">
                      {record.status === "confirmed" && (
                        <button
                          onClick={() => handleCheckIn(record)}
                          className="flex-1 lg:flex-none bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          Check-in
                        </button>
                      )}
                      {record.status === "in_progress" && (
                        <button
                          onClick={() => handleCheckOut(record)}
                          className="flex-1 lg:flex-none bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Check-out
                        </button>
                      )}
                      <button
                        onClick={() => handleGenerateQR(record)}
                        className="flex-1 lg:flex-none bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                      >
                        <QrCode className="w-4 h-4 inline mr-1" />
                        QR
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredRecords.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100"
            >
              <QrCode className="w-12 h-12 lg:w-16 lg:h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Không có lịch đặt nào
              </h3>
              <p className="text-gray-600 max-w-sm mx-auto">
                Không tìm thấy lịch đặt nào cần check-in hoặc check-out
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Check-in Modal */}
      <AnimatePresence>
        {showCheckInModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCheckInModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Check-in Xe
              </h3>
              <div className="space-y-4">
                {/* Vehicle Info */}
                {selectedRecord && (selectedRecord.vehicle || selectedRecord.vehicleDetails) && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                    <p className="text-sm font-medium text-blue-900">
                      Xe: {(selectedRecord.vehicle || selectedRecord.vehicleDetails)?.vehicleName}
                    </p>
                    <p className="text-sm text-blue-700">
                      Biển số: {(selectedRecord.vehicle || selectedRecord.vehicleDetails)?.licensePlate}
                    </p>
                    {(selectedRecord.vehicle || selectedRecord.vehicleDetails)?.currentOdometer > 0 && (
                      <p className="text-xs text-blue-600 mt-1">
                        💡 Số km hiện tại của xe: {(selectedRecord.vehicle || selectedRecord.vehicleDetails)?.currentOdometer?.toLocaleString()} km
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số km hiện tại
                  </label>
                  <input
                    type="number"
                    value={checkData.odometerReading}
                    onChange={(e) =>
                      setCheckData({
                        ...checkData,
                        odometerReading: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập số km"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Nhập số km đọc được trên đồng hồ xe
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mức pin (%)
                  </label>
                  <input
                    type="number"
                    value={checkData.fuelLevel}
                    onChange={(e) =>
                      setCheckData({ ...checkData, fuelLevel: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập % pin"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú
                  </label>
                  <textarea
                    value={checkData.notes}
                    onChange={(e) =>
                      setCheckData({ ...checkData, notes: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    placeholder="Nhập ghi chú (nếu có)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh (tùy chọn)</label>
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    multiple
                    onChange={(e) => handleImageSelect(e.target.files)}
                    className="w-full"
                  />

                  {checkData.images && checkData.images.length > 0 && (
                    <div className="mt-2 flex space-x-2 overflow-x-auto">
                      {checkData.images.map((src, idx) => (
                        <div key={idx} className="relative">
                          <img src={src} alt={`img-${idx}`} className="w-24 h-16 object-cover rounded" />
                          <button
                            onClick={() => removeImageAt(idx)}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 text-xs"
                            type="button"
                          >
                            x
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Check logs (fetched on modal open) */}
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Lịch sử check-in/out</p>
                  {checkLogs && checkLogs.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {checkLogs.map((log) => (
                        <div key={log.id || `${log.createdAt}`} className="text-xs text-gray-700 border-b border-gray-100 pb-2">
                          <div className="flex justify-between">
                            <div>
                              <div className="font-medium">{log.actionType || log.action || log.type || 'Log'}</div>
                              <div className="text-gray-500">{log.notes || log.message || ''}</div>
                            </div>
                            <div className="text-gray-400 text-xs">{log.createdAt ? new Date(log.createdAt).toLocaleString('vi-VN') : ''}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic">Chưa có lịch sử check-in/out cho booking này</p>
                  )}
                </div>

              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowCheckInModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={submitCheckIn}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Đang xử lý..." : "Xác nhận Check-in"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Check-out Modal */}
      <AnimatePresence>
        {showCheckOutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCheckOutModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Check-out Xe
              </h3>
              <div className="space-y-4">
                {/* Vehicle Info */}
                {selectedRecord && (selectedRecord.vehicle || selectedRecord.vehicleDetails) && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                    <p className="text-sm font-medium text-blue-900">
                      Xe: {(selectedRecord.vehicle || selectedRecord.vehicleDetails)?.vehicleName}
                    </p>
                    <p className="text-sm text-blue-700">
                      Biển số: {(selectedRecord.vehicle || selectedRecord.vehicleDetails)?.licensePlate}
                    </p>
                    {checkLogs && checkLogs.length > 0 && checkLogs[0]?.odometerReading && (
                      <p className="text-xs text-blue-600 mt-1">
                        💡 Số km khi check-in: {checkLogs[0]?.odometerReading?.toLocaleString()} km
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số km hiện tại
                  </label>
                  <input
                    type="number"
                    value={checkData.odometerReading}
                    onChange={(e) =>
                      setCheckData({
                        ...checkData,
                        odometerReading: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập số km"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Nhập số km đọc được trên đồng hồ xe (phải ≥ số km check-in)
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mức pin (%)
                  </label>
                  <input
                    type="number"
                    value={checkData.fuelLevel}
                    onChange={(e) =>
                      setCheckData({ ...checkData, fuelLevel: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập % pin"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú
                  </label>
                  <textarea
                    value={checkData.notes}
                    onChange={(e) =>
                      setCheckData({ ...checkData, notes: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    placeholder="Nhập ghi chú (nếu có)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh (tùy chọn)</label>
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    multiple
                    onChange={(e) => handleImageSelect(e.target.files)}
                    className="w-full"
                  />

                  {checkData.images && checkData.images.length > 0 && (
                    <div className="mt-2 flex space-x-2 overflow-x-auto">
                      {checkData.images.map((src, idx) => (
                        <div key={idx} className="relative">
                          <img src={src} alt={`img-${idx}`} className="w-24 h-16 object-cover rounded" />
                          <button
                            onClick={() => removeImageAt(idx)}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 text-xs"
                            type="button"
                          >
                            x
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Check logs for checkout */}
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Lịch sử check-in/out</p>
                  {checkLogs && checkLogs.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {checkLogs.map((log) => (
                        <div key={log.id || `${log.createdAt}`} className="text-xs text-gray-700 border-b border-gray-100 pb-2">
                          <div className="flex justify-between">
                            <div>
                              <div className="font-medium">{log.actionType || log.action || log.type || 'Log'}</div>
                              <div className="text-gray-500">{log.notes || log.message || ''}</div>
                            </div>
                            <div className="text-gray-400 text-xs">{log.createdAt ? new Date(log.createdAt).toLocaleString('vi-VN') : ''}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic">Chưa có lịch sử check-in/out cho booking này</p>
                  )}
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowCheckOutModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={submitCheckOut}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Đang xử lý..." : "Xác nhận Check-out"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* QR Modal */}
      <AnimatePresence>
        {showQRModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowQRModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">QR Code</h3>
                <button onClick={() => setShowQRModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="text-center">
                {qrData ? (
                  typeof qrData === 'string' ? (
                    <img src={qrData} alt="QR" className="mx-auto" />
                  ) : qrData.qrImage || qrData.image ? (
                    <img src={qrData.qrImage || qrData.image} alt="QR" className="mx-auto" />
                  ) : (
                    <pre className="text-xs text-left max-h-64 overflow-auto bg-gray-50 p-3 rounded">{JSON.stringify(qrData, null, 2)}</pre>
                  )
                ) : (
                  <p className="text-gray-500">Không có dữ liệu QR</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScanSuccess={handleQRScanSuccess}
      />
    </div>
  );
};

export default CheckInOutManagement;
