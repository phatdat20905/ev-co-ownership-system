import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Car, Plus, Search, Filter, Edit, Trash2, Users, Battery, MapPin, Calendar, Wrench, Eye, QrCode, BarChart3, Download, Zap, ChevronDown, X, MoreVertical, Bell, User, LogOut, Menu, FileText, AlertTriangle, PieChart } from "lucide-react";


const CarManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCar, setSelectedCar] = useState(null);
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

  const cars = [
    {
      id: 1,
      name: "VF e34",
      license: "29A-123.45",
      model: "2024",
      battery: 85,
      status: "active",
      location: "Q.1, TP.HCM",
      coOwners: 4,
      utilization: 78,
      nextMaintenance: "15/12/2024",
      lastService: "15/11/2024",
      totalRevenue: 18450000,
      image: "/api/placeholder/300/200"
    },
    {
      id: 2,
      name: "VinFast VF 8",
      license: "29A-678.90",
      model: "2024",
      battery: 92,
      status: "maintenance",
      location: "Q.3, TP.HCM",
      coOwners: 3,
      utilization: 65,
      nextMaintenance: "Đang bảo dưỡng",
      lastService: "10/11/2024",
      totalRevenue: 15680000,
      image: "/api/placeholder/300/200"
    },
    {
      id: 3,
      name: "VF 9",
      license: "29B-123.45",
      model: "2024",
      battery: 78,
      status: "active",
      location: "Q.7, TP.HCM",
      coOwners: 5,
      utilization: 82,
      nextMaintenance: "20/12/2024",
      lastService: "12/11/2024",
      totalRevenue: 21450000,
      image: "/api/placeholder/300/200"
    },
    {
      id: 4,
      name: "VF e34",
      license: "30A-543.21",
      model: "2023",
      battery: 91,
      status: "active",
      location: "Q.2, TP.HCM",
      coOwners: 4,
      utilization: 71,
      nextMaintenance: "18/12/2024",
      lastService: "08/11/2024",
      totalRevenue: 17230000,
      image: "/api/placeholder/300/200"
    }
  ];

  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái", color: "gray" },
    { value: "active", label: "Đang hoạt động", color: "green" },
    { value: "maintenance", label: "Bảo dưỡng", color: "amber" },
    { value: "inactive", label: "Ngừng hoạt động", color: "red" }
  ];

  const filteredCars = cars.filter(car => {
    const matchesSearch = car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         car.license.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         car.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || car.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalCars: cars.length,
    activeCars: cars.filter(car => car.status === 'active').length,
    inMaintenance: cars.filter(car => car.status === 'maintenance').length,
    totalRevenue: cars.reduce((sum, car) => sum + car.totalRevenue, 0)
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'maintenance': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'inactive': return 'bg-red-100 text-red-800 border-red-200';
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
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Quản lý xe</h1>
                <p className="text-gray-600 text-sm lg:text-base">Quản lý nhóm xe đồng sở hữu và thông tin chi tiết</p>
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
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Tổng số xe</p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">{stats.totalCars}</p>
                </div>
                <div className="p-2 lg:p-3 bg-blue-500 rounded-lg text-white shadow-sm">
                  <Car className="w-4 h-4 lg:w-6 lg:h-6" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Đang hoạt động</p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">{stats.activeCars}</p>
                </div>
                <div className="p-2 lg:p-3 bg-green-500 rounded-lg text-white shadow-sm">
                  <Zap className="w-4 h-4 lg:w-6 lg:h-6" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Đang bảo dưỡng</p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">{stats.inMaintenance}</p>
                </div>
                <div className="p-2 lg:p-3 bg-amber-500 rounded-lg text-white shadow-sm">
                  <Wrench className="w-4 h-4 lg:w-6 lg:h-6" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Tổng doanh thu</p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">{(stats.totalRevenue / 1000000).toFixed(1)}M</p>
                </div>
                <div className="p-2 lg:p-3 bg-purple-500 rounded-lg text-white shadow-sm">
                  <BarChart3 className="w-4 h-4 lg:w-6 lg:h-6" />
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
                  placeholder="Tìm kiếm xe theo tên, biển số hoặc vị trí..."
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

          {/* Add Car Button for Mobile */}
          <div className="lg:hidden mb-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddForm(true)}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Thêm xe mới</span>
            </motion.button>
          </div>

          {/* Cars Grid */}
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
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(car.status)}`}>
                      {statusOptions.find(s => s.value === car.status)?.label}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <button className="p-1.5 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors">
                      <MoreVertical className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  <div className="absolute bottom-3 left-3 text-white">
                    <h3 className="text-lg lg:text-xl font-bold">{car.name}</h3>
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
                      <span className="font-medium">{car.model}</span>
                    </div>
                    <div className="flex justify-between text-xs lg:text-sm">
                      <span className="text-gray-600">Bảo dưỡng tiếp:</span>
                      <span className="font-medium">{car.nextMaintenance}</span>
                    </div>
                    <div className="flex justify-between text-xs lg:text-sm">
                      <span className="text-gray-600">Doanh thu:</span>
                      <span className="font-medium text-green-600">
                        {(car.totalRevenue / 1000000).toFixed(1)}M
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setSelectedCar(car)}
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

          {filteredCars.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100"
            >
              <Car className="w-12 h-12 lg:w-16 lg:h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy xe</h3>
              <p className="text-gray-600 max-w-sm mx-auto mb-6">Thử thay đổi điều kiện tìm kiếm hoặc thêm xe mới</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Thêm xe mới
              </button>
            </motion.div>
          )}
        </main>
      </div>

      {/* Car Detail Modal */}
      <AnimatePresence>
        {selectedCar && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl lg:rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="h-48 lg:h-64 bg-gradient-to-br from-blue-500 to-blue-600 relative">
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedCar.status)}`}>
                    {statusOptions.find(s => s.value === selectedCar.status)?.label}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedCar(null)}
                  className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl lg:text-2xl font-bold">{selectedCar.name}</h3>
                  <p className="text-white/80">{selectedCar.license} • {selectedCar.model}</p>
                </div>
              </div>

              <div className="p-4 lg:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                  {/* Car Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Thông tin xe</h4>
                    <div className="space-y-3 lg:space-y-4">
                      <div className="flex justify-between text-sm lg:text-base">
                        <span className="text-gray-600">Biển số:</span>
                        <span className="font-medium">{selectedCar.license}</span>
                      </div>
                      <div className="flex justify-between text-sm lg:text-base">
                        <span className="text-gray-600">Model:</span>
                        <span className="font-medium">{selectedCar.model}</span>
                      </div>
                      <div className="flex justify-between text-sm lg:text-base">
                        <span className="text-gray-600">Vị trí hiện tại:</span>
                        <span className="font-medium">{selectedCar.location}</span>
                      </div>
                      <div className="flex justify-between text-sm lg:text-base">
                        <span className="text-gray-600">Tình trạng pin:</span>
                        <span className="font-medium">{selectedCar.battery}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Usage Stats */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Thống kê sử dụng</h4>
                    <div className="space-y-3 lg:space-y-4">
                      <div className="flex justify-between text-sm lg:text-base">
                        <span className="text-gray-600">Số chủ sở hữu:</span>
                        <span className="font-medium">{selectedCar.coOwners}</span>
                      </div>
                      <div className="flex justify-between text-sm lg:text-base">
                        <span className="text-gray-600">Tỷ lệ sử dụng:</span>
                        <span className="font-medium">{selectedCar.utilization}%</span>
                      </div>
                      <div className="flex justify-between text-sm lg:text-base">
                        <span className="text-gray-600">Bảo dưỡng gần nhất:</span>
                        <span className="font-medium">{selectedCar.lastService}</span>
                      </div>
                      <div className="flex justify-between text-sm lg:text-base">
                        <span className="text-gray-600">Bảo dưỡng tiếp theo:</span>
                        <span className="font-medium">{selectedCar.nextMaintenance}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financial Info */}
                <div className="mt-6 lg:mt-8 p-4 lg:p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Thông tin tài chính</h4>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-lg lg:text-2xl font-bold text-blue-600">{(selectedCar.totalRevenue / 1000000).toFixed(1)}M</p>
                      <p className="text-xs lg:text-sm text-gray-600">Tổng doanh thu</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg lg:text-2xl font-bold text-green-600">{selectedCar.utilization}%</p>
                      <p className="text-xs lg:text-sm text-gray-600">Hiệu suất sử dụng</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg lg:text-2xl font-bold text-amber-600">{selectedCar.coOwners}</p>
                      <p className="text-xs lg:text-sm text-gray-600">Đồng sở hữu</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg lg:text-2xl font-bold text-purple-600">85%</p>
                      <p className="text-xs lg:text-sm text-gray-600">Hài lòng</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col lg:flex-row space-y-3 lg:space-y-0 lg:space-x-3 mt-6 lg:mt-8">
                  <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 text-sm lg:text-base">
                    <QrCode className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span>QR Code Check-in</span>
                  </button>
                  <button className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 text-sm lg:text-base">
                    <Wrench className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span>Lịch sử dịch vụ</span>
                  </button>
                  <button className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 text-sm lg:text-base">
                    <BarChart3 className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span>Báo cáo chi tiết</span>
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

export default CarManagement;