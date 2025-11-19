import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Wrench,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Car,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Download,
  Eye,
  Users,
  DollarSign,
  ChevronDown,
  X,
  MoreVertical,
  Menu,
  LogOut,
  User,
  Bell,
  Shield,
  PieChart,
  FileText,
  QrCode,
  AlertCircle,
  TrendingUp,
  CreditCard,
  Building,
  Map,
  Key,
  Loader2,
} from "lucide-react";
import { useMaintenanceStore } from "../../store/maintenanceStore";
import { useAuthStore } from "../../store/authStore";
import { showToast } from "../../utils/toast";
import { vehicleAPI } from "../../api";

const ServiceManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedService, setSelectedService] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [serviceToComplete, setServiceToComplete] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [completeFormData, setCompleteFormData] = useState({
    odometerReading: '',
    cost: '',
    serviceProvider: '',
    description: ''
  });

  // Zustand stores
  const { 
    schedules, 
    loading, 
    error, 
    fetchAllSchedules, 
    createSchedule,
    updateSchedule,
    deleteSchedule,
    completeMaintenance,
    clearError 
  } = useMaintenanceStore();

  const { user } = useAuthStore();

  // State cho user data
  const [userRole, setUserRole] = useState("staff");
  const [userData, setUserData] = useState({
    name: "Nguyễn Văn B",
    role: "staff",
  });

  // Notifications mock data
  const [notifications] = useState([
    {
      id: 1,
      title: "Dịch vụ hoàn thành",
      message: "Bảo dưỡng định kỳ cho xe VF e34 đã hoàn thành",
      time: "5 phút trước",
      read: false,
    },
    {
      id: 2,
      title: "Lịch mới",
      message: "Đã lên lịch thay pin cho VF 9",
      time: "1 giờ trước",
      read: false,
    },
  ]);

  // Load schedules on mount
  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    await fetchAllSchedules();
  };

  // Local cache for vehicle info keyed by vehicleId
  const [vehicleMap, setVehicleMap] = useState({});
  const [formData, setFormData] = useState({
    vehicleId: "",
    maintenanceType: "",
    scheduledDate: "",
    odometerAtSchedule: "",
    estimatedCost: "",
    notes: "",
  });

  // When schedules change, fetch vehicle info for referenced vehicle_ids
  useEffect(() => {
    const loadVehicles = async () => {
      if (!schedules || schedules.length === 0) return;

      // Start from any embedded vehicle data in schedules to avoid extra API calls
      const map = { ...vehicleMap };
      const missingIds = new Set();

      schedules.forEach((s) => {
        if (s.vehicle && s.vehicle.id) {
          // backend may embed a vehicle object on each schedule
          map[s.vehicle.id] = {
            name: s.vehicle.vehicleName || s.vehicle.name || s.vehicle.model || 'Xe điện',
            plate: s.vehicle.licensePlate || s.vehicle.plate || s.vehicle.plate_number || 'N/A',
          };
        } else if (s.vehicleId) {
          if (!map[s.vehicleId]) missingIds.add(s.vehicleId);
        }
      });

      // Fetch only vehicle ids that we still don't have
      await Promise.all(Array.from(missingIds).map(async (vid) => {
        try {
          const res = await vehicleAPI.getVehicleById(vid);
          if (res.success && res.data) {
            map[vid] = {
              name: res.data.name || res.data.title || res.data.model || 'Xe điện',
              plate: res.data.plate || res.data.license_plate || res.data.plate_number || 'N/A'
            };
          }
        } catch (e) {
          // ignore individual failures
        }
      }));

      setVehicleMap(map);
    };

    loadVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedules]);

  // Handle errors
  useEffect(() => {
    if (error) {
      showToast.error(error);
      clearError();
    }
  }, [error, clearError]);

  useEffect(() => {
    // Lấy và xử lý thông tin user từ localStorage hoặc authStore
    if (user) {
      setUserData({
        name: user.name || user.fullName || "User",
        role: user.role || "staff",
      });
      setUserRole((user.role || "staff").trim().toLowerCase());
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
      } else {
        setUserData({
          name: "Nguyễn Văn B",
          role: "staff",
        });
        setUserRole("staff");
      }
    }
  }, [user]);

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
      id: "contracts",
      label: "Quản lý hợp đồng",
      icon: <FileText className="w-5 h-5" />,
      link: "/admin/contracts",
    },
    {
      id: "services",
      label: "Quản lý dịch vụ",
      icon: <Wrench className="w-5 h-5" />,
      link: "/admin/services",
    },
    {
      id: "checkinout",
      label: "Check-in/out",
      icon: <QrCode className="w-5 h-5" />,
      link: "/admin/checkinout",
    },
    {
      id: "users",
      label: "Quản lý người dùng",
      icon: <Users className="w-5 h-5" />,
      link: "/admin/users",
    },
    {
      id: "groups",
      label: "Quản lý nhóm",
      icon: <Building className="w-5 h-5" />,
      link: "/admin/groups",
    },
    {
      id: "reports",
      label: "Báo cáo",
      icon: <PieChart className="w-5 h-5" />,
      link: "/admin/reports",
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
      label: "Quản lý hợp đồng",
      icon: <FileText className="w-5 h-5" />,
      link: "/staff/contracts",
    },
    {
      id: "services",
      label: "Quản lý dịch vụ",
      icon: <Wrench className="w-5 h-5" />,
      link: "/staff/services",
    },
    {
      id: "checkinout",
      label: "Check-in/out",
      icon: <QrCode className="w-5 h-5" />,
      link: "/staff/checkinout",
    },
  ];

  const menuItems = userRole === "admin" ? adminMenuItems : staffMenuItems;

  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái", color: "gray" },
    { value: "scheduled", label: "Đã lên lịch", color: "blue" },
    { value: "in_progress", label: "Đang thực hiện", color: "amber" },
    { value: "completed", label: "Hoàn thành", color: "green" },
    { value: "cancelled", label: "Đã hủy", color: "red" },
  ];

  const priorityOptions = [
    { value: "low", label: "Thấp", color: "gray" },
    { value: "medium", label: "Trung bình", color: "amber" },
    { value: "high", label: "Cao", color: "red" },
  ];

  // Transform backend data to frontend format
  const services = (schedules || []).map(schedule => {
    // Prefer embedded vehicle object when backend provides it
    const embedded = schedule.vehicle;
    const cached = schedule.vehicleId ? vehicleMap[schedule.vehicleId] : null;

    const name = embedded?.vehicleName || embedded?.name || cached?.name || schedule.vehicleInfo || `Xe #${(schedule.vehicleId || '')?.slice?.(0,8) || 'N/A'}`;
    const plate = embedded?.licensePlate || embedded?.plate || cached?.plate || '';

    const carDisplay = plate ? `${name} (${plate})` : name;

    return {
      id: schedule.id,
      type: schedule.maintenanceType || schedule.type || "Bảo dưỡng định kỳ",
      maintenanceType: schedule.maintenanceType,
      car: carDisplay,
      scheduledDate: schedule.scheduledDate ? new Date(schedule.scheduledDate).toLocaleDateString('vi-VN') : "",
      scheduledDateRaw: schedule.scheduledDate, // Keep raw date for editing
      completedDate: schedule.completedDate ? new Date(schedule.completedDate).toLocaleDateString('vi-VN') : "",
      status: schedule.status || "scheduled",
      cost: Number(schedule.estimatedCost ?? schedule.cost ?? 0) || 0,
      estimatedCost: schedule.estimatedCost,
      odometerAtSchedule: schedule.odometerAtSchedule,
      notes: schedule.notes || "",
      description: schedule.notes || "",
      technician: schedule.serviceProvider || "Chưa phân công",
      vehicleId: schedule.vehicleId || embedded?.id,
    };
  });

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.car.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.technician.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || service.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalServices: services.length,
    completedServices: services.filter((s) => s.status === "completed").length,
    scheduledServices: services.filter((s) => s.status === "scheduled").length,
    inProgressServices: services.filter((s) => s.status === "in_progress")
      .length,
    totalCost: services.reduce((sum, service) => sum + service.cost, 0),
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "in_progress":
        return <Clock className="w-4 h-4 text-amber-600" />;
      case "scheduled":
        return <Calendar className="w-4 h-4 text-blue-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "in_progress":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "low":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "medium":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Role-based permissions
  const canAddService = userRole === "admin";
  const canEditService = userRole === "admin";
  const canDeleteService = userRole === "admin";
  const canExport = userRole === "admin";

  const getActiveTab = () => {
    const currentPath = location.pathname;
    const menuItem = menuItems.find((item) => item.link === currentPath);
    return menuItem ? menuItem.id : "services";
  };

  const activeTab = getActiveTab();

  // CRUD Handlers
  const handleAddService = async (e) => {
    e?.preventDefault();
    if (!formData.vehicleId || !formData.maintenanceType || !formData.scheduledDate) {
      showToast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    const result = await createSchedule(formData.vehicleId, {
      maintenanceType: formData.maintenanceType,
      scheduledDate: formData.scheduledDate,
      odometerAtSchedule: formData.odometerAtSchedule ? parseInt(formData.odometerAtSchedule) : undefined,
      estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : undefined,
      notes: formData.notes || undefined,
    });

    if (result.success) {
      showToast.success(result.message || "Thêm dịch vụ thành công");
      setShowAddForm(false);
      setFormData({
        vehicleId: "",
        maintenanceType: "",
        scheduledDate: "",
        odometerAtSchedule: "",
        estimatedCost: "",
        notes: "",
      });
      loadSchedules();
    }
  };

  const handleEditService = async (e) => {
    e?.preventDefault();
    if (!selectedService) return;

    const updateData = {};
    
    // Only include fields that have actual values (not empty strings)
    if (formData.maintenanceType && formData.maintenanceType.trim()) {
      updateData.maintenanceType = formData.maintenanceType;
    }
    if (formData.scheduledDate && formData.scheduledDate.trim()) {
      updateData.scheduledDate = formData.scheduledDate;
    }
    if (formData.odometerAtSchedule && formData.odometerAtSchedule.toString().trim()) {
      updateData.odometerAtSchedule = parseInt(formData.odometerAtSchedule);
    }
    if (formData.estimatedCost && formData.estimatedCost.toString().trim()) {
      updateData.estimatedCost = parseFloat(formData.estimatedCost);
    }
    if (formData.notes && formData.notes.trim()) {
      updateData.notes = formData.notes;
    }
    if (formData.status && formData.status.trim()) {
      updateData.status = formData.status;
    }

    if (Object.keys(updateData).length === 0) {
      showToast.error("Vui lòng thay đổi ít nhất một trường");
      return;
    }

    const result = await updateSchedule(selectedService.id, updateData);

    if (result.success) {
      showToast.success(result.message || "Cập nhật dịch vụ thành công");
      setShowEditForm(false);
      setSelectedService(null);
      setFormData({
        vehicleId: "",
        maintenanceType: "",
        scheduledDate: "",
        odometerAtSchedule: "",
        estimatedCost: "",
        notes: "",
      });
      loadSchedules();
    }
  };

  const handleDeleteClick = (service) => {
    setServiceToDelete(service);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!serviceToDelete) return;
    
    const result = await deleteSchedule(serviceToDelete.id);
    if (result.success) {
      showToast.success(result.message || "Xóa dịch vụ thành công");
      setShowDeleteConfirm(false);
      setServiceToDelete(null);
      setSelectedService(null);
      loadSchedules();
    }
  };

  const handleCompleteClick = (service) => {
    setServiceToComplete(service);
    setShowCompleteForm(true);
    // Pre-fill cost from schedule if available
    setCompleteFormData({
      odometerReading: '',
      cost: service.cost || '',
      serviceProvider: service.technician || '',
      description: service.description || ''
    });
  };

  const handleCompleteConfirm = async (e) => {
    e?.preventDefault();
    if (!serviceToComplete) return;
    
    // Validate required fields
    if (!completeFormData.odometerReading || !completeFormData.cost) {
      showToast.error("Vui lòng điền đầy đủ số Odo và chi phí");
      return;
    }
    
    const result = await completeMaintenance(serviceToComplete.id, {
      odometerReading: parseInt(completeFormData.odometerReading),
      cost: parseFloat(completeFormData.cost),
      serviceProvider: completeFormData.serviceProvider || undefined,
      description: completeFormData.description || undefined,
    });
    
    if (result.success) {
      showToast.success(result.message || "Đánh dấu hoàn thành thành công");
      setShowCompleteForm(false);
      setServiceToComplete(null);
      setSelectedService(null);
      setCompleteFormData({
        odometerReading: '',
        cost: '',
        serviceProvider: '',
        description: ''
      });
      loadSchedules();
    }
  };

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
              <div>
                <h2 className="text-lg lg:text-xl font-bold text-gray-900">
                  Quản lý dịch vụ
                </h2>
                <p className="text-xs lg:text-sm text-gray-600">
                  Theo dõi và quản lý các dịch vụ bảo dưỡng
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 lg:space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setNotificationsOpen(!notificationsOpen);
                    setUserMenuOpen(false);
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
                >
                  <Bell className="w-5 h-5 text-gray-600" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {notificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900">
                          Thông báo
                        </h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                              !notif.read ? "bg-blue-50" : ""
                            }`}
                          >
                            <p className="font-medium text-sm text-gray-900">
                              {notif.title}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {notif.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {notif.time}
                            </p>
                          </div>
                        ))}
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
                    setNotificationsOpen(false);
                  }}
                  className="flex items-center space-x-2 lg:space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 hidden lg:block">
                    {userData.name}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-600 hidden lg:block" />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-gray-100">
                        <p className="font-semibold text-gray-900">
                          {userData.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {userRole === "admin"
                            ? "Quản trị viên"
                            : "Nhân viên"}
                        </p>
                      </div>
                      <div className="p-2">
                        <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-3">
                          <User className="w-4 h-4" />
                          <span>Thông tin cá nhân</span>
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-3 text-red-600"
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

        {/* Service Management Content */}
        <div className="p-4 lg:p-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-6 mb-6 lg:mb-8">
            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">
                    Tổng dịch vụ
                  </p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">
                    {stats.totalServices}
                  </p>
                </div>
                <div className="p-2 lg:p-3 bg-blue-500 rounded-lg text-white shadow-sm">
                  <Wrench className="w-4 h-4 lg:w-6 lg:h-6" />
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
                    {stats.completedServices}
                  </p>
                </div>
                <div className="p-2 lg:p-3 bg-green-500 rounded-lg text-white shadow-sm">
                  <CheckCircle className="w-4 h-4 lg:w-6 lg:h-6" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">
                    Đã lên lịch
                  </p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">
                    {stats.scheduledServices}
                  </p>
                </div>
                <div className="p-2 lg:p-3 bg-amber-500 rounded-lg text-white shadow-sm">
                  <Calendar className="w-4 h-4 lg:w-6 lg:h-6" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">
                    Đang thực hiện
                  </p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">
                    {stats.inProgressServices}
                  </p>
                </div>
                <div className="p-2 lg:p-3 bg-purple-500 rounded-lg text-white shadow-sm">
                  <Clock className="w-4 h-4 lg:w-6 lg:h-6" />
                </div>
              </div>
            </div>

            {userRole === "admin" && (
              <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm font-medium text-gray-600">
                      Tổng chi phí
                    </p>
                    <p className="text-lg lg:text-2xl font-bold text-gray-900">
                      {(stats.totalCost / 1000000).toFixed(1)}M
                    </p>
                  </div>
                  <div className="p-2 lg:p-3 bg-red-500 rounded-lg text-white shadow-sm">
                    <DollarSign className="w-4 h-4 lg:w-6 lg:h-6" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm kiếm dịch vụ theo loại, xe hoặc kỹ thuật viên..."
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
                    className="w-full lg:w-48 appearance-none px-4 py-2 lg:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base bg-gray-50 focus:bg-white transition-colors"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                </div>
                {canAddService && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAddForm(true)}
                    className="bg-blue-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors shadow-sm text-sm lg:text-base"
                  >
                    <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span className="hidden lg:inline font-medium">Thêm dịch vụ</span>
                    <span className="lg:hidden">Thêm</span>
                  </motion.button>
                )}
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          )}

          {/* Services Grid */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {filteredServices.map((service) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all"
                >
                  <div className="p-4 lg:p-6">
                    <div className="flex items-start justify-between mb-3 lg:mb-4">
                      <div className="flex-1">
                        <h3 className="text-base lg:text-lg font-bold text-gray-900 mb-1 lg:mb-2">
                          {service.type}
                        </h3>
                        <div className="flex items-center space-x-2 text-xs lg:text-sm text-gray-600">
                          <Car className="w-3 h-3 lg:w-4 lg:h-4" />
                          <span>{service.car}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span
                          className={`px-2 lg:px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor(
                            service.status
                          )}`}
                        >
                          {getStatusIcon(service.status)}
                          <span>
                            {
                              statusOptions.find(
                                (s) => s.value === service.status
                              )?.label
                            }
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 lg:space-y-3 mb-4 lg:mb-6">
                      <div className="flex justify-between text-xs lg:text-sm">
                        <span className="text-gray-600">Kỹ thuật viên:</span>
                        <span className="font-medium">{service.technician}</span>
                      </div>
                      <div className="flex justify-between text-xs lg:text-sm">
                        <span className="text-gray-600">Ngày lên lịch:</span>
                        <span className="font-medium">
                          {service.scheduledDate}
                        </span>
                      </div>
                      {service.completedDate && (
                        <div className="flex justify-between text-xs lg:text-sm">
                          <span className="text-gray-600">Ngày hoàn thành:</span>
                          <span className="font-medium text-green-600">
                            {service.completedDate}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-xs lg:text-sm">
                        <span className="text-gray-600">Chi phí:</span>
                        <span className="font-semibold text-green-600">
                          {(service.cost / 1000000).toFixed(1)}M VND
                        </span>
                      </div>
                    </div>

                    <div className="mb-4 lg:mb-6">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {service.description}
                      </p>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedService(service)}
                        className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg flex items-center justify-center space-x-1 hover:bg-gray-200 transition-colors text-xs lg:text-sm"
                      >
                        <Eye className="w-3 h-3 lg:w-4 lg:h-4" />
                        <span>Chi tiết</span>
                      </button>
                      {canEditService && service.status !== "completed" && (
                        <button 
                          onClick={() => {
                            setSelectedService(service);
                            setShowEditForm(true);
                          }}
                          className="flex-1 bg-blue-100 text-blue-700 py-2 rounded-lg flex items-center justify-center space-x-1 hover:bg-blue-200 transition-colors text-xs lg:text-sm"
                        >
                          <Edit className="w-3 h-3 lg:w-4 lg:h-4" />
                          <span>Sửa</span>
                        </button>
                      )}
                      {canDeleteService && (
                        <button 
                          onClick={() => handleDeleteClick(service)}
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
          {!loading && filteredServices.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100"
            >
              <Wrench className="w-12 h-12 lg:w-16 lg:h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Không tìm thấy dịch vụ
              </h3>
              <p className="text-gray-600 max-w-sm mx-auto mb-6">
                Thử thay đổi điều kiện tìm kiếm hoặc thêm dịch vụ mới
              </p>
              {canAddService && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Thêm dịch vụ mới
                </button>
              )}
            </motion.div>
          )}
        </div>

        {/* Service Detail Modal */}
        <AnimatePresence>
          {selectedService && !showEditForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-xl lg:rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              >
                <div className="p-4 lg:p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                        {selectedService.type}
                      </h2>
                      <p className="text-gray-600 text-sm lg:text-base">
                        {selectedService.car}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedService(null)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                <div className="p-4 lg:p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-6 lg:mb-8">
                    {/* Service Details */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Thông tin dịch vụ
                      </h4>
                      <div className="space-y-3 lg:space-y-4">
                        <div className="flex justify-between text-sm lg:text-base">
                          <span className="text-gray-600">Loại dịch vụ:</span>
                          <span className="font-medium">
                            {selectedService.type}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm lg:text-base">
                          <span className="text-gray-600">Xe:</span>
                          <span className="font-medium">
                            {selectedService.car}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm lg:text-base">
                          <span className="text-gray-600">Kỹ thuật viên:</span>
                          <span className="font-medium">
                            {selectedService.technician}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm lg:text-base">
                          <span className="text-gray-600">Ngày lên lịch:</span>
                          <span className="font-medium">
                            {selectedService.scheduledDate}
                          </span>
                        </div>
                        {selectedService.completedDate && (
                          <div className="flex justify-between text-sm lg:text-base">
                            <span className="text-gray-600">
                              Ngày hoàn thành:
                            </span>
                            <span className="font-medium text-green-600">
                              {selectedService.completedDate}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm lg:text-base">
                          <span className="text-gray-600">Trạng thái:</span>
                          <span className="font-medium">
                            {
                              statusOptions.find(
                                (s) => s.value === selectedService.status
                              )?.label
                            }
                          </span>
                        </div>
                        <div className="flex justify-between text-sm lg:text-base">
                          <span className="text-gray-600">Ưu tiên:</span>
                          <span className="font-medium">
                            {
                              priorityOptions.find(
                                (p) => p.value === selectedService.priority
                              )?.label
                            }
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Financial Information */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Thông tin tài chính
                      </h4>
                      <div className="space-y-3 lg:space-y-4">
                        <div className="flex justify-between text-sm lg:text-base">
                          <span className="text-gray-600">
                            Chi phí dịch vụ:
                          </span>
                          <span className="font-semibold text-green-600">
                            {(Number(selectedService.cost) || 0).toLocaleString("vi-VN")} VND
                          </span>
                        </div>
                        <div className="flex justify-between text-sm lg:text-base">
                          <span className="text-gray-600">
                            Phương thức thanh toán:
                          </span>
                          <span className="font-medium">
                            Chia đều theo thành viên
                          </span>
                        </div>
                        <div className="flex justify-between text-sm lg:text-base">
                          <span className="text-gray-600">
                            Trạng thái thanh toán:
                          </span>
                          <span className="font-medium text-green-600">
                            Đã thanh toán
                          </span>
                        </div>
                      </div>

                      <div className="mt-6 p-4 lg:p-6 bg-blue-50 rounded-xl border border-blue-200">
                        <h5 className="font-semibold text-blue-900 mb-2">
                          Mô tả dịch vụ
                        </h5>
                        <p className="text-blue-800 text-sm lg:text-base">
                          {selectedService.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Parts List */}
                  {selectedService.parts && selectedService.parts.length > 0 && (
                    <div className="mb-6 lg:mb-8">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Vật tư sử dụng
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedService.parts.map((part, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 lg:p-4 border border-gray-200 rounded-xl"
                          >
                            <div className="flex items-center space-x-3">
                              <Wrench className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
                              <span className="text-gray-900 text-sm lg:text-base">
                                {part}
                              </span>
                            </div>
                            <span className="text-xs lg:text-sm text-gray-500">
                              Đã sử dụng
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col lg:flex-row space-y-3 lg:space-y-0 lg:space-x-3 pt-6 border-t border-gray-200">
                    {selectedService.status !== "completed" && (
                      <button 
                        onClick={() => handleCompleteClick(selectedService)}
                        className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 text-sm lg:text-base"
                      >
                        <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5" />
                        <span>Đánh dấu hoàn thành</span>
                      </button>
                    )}
                    {canEditService && selectedService.status !== "completed" && (
                      <button 
                        onClick={() => setShowEditForm(true)}
                        className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 text-sm lg:text-base"
                      >
                        <Edit className="w-4 h-4 lg:w-5 lg:h-5" />
                        <span>Cập nhật tiến độ</span>
                      </button>
                    )}
                    {canDeleteService && (
                      <button 
                        onClick={() => {
                          handleDeleteClick(selectedService);
                        }}
                        className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 text-sm lg:text-base"
                      >
                        <Trash2 className="w-4 h-4 lg:w-5 lg:h-5" />
                        <span>Xóa dịch vụ</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && serviceToDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-xl p-6 w-full max-w-md"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-red-100 rounded-full">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Xác nhận xóa
                  </h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Bạn có chắc chắn muốn xóa dịch vụ "{serviceToDelete.type}" không? 
                  Hành động này không thể hoàn tác.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setServiceToDelete(null);
                    }}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Xóa</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Complete Maintenance Form Modal */}
        <AnimatePresence>
          {showCompleteForm && serviceToComplete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-green-100 rounded-full">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Hoàn thành bảo trì
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowCompleteForm(false);
                      setServiceToComplete(null);
                      setCompleteFormData({
                        odometerReading: '',
                        cost: '',
                        serviceProvider: '',
                        description: ''
                      });
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Dịch vụ:</strong> {serviceToComplete.type}
                  </p>
                  <p className="text-sm text-blue-900">
                    <strong>Xe:</strong> {serviceToComplete.car}
                  </p>
                </div>

                <form onSubmit={handleCompleteConfirm} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số Odo hiện tại (km) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={completeFormData.odometerReading}
                        onChange={(e) => setCompleteFormData({...completeFormData, odometerReading: e.target.value})}
                        placeholder="15000"
                        min="0"
                        max="1000000"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Chi phí thực tế (VND) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={completeFormData.cost}
                        onChange={(e) => setCompleteFormData({...completeFormData, cost: e.target.value})}
                        placeholder="2000000"
                        min="0"
                        max="1000000000"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nhà cung cấp dịch vụ
                      </label>
                      <input
                        type="text"
                        value={completeFormData.serviceProvider}
                        onChange={(e) => setCompleteFormData({...completeFormData, serviceProvider: e.target.value})}
                        placeholder="VD: Xưởng bảo dưỡng ABC"
                        maxLength="255"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mô tả công việc đã thực hiện
                    </label>
                    <textarea
                      value={completeFormData.description}
                      onChange={(e) => setCompleteFormData({...completeFormData, description: e.target.value})}
                      placeholder="Nhập mô tả chi tiết về công việc đã thực hiện..."
                      rows="4"
                      maxLength="1000"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCompleteForm(false);
                        setServiceToComplete(null);
                        setCompleteFormData({
                          odometerReading: '',
                          cost: '',
                          serviceProvider: '',
                          description: ''
                        });
                      }}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>Hoàn thành</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Add Service Form Modal */}
        <AnimatePresence>
          {showAddForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Plus className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Thêm dịch vụ mới
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setFormData({
                        vehicleId: "",
                        maintenanceType: "",
                        scheduledDate: "",
                        odometerAtSchedule: "",
                        estimatedCost: "",
                        notes: "",
                      });
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                <form onSubmit={handleAddService} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ID Xe <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.vehicleId}
                        onChange={(e) => setFormData({...formData, vehicleId: e.target.value})}
                        placeholder="88888888-8888-8888-8888-888888888881"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Loại bảo trì <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.maintenanceType}
                        onChange={(e) => setFormData({...formData, maintenanceType: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Chọn loại bảo trì</option>
                        <option value="Bảo dưỡng định kỳ">Bảo dưỡng định kỳ</option>
                        <option value="Thay pin">Thay pin</option>
                        <option value="Sửa chữa">Sửa chữa</option>
                        <option value="Kiểm tra kỹ thuật">Kiểm tra kỹ thuật</option>
                        <option value="Rửa xe">Rửa xe</option>
                        <option value="Thay lốp">Thay lốp</option>
                        <option value="Khác">Khác</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngày lên lịch <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.scheduledDate}
                        onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số Odo dự kiến (km)
                      </label>
                      <input
                        type="number"
                        value={formData.odometerAtSchedule}
                        onChange={(e) => setFormData({...formData, odometerAtSchedule: e.target.value})}
                        placeholder="15000"
                        min="0"
                        max="1000000"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Chi phí dự tính (VND)
                      </label>
                      <input
                        type="number"
                        value={formData.estimatedCost}
                        onChange={(e) => setFormData({...formData, estimatedCost: e.target.value})}
                        placeholder="2000000"
                        min="0"
                        max="1000000000"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ghi chú
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Nhập ghi chú về lịch bảo trì..."
                      rows="4"
                      maxLength="1000"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setFormData({
                          vehicleId: "",
                          maintenanceType: "",
                          scheduledDate: "",
                          odometerAtSchedule: "",
                          estimatedCost: "",
                          notes: "",
                        });
                      }}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>Thêm dịch vụ</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Edit Service Form Modal */}
        <AnimatePresence>
          {showEditForm && selectedService && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Edit className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Cập nhật dịch vụ
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowEditForm(false);
                      setSelectedService(null);
                      setFormData({
                        vehicleId: "",
                        maintenanceType: "",
                        scheduledDate: "",
                        odometerAtSchedule: "",
                        estimatedCost: "",
                        notes: "",
                      });
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                <form onSubmit={handleEditService} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Loại bảo trì
                      </label>
                      <select
                        value={formData.maintenanceType || selectedService.maintenanceType}
                        onChange={(e) => setFormData({...formData, maintenanceType: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Giữ nguyên</option>
                        <option value="Bảo dưỡng định kỳ">Bảo dưỡng định kỳ</option>
                        <option value="Thay pin">Thay pin</option>
                        <option value="Sửa chữa">Sửa chữa</option>
                        <option value="Kiểm tra kỹ thuật">Kiểm tra kỹ thuật</option>
                        <option value="Rửa xe">Rửa xe</option>
                        <option value="Thay lốp">Thay lốp</option>
                        <option value="Khác">Khác</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngày lên lịch
                      </label>
                      <input
                        type="date"
                        value={formData.scheduledDate || (selectedService.scheduledDateRaw ? new Date(selectedService.scheduledDateRaw).toISOString().split('T')[0] : '')}
                        onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số Odo dự kiến (km)
                      </label>
                      <input
                        type="number"
                        value={formData.odometerAtSchedule || selectedService.odometerAtSchedule || ''}
                        onChange={(e) => setFormData({...formData, odometerAtSchedule: e.target.value})}
                        placeholder="15000"
                        min="0"
                        max="1000000"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Chi phí dự tính (VND)
                      </label>
                      <input
                        type="number"
                        value={formData.estimatedCost || selectedService.estimatedCost || ''}
                        onChange={(e) => setFormData({...formData, estimatedCost: e.target.value})}
                        placeholder="2000000"
                        min="0"
                        max="1000000000"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Trạng thái
                      </label>
                      <select
                        value={formData.status || selectedService.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="scheduled">Đã lên lịch</option>
                        <option value="in_progress">Đang thực hiện</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="cancelled">Đã hủy</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ghi chú
                    </label>
                    <textarea
                      value={formData.notes || selectedService.notes || ''}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Nhập ghi chú về lịch bảo trì..."
                      rows="4"
                      maxLength="1000"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditForm(false);
                        setSelectedService(null);
                        setFormData({
                          vehicleId: "",
                          maintenanceType: "",
                          scheduledDate: "",
                          odometerAtSchedule: "",
                          estimatedCost: "",
                          notes: "",
                        });
                      }}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>Cập nhật</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ServiceManagement;
