import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Wrench, Plus, Search, Filter, Edit, Trash2, Car, Calendar, Clock, CheckCircle, AlertTriangle, BarChart3, Download, Eye, Users, DollarSign, ChevronDown, X, MoreVertical, Bell, User, LogOut, Menu, FileText, PieChart } from "lucide-react";

const ServiceManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedService, setSelectedService] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Menu items cho sidebar
  const menuItems = [
    { id: "overview", label: "Tổng quan", icon: <BarChart3 className="w-5 h-5" />, link: "/admin" },
    { id: "cars", label: "Quản lý xe", icon: <Car className="w-5 h-5" />, link: "/admin/cars" },
    { id: "staff", label: "Nhân viên", icon: <Users className="w-5 h-5" />, link: "/admin/staff" },
    { id: "contracts", label: "Hợp đồng", icon: <FileText className="w-5 h-5" />, link: "/admin/contracts" },
    { id: "services", label: "Dịch vụ xe", icon: <Wrench className="w-5 h-5" />, link: "/admin/services" },
    { id: "disputes", label: "Tranh chấp", icon: <AlertTriangle className="w-5 h-5" />, link: "/admin/disputes" },
    { id: "reports", label: "Báo cáo TC", icon: <PieChart className="w-5 h-5" />, link: "/admin/financial-reports" }
  ];

  const getActiveTab = () => {
    const currentPath = location.pathname;
    const menuItem = menuItems.find(item => item.link === currentPath);
    return menuItem ? menuItem.id : "overview";
  };

  const activeTab = getActiveTab();

  const services = [
    {
      id: 1,
      type: "Bảo dưỡng định kỳ",
      car: "VF e34 - 29A-123.45",
      scheduledDate: "15/12/2024",
      completedDate: "",
      status: "scheduled",
      cost: 2500000,
      technician: "Lê Văn C",
      description: "Bảo dưỡng định kỳ 10,000km",
      parts: ["Dầu phanh", "Lọc gió", "Kiểm tra pin"],
      priority: "medium"
    },
    {
      id: 2,
      type: "Sửa chữa phanh",
      car: "VinFast VF 8 - 29A-678.90",
      scheduledDate: "12/11/2024",
      completedDate: "14/11/2024",
      status: "completed",
      cost: 8500000,
      technician: "Nguyễn Văn A",
      description: "Thay thế hệ thống phanh trước",
      parts: ["Má phanh trước", "Dầu phanh", "Rotor"],
      priority: "high"
    },
    {
      id: 3,
      type: "Thay pin",
      car: "VF 9 - 29B-123.45",
      scheduledDate: "20/12/2024",
      completedDate: "",
      status: "scheduled",
      cost: 12000000,
      technician: "Trần Thị B",
      description: "Thay thế pin chính",
      parts: ["Pin lithium 75kWh", "Hệ thống làm mát"],
      priority: "high"
    },
    {
      id: 4,
      type: "Vệ sinh nội thất",
      car: "VF e34 - 30A-543.21",
      scheduledDate: "18/11/2024",
      completedDate: "18/11/2024",
      status: "completed",
      cost: 800000,
      technician: "Phạm Thị D",
      description: "Vệ sinh toàn bộ nội thất",
      parts: ["Chất tẩy rửa", "Bộ vệ sinh"],
      priority: "low"
    }
  ];

  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái", color: "gray" },
    { value: "scheduled", label: "Đã lên lịch", color: "blue" },
    { value: "in_progress", label: "Đang thực hiện", color: "amber" },
    { value: "completed", label: "Hoàn thành", color: "green" },
    { value: "cancelled", label: "Đã hủy", color: "red" }
  ];

  const priorityOptions = [
    { value: "low", label: "Thấp", color: "gray" },
    { value: "medium", label: "Trung bình", color: "amber" },
    { value: "high", label: "Cao", color: "red" }
  ];

  const serviceTypes = [
    "Bảo dưỡng định kỳ",
    "Sửa chữa phanh",
    "Thay pin",
    "Vệ sinh nội thất",
    "Sửa chữa điện",
    "Bảo dưỡng điều hòa",
    "Thay lốp",
    "Kiểm tra tổng thể"
  ];

  const filteredServices = services.filter(service => {
    const matchesSearch = service.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.car.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.technician.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || service.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalServices: services.length,
    completedServices: services.filter(s => s.status === 'completed').length,
    scheduledServices: services.filter(s => s.status === 'scheduled').length,
    totalCost: services.reduce((sum, service) => sum + service.cost, 0)
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-amber-600" />;
      case 'scheduled': return <Calendar className="w-4 h-4 text-blue-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
                  <p className="text-sm font-medium text-gray-900">Admin User</p>
                  <p className="text-xs text-gray-600">Quản trị viên</p>
                </div>
                <button 
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => {
                    console.log('Đăng xuất');
                  }}
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
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Quản lý dịch vụ</h1>
                <p className="text-gray-600 text-sm lg:text-base">Quản lý thực hiện các dịch vụ xe và bảo dưỡng</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Search Bar */}
              <div className="relative hidden md:block">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 text-sm bg-gray-50 focus:bg-white transition-colors"
                />
              </div>

              {/* Notifications */}
              <div className="relative">
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                </button>
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium text-gray-900">Admin User</p>
                  <p className="text-xs text-gray-600">Quản trị viên</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                  <User className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 lg:p-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Tổng dịch vụ</p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">{stats.totalServices}</p>
                </div>
                <div className="p-2 lg:p-3 bg-blue-500 rounded-lg text-white shadow-sm">
                  <Wrench className="w-4 h-4 lg:w-6 lg:h-6" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Đã hoàn thành</p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">{stats.completedServices}</p>
                </div>
                <div className="p-2 lg:p-3 bg-green-500 rounded-lg text-white shadow-sm">
                  <CheckCircle className="w-4 h-4 lg:w-6 lg:h-6" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Đã lên lịch</p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">{stats.scheduledServices}</p>
                </div>
                <div className="p-2 lg:p-3 bg-amber-500 rounded-lg text-white shadow-sm">
                  <Calendar className="w-4 h-4 lg:w-6 lg:h-6" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Tổng chi phí</p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">{(stats.totalCost / 1000000).toFixed(1)}M</p>
                </div>
                <div className="p-2 lg:p-3 bg-purple-500 rounded-lg text-white shadow-sm">
                  <DollarSign className="w-4 h-4 lg:w-6 lg:h-6" />
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
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base bg-gray-50 focus:bg-white appearance-none"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
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
                <button className="hidden lg:flex items-center space-x-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  <Filter className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
                  <span>Lọc nâng cao</span>
                </button>
                <button className="hidden lg:flex items-center space-x-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  <Download className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
                  <span>Xuất DS</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Filters Modal */}
          <AnimatePresence>
            {mobileFiltersOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end lg:hidden z-40">
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  className="bg-white rounded-t-2xl w-full p-6 max-h-[80vh] overflow-y-auto"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Bộ lọc</h3>
                    <button 
                      onClick={() => setMobileFiltersOpen(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {statusOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        Đặt lại
                      </button>
                      <button 
                        onClick={() => setMobileFiltersOpen(false)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Áp dụng
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Add Service Button for Mobile */}
          <div className="lg:hidden mb-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddForm(true)}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Thêm dịch vụ</span>
            </motion.button>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
            {filteredServices.map((service) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden group"
              >
                <div className="p-4 lg:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">{service.type}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                        <Car className="w-4 h-4" />
                        <span>{service.car}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-2 lg:px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(service.priority)}`}>
                        {priorityOptions.find(p => p.value === service.priority)?.label}
                      </span>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(service.status)}
                        <span className={`text-xs font-medium border px-2 py-1 rounded-full ${getStatusColor(service.status)}`}>
                          {statusOptions.find(s => s.value === service.status)?.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 lg:space-y-3 mb-4 lg:mb-6">
                    <div className="flex justify-between text-xs lg:text-sm">
                      <span className="text-gray-600">Kỹ thuật viên:</span>
                      <span className="font-medium">{service.technician}</span>
                    </div>
                    <div className="flex justify-between text-xs lg:text-sm">
                      <span className="text-gray-600">Ngày lên lịch:</span>
                      <span className="font-medium">{service.scheduledDate}</span>
                    </div>
                    {service.completedDate && (
                      <div className="flex justify-between text-xs lg:text-sm">
                        <span className="text-gray-600">Ngày hoàn thành:</span>
                        <span className="font-medium text-green-600">{service.completedDate}</span>
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
                    <p className="text-sm text-gray-600 line-clamp-2">{service.description}</p>
                  </div>

                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setSelectedService(service)}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg flex items-center justify-center space-x-1 hover:bg-gray-200 transition-colors text-xs lg:text-sm"
                    >
                      <Eye className="w-3 h-3 lg:w-4 lg:h-4" />
                      <span>Chi tiết</span>
                    </button>
                    <button className="flex-1 bg-blue-100 text-blue-700 py-2 rounded-lg flex items-center justify-center space-x-1 hover:bg-blue-200 transition-colors text-xs lg:text-sm">
                      <Edit className="w-3 h-3 lg:w-4 lg:h-4" />
                      <span>Sửa</span>
                    </button>
                    <button className="flex-1 bg-red-100 text-red-700 py-2 rounded-lg flex items-center justify-center space-x-1 hover:bg-red-200 transition-colors text-xs lg:text-sm">
                      <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />
                      <span>Xóa</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredServices.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100"
            >
              <Wrench className="w-12 h-12 lg:w-16 lg:h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy dịch vụ</h3>
              <p className="text-gray-600 max-w-sm mx-auto mb-6">Thử thay đổi điều kiện tìm kiếm hoặc thêm dịch vụ mới</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Thêm dịch vụ mới
              </button>
            </motion.div>
          )}
        </main>
      </div>

      {/* Service Detail Modal */}
      <AnimatePresence>
        {selectedService && (
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
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900">{selectedService.type}</h2>
                    <p className="text-gray-600 text-sm lg:text-base">{selectedService.car}</p>
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
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Thông tin dịch vụ</h4>
                    <div className="space-y-3 lg:space-y-4">
                      <div className="flex justify-between text-sm lg:text-base">
                        <span className="text-gray-600">Loại dịch vụ:</span>
                        <span className="font-medium">{selectedService.type}</span>
                      </div>
                      <div className="flex justify-between text-sm lg:text-base">
                        <span className="text-gray-600">Xe:</span>
                        <span className="font-medium">{selectedService.car}</span>
                      </div>
                      <div className="flex justify-between text-sm lg:text-base">
                        <span className="text-gray-600">Kỹ thuật viên:</span>
                        <span className="font-medium">{selectedService.technician}</span>
                      </div>
                      <div className="flex justify-between text-sm lg:text-base">
                        <span className="text-gray-600">Ngày lên lịch:</span>
                        <span className="font-medium">{selectedService.scheduledDate}</span>
                      </div>
                      {selectedService.completedDate && (
                        <div className="flex justify-between text-sm lg:text-base">
                          <span className="text-gray-600">Ngày hoàn thành:</span>
                          <span className="font-medium text-green-600">{selectedService.completedDate}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm lg:text-base">
                        <span className="text-gray-600">Trạng thái:</span>
                        <span className="font-medium">
                          {statusOptions.find(s => s.value === selectedService.status)?.label}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm lg:text-base">
                        <span className="text-gray-600">Ưu tiên:</span>
                        <span className="font-medium">
                          {priorityOptions.find(p => p.value === selectedService.priority)?.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Financial Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Thông tin tài chính</h4>
                    <div className="space-y-3 lg:space-y-4">
                      <div className="flex justify-between text-sm lg:text-base">
                        <span className="text-gray-600">Chi phí dịch vụ:</span>
                        <span className="font-semibold text-green-600">
                          {selectedService.cost.toLocaleString('vi-VN')} VND
                        </span>
                      </div>
                      <div className="flex justify-between text-sm lg:text-base">
                        <span className="text-gray-600">Phương thức thanh toán:</span>
                        <span className="font-medium">Chia đều theo thành viên</span>
                      </div>
                      <div className="flex justify-between text-sm lg:text-base">
                        <span className="text-gray-600">Trạng thái thanh toán:</span>
                        <span className="font-medium text-green-600">Đã thanh toán</span>
                      </div>
                    </div>

                    <div className="mt-6 p-4 lg:p-6 bg-blue-50 rounded-xl border border-blue-200">
                      <h5 className="font-semibold text-blue-900 mb-2">Mô tả dịch vụ</h5>
                      <p className="text-blue-800 text-sm lg:text-base">{selectedService.description}</p>
                    </div>
                  </div>
                </div>

                {/* Parts List */}
                <div className="mb-6 lg:mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Vật tư sử dụng</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedService.parts.map((part, index) => (
                      <div key={index} className="flex items-center justify-between p-3 lg:p-4 border border-gray-200 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <Wrench className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
                          <span className="text-gray-900 text-sm lg:text-base">{part}</span>
                        </div>
                        <span className="text-xs lg:text-sm text-gray-500">Đã sử dụng</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col lg:flex-row space-y-3 lg:space-y-0 lg:space-x-3 pt-6 border-t border-gray-200">
                  {selectedService.status !== 'completed' && (
                    <button className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 text-sm lg:text-base">
                      <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5" />
                      <span>Đánh dấu hoàn thành</span>
                    </button>
                  )}
                  <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 text-sm lg:text-base">
                    <Edit className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span>Cập nhật tiến độ</span>
                  </button>
                  <button className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 text-sm lg:text-base">
                    <BarChart3 className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span>Báo cáo chi phí</span>
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

export default ServiceManagement;