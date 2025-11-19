import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Car,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Users,
  Battery,
  MapPin,
  BarChart3,
  Download,
  Zap,
  Wrench,
  Eye,
  QrCode,
  ChevronDown,
  X,
  MoreVertical,
  FileText,
  AlertTriangle,
  Menu,
  LogOut,
  User,
  Bell,
  Shield,
  PieChart,
  Loader2,
} from "lucide-react";
import { useVehicleStore } from "../../store/vehicleStore";
import { useAuthStore } from "../../store/authStore";
import { showToast } from "../../utils/toast";

const CarManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const {
    vehicles,
    loading,
    error,
    fetchVehicles,
    deleteVehicle,
    createVehicle,
    updateVehicle,
    updateVehicleStatus,
    clearError,
  } = useVehicleStore();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCar, setSelectedCar] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    vehicleName: "",
    licensePlate: "",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    color: "",
    vin: "",
    batteryCapacityKwh: "",
    currentOdometer: "",
    purchasePrice: "",
    purchaseDate: "",
    groupId: "",
    specifications: {
      location: "",
      seats: 5,
      features: []
    }
  });

  // State cho user data
  const [userRole, setUserRole] = useState("staff");
  const [userData, setUserData] = useState({
    name: user?.fullName || "User",
    role: user?.role || "staff",
  });

  // Load vehicles khi component mount
  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    await fetchVehicles();
  };

  useEffect(() => {
    // Lấy và xử lý thông tin user từ store hoặc localStorage
    if (user) {
      setUserData({
        name: user.fullName || user.email,
        role: user.role,
      });
      const cleanRole = (user.role || "staff").toString().trim().toLowerCase();
      setUserRole(cleanRole);
    } else {
      const storedUserData = localStorage.getItem("userData");
      if (storedUserData) {
        try {
          const parsedData = JSON.parse(storedUserData);
          setUserData(parsedData);
          const cleanRole = (parsedData.role || "staff").trim().toLowerCase();
          setUserRole(cleanRole);
        } catch (error) {
          console.error("Lỗi khi parse userData:", error);
          setUserRole("staff");
        }
      }
    }
  }, [user]);

  // Show error toast
  useEffect(() => {
    if (error) {
      showToast.error(error);
      clearError();
    }
  }, [error]);

  // Thông báo (giữ nguyên mock data)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Bảo dưỡng định kỳ",
      message: "Xe VF e34 cần bảo dưỡng tháng 11",
      time: "2 giờ trước",
      type: "warning",
      read: false,
    },
    {
      id: 2,
      title: "Check-in thành công",
      message: "Minh Nguyễn đã check-in xe VF 8",
      time: "5 giờ trước",
      type: "success",
      read: true,
    },
    {
      id: 3,
      title: "Đặt lịch mới",
      message: "Co-owner Lan Phương đặt lịch sử dụng 15/11",
      time: "1 ngày trước",
      type: "info",
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
      icon: <AlertTriangle className="w-5 h-5" />,
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
    { value: "available", label: "Sẵn sàng", color: "green" },
    { value: "in_use", label: "Đang sử dụng", color: "blue" },
    { value: "maintenance", label: "Bảo dưỡng", color: "amber" },
    { value: "unavailable", label: "Ngừng hoạt động", color: "red" },
  ];

  // Map backend status to display
  const mapStatus = (backendStatus) => {
    const mapping = {
      available: "available",
      in_use: "in_use",
      maintenance: "maintenance",
      unavailable: "unavailable",
    };
    return mapping[backendStatus] || "available";
  };

  const filteredCars = vehicles.filter((car) => {
    const matchesSearch =
      car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.license.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || mapStatus(car.status) === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalCars: vehicles.length,
    activeCars: vehicles.filter((car) => car.status === "available").length,
    inUseCars: vehicles.filter((car) => car.status === "in_use").length,
    inMaintenance: vehicles.filter((car) => car.status === "maintenance")
      .length,
    inactiveCars: vehicles.filter((car) => car.status === "unavailable").length,
    totalRevenue: vehicles.reduce((sum, car) => sum + (car.totalRevenue || 0), 0),
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200";
      case "in_use":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "maintenance":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "unavailable":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Role-based permissions
  const canAddCar = userRole === "admin";
  const canEditCar = userRole === "admin";
  const canDeleteCar = userRole === "admin";
  const canViewRevenue = userRole === "admin";
  const canExport = userRole === "admin";

  const getActiveTab = () => {
    const currentPath = location.pathname;
    const menuItem = menuItems.find((item) => item.link === currentPath);
    return menuItem ? menuItem.id : "cars";
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

  // Hàm xử lý xóa xe
  const handleDeleteCar = async (carId) => {
    const result = await deleteVehicle(carId);
    if (result.success) {
      showToast.success(result.message || "Xóa xe thành công");
      setDeleteConfirm(null);
    } else {
      showToast.error(result.message || "Lỗi khi xóa xe");
    }
  };

  // Hàm xử lý cập nhật trạng thái
  const handleUpdateStatus = async (carId, newStatus) => {
    const result = await updateVehicleStatus(carId, newStatus);
    if (result.success) {
      showToast.success(result.message || "Cập nhật trạng thái thành công");
    } else {
      showToast.error(result.message || "Lỗi khi cập nhật trạng thái");
    }
  };

  // Hàm xử lý thêm xe
  const handleAddVehicle = async (e) => {
    e.preventDefault();
    const result = await createVehicle(formData);
    if (result.success) {
      showToast.success(result.message || "Thêm xe thành công");
      setShowAddForm(false);
      resetForm();
    } else {
      showToast.error(result.message || "Lỗi khi thêm xe");
    }
  };

  // Hàm xử lý sửa xe
  const handleEditVehicle = async (e) => {
    e.preventDefault();
    if (!editingCar) return;
    const result = await updateVehicle(editingCar.id, formData);
    if (result.success) {
      showToast.success(result.message || "Cập nhật xe thành công");
      setShowEditForm(false);
      setEditingCar(null);
      resetForm();
    } else {
      showToast.error(result.message || "Lỗi khi cập nhật xe");
    }
  };

  // Hàm mở form sửa
  const handleOpenEditForm = (car) => {
    setEditingCar(car);
    setFormData({
      vehicleName: car.name,
      licensePlate: car.license,
      brand: car.brand || "",
      model: car.model || "",
      year: car.year || new Date().getFullYear(),
      color: car.color || "",
      vin: car.vin || "",
      batteryCapacityKwh: car.batteryCapacityKwh || "",
      currentOdometer: car.currentOdometer || "",
      purchasePrice: car.purchasePrice || "",
      purchaseDate: car.purchaseDate || "",
      groupId: car.groupId || "",
      specifications: car.specifications || {
        location: car.location || "",
        seats: 5,
        features: []
      }
    });
    setShowEditForm(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      vehicleName: "",
      licensePlate: "",
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      color: "",
      vin: "",
      batteryCapacityKwh: "",
      currentOdometer: "",
      purchasePrice: "",
      purchaseDate: "",
      groupId: "",
      specifications: {
        location: "",
        seats: 5,
        features: []
      }
    });
  };

  // Hàm xử lý xem chi tiết
  const handleViewDetails = (car) => {
    setSelectedCar(car);
    setShowDetailModal(true);
  };

  // Hàm export CSV
  const handleExportCSV = () => {
    try {
      const headers = ["Tên xe", "Biển số", "Model", "Trạng thái", "Pin", "Vị trí", "Số chủ sở hữu"];
      const rows = filteredCars.map(car => [
        car.name,
        car.license,
        car.model,
        statusOptions.find(s => s.value === mapStatus(car.status))?.label,
        `${car.battery}%`,
        car.location,
        car.coOwners
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.join(","))
      ].join("\n");

      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `danh-sach-xe-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast.success("Xuất file thành công");
    } catch (error) {
      showToast.error("Lỗi khi xuất file");
    }
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
                  "Quản lý xe"}
              </h2>
            </div>

            <div className="flex items-center space-x-3">
              {/* Search Bar */}
              <div className="relative hidden md:block">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm kiếm xe..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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

        {/* Car Management Content */}
        <div className="p-4 lg:p-8">
          {/* Stats Overview */}
          <div
            className={`grid gap-3 lg:gap-6 mb-6 lg:mb-8 ${
              userRole === "admin"
                ? "grid-cols-2 lg:grid-cols-5"
                : "grid-cols-2 lg:grid-cols-4"
            }`}
          >
            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">
                    Tổng số xe
                  </p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">
                    {stats.totalCars}
                  </p>
                </div>
                <div className="p-2 lg:p-3 bg-blue-500 rounded-lg text-white shadow-sm">
                  <Car className="w-4 h-4 lg:w-6 lg:h-6" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">
                    Sẵn sàng
                  </p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">
                    {stats.activeCars}
                  </p>
                </div>
                <div className="p-2 lg:p-3 bg-green-500 rounded-lg text-white shadow-sm">
                  <Zap className="w-4 h-4 lg:w-6 lg:h-6" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">
                    Đang bảo dưỡng
                  </p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">
                    {stats.inMaintenance}
                  </p>
                </div>
                <div className="p-2 lg:p-3 bg-amber-500 rounded-lg text-white shadow-sm">
                  <Wrench className="w-4 h-4 lg:w-6 lg:h-6" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">
                    Ngừng hoạt động
                  </p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">
                    {stats.inactiveCars}
                  </p>
                </div>
                <div className="p-2 lg:p-3 bg-red-500 rounded-lg text-white shadow-sm">
                  <X className="w-4 h-4 lg:w-6 lg:h-6" />
                </div>
              </div>
            </div>

            {userRole === "admin" && (
              <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm font-medium text-gray-600">
                      Tổng doanh thu
                    </p>
                    <p className="text-lg lg:text-2xl font-bold text-gray-900">
                      {(stats.totalRevenue / 1000000).toFixed(1)}M
                    </p>
                  </div>
                  <div className="p-2 lg:p-3 bg-purple-500 rounded-lg text-white shadow-sm">
                    <BarChart3 className="w-4 h-4 lg:w-6 lg:h-6" />
                  </div>
                </div>
              </div>
            )}
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
                    placeholder="Tìm kiếm xe theo tên, biển số hoặc vị trí..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 lg:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base bg-gray-50 focus:bg-white transition-colors"
                  />
                </div>

                {/* Filters */}
                <div className="flex gap-2 lg:gap-3">
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
                  <button
                    onClick={() => setMobileFiltersOpen(true)}
                    className="lg:hidden flex items-center space-x-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Filter className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons - Admin Only */}
            <div className="flex gap-3 mt-4 lg:mt-0">
              {canExport && (
                <button 
                  onClick={handleExportCSV}
                  className="hidden lg:flex items-center space-x-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  <Download className="w-4 h-4" />
                  <span>Xuất danh sách</span>
                </button>
              )}
              {canAddCar && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">Thêm xe mới</span>
                </motion.button>
              )}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
            </div>
          )}

          {/* Cars Grid */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
              {filteredCars.map((car) => (
                <motion.div
                  key={car.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden group"
                >
                  {/* Car Image */}
                  <div className="h-40 lg:h-48 bg-gradient-to-br from-blue-500 to-blue-600 relative">
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="absolute top-3 left-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          car.status
                        )}`}
                      >
                        {statusOptions.find(
                          (s) => s.value === mapStatus(car.status)
                        )?.label}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <button className="p-1.5 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors">
                        <MoreVertical className="w-4 h-4 text-white" />
                      </button>
                    </div>
                    <div className="absolute bottom-3 left-3 text-white">
                      <h3 className="text-lg lg:text-xl font-bold">
                        {car.name}
                      </h3>
                      <p className="text-white/80 text-sm">{car.license}</p>
                    </div>
                  </div>

                  {/* Car Details */}
                  <div className="p-4 lg:p-6">
                    <div className="grid grid-cols-2 gap-3 lg:gap-4 mb-4">
                      <div className="flex items-center space-x-2 text-xs lg:text-sm">
                        <Battery className="w-3 h-3 lg:w-4 lg:h-4 text-green-600" />
                        <span>Pin {car.battery}%</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs lg:text-sm">
                        <Users className="w-3 h-3 lg:w-4 lg:h-4 text-blue-600" />
                        <span>{car.coOwners} chủ sở hữu</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs lg:text-sm">
                        <MapPin className="w-3 h-3 lg:w-4 lg:h-4 text-red-600" />
                        <span className="truncate">{car.location}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs lg:text-sm">
                        <BarChart3 className="w-3 h-3 lg:w-4 lg:h-4 text-purple-600" />
                        <span>{car.utilization}% sử dụng</span>
                      </div>
                    </div>

                    <div className="space-y-2 lg:space-y-3 mb-4 lg:mb-6">
                      <div className="flex justify-between text-xs lg:text-sm">
                        <span className="text-gray-600">Model:</span>
                        <span className="font-medium">{car.model || car.year}</span>
                      </div>
                      <div className="flex justify-between text-xs lg:text-sm">
                        <span className="text-gray-600">Bảo dưỡng tiếp:</span>
                        <span className="font-medium">
                          {car.nextMaintenance}
                        </span>
                      </div>
                      {canViewRevenue && (
                        <div className="flex justify-between text-xs lg:text-sm">
                          <span className="text-gray-600">Doanh thu:</span>
                          <span className="font-medium text-green-600">
                            {((car.totalRevenue || 0) / 1000000).toFixed(1)}M
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(car)}
                        className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg flex items-center justify-center space-x-1 hover:bg-gray-200 transition-colors text-xs lg:text-sm"
                      >
                        <Eye className="w-3 h-3 lg:w-4 lg:h-4" />
                        <span>Chi tiết</span>
                      </button>
                      {canEditCar && (
                        <button 
                          onClick={() => handleOpenEditForm(car)}
                          className="flex-1 bg-blue-100 text-blue-700 py-2 rounded-lg flex items-center justify-center space-x-1 hover:bg-blue-200 transition-colors text-xs lg:text-sm">
                          <Edit className="w-3 h-3 lg:w-4 lg:h-4" />
                          <span>Sửa</span>
                        </button>
                      )}
                      {canDeleteCar && (
                        <button
                          onClick={() => setDeleteConfirm(car.id)}
                          className="flex-1 bg-red-100 text-red-700 py-2 rounded-lg flex items-center justify-center space-x-1 hover:bg-red-200 transition-colors text-xs lg:text-sm"
                        >
                          <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />
                          <span>Xóa</span>
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredCars.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100"
            >
              <Car className="w-12 h-12 lg:w-16 lg:h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Không tìm thấy xe
              </h3>
              <p className="text-gray-600 max-w-sm mx-auto mb-6">
                {userRole === "admin"
                  ? "Thử thay đổi điều kiện tìm kiếm hoặc thêm xe mới"
                  : "Thử thay đổi điều kiện tìm kiếm"}
              </p>
              {canAddCar && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Thêm xe mới
                </button>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Xác nhận xóa xe
              </h3>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn xóa xe này? Hành động này không thể hoàn tác.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleDeleteCar(deleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Xóa
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Vehicle Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={() => setShowAddForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-6 max-w-2xl w-full shadow-2xl my-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Thêm xe mới</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <form onSubmit={handleAddVehicle} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên xe <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.vehicleName}
                      onChange={(e) => setFormData({ ...formData, vehicleName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="VF e34"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Biển số <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.licensePlate}
                      onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="30A-12345"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hãng xe <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="VinFast"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Model <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="VF e34"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Năm sản xuất
                    </label>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="2000"
                      max={new Date().getFullYear() + 1}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Màu sắc
                    </label>
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Đỏ"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số VIN
                    </label>
                    <input
                      type="text"
                      value={formData.vin}
                      onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="VF123456789"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dung lượng pin (kWh)
                    </label>
                    <input
                      type="number"
                      value={formData.batteryCapacityKwh}
                      onChange={(e) => setFormData({ ...formData, batteryCapacityKwh: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="42.0"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số Km hiện tại
                    </label>
                    <input
                      type="number"
                      value={formData.currentOdometer}
                      onChange={(e) => setFormData({ ...formData, currentOdometer: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giá mua (VNĐ)
                    </label>
                    <input
                      type="number"
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="690000000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày mua
                    </label>
                    <input
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vị trí hiện tại
                    </label>
                    <input
                      type="text"
                      value={formData.specifications.location}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        specifications: { ...formData.specifications, location: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Hà Nội"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Đang xử lý...
                      </>
                    ) : (
                      "Thêm xe"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Vehicle Modal */}
      <AnimatePresence>
        {showEditForm && editingCar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={() => {
              setShowEditForm(false);
              setEditingCar(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-6 max-w-2xl w-full shadow-2xl my-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Chỉnh sửa xe</h3>
                <button
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingCar(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <form onSubmit={handleEditVehicle} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên xe <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.vehicleName}
                      onChange={(e) => setFormData({ ...formData, vehicleName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Biển số <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.licensePlate}
                      onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hãng xe <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Model <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Năm sản xuất
                    </label>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="2000"
                      max={new Date().getFullYear() + 1}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Màu sắc
                    </label>
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số VIN
                    </label>
                    <input
                      type="text"
                      value={formData.vin}
                      onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dung lượng pin (kWh)
                    </label>
                    <input
                      type="number"
                      value={formData.batteryCapacityKwh}
                      onChange={(e) => setFormData({ ...formData, batteryCapacityKwh: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số Km hiện tại
                    </label>
                    <input
                      type="number"
                      value={formData.currentOdometer}
                      onChange={(e) => setFormData({ ...formData, currentOdometer: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giá mua (VNĐ)
                    </label>
                    <input
                      type="number"
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày mua
                    </label>
                    <input
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vị trí hiện tại
                    </label>
                    <input
                      type="text"
                      value={formData.specifications.location}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        specifications: { ...formData.specifications, location: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditForm(false);
                      setEditingCar(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Đang xử lý...
                      </>
                    ) : (
                      "Cập nhật"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vehicle Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedCar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={() => {
              setShowDetailModal(false);
              setSelectedCar(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-6 max-w-3xl w-full shadow-2xl my-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Chi tiết xe</h3>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedCar(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Image */}
                <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl relative">
                  <div className="absolute inset-0 bg-black/10 rounded-xl" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h4 className="text-2xl font-bold">{selectedCar.name}</h4>
                    <p className="text-white/80">{selectedCar.license}</p>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                        selectedCar.status
                      )}`}
                    >
                      {statusOptions.find(s => s.value === mapStatus(selectedCar.status))?.label}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Hãng xe</p>
                    <p className="font-semibold text-gray-900">{selectedCar.brand || "Chưa cập nhật"}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Model</p>
                    <p className="font-semibold text-gray-900">{selectedCar.model || selectedCar.year}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Màu sắc</p>
                    <p className="font-semibold text-gray-900">{selectedCar.color || "Chưa cập nhật"}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Năm sản xuất</p>
                    <p className="font-semibold text-gray-900">{selectedCar.year || "Chưa cập nhật"}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg col-span-2">
                    <p className="text-sm text-gray-600 mb-1">Số VIN</p>
                    <p className="font-semibold text-gray-900 text-xs">{selectedCar.vin || "Chưa cập nhật"}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Mức pin</p>
                    <div className="flex items-center space-x-2">
                      <Battery className="w-5 h-5 text-green-600" />
                      <p className="font-semibold text-gray-900">{selectedCar.battery}%</p>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Dung lượng pin</p>
                    <p className="font-semibold text-gray-900">
                      {selectedCar.batteryCapacityKwh ? `${selectedCar.batteryCapacityKwh} kWh` : "Chưa cập nhật"}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Quãng đường (Range)</p>
                    <p className="font-semibold text-gray-900">
                      {selectedCar.specifications?.range_km ? `${selectedCar.specifications.range_km} km` : "Chưa cập nhật"}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Tốc độ 0-100km/h</p>
                    <p className="font-semibold text-gray-900">
                      {selectedCar.specifications?.acceleration_0_100 || "Chưa cập nhật"}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Vị trí</p>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-red-600" />
                      <p className="font-semibold text-gray-900">{selectedCar.location}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Số Km đã đi</p>
                    <p className="font-semibold text-gray-900">
                      {selectedCar.currentOdometer ? `${selectedCar.currentOdometer.toLocaleString()} km` : "Chưa cập nhật"}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Giá mua</p>
                    <p className="font-semibold text-gray-900">
                      {selectedCar.purchasePrice ? `${(selectedCar.purchasePrice / 1000000).toFixed(0)}M VNĐ` : "Chưa cập nhật"}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Ngày mua</p>
                    <p className="font-semibold text-gray-900">
                      {selectedCar.purchaseDate ? new Date(selectedCar.purchaseDate).toLocaleDateString('vi-VN') : "Chưa cập nhật"}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Số chủ sở hữu</p>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <p className="font-semibold text-gray-900">{selectedCar.coOwners} người</p>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Tỷ lệ sử dụng</p>
                    <p className="font-semibold text-gray-900">{selectedCar.utilization}%</p>
                  </div>
                  {canViewRevenue && (
                    <div className="p-4 bg-gray-50 rounded-lg col-span-2">
                      <p className="text-sm text-gray-600 mb-1">Doanh thu</p>
                      <p className="font-semibold text-green-600">
                        {((selectedCar.totalRevenue || 0) / 1000000).toFixed(1)}M VNĐ
                      </p>
                    </div>
                  )}
                </div>

                {/* Insurance Info */}
                {selectedCar.insurancePolicies && selectedCar.insurancePolicies.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-blue-600" />
                      Bảo hiểm
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Nhà cung cấp</p>
                        <p className="font-semibold text-gray-900 text-sm">{selectedCar.insurancePolicies[0].insuranceProvider}</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Số hợp đồng</p>
                        <p className="font-semibold text-gray-900 text-sm">{selectedCar.insurancePolicies[0].policyNumber}</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Ngày hết hạn</p>
                        <p className="font-semibold text-gray-900 text-sm">
                          {new Date(selectedCar.insurancePolicies[0].endDate).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Phí bảo hiểm</p>
                        <p className="font-semibold text-gray-900 text-sm">
                          {(parseFloat(selectedCar.insurancePolicies[0].premiumAmount) / 1000000).toFixed(1)}M VNĐ
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                {canEditCar && (
                  <div className="flex space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        handleOpenEditForm(selectedCar);
                      }}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Chỉnh sửa</span>
                    </button>
                    <select
                      value={selectedCar.status}
                      onChange={(e) => {
                        handleUpdateStatus(selectedCar.id, e.target.value);
                        setShowDetailModal(false);
                        setSelectedCar(null);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="available">Sẵn sàng</option>
                      <option value="in_use">Đang sử dụng</option>
                      <option value="maintenance">Bảo dưỡng</option>
                      <option value="unavailable">Ngừng hoạt động</option>
                    </select>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CarManagement;
