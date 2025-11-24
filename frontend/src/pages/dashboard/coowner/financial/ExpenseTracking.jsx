import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Filter, TrendingUp, TrendingDown, DollarSign, Calendar, PieChart, BarChart3, FileText, Loader2 } from "lucide-react";
import Header from "../../../../components/layout/Header";
import Footer from "../../../../components/layout/Footer";
import { useCostStore } from "../../../../store/costStore";
import { useAuthStore } from "../../../../store/authStore";
import { costAPI } from "../../../../api/cost";
import { showToast, getErrorMessage } from "../../../../utils/toast";

export default function ExpenseTracking() {
  const [expenseData, setExpenseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isExporting, setIsExporting] = useState(false);
  const { fetchExpenseTracking } = useCostStore();
  const { activeGroup } = useAuthStore();

  useEffect(() => {
    loadExpenseData();
  }, [selectedYear, activeGroup]);

  const loadExpenseData = async () => {
    if (!activeGroup?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetchExpenseTracking(activeGroup.id, { year: selectedYear });
      // Handle API response structure: { success, data: { totalExpenses, monthlyAverage, ... } }
      const data = response?.data || response;
      setExpenseData({
        totalExpenses: data?.totalExpenses || 0,
        monthlyAverage: data?.monthlyAverage || 0,
        yoyGrowth: data?.yoyGrowth || 0,
        categories: data?.categories || [],
        monthlyData: data?.monthlyData || [],
        recentTransactions: data?.recentTransactions || [],
        year: data?.year || selectedYear
      });
    } catch (error) {
      console.error('Failed to load expense tracking:', error);
      showToast.error(getErrorMessage(error));
      // Set empty data on error
      setExpenseData({
        totalExpenses: 0,
        monthlyAverage: 0,
        yoyGrowth: 0,
        categories: [],
        monthlyData: [],
        recentTransactions: [],
        year: selectedYear
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    if (!activeGroup?.id) {
      showToast.warning('Vui lòng chọn nhóm để xuất báo cáo');
      return;
    }

    setIsExporting(true);
    try {
      const blob = await costAPI.exportExpenseTrackingExcel(activeGroup.id, { year: selectedYear });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `expense-tracking-${activeGroup.id}-${selectedYear}-${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showToast.success('Xuất báo cáo Excel thành công!');
    } catch (err) {
      console.error('Error exporting Excel:', err);
      showToast.error(getErrorMessage(err));
    } finally {
      setIsExporting(false);
    }
  };

  const handleFilterChange = () => {
    // Cycle through simple demo filters: all -> charging -> maintenance -> all
    const options = ['all', 'charging', 'maintenance'];
    const currentIndex = options.indexOf(filter);
    const next = options[(currentIndex + 1) % options.length];
    setFilter(next);
    showToast.info(`Bộ lọc đã được cập nhật: ${next === 'all' ? 'Tất cả' : next}`);
  };

  const safeToLocaleString = (value) => {
    return value ? value.toLocaleString("vi-VN") : "0";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!activeGroup?.id) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Vui lòng chọn nhóm để xem báo cáo chi phí</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
  <main className="pt-20 flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Theo dõi chi phí</h1>
              <p className="text-gray-600 mt-2">Phân tích chi tiết chi phí theo năm</p>
            </div>
            
            <div className="flex gap-4 items-center">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[...Array(5)].map((_, i) => {
                  const year = new Date().getFullYear() - i;
                  return <option key={year} value={year}>{year}</option>;
                })}
              </select>
              <button 
                onClick={handleFilterChange}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Lọc</span>
              </button>
              <button 
                onClick={handleExportExcel}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang xuất...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Xuất báo cáo</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng chi phí</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {safeToLocaleString(expenseData?.totalExpenses)}đ
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                {expenseData?.yoyGrowth >= 0 ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600">+{expenseData?.yoyGrowth}% so với năm trước</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-600">{expenseData?.yoyGrowth}% so với năm trước</span>
                  </>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Trung bình tháng</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {safeToLocaleString(expenseData?.monthlyAverage)}đ
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <span className="text-sm text-gray-600">Tính trung bình cả năm</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tăng trưởng YoY</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {expenseData?.yoyGrowth || 0}%
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">So với cùng kỳ năm ngoái</p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Phân loại chi phí */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Phân loại chi phí</h2>
                <PieChart className="w-5 h-5 text-gray-600" />
              </div>
              
              <div className="space-y-4">
                {expenseData?.categories?.length > 0 ? (
                  expenseData.categories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-green-500' : index === 2 ? 'bg-yellow-500' : index === 3 ? 'bg-purple-500' : 'bg-gray-500'}`}></div>
                        <span className="text-sm font-medium text-gray-700">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">{safeToLocaleString(category.amount)}đ</p>
                        <p className="text-xs text-gray-500">{category.percentage}%</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">Chưa có dữ liệu</p>
                )}
              </div>
            </motion.div>

            {/* Chi phí theo tháng */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Chi phí theo tháng</h2>
                <BarChart3 className="w-5 h-5 text-gray-600" />
              </div>
              
              <div className="space-y-3">
                {expenseData?.monthlyData?.map((month, index) => {
                  const maxAmount = Math.max(...(expenseData?.monthlyData?.map(m => m.amount) || [1]));
                  const widthPercent = maxAmount > 0 ? (month.amount / maxAmount) * 100 : 0;
                  
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 w-16">{month.month}</span>
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all" 
                            style={{ width: `${widthPercent}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold text-gray-900 w-24 text-right">
                          {safeToLocaleString(month.amount)}đ
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Giao dịch gần đây */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Giao dịch gần đây</h2>
              <FileText className="w-5 h-5 text-gray-600" />
            </div>
            
            <div className="space-y-4">
              {expenseData?.recentTransactions?.length > 0 ? (
                expenseData.recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        transaction.category === 'maintenance' ? 'bg-blue-100 text-blue-600' :
                        transaction.category === 'insurance' ? 'bg-green-100 text-green-600' :
                        transaction.category === 'charging' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-500">{transaction.date}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{safeToLocaleString(transaction.amount)}đ</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        transaction.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transaction.status === 'completed' ? 'Đã hoàn thành' : 'Đang chờ'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Chưa có giao dịch</p>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
