import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { BarChart3, Download, Filter, Calendar, DollarSign, Users, Car, QrCode, TrendingUp, TrendingDown, Eye, FileText, PieChart, CreditCard, Wallet, ChevronDown, X, MoreVertical, Bell, User, LogOut, Menu, AlertTriangle, Wrench } from "lucide-react";
import { useFinancialStore } from "../../store/financialStore";
import { useAdminStore } from "../../store/adminStore";
import { useAuthStore } from "../../store/authStore";
import showToast, { getErrorMessage } from '../../utils/toast';
import LoadingSpinner from "../../components/common/LoadingSpinner";
import DashboardLayout from "../../components/layout/DashboardLayout";

const FinancialReports = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();
  const { 
    financialOverview, 
    revenueReport, 
    expenseReport, 
    carPerformance: storeCarPerformance,
    loading, 
    error,
    fetchFinancialOverview, 
    fetchRevenueReport, 
    fetchExpenseReport,
    exportFinancialReport 
  } = useFinancialStore();
  const { notifications: storeNotifications, fetchNotifications } = useAdminStore();
  
  const [dateRange, setDateRange] = useState("month");
  const [selectedReport, setSelectedReport] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Notification handler for layout
  const handleNotificationRead = async (notificationId) => {
    // Implement notification read logic if needed
  };

  // Fetch financial data on mount
  useEffect(() => {
    // Map UI-friendly dateRange to API expected period values
    const periodMap = {
      week: '7d',
      month: '30d',
      quarter: '90d',
      year: '1y'
    };
    const apiPeriod = periodMap[dateRange] || dateRange;
    const params = { period: apiPeriod };

    fetchFinancialOverview(params);
    fetchRevenueReport(params);
    fetchExpenseReport(params);
    // NOTE: using mocked car performance data locally for development/testing
    // to avoid calling upstream analytics APIs. The table below will use
    // the mocked values instead of fetched results.
    fetchNotifications({ limit: 20 });
  }, [dateRange, fetchFinancialOverview, fetchRevenueReport, fetchExpenseReport, fetchNotifications]);
  // Use data from store or fallback to default
  const notifications = storeNotifications || [];
  const financialData = financialOverview || {
    revenue: { current: 0, previous: 0, growth: 0 },
    expenses: { current: 0, previous: 0, growth: 0 },
    profit: { current: 0, previous: 0, growth: 0 },
    utilization: { current: 0, previous: 0, growth: 0 }
  };

  const revenueBreakdown = revenueReport?.breakdown || [];
  const expenseBreakdown = expenseReport?.breakdown || [];

  // Reports list derived from real API data (financialOverview, revenueReport, expenseReport)
  const [reportsList, setReportsList] = useState([]);

  // Utility to estimate a "size" string from an object (approximate)
  const estimateSize = (obj) => {
    try {
      const bytes = new TextEncoder().encode(JSON.stringify(obj || {})).length;
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    } catch (e) {
      return '-';
    }
  };

  useEffect(() => {
    const list = [];
    const dateLabel = (() => {
      if (dateRange === 'week') return 'Tuần này';
      if (dateRange === 'month') return 'Tháng này';
      if (dateRange === 'quarter') return 'Quý này';
      if (dateRange === 'year') return 'Năm nay';
      return dateRange;
    })();

    if (revenueReport) {
      list.push({
        id: `revenue_${dateRange}`,
        title: `Báo cáo doanh thu - ${dateLabel}`,
        type: 'Doanh thu',
        period: dateLabel,
        // Normalize generatedAt to YYYY-MM-DD for display
        generatedDate: new Date(revenueReport.generatedAt || Date.now()).toISOString().split('T')[0],
        size: estimateSize(revenueReport),
        status: 'completed',
        raw: revenueReport,
      });
    }

    if (expenseReport) {
      list.push({
        id: `expense_${dateRange}`,
        title: `Báo cáo chi phí - ${dateLabel}`,
        type: 'Chi phí',
        period: dateLabel,
        generatedDate: new Date(expenseReport.generatedAt || Date.now()).toISOString().split('T')[0],
        size: estimateSize(expenseReport),
        status: 'completed',
        raw: expenseReport,
      });
    }

    if (financialOverview) {
      list.unshift({
        id: `overview_${dateRange}`,
        title: `Tổng quan tài chính - ${dateLabel}`,
        type: 'Tổng hợp',
        period: dateLabel,
        generatedDate: new Date(financialOverview.generatedAt || Date.now()).toISOString().split('T')[0],
        size: estimateSize(financialOverview),
        status: 'completed',
        raw: financialOverview,
      });
    }

    setReportsList(list);
  }, [revenueReport, expenseReport, financialOverview, dateRange]);

  // Prefer dedicated carPerformance from store; fallback to financialOverview.carPerformance
  // Mock data for "Hiệu suất theo xe" table — used instead of calling API
  const MOCK_CAR_PERFORMANCE = [
    { vehicleId: 'veh_001', vehicleName: 'VinFast VF e34', revenue: 12500000, cost: 4200000, profit: 8300000, utilization: 72.4 },
    { vehicleId: 'veh_002', vehicleName: 'Tesla Model 3', revenue: 9800000, cost: 3500000, profit: 6300000, utilization: 65.1 },
    { vehicleId: 'veh_003', vehicleName: 'Nissan Leaf', revenue: 6400000, cost: 2800000, profit: 3600000, utilization: 51.7 },
    { vehicleId: 'veh_004', vehicleName: 'Hyundai Ioniq 5', revenue: 15400000, cost: 6100000, profit: 9300000, utilization: 78.3 },
    { vehicleId: 'veh_005', vehicleName: 'BMW i3', revenue: 4300000, cost: 2100000, profit: 2200000, utilization: 39.8 },
    { vehicleId: 'veh_006', vehicleName: 'Kia EV6', revenue: 11250000, cost: 4800000, profit: 6450000, utilization: 69.2 }
  ];

  const [mockedCarPerformance, setMockedCarPerformance] = useState(MOCK_CAR_PERFORMANCE);

  // Use mocked data (developer-requested) instead of upstream store data
  const carPerformance = mockedCarPerformance;

  const unreadNotifications = notifications.filter(n => !n.read).length;

  // Handle export report (supports format: 'pdf' or 'xlsx')
  const handleExportReport = async (reportType, format = 'xlsx') => {
    try {
      await exportFinancialReport(reportType, { period: dateRange, format });
      showToast.success(`Đã export báo cáo (${format.toUpperCase()}) thành công`);
    } catch (error) {
      const msg = getErrorMessage(error) || 'Không thể export báo cáo';
      showToast.error(msg);
    }
  };

  // Map human-friendly report types to backend export types
  const mapReportType = (label) => {
    if (!label) return 'overview';
    const lower = label.toString().toLowerCase();
    if (lower.includes('doanh thu') || lower.includes('revenue')) return 'revenue';
    if (lower.includes('chi phí') || lower.includes('chi phi') || lower.includes('expenses')) return 'expenses';
    if (lower.includes('tổng hợp') || lower.includes('tong hop')) return 'overview';
    return 'overview';
  };

  // Show loading spinner
  if (loading && !financialOverview) {
    return <LoadingSpinner />;
  }

  const StatCard = ({ title, value, change, icon, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs lg:text-sm font-medium text-gray-600">{title}</p>
          <p className="text-lg lg:text-2xl font-bold text-gray-900 mt-1">
            {typeof value === 'number' ? (value / 1000000).toFixed(1) + 'M' : value}
          </p>
          <div className="flex items-center space-x-1 mt-2">
            {change > 0 ? (
              <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4 text-green-600" />
            ) : (
              <TrendingDown className="w-3 h-3 lg:w-4 lg:h-4 text-red-600" />
            )}
            <span className={`text-xs lg:text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}%
            </span>
            <span className="text-xs text-gray-500 hidden lg:inline">so với kỳ trước</span>
          </div>
        </div>
        <div className={`p-2 lg:p-3 rounded-lg ${color} text-white shadow-sm`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );

  const ProgressBar = ({ percentage, color }) => (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className={`h-2 rounded-full ${color}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );

  // Recursive renderer to display report data in a friendly, readable format
  const RenderData = ({ data, level = 0 }) => {
    if (data === null || data === undefined) return <div className="text-sm text-gray-700">—</div>;
    if (typeof data !== 'object') return <div className="text-sm text-gray-700">{String(data)}</div>;

    if (Array.isArray(data)) {
      if (data.length === 0) return <div className="text-sm text-gray-700">[]</div>;
      return (
        <div className="space-y-2">
          {data.map((item, idx) => (
            <div key={idx} className="p-2 border rounded bg-white">
              <RenderData data={item} level={level + 1} />
            </div>
          ))}
        </div>
      );
    }

    // Plain object
    return (
      <div className="w-full overflow-auto">
        <table className="w-full text-sm">
          <tbody>
            {Object.entries(data).map(([key, value]) => (
              <tr key={key} className="align-top border-b last:border-b-0">
                <td className="py-2 pr-4 font-medium text-gray-800 w-40">{key}</td>
                <td className="py-2 text-gray-700">
                  <RenderData data={value} level={level + 1} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <DashboardLayout
      userRole="admin"
      notifications={notifications}
      onNotificationRead={handleNotificationRead}
    >
        {/* Content */}
        <main className="p-4 lg:p-8">
          {/* Date Range and Actions */}
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between mb-6 lg:mb-8">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-3 lg:px-4 py-2 lg:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base bg-gray-50 focus:bg-white appearance-none"
                >
                  <option value="week">Tuần này</option>
                  <option value="month">Tháng này</option>
                  <option value="quarter">Quý này</option>
                  <option value="year">Năm nay</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleExportReport('overview')}
                className="bg-blue-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors shadow-sm text-sm lg:text-base"
              >
                <Download className="w-4 h-4 lg:w-5 lg:h-5" />
                <span>Xuất báo cáo</span>
              </motion.button>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden flex items-center space-x-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4 text-gray-600" />
              </button>
              <button className="hidden lg:flex items-center space-x-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                <Filter className="w-4 h-4 text-gray-600" />
                <span>Lọc</span>
              </button>
              <button className="hidden lg:flex items-center space-x-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                <Calendar className="w-4 h-4 text-gray-600" />
                <span>Khoảng thời gian</span>
              </button>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Khoảng thời gian</label>
                      <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="week">Tuần này</option>
                        <option value="month">Tháng này</option>
                        <option value="quarter">Quý này</option>
                        <option value="year">Năm nay</option>
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

          {/* Financial Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
            <StatCard
              title="Tổng doanh thu"
              value={financialData.revenue.current}
              change={financialData.revenue.growth}
              icon={<DollarSign className="w-4 h-4 lg:w-6 lg:h-6" />}
              color="bg-green-500"
            />
            <StatCard
              title="Tổng chi phí"
              value={financialData.expenses.current}
              change={financialData.expenses.growth}
              icon={<CreditCard className="w-4 h-4 lg:w-6 lg:h-6" />}
              color="bg-red-500"
            />
            <StatCard
              title="Lợi nhuận"
              value={financialData.profit.current}
              change={financialData.profit.growth}
              icon={<TrendingUp className="w-4 h-4 lg:w-6 lg:h-6" />}
              color="bg-blue-500"
            />
            <StatCard
              title="Tỷ lệ sử dụng"
              value={financialData.utilization.current + '%'}
              change={financialData.utilization.growth}
              icon={<BarChart3 className="w-4 h-4 lg:w-6 lg:h-6" />}
              color="bg-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-6 lg:mb-8">
            {/* Revenue Breakdown */}
            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Phân bổ doanh thu</h3>
                <PieChart className="w-5 h-5 text-gray-600" />
              </div>
              <div className="space-y-4">
                {revenueBreakdown.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-900">{item.category}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {(item.amount / 1000000).toFixed(1)}M
                        </span>
                        <span className="text-xs text-gray-500">{item.percentage}%</span>
                        {item.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                    </div>
                    <ProgressBar 
                      percentage={item.percentage} 
                      color={item.trend === 'up' ? 'bg-green-500' : 'bg-red-500'}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Expense Breakdown */}
            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Phân bổ chi phí</h3>
                <Wallet className="w-5 h-5 text-gray-600" />
              </div>
              <div className="space-y-4">
                {expenseBreakdown.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-900">{item.category}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {(item.amount / 1000000).toFixed(1)}M
                        </span>
                        <span className="text-xs text-gray-500">{item.percentage}%</span>
                        {item.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4 text-red-600" />
                        ) : item.trend === 'down' ? (
                          <TrendingDown className="w-4 h-4 text-green-600" />
                        ) : (
                          <div className="w-4 h-4 text-gray-400">-</div>
                        )}
                      </div>
                    </div>
                    <ProgressBar 
                      percentage={item.percentage} 
                      color={
                        item.trend === 'up' ? 'bg-red-500' :
                        item.trend === 'down' ? 'bg-green-500' : 'bg-gray-400'
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Car Performance */}
          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100 mb-6 lg:mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Hiệu suất theo xe</h3>
              <Car className="w-5 h-5 text-gray-600" />
            </div>
            <div className="overflow-x-auto">
              <div className="flex items-center justify-between mb-4">
                <div />
                <div className="flex items-center space-x-2">
                  <button
                      onClick={() => {
                        // Refresh mocked data (no upstream API call)
                        setMockedCarPerformance(MOCK_CAR_PERFORMANCE);
                      }}
                    className="px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
                  >Làm mới</button>
                </div>
              </div>

              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Xe</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doanh thu</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tỷ lệ sử dụng</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chi phí</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lợi nhuận</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hiệu suất</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(!carPerformance || carPerformance.length === 0) ? (
                    <tr>
                      <td colSpan={6} className="px-4 lg:px-6 py-8 text-center text-sm text-gray-500">
                        Không có dữ liệu hiệu suất xe cho khoảng thời gian này.
                        <div className="mt-3">
                          <button
                              onClick={() => {
                                // Retry using mocked data
                                setMockedCarPerformance(MOCK_CAR_PERFORMANCE);
                              }}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm"
                          >Thử làm mới</button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    carPerformance.map((car, index) => {
                      const revenue = Number(car.revenue || 0);
                      const cost = Number(car.cost || 0);
                      const profit = Number(car.profit || (revenue - cost));
                      const utilization = Number(car.utilization || 0);
                      const profitPct = revenue > 0 ? (profit / revenue) : 0;
                      const key = car.vehicleId || car.id || car.vehicleName || index;

                      return (
                        <tr key={key} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <Car className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
                              <span className="font-medium text-gray-900 text-sm lg:text-base">{car.vehicleName || car.name || '—'}</span>
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                            {(revenue / 1000000).toFixed(1)}M
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <ProgressBar percentage={Math.min(Math.max(utilization, 0), 100)} color="bg-blue-500" />
                              <span className="text-sm text-gray-900">{Math.round(utilization)}%</span>
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-red-600">
                            {(cost / 1000000).toFixed(1)}M
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                            {(profit / 1000000).toFixed(1)}M
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 lg:px-3 py-1 rounded-full text-xs font-medium ${
                              profitPct > 0.7 ? 'bg-green-100 text-green-800 border border-green-200' :
                              profitPct > 0.5 ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                              'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                              {Math.round(profitPct * 100)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Reports List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 lg:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Báo cáo đã tạo</h3>
                <div className="flex items-center space-x-2">
                  <button className="hidden lg:flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    <Filter className="w-4 h-4 text-gray-600" />
                    <span>Lọc</span>
                  </button>
                  <button className="hidden lg:flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span>Khoảng thời gian</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              {/* View modal for a selected report */}
              <AnimatePresence>
                {selectedReport && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black opacity-40" onClick={() => setSelectedReport(null)} />
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      className="bg-white rounded-xl shadow-lg max-w-3xl w-full p-6 z-10 mx-4 overflow-y-auto max-h-[80vh]"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="text-lg font-semibold">{selectedReport.title}</h4>
                        <button onClick={() => setSelectedReport(null)} className="p-2 rounded-md hover:bg-gray-100">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-sm text-gray-700 mb-4">
                        <div><strong>Loại:</strong> {selectedReport.type}</div>
                        <div><strong>Khoảng thời gian:</strong> {selectedReport.period}</div>
                        <div><strong>Ngày tạo:</strong> {selectedReport.generatedDate}</div>
                        <div><strong>Kích thước (approx):</strong> {selectedReport.size}</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <RenderData data={selectedReport.raw} />
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Báo cáo</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kích thước</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportsList.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 lg:px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
                          <div>
                            <div className="font-medium text-gray-900 text-sm lg:text-base">{report.title}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className="px-2 lg:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium border border-blue-200">
                          {report.type}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.period}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.generatedDate}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.size}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => setSelectedReport(report)}
                            className="text-blue-600 hover:text-blue-900 flex items-center space-x-1 text-xs lg:text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Xem</span>
                          </button>
                          <button 
                            onClick={() => handleExportReport(mapReportType(report.type), 'xlsx')}
                            className="text-green-600 hover:text-green-900 flex items-center space-x-1 text-xs lg:text-sm"
                          >
                            <Download className="w-4 h-4" />
                            <span>Tải</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
    </DashboardLayout>
  );
};

export default FinancialReports;
