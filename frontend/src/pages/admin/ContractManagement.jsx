import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FileText, Plus, Search, Filter, Edit, Trash2, Users, Calendar, Download, Eye, CheckCircle, XCircle, Clock, AlertTriangle, BarChart3, Shield, ChevronDown, X, MoreVertical, Bell, User, LogOut, Menu, Car, Wrench, PieChart } from "lucide-react";

const ContractManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedContract, setSelectedContract] = useState(null);
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

  const contracts = [
    {
      id: 1,
      contractNumber: "HD-2024-001",
      type: "Đồng sở hữu",
      parties: ["Minh Nguyễn", "Lan Phương", "Tuấn Anh"],
      car: "VF e34 - 29A-123.45",
      startDate: "01/11/2024",
      endDate: "01/11/2025",
      status: "active",
      value: 450000000,
      signedDate: "25/10/2024",
      documents: ["Hợp đồng chính", "Phụ lục A", "Biên bản bàn giao"]
    },
    {
      id: 2,
      contractNumber: "HD-2024-002",
      type: "Đồng sở hữu",
      parties: ["Hồng Nhung", "Văn Nam", "Thùy Linh"],
      car: "VinFast VF 8 - 29A-678.90",
      startDate: "05/11/2024",
      endDate: "05/11/2025",
      status: "pending",
      value: 680000000,
      signedDate: "30/10/2024",
      documents: ["Hợp đồng chính", "Phụ lục B"]
    },
    {
      id: 3,
      contractNumber: "HD-2024-003",
      type: "Đồng sở hữu",
      parties: ["Quang Hải", "Mai Phương", "Đức Anh", "Thu Hà"],
      car: "VF 9 - 29B-123.45",
      startDate: "10/11/2024",
      endDate: "10/11/2025",
      status: "expired",
      value: 820000000,
      signedDate: "05/11/2024",
      documents: ["Hợp đồng chính", "Phụ lục A", "Phụ lục C", "Biên bản bàn giao"]
    },
    {
      id: 4,
      contractNumber: "HD-2024-004",
      type: "Đồng sở hữu",
      parties: ["Thanh Tùng", "Ngọc Anh"],
      car: "VF e34 - 30A-543.21",
      startDate: "15/11/2024",
      endDate: "15/11/2025",
      status: "active",
      value: 380000000,
      signedDate: "10/11/2024",
      documents: ["Hợp đồng chính"]
    }
  ];

  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái", color: "gray" },
    { value: "active", label: "Đang hoạt động", color: "green" },
    { value: "pending", label: "Chờ ký", color: "amber" },
    { value: "expired", label: "Hết hạn", color: "red" },
    { value: "cancelled", label: "Đã hủy", color: "gray" }
  ];

  const contractTypes = [
    "Đồng sở hữu",
    "Thuê bao",
    "Cho thuê",
    "Bảo trì",
    "Bảo hiểm"
  ];

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.parties.some(party => party.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         contract.car.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || contract.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalContracts: contracts.length,
    activeContracts: contracts.filter(c => c.status === 'active').length,
    pendingContracts: contracts.filter(c => c.status === 'pending').length,
    totalValue: contracts.reduce((sum, contract) => sum + contract.value, 0)
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-amber-600" />;
      case 'expired': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <XCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
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
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Quản lý hợp đồng</h1>
                <p className="text-gray-600 text-sm lg:text-base">Hợp đồng pháp lý điện tử và e-contract</p>
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
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Tổng hợp đồng</p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">{stats.totalContracts}</p>
                </div>
                <div className="p-2 lg:p-3 bg-blue-500 rounded-lg text-white shadow-sm">
                  <FileText className="w-4 h-4 lg:w-6 lg:h-6" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Đang hoạt động</p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">{stats.activeContracts}</p>
                </div>
                <div className="p-2 lg:p-3 bg-green-500 rounded-lg text-white shadow-sm">
                  <CheckCircle className="w-4 h-4 lg:w-6 lg:h-6" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Chờ ký</p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">{stats.pendingContracts}</p>
                </div>
                <div className="p-2 lg:p-3 bg-amber-500 rounded-lg text-white shadow-sm">
                  <Clock className="w-4 h-4 lg:w-6 lg:h-6" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Tổng giá trị</p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">{(stats.totalValue / 1000000000).toFixed(1)}B</p>
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
                  placeholder="Tìm kiếm hợp đồng theo số, thành viên hoặc xe..."
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

          {/* Add Contract Button for Mobile */}
          <div className="lg:hidden mb-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddForm(true)}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Tạo hợp đồng</span>
            </motion.button>
          </div>

          {/* Contracts Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số hợp đồng</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thành viên</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Xe</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời hạn</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá trị</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredContracts.map((contract) => (
                    <tr key={contract.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
                          <div>
                            <div className="font-medium text-gray-900 text-sm lg:text-base">{contract.contractNumber}</div>
                            <div className="text-xs lg:text-sm text-gray-500">Ký ngày: {contract.signedDate}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className="px-2 lg:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs lg:text-sm font-medium">
                          {contract.type}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <div className="text-sm text-gray-900">
                            {contract.parties.slice(0, 2).join(', ')}
                            {contract.parties.length > 2 && ` +${contract.parties.length - 2}`}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {contract.car}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div>Từ: {contract.startDate}</div>
                          <div>Đến: {contract.endDate}</div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                        {(contract.value / 1000000).toFixed(0)}M VND
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(contract.status)}
                          <span className={`text-sm font-medium ${
                            contract.status === 'active' ? 'text-green-800' :
                            contract.status === 'pending' ? 'text-amber-800' :
                            contract.status === 'expired' ? 'text-red-800' :
                            'text-gray-800'
                          }`}>
                            {statusOptions.find(s => s.value === contract.status)?.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => setSelectedContract(contract)}
                            className="text-blue-600 hover:text-blue-900 flex items-center space-x-1 text-xs lg:text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Xem</span>
                          </button>
                          <button className="text-green-600 hover:text-green-900 flex items-center space-x-1 text-xs lg:text-sm">
                            <Edit className="w-4 h-4" />
                            <span>Sửa</span>
                          </button>
                          <button className="text-red-600 hover:text-red-900 flex items-center space-x-1 text-xs lg:text-sm">
                            <Trash2 className="w-4 h-4" />
                            <span>Xóa</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredContracts.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <FileText className="w-12 h-12 lg:w-16 lg:h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy hợp đồng</h3>
                <p className="text-gray-600 max-w-sm mx-auto mb-6">Thử thay đổi điều kiện tìm kiếm hoặc tạo hợp đồng mới</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Tạo hợp đồng mới
                </button>
              </motion.div>
            )}
          </div>
        </main>
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
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900">{selectedContract.contractNumber}</h2>
                    <p className="text-gray-600 text-sm lg:text-base">Hợp đồng đồng sở hữu xe điện</p>
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-6 lg:mb-8">
                  {/* Contract Details */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Thông tin hợp đồng</h4>
                    <div className="space-y-3 lg:space-y-4">
                      <div className="flex justify-between text-sm lg:text-base">
                        <span className="text-gray-600">Số hợp đồng:</span>
                        <span className="font-medium">{selectedContract.contractNumber}</span>
                      </div>
                      <div className="flex justify-between text-sm lg:text-base">
                        <span className="text-gray-600">Loại hợp đồng:</span>
                        <span className="font-medium">{selectedContract.type}</span>
                      </div>
                      <div className="flex justify-between text-sm lg:text-base">
                        <span className="text-gray-600">Ngày ký:</span>
                        <span className="font-medium">{selectedContract.signedDate}</span>
                      </div>
                      <div className="flex justify-between text-sm lg:text-base">
                        <span className="text-gray-600">Thời hạn:</span>
                        <span className="font-medium">{selectedContract.startDate} - {selectedContract.endDate}</span>
                      </div>
                      <div className="flex justify-between text-sm lg:text-base">
                        <span className="text-gray-600">Giá trị:</span>
                        <span className="font-semibold text-green-600">
                          {(selectedContract.value / 1000000).toFixed(0)} triệu VND
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Parties Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Bên tham gia</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-600">Thành viên:</span>
                        <div className="mt-2 space-y-2">
                          {selectedContract.parties.map((party, index) => (
                            <div key={index} className="flex items-center space-x-3">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-900 text-sm lg:text-base">{party}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Xe áp dụng:</span>
                        <p className="font-medium mt-1 text-sm lg:text-base">{selectedContract.car}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="mb-6 lg:mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Tài liệu đính kèm</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedContract.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 lg:p-4 border border-gray-200 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
                          <span className="text-gray-900 text-sm lg:text-base">{doc}</span>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Tải xuống
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col lg:flex-row space-y-3 lg:space-y-0 lg:space-x-3 pt-6 border-t border-gray-200">
                  <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 text-sm lg:text-base">
                    <Download className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span>Tải hợp đồng</span>
                  </button>
                  <button className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 text-sm lg:text-base">
                    <Edit className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span>Chỉnh sửa</span>
                  </button>
                  <button className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 text-sm lg:text-base">
                    <Shield className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span>Xác thực chữ ký</span>
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

export default ContractManagement;