import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AlertTriangle, Search, Filter, MessageCircle, CheckCircle, XCircle, Clock, User, Car, Calendar, Download, FileText, CreditCard, MapPin, Wrench, BarChart3, Send, ChevronDown, X, MoreVertical, Bell, LogOut, Menu, Plus, PieChart } from "lucide-react";

const DisputeManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Menu items cho sidebar
  const menuItems = [
    { id: "overview", label: "Tổng quan", icon: <BarChart3 className="w-5 h-5" />, link: "/admin" },
    { id: "cars", label: "Quản lý xe", icon: <Car className="w-5 h-5" />, link: "/admin/cars" },
    { id: "staff", label: "Nhân viên", icon: <User className="w-5 h-5" />, link: "/admin/staff" },
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

  const disputes = [
    {
      id: 1,
      title: "Tranh chấp lịch sử dụng",
      description: "Xung đột lịch sử dụng xe giữa các thành viên",
      users: ["Minh Nguyễn", "Lan Phương"],
      car: "VF e34 - 29A-123.45",
      createdAt: "15/11/2024",
      status: "pending",
      priority: "high",
      type: "schedule",
      financialImpact: 0,
      messages: [
        { 
          user: "Minh Nguyễn", 
          message: "Tôi đã đặt lịch trước nhưng không được sử dụng xe vào ngày 14/11", 
          time: "10:30 AM",
          role: "Co-owner"
        },
        { 
          user: "Lan Phương", 
          message: "Tôi không nhận được thông báo về lịch này và đã có kế hoạch sử dụng xe", 
          time: "10:45 AM",
          role: "Co-owner"
        },
        { 
          user: "Admin System", 
          message: "Hệ thống ghi nhận cả hai đều đặt lịch cho cùng khung giờ. Đề xuất giải pháp?", 
          time: "11:00 AM",
          role: "System"
        }
      ]
    },
    {
      id: 2,
      title: "Vấn đề thanh toán",
      description: "Thành viên chưa thanh toán chi phí chia sẻ",
      users: ["Tuấn Anh"],
      car: "VinFast VF 8 - 29A-678.90",
      createdAt: "14/11/2024",
      status: "in_progress",
      priority: "medium",
      type: "payment",
      financialImpact: 2450000,
      messages: [
        { 
          user: "Tuấn Anh", 
          message: "Tôi chưa nhận được hóa đơn thanh toán cho tháng 11", 
          time: "09:15 AM",
          role: "Co-owner"
        },
        { 
          user: "Staff Support", 
          message: "Đã gửi lại hóa đơn qua email. Vui lòng kiểm tra hộp thư", 
          time: "10:30 AM",
          role: "Staff"
        }
      ]
    },
    {
      id: 3,
      title: "Hư hỏng xe",
      description: "Báo cáo hư hỏng sau khi sử dụng",
      users: ["Hồng Nhung"],
      car: "VF 9 - 29B-123.45",
      createdAt: "13/11/2024",
      status: "resolved",
      priority: "high",
      type: "damage",
      financialImpact: 8500000,
      messages: [
        { 
          user: "Hồng Nhung", 
          message: "Xe có vấn đề về phanh sau khi sử dụng. Cần kiểm tra gấp", 
          time: "03:20 PM",
          role: "Co-owner"
        },
        { 
          user: "Kỹ thuật viên", 
          message: "Đã kiểm tra và sửa chữa xong. Chi phí 8.5M VND", 
          time: "04:45 PM",
          role: "Staff"
        }
      ]
    },
    {
      id: 4,
      title: "Tranh chấp vị trí đỗ xe",
      description: "Không tìm thấy xe tại vị trí đã đỗ",
      users: ["Văn Nam", "Minh Nguyễn"],
      car: "VF e34 - 30A-543.21",
      createdAt: "12/11/2024",
      status: "in_progress",
      priority: "medium",
      type: "location",
      financialImpact: 0,
      messages: [
        { 
          user: "Văn Nam", 
          message: "Xe không có tại bãi đỗ đã thỏa thuận. Không thể sử dụng", 
          time: "08:15 AM",
          role: "Co-owner"
        }
      ]
    }
  ];

  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái", color: "gray" },
    { value: "pending", label: "Chờ xử lý", color: "amber" },
    { value: "in_progress", label: "Đang xử lý", color: "blue" },
    { value: "resolved", label: "Đã giải quyết", color: "green" },
    { value: "cancelled", label: "Đã hủy", color: "red" }
  ];

  const priorityOptions = [
    { value: "low", label: "Thấp", color: "gray" },
    { value: "medium", label: "Trung bình", color: "amber" },
    { value: "high", label: "Cao", color: "red" }
  ];

  const typeOptions = [
    { value: "schedule", label: "Lịch sử dụng", icon: <Calendar className="w-4 h-4" /> },
    { value: "payment", label: "Thanh toán", icon: <CreditCard className="w-4 h-4" /> },
    { value: "damage", label: "Hư hỏng", icon: <Wrench className="w-4 h-4" /> },
    { value: "location", label: "Vị trí", icon: <MapPin className="w-4 h-4" /> },
    { value: "other", label: "Khác", icon: <AlertTriangle className="w-4 h-4" /> }
  ];

  const filteredDisputes = disputes.filter(dispute => {
    const matchesSearch = dispute.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dispute.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || dispute.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
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

  const getTypeIcon = (type) => {
    const option = typeOptions.find(opt => opt.value === type);
    return option ? option.icon : <AlertTriangle className="w-4 h-4" />;
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedDispute) return;

    const newMsg = {
      user: "Admin System",
      message: newMessage,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      role: "Admin"
    };

    const updatedDispute = {
      ...selectedDispute,
      messages: [...selectedDispute.messages, newMsg]
    };

    setSelectedDispute(updatedDispute);
    setNewMessage("");
  };

  const disputeStats = {
    total: disputes.length,
    pending: disputes.filter(d => d.status === 'pending').length,
    inProgress: disputes.filter(d => d.status === 'in_progress').length,
    resolved: disputes.filter(d => d.status === 'resolved').length,
    totalFinancialImpact: disputes.reduce((sum, dispute) => sum + dispute.financialImpact, 0)
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
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Quản lý tranh chấp</h1>
                <p className="text-gray-600 text-sm lg:text-base">Giải quyết vấn đề và xung đột giữa thành viên</p>
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
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-6 mb-6 lg:mb-8">
            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Tổng tranh chấp</p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">{disputeStats.total}</p>
                </div>
                <div className="p-2 lg:p-3 bg-blue-500 rounded-lg text-white shadow-sm">
                  <AlertTriangle className="w-4 h-4 lg:w-6 lg:h-6" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Chờ xử lý</p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">{disputeStats.pending}</p>
                </div>
                <div className="p-2 lg:p-3 bg-amber-500 rounded-lg text-white shadow-sm">
                  <Clock className="w-4 h-4 lg:w-6 lg:h-6" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Đang xử lý</p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">{disputeStats.inProgress}</p>
                </div>
                <div className="p-2 lg:p-3 bg-blue-500 rounded-lg text-white shadow-sm">
                  <MessageCircle className="w-4 h-4 lg:w-6 lg:h-6" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Đã giải quyết</p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">{disputeStats.resolved}</p>
                </div>
                <div className="p-2 lg:p-3 bg-green-500 rounded-lg text-white shadow-sm">
                  <CheckCircle className="w-4 h-4 lg:w-6 lg:h-6" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Tổng thiệt hại</p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">{(disputeStats.totalFinancialImpact / 1000000).toFixed(1)}M</p>
                </div>
                <div className="p-2 lg:p-3 bg-red-500 rounded-lg text-white shadow-sm">
                  <CreditCard className="w-4 h-4 lg:w-6 lg:h-6" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Disputes List */}
            <div className="lg:col-span-2 space-y-6">
              {/* Search and Filter */}
              <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
                  <div className="flex-1 relative">
                    <Search className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm tranh chấp..."
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
                      <span>Xuất báo cáo</span>
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

              {/* Disputes Grid */}
              <div className="space-y-4">
                {filteredDisputes.map((dispute) => (
                  <motion.div
                    key={dispute.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -2 }}
                    className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => setSelectedDispute(dispute)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex items-center space-x-2 text-gray-600">
                            {getTypeIcon(dispute.type)}
                            <span className="text-sm capitalize">{typeOptions.find(t => t.value === dispute.type)?.label}</span>
                          </div>
                          <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{dispute.title}</h3>
                        </div>
                        <p className="text-gray-600 mb-3">{dispute.description}</p>
                        
                        <div className="flex flex-wrap gap-3 lg:gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span className="text-xs lg:text-sm">{dispute.users.join(", ")}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Car className="w-4 h-4" />
                            <span className="text-xs lg:text-sm">{dispute.car}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span className="text-xs lg:text-sm">{dispute.createdAt}</span>
                          </div>
                          {dispute.financialImpact > 0 && (
                            <div className="flex items-center space-x-1">
                              <CreditCard className="w-4 h-4" />
                              <span className="text-red-600 font-medium text-xs lg:text-sm">
                                {(dispute.financialImpact / 1000000).toFixed(1)}M VND
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`px-2 lg:px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(dispute.status)}`}>
                          {statusOptions.find(s => s.value === dispute.status)?.label}
                        </span>
                        <span className={`px-2 lg:px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(dispute.priority)}`}>
                          Ưu tiên {priorityOptions.find(p => p.value === dispute.priority)?.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-xs lg:text-sm">{dispute.messages.length} tin nhắn</span>
                        </div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                        Xem chi tiết
                      </button>
                    </div>
                  </motion.div>
                ))}

                {filteredDisputes.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100"
                  >
                    <AlertTriangle className="w-12 h-12 lg:w-16 lg:h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Không có tranh chấp nào</h3>
                    <p className="text-gray-600 max-w-sm mx-auto">Tất cả tranh chấp đã được giải quyết hoặc không tìm thấy kết quả phù hợp</p>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Dispute Detail Sidebar */}
            <div className="lg:col-span-1">
              {selectedDispute ? (
                <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100 sticky top-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg lg:text-xl font-semibold text-gray-900">Chi tiết tranh chấp</h3>
                    <button
                      onClick={() => setSelectedDispute(null)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Thông tin cơ bản</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm text-gray-600">Tiêu đề</label>
                          <p className="font-medium text-sm lg:text-base">{selectedDispute.title}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Mô tả</label>
                          <p className="font-medium text-sm lg:text-base">{selectedDispute.description}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Thành viên liên quan</label>
                          <p className="font-medium text-sm lg:text-base">{selectedDispute.users.join(", ")}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Xe</label>
                          <p className="font-medium text-sm lg:text-base">{selectedDispute.car}</p>
                        </div>
                        {selectedDispute.financialImpact > 0 && (
                          <div>
                            <label className="text-sm text-gray-600">Thiệt hại tài chính</label>
                            <p className="font-medium text-red-600 text-sm lg:text-base">
                              {selectedDispute.financialImpact.toLocaleString('vi-VN')} VND
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Lịch sử tin nhắn</h4>
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {selectedDispute.messages.map((message, index) => (
                          <div key={index} className={`rounded-lg p-3 ${
                            message.role === 'Admin' ? 'bg-blue-50 border border-blue-200' :
                            message.role === 'Staff' ? 'bg-green-50 border border-green-200' :
                            'bg-gray-50 border border-gray-200'
                          }`}>
                            <div className="flex justify-between items-start mb-1">
                              <div className="flex items-center space-x-2">
                                <span className={`font-medium text-sm ${
                                  message.role === 'Admin' ? 'text-blue-900' :
                                  message.role === 'Staff' ? 'text-green-900' : 'text-gray-900'
                                }`}>
                                  {message.user}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  message.role === 'Admin' ? 'bg-blue-100 text-blue-800' :
                                  message.role === 'Staff' ? 'bg-green-100 text-green-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {message.role}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">{message.time}</span>
                            </div>
                            <p className="text-gray-700 text-sm">{message.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Phản hồi</h4>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Nhập phản hồi..."
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <button
                          onClick={handleSendMessage}
                          className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Hành động</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <button className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 text-sm">
                          <MessageCircle className="w-4 h-4" />
                          <span>Phản hồi</span>
                        </button>
                        <button className="bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          <span>Giải quyết</span>
                        </button>
                        <button className="bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center space-x-2 text-sm">
                          <Clock className="w-4 h-4" />
                          <span>Tạm dừng</span>
                        </button>
                        <button className="bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 text-sm">
                          <FileText className="w-4 h-4" />
                          <span>Xuất BP</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
                  <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Chọn một tranh chấp</h3>
                  <p className="text-gray-600 text-sm">Chọn một tranh chấp từ danh sách để xem chi tiết và thực hiện hành động</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DisputeManagement;