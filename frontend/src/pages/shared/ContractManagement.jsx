import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  Calendar,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  BarChart3,
  Shield,
  ChevronDown,
  X,
  Menu,
  LogOut,
  User,
  Bell,
  PieChart,
  Car,
  Wrench,
  QrCode,
  DollarSign,
  Loader2,
} from "lucide-react";
import { useContractStore } from "../../store/contractStore";
import { useAuthStore } from "../../store/authStore";
import { showToast } from "../../utils/toast";
import { contractAPI, vehicleAPI } from "../../api";

const ContractManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { 
    contracts, 
    loading, 
    error, 
    fetchUserContracts,
    createContract,
    updateContract,
    deleteContract,
    signContract,
    clearError
  } = useContractStore();
  
  // Local user state
  const [userData, setUserData] = useState(user || { name: '', role: 'staff' });
  const [userRole, setUserRole] = useState((user?.role || 'staff').toString().trim().toLowerCase());

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedContract, setSelectedContract] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [contractToDelete, setContractToDelete] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    vehicleId: "",
    groupId: "",
    contractType: "co_ownership",
    startDate: "",
    endDate: "",
    terms: "",
    value: "",
  });

  const [notifications] = useState([
    {
      id: 1,
      title: "Hợp đồng mới",
      message: "HD-2024-010 đã được tạo thành công",
      time: "5 phút trước",
      type: "success",
      read: false,
    },
  ]);

  // Load contracts on mount
  useEffect(() => {
    loadContracts();
  }, []);

  // Local cache for vehicle info keyed by groupId or vehicleId
  const [vehicleMap, setVehicleMap] = useState({});

  // When contracts change, fetch vehicle info for referenced group_ids / vehicle_ids
  useEffect(() => {
    const loadVehicles = async () => {
      if (!contracts) return;
      const dataArray = Array.isArray(contracts) ? contracts : (contracts?.contracts || []);
      const groupIds = new Set();
      const vehicleIds = new Set();

      dataArray.forEach((c) => {
        if (c.group_id) groupIds.add(c.group_id);
        if (c.vehicle_id) vehicleIds.add(c.vehicle_id);
      });

      const map = { ...vehicleMap };

      // Fetch by vehicleId first (higher fidelity)
      await Promise.all(Array.from(vehicleIds).map(async (vid) => {
        if (map[vid]) return;
        try {
          const res = await vehicleAPI.getVehicleById(vid);
          if (res.success && res.data) {
            map[vid] = { name: res.data.name || res.data.title || res.data.model || 'Xe điện', plate: res.data.plate || res.data.license_plate || res.data.plate_number || 'N/A' };
          }
        } catch (e) {
          // ignore
        }
      }));

      // Then fetch by groupId only if we don't already have a vehicle for that group
      await Promise.all(Array.from(groupIds).map(async (gid) => {
        if (map[gid]) return;
        try {
          const res = await vehicleAPI.getVehiclesByGroupId(gid);
          if (res.success && Array.isArray(res.data) && res.data.length > 0) {
            const v = res.data[0];
            map[gid] = { name: v.name || v.title || v.model || 'Xe điện', plate: v.plate || v.license_plate || v.plate_number || 'N/A' };
          }
        } catch (e) {
          // ignore
        }
      }));

      setVehicleMap(map);
    };

    loadVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contracts]);

  const loadContracts = async () => {
    await fetchUserContracts();
  };

  // Handle errors
  useEffect(() => {
    if (error) {
      showToast.error(error);
      clearError();
    }
  }, [error, clearError]);

  useEffect(() => {
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
    { value: "active", label: "Đang hoạt động", color: "green" },
    { value: "pending", label: "Chờ ký", color: "amber" },
    { value: "signed", label: "Đã ký", color: "blue" },
    { value: "draft", label: "Bản nháp", color: "gray" },
    { value: "expired", label: "Hết hạn", color: "red" },
    { value: "terminated", label: "Đã chấm dứt", color: "red" },
    { value: "cancelled", label: "Đã hủy", color: "gray" },
  ];

  // Helper: Extract vehicle info from contract content
  const extractVehicleFromContent = (content) => {
    if (!content) return null;
    // Parse from: "Phương tiện: Tesla Model 3 (Biển số: 51A-12345)"
    const match = content.match(/Phương tiện:\s*([^(]+)\s*\(Biển số:\s*([^)]+)\)/);
    if (match) {
      return {
        name: match[1].trim(),
        plate: match[2].trim()
      };
    }
    return null;
  };

  // Helper: Map group_id to vehicle info (from seed data)
  const getVehicleByGroupId = (groupId) => {
    const groupVehicleMap = {
      '77777777-7777-7777-7777-777777777771': { name: 'Tesla Model 3 - Silver Edition', plate: '30A-12345' },
      '77777777-7777-7777-7777-777777777772': { name: 'VinFast VF e34 - Pearl White', plate: '51G-67890' },
      '77777777-7777-7777-7777-777777777773': { name: 'Hyundai Ioniq 5 - Atlas White', plate: '30K-11111' },
    };
    return groupVehicleMap[groupId] || null;
  };

  // Use contracts from store with proper mapping - handle both array and object with contracts property
  const contractsData = Array.isArray(contracts) ? contracts : (contracts?.contracts || []);
  
  const contractsList = contractsData.map((contract) => {
  // Try to get vehicle info from multiple sources: content -> vehicleMap (API) -> legacy group map
  const vehicleFromContent = extractVehicleFromContent(contract.content);
  const vehicleFromMap = vehicleMap[contract.vehicle_id] || vehicleMap[contract.group_id];
  const vehicleFromGroup = getVehicleByGroupId(contract.group_id);
  const vehicle = vehicleFromContent || vehicleFromMap || vehicleFromGroup || { name: "Xe điện", plate: "N/A" };

    // Normalize date fields: backend may use effective_date/expiry_date or start_date/end_date
    const startRaw = contract.effective_date || contract.start_date || contract.startDate;
    const endRaw = contract.expiry_date || contract.end_date || contract.endDate;
    const startDate = startRaw ? new Date(startRaw).toLocaleDateString("vi-VN") : "";
    const endDate = endRaw ? new Date(endRaw).toLocaleDateString("vi-VN") : "";

    return {
      id: contract.id,
      contractNumber:
        contract.contract_number || contract.contractNumber || (contract.id ? `HD-${String(contract.id).slice(0, 8)}` : ""),
      parties: contract.parties || [],
      car: `${vehicle.name} (${vehicle.plate})`,
      vehicleName: vehicle.name,
      vehiclePlate: vehicle.plate,
      vehicleId: contract.vehicle_id || contract.vehicleId,
      groupId: contract.group_id || contract.groupId,
      startDate,
      endDate,
      status: contract.status || "pending",
      contractType: contract.contract_type || contract.contractType || "co_ownership",
  value: Number(contract.total_value ?? contract.value ?? 0) || 0,
      // Prefer explicit description, then content (seed embeds vehicle info there), then terms
      description: contract.description || contract.content || contract.terms || "",
      createdAt: contract.created_at || contract.createdAt,
    };
  });

  const filteredContracts = contractsList.filter((contract) => {
    const matchesSearch =
      contract.contractNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.parties?.some((party) =>
        party?.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      contract.car.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || contract.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalContracts: contractsList.length,
    activeContracts: contractsList.filter((c) => c.status === "active").length,
    pendingContracts: contractsList.filter((c) => c.status === "pending").length,
    expiredContracts: contractsList.filter((c) => c.status === "expired").length,
    totalValue: contractsList.reduce((sum, contract) => sum + contract.value, 0),
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
      case "signed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "pending":
      case "draft":
        return <Clock className="w-4 h-4 text-amber-600" />;
      case "expired":
      case "terminated":
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "signed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "draft":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "expired":
      case "terminated":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Role-based permissions
  const canAddContract = userRole === "admin";
  const canEditContract = userRole === "admin";
  const canDeleteContract = userRole === "admin";
  const canExport = userRole === "admin";

  const getActiveTab = () => {
    const currentPath = location.pathname;
    const menuItem = menuItems.find((item) => item.link === currentPath);
    return menuItem ? menuItem.id : "contracts";
  };

  const activeTab = getActiveTab();

  // CRUD Handlers
  const handleDeleteClick = (contract) => {
    setContractToDelete(contract);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!contractToDelete) return;
    
    const result = await deleteContract(contractToDelete.id);
    if (result.success) {
      showToast.success(result.message || "Xóa hợp đồng thành công");
      setShowDeleteConfirm(false);
      setContractToDelete(null);
      setSelectedContract(null);
      loadContracts();
    }
  };

  // Download contract PDF
  const handleDownload = async (contractId, filename = "contract") => {
    try {
      const result = await contractAPI.downloadContract(contractId);
      if (!result.success) {
        showToast.error(result.message || "Không thể tải xuống");
        return;
      }

      const blob = new Blob([result.data], { type: result.data.type || 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename || 'contract'}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast.success('Bắt đầu tải xuống');
    } catch (error) {
      showToast.error(error.message || 'Lỗi khi tải xuống hợp đồng');
    }
  };

  const handleSignContract = async (contractId) => {
    const result = await signContract(contractId, {});
    if (result.success) {
      showToast.success(result.message || "Ký hợp đồng thành công");
      loadContracts();
    }
  };

  const handleCreateContract = async () => {
    if (!createFormData.vehicleId || !createFormData.groupId || !createFormData.startDate || !createFormData.endDate) {
      showToast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    const result = await createContract({
      vehicle_id: createFormData.vehicleId,
      group_id: createFormData.groupId,
      contract_type: createFormData.contractType,
      start_date: createFormData.startDate,
      end_date: createFormData.endDate,
      terms: createFormData.terms,
      total_value: parseFloat(createFormData.value) || 0,
    });

    if (result.success) {
      showToast.success(result.message || "Tạo hợp đồng thành công");
      setShowCreateModal(false);
      setCreateFormData({
        vehicleId: "",
        groupId: "",
        contractType: "co_ownership",
        startDate: "",
        endDate: "",
        terms: "",
        value: "",
      });
      loadContracts();
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
                  Quản lý hợp đồng
                </h2>
                <p className="text-xs lg:text-sm text-gray-600">
                  Hợp đồng pháp lý điện tử và e-contract
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

        {/* Contract Management Content */}
        <div className="p-4 lg:p-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-6 mb-6 lg:mb-8">
            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">
                    Tổng hợp đồng
                  </p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">
                    {stats.totalContracts}
                  </p>
                </div>
                <div className="p-2 lg:p-3 bg-blue-500 rounded-lg text-white shadow-sm">
                  <FileText className="w-4 h-4 lg:w-6 lg:h-6" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">
                    Đang hoạt động
                  </p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">
                    {stats.activeContracts}
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
                    Chờ ký
                  </p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">
                    {stats.pendingContracts}
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
                    Hết hạn
                  </p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">
                    {stats.expiredContracts}
                  </p>
                </div>
                <div className="p-2 lg:p-3 bg-red-500 rounded-lg text-white shadow-sm">
                  <AlertTriangle className="w-4 h-4 lg:w-6 lg:h-6" />
                </div>
              </div>
            </div>

            {userRole === "admin" && (
              <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm font-medium text-gray-600">
                      Tổng giá trị
                    </p>
                    <p className="text-lg lg:text-2xl font-bold text-gray-900">
                      {(stats.totalValue / 1000000).toFixed(1)}M
                    </p>
                  </div>
                  <div className="p-2 lg:p-3 bg-purple-500 rounded-lg text-white shadow-sm">
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
                  placeholder="Tìm kiếm hợp đồng theo mã, bên tham gia hoặc xe..."
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
                {canAddContract && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 lg:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm lg:text-base whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span>Thêm hợp đồng</span>
                  </button>
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

          {/* Contracts Grid */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {filteredContracts.map((contract) => (
                <motion.div
                  key={contract.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all"
                >
                  <div className="p-4 lg:p-6">
                    <div className="flex items-start justify-between mb-3 lg:mb-4">
                      <div className="flex-1">
                        <h3 className="text-base lg:text-lg font-bold text-gray-900 mb-1 lg:mb-2">
                          {contract.contractNumber}
                        </h3>
                        <div className="flex items-center space-x-2 text-xs lg:text-sm text-gray-600">
                          <Users className="w-3 h-3 lg:w-4 lg:h-4" />
                          <span>{contract.parties.length || 0} bên</span>
                        </div>
                      </div>
                      <span
                        className={`px-2 lg:px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor(
                          contract.status
                        )}`}
                      >
                        {getStatusIcon(contract.status)}
                        <span>
                          {
                            statusOptions.find(
                              (s) => s.value === contract.status
                            )?.label
                          }
                        </span>
                      </span>
                    </div>

                    <div className="space-y-2 lg:space-y-3 mb-4 lg:mb-6">
                      <div className="flex justify-between text-xs lg:text-sm">
                        <span className="text-gray-600">Xe:</span>
                        <span className="font-medium">{contract.car}</span>
                      </div>
                      <div className="flex justify-between text-xs lg:text-sm">
                        <span className="text-gray-600">Ngày bắt đầu:</span>
                        <span className="font-medium">
                          {contract.startDate}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs lg:text-sm">
                        <span className="text-gray-600">Ngày kết thúc:</span>
                        <span className="font-medium">{contract.endDate}</span>
                      </div>
                      <div className="flex justify-between text-xs lg:text-sm">
                        <span className="text-gray-600">Giá trị:</span>
                        <span className="font-semibold text-green-600">
                          {(contract.value / 1000000).toFixed(1)}M VND
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedContract(contract)}
                        className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg flex items-center justify-center space-x-1 hover:bg-gray-200 transition-colors text-xs lg:text-sm"
                      >
                        <Eye className="w-3 h-3 lg:w-4 lg:h-4" />
                        <span>Chi tiết</span>
                      </button>
                      {contract.status === "pending" && (
                        <button 
                          onClick={() => handleSignContract(contract.id)}
                          disabled={loading}
                          className="flex-1 bg-green-100 text-green-700 py-2 rounded-lg flex items-center justify-center space-x-1 hover:bg-green-200 transition-colors text-xs lg:text-sm disabled:opacity-50"
                        >
                          <CheckCircle className="w-3 h-3 lg:w-4 lg:h-4" />
                          <span>Ký</span>
                        </button>
                      )}
                      {canDeleteContract && (
                        <button 
                          onClick={() => handleDeleteClick(contract)}
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
          {!loading && filteredContracts.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100"
            >
              <FileText className="w-12 h-12 lg:w-16 lg:h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Không tìm thấy hợp đồng
              </h3>
              <p className="text-gray-600 max-w-sm mx-auto mb-6">
                Thử thay đổi điều kiện tìm kiếm hoặc thêm hợp đồng mới
              </p>
            </motion.div>
          )}
        </div>

        {/* Contract Detail Modal */}
        <AnimatePresence>
          {selectedContract && (
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
                        {selectedContract.contractNumber}
                      </h2>
                      <p className="text-gray-600 text-sm lg:text-base">
                        {selectedContract.car}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedContract(null)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                <div className="p-4 lg:p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Thông tin hợp đồng
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Mã hợp đồng:</span>
                          <span className="font-medium">
                            {selectedContract.contractNumber}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Loại hợp đồng:</span>
                          <span className="font-medium">
                            {selectedContract.contractType === 'co_ownership' ? 'Đồng sở hữu' : 
                             selectedContract.contractType === 'rental' ? 'Thuê xe' : 
                             selectedContract.contractType === 'lease' ? 'Cho thuê dài hạn' : 
                             selectedContract.contractType}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">ID Xe:</span>
                          <span className="font-medium text-xs">
                            {selectedContract.vehicleId || selectedContract.car}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">ID Nhóm:</span>
                          <span className="font-medium text-xs">
                            {selectedContract.groupId || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ngày bắt đầu:</span>
                          <span className="font-medium">
                            {selectedContract.startDate}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ngày kết thúc:</span>
                          <span className="font-medium">
                            {selectedContract.endDate}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Trạng thái:</span>
                          <span className="font-medium">
                            {
                              statusOptions.find(
                                (s) => s.value === selectedContract.status
                              )?.label
                            }
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Các bên tham gia
                      </h4>
                      {selectedContract.parties && selectedContract.parties.length > 0 ? (
                        <div className="space-y-2 mb-4">
                          {selectedContract.parties.map((party, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {party.party_role || party.partyRole || 'Bên tham gia'}
                                </p>
                                <p className="text-xs text-gray-600">
                                  User ID: {party.user_id?.slice(0, 8) || party.userId?.slice(0, 8) || 'N/A'}...
                                </p>
                              </div>
                              {(party.has_signed || party.hasSigned) && (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 mb-4">Chưa có bên tham gia</p>
                      )}

                      <h4 className="text-lg font-semibold text-gray-900 mb-2 mt-6">
                        Thông tin tài chính
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Giá trị hợp đồng:</span>
                          <span className="font-semibold text-green-600">
                            {(Number(selectedContract.value) || 0).toLocaleString("vi-VN")} VND
                          </span>
                        </div>
                      </div>

                      {selectedContract.description && (
                        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                          <h5 className="font-semibold text-blue-900 mb-2">
                            Điều khoản
                          </h5>
                          <p className="text-blue-800 text-sm whitespace-pre-wrap">
                            {selectedContract.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col lg:flex-row space-y-3 lg:space-y-0 lg:space-x-3 pt-6 border-t border-gray-200">
                    {selectedContract.status === "pending" && (
                      <button 
                        onClick={() => handleSignContract(selectedContract.id)}
                        disabled={loading}
                        className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                      >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        <CheckCircle className="w-5 h-5" />
                        <span>Ký hợp đồng</span>
                      </button>
                    )}
                    <button onClick={() => handleDownload(selectedContract.id, selectedContract.contractNumber)} className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                      <Download className="w-5 h-5" />
                      <span>Tải xuống</span>
                    </button>
                    {canDeleteContract && (
                      <button 
                        onClick={() => {
                          handleDeleteClick(selectedContract);
                        }}
                        className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Trash2 className="w-5 h-5" />
                        <span>Xóa hợp đồng</span>
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
          {showDeleteConfirm && contractToDelete && (
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
                  Bạn có chắc chắn muốn xóa hợp đồng "{contractToDelete.contractNumber}" không? 
                  Hành động này không thể hoàn tác.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setContractToDelete(null);
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

        {/* Create Contract Modal */}
        <AnimatePresence>
          {showCreateModal && (
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
                      Tạo hợp đồng mới
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ID Xe <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={createFormData.vehicleId}
                        onChange={(e) => setCreateFormData({...createFormData, vehicleId: e.target.value})}
                        placeholder="88888888-8888-8888-8888-888888888881"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ID Nhóm <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={createFormData.groupId}
                        onChange={(e) => setCreateFormData({...createFormData, groupId: e.target.value})}
                        placeholder="77777777-7777-7777-7777-777777777771"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Loại hợp đồng
                      </label>
                      <select
                        value={createFormData.contractType}
                        onChange={(e) => setCreateFormData({...createFormData, contractType: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="co_ownership">Đồng sở hữu</option>
                        <option value="rental">Thuê xe</option>
                        <option value="lease">Cho thuê dài hạn</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giá trị (VND)
                      </label>
                      <input
                        type="number"
                        value={createFormData.value}
                        onChange={(e) => setCreateFormData({...createFormData, value: e.target.value})}
                        placeholder="500000000"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngày bắt đầu <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={createFormData.startDate}
                        onChange={(e) => setCreateFormData({...createFormData, startDate: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngày kết thúc <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={createFormData.endDate}
                        onChange={(e) => setCreateFormData({...createFormData, endDate: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Điều khoản hợp đồng
                    </label>
                    <textarea
                      value={createFormData.terms}
                      onChange={(e) => setCreateFormData({...createFormData, terms: e.target.value})}
                      placeholder="Nhập các điều khoản và điều kiện của hợp đồng..."
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleCreateContract}
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Tạo hợp đồng</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ContractManagement;
