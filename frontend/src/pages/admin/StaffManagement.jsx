import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Users, UserPlus, Search, Filter, Edit, Trash2, Shield, Mail, Phone, Calendar, ArrowLeft, BarChart3, Car, FileText, QrCode, Wrench, Download, CheckCircle, XCircle, Eye, X, Menu, Bell, User, LogOut, PieChart, AlertTriangle } from "lucide-react";


const StaffManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

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

  const staffMembers = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      email: "a.nguyen@evco.com",
      phone: "0912345678",
      role: "Quản lý vận hành",
      status: "active",
      joinDate: "15/08/2024",
      permissions: ["Quản lý xe", "Xử lý đặt lịch", "Báo cáo", "Check-in/out", "Quản lý dịch vụ"],
      assignedCars: 12,
      completedTasks: 45
    },
    {
      id: 2,
      name: "Trần Thị B",
      email: "b.tran@evco.com",
      phone: "0923456789",
      role: "Nhân viên hỗ trợ",
      status: "active",
      joinDate: "20/09/2024",
      permissions: ["Hỗ trợ thành viên", "Xử lý khiếu nại", "Check-in/out"],
      assignedCars: 8,
      completedTasks: 32
    },
    {
      id: 3,
      name: "Lê Văn C",
      email: "c.le@evco.com",
      phone: "0934567890",
      role: "Kỹ thuật viên",
      status: "inactive",
      joinDate: "10/07/2024",
      permissions: ["Bảo dưỡng xe", "Kiểm tra kỹ thuật", "Quản lý dịch vụ"],
      assignedCars: 6,
      completedTasks: 28
    },
    {
      id: 4,
      name: "Phạm Thị D",
      email: "d.pham@evco.com",
      phone: "0945678901",
      role: "Nhân viên Check-in/out",
      status: "active",
      joinDate: "05/10/2024",
      permissions: ["Check-in/out", "Xác minh QR", "Ghi nhận sự cố"],
      assignedCars: 10,
      completedTasks: 67
    }
  ];

  const roles = [
    "Quản lý vận hành",
    "Nhân viên hỗ trợ",
    "Kỹ thuật viên",
    "Nhân viên Check-in/out",
    "Kế toán",
    "Quản lý chất lượng"
  ];

  const permissionsList = [
    "Quản lý xe",
    "Xử lý đặt lịch",
    "Hỗ trợ thành viên",
    "Xử lý khiếu nại",
    "Báo cáo",
    "Bảo dưỡng xe",
    "Kiểm tra kỹ thuật",
    "Quản lý tài chính",
    "Check-in/out",
    "Xác minh QR",
    "Ghi nhận sự cố",
    "Quản lý dịch vụ"
  ];

  const filteredStaff = staffMembers.filter(staff =>
    staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const staffStats = {
    total: staffMembers.length,
    active: staffMembers.filter(s => s.status === 'active').length,
    assignedCars: staffMembers.reduce((sum, staff) => sum + staff.assignedCars, 0),
    totalTasks: staffMembers.reduce((sum, staff) => sum + staff.completedTasks, 0)
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
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Quản lý nhân viên</h1>
                <p className="text-gray-600 text-sm lg:text-base">Quản lý staff và phân quyền hệ thống</p>
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
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Tổng nhân viên</p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">{staffStats.total}</p>
                </div>
                <div className="p-2 lg:p-3 bg-blue-500 rounded-lg text-white shadow-sm">
                  <Users className="w-4 h-4 lg:w-6 lg:h-6" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Đang hoạt động</p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">{staffStats.active}</p>
                </div>
                <div className="p-2 lg:p-3 bg-green-500 rounded-lg text-white shadow-sm">
                  <CheckCircle className="w-4 h-4 lg:w-6 lg:h-6" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Xe được phân công</p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">{staffStats.assignedCars}</p>
                </div>
                <div className="p-2 lg:p-3 bg-amber-500 rounded-lg text-white shadow-sm">
                  <Car className="w-4 h-4 lg:w-6 lg:h-6" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Công việc hoàn thành</p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">{staffStats.totalTasks}</p>
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
                  placeholder="Tìm kiếm nhân viên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 lg:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base bg-gray-50 focus:bg-white transition-colors"
                />
              </div>
              <div className="flex gap-2 lg:gap-3">
                <button className="flex items-center space-x-2 px-3 lg:px-4 py-2 lg:py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  <Filter className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
                  <span>Lọc</span>
                </button>
                <button className="flex items-center space-x-2 px-3 lg:px-4 py-2 lg:py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  <Download className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
                  <span>Xuất báo cáo</span>
                </button>
              </div>
            </div>
          </div>

          {/* Add Staff Button for Mobile */}
          <div className="lg:hidden mb-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddForm(true)}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-700 transition-colors shadow-sm"
            >
              <UserPlus className="w-5 h-5" />
              <span className="font-medium">Thêm nhân viên</span>
            </motion.button>
          </div>

          {/* Add Staff Button for Desktop */}
          <div className="hidden lg:flex justify-end mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors shadow-sm"
            >
              <UserPlus className="w-5 h-5" />
              <span className="font-medium">Thêm nhân viên</span>
            </motion.button>
          </div>

          {/* Staff Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
            {filteredStaff.map((staff) => (
              <motion.div
                key={staff.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden group"
              >
                <div className="p-4 lg:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-semibold">
                        {staff.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{staff.name}</h3>
                        <p className="text-gray-600 text-sm">{staff.role}</p>
                      </div>
                    </div>
                    <span className={`px-2 lg:px-3 py-1 rounded-full text-xs font-medium ${
                      staff.status === 'active' 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}>
                      {staff.status === 'active' ? 'Đang làm việc' : 'Ngừng làm'}
                    </span>
                  </div>

                  <div className="space-y-2 lg:space-y-3 mb-4 lg:mb-6">
                    <div className="flex items-center space-x-3 text-xs lg:text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 truncate">{staff.email}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs lg:text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{staff.phone}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs lg:text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Tham gia: {staff.joinDate}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 lg:gap-4 mb-4 lg:mb-6">
                    <div className="text-center">
                      <p className="text-lg lg:text-2xl font-bold text-blue-600">{staff.assignedCars}</p>
                      <p className="text-xs text-gray-600">Xe phụ trách</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg lg:text-2xl font-bold text-green-600">{staff.completedTasks}</p>
                      <p className="text-xs text-gray-600">CV hoàn thành</p>
                    </div>
                  </div>

                  <div className="mb-4 lg:mb-6">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2 text-sm lg:text-base">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <span>Quyền hạn</span>
                    </h4>
                    <div className="flex flex-wrap gap-1 lg:gap-2">
                      {staff.permissions.slice(0, 3).map((permission, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs"
                        >
                          {permission}
                        </span>
                      ))}
                      {staff.permissions.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
                          +{staff.permissions.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setSelectedStaff(staff)}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg flex items-center justify-center space-x-1 hover:bg-gray-200 transition-colors text-xs lg:text-sm"
                    >
                      <Eye className="w-3 h-3 lg:w-4 lg:h-4" />
                      <span>Xem</span>
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

          {filteredStaff.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100"
            >
              <Users className="w-12 h-12 lg:w-16 lg:h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy nhân viên</h3>
              <p className="text-gray-600 max-w-sm mx-auto mb-6">Thử thay đổi điều kiện tìm kiếm hoặc thêm nhân viên mới</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Thêm nhân viên mới
              </button>
            </motion.div>
          )}
        </main>
      </div>

      {/* Staff Detail Modal */}
      <AnimatePresence>
        {selectedStaff && (
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
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Chi tiết nhân viên</h2>
                    <p className="text-gray-600 text-sm lg:text-base">{selectedStaff.name}</p>
                  </div>
                  <button
                    onClick={() => setSelectedStaff(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="p-4 lg:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-6 lg:mb-8">
                  {/* Staff Details */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Thông tin nhân viên</h4>
                    <div className="space-y-3 lg:space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-semibold text-xl">
                          {selectedStaff.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h3 className="text-lg lg:text-xl font-bold text-gray-900">{selectedStaff.name}</h3>
                          <p className="text-gray-600">{selectedStaff.role}</p>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium mt-2 inline-block ${
                            selectedStaff.status === 'active' 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : 'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}>
                            {selectedStaff.status === 'active' ? 'Đang làm việc' : 'Ngừng làm'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 lg:space-y-3 pt-4">
                        <div className="flex justify-between text-sm lg:text-base">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium">{selectedStaff.email}</span>
                        </div>
                        <div className="flex justify-between text-sm lg:text-base">
                          <span className="text-gray-600">Số điện thoại:</span>
                          <span className="font-medium">{selectedStaff.phone}</span>
                        </div>
                        <div className="flex justify-between text-sm lg:text-base">
                          <span className="text-gray-600">Ngày tham gia:</span>
                          <span className="font-medium">{selectedStaff.joinDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Performance Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Hiệu suất làm việc</h4>
                    <div className="space-y-3 lg:space-y-4">
                      <div className="flex justify-between text-sm lg:text-base">
                        <span className="text-gray-600">Xe phụ trách:</span>
                        <span className="font-semibold">{selectedStaff.assignedCars}</span>
                      </div>
                      <div className="flex justify-between text-sm lg:text-base">
                        <span className="text-gray-600">Công việc hoàn thành:</span>
                        <span className="font-semibold">{selectedStaff.completedTasks}</span>
                      </div>
                      <div className="flex justify-between text-sm lg:text-base">
                        <span className="text-gray-600">Tỷ lệ hoàn thành:</span>
                        <span className="font-semibold text-green-600">92%</span>
                      </div>
                      <div className="flex justify-between text-sm lg:text-base">
                        <span className="text-gray-600">Đánh giá:</span>
                        <span className="font-semibold text-amber-600">Rất tốt</span>
                      </div>
                    </div>

                    <div className="mt-6 p-4 lg:p-6 bg-blue-50 rounded-xl border border-blue-200">
                      <h5 className="font-semibold text-blue-900 mb-2">Ghi chú</h5>
                      <p className="text-blue-800 text-sm lg:text-base">Nhân viên có hiệu suất làm việc tốt, tích cực trong công việc.</p>
                    </div>
                  </div>
                </div>

                {/* Permissions List */}
                <div className="mb-6 lg:mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Quyền hạn chi tiết</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedStaff.permissions.map((permission, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 lg:p-4 border border-gray-200 rounded-xl">
                        <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-green-500" />
                        <span className="text-gray-900 text-sm lg:text-base">{permission}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col lg:flex-row space-y-3 lg:space-y-0 lg:space-x-3 pt-6 border-t border-gray-200">
                  <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 text-sm lg:text-base">
                    <Edit className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span>Chỉnh sửa thông tin</span>
                  </button>
                  <button className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 text-sm lg:text-base">
                    <Shield className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span>Phân quyền</span>
                  </button>
                  <button className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 text-sm lg:text-base">
                    <BarChart3 className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span>Xem hiệu suất</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Staff Modal */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl lg:rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-4 lg:p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Thêm nhân viên mới</h2>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
              
              <div className="p-4 lg:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                    <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input type="email" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                    <input type="tel" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chức vụ</label>
                    <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      {roles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-6 lg:mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Quyền hạn</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {permissionsList.map(permission => (
                      <label key={permission} className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm text-gray-700">{permission}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row space-y-3 lg:space-y-0 lg:space-x-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm lg:text-base"
                  >
                    Hủy
                  </button>
                  <button className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm lg:text-base">
                    Thêm nhân viên
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

export default StaffManagement;