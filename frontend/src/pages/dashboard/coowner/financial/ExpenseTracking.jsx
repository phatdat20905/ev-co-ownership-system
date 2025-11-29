import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Filter, Plus, TrendingUp, TrendingDown, DollarSign, Calendar, PieChart, BarChart3, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../../../../components/layout/Header";
import Footer from "../../../../components/layout/Footer";

export default function ExpenseTracking() {
  const [expenseData, setExpenseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    // Mock data fetch - trong thực tế sẽ gọi API
    const fetchExpenseData = async () => {
      setTimeout(() => {
        setExpenseData({
          totalExpenses: 12500000,
          monthlyAverage: 1041667,
          yoyGrowth: 12.5,
          categories: [
            { name: "Bảo dưỡng", amount: 4500000, percentage: 36, color: "bg-blue-500" },
            { name: "Bảo hiểm", amount: 3000000, percentage: 24, color: "bg-green-500" },
            { name: "Sạc điện", amount: 2500000, percentage: 20, color: "bg-yellow-500" },
            { name: "Phí đỗ xe", amount: 1500000, percentage: 12, color: "bg-purple-500" },
            { name: "Khác", amount: 1000000, percentage: 8, color: "bg-gray-500" }
          ],
          monthlyData: [
            { month: "Tháng 1", amount: 1200000, usage: 15 },
            { month: "Tháng 2", amount: 1100000, usage: 12 },
            { month: "Tháng 3", amount: 1300000, usage: 18 },
            { month: "Tháng 4", amount: 1250000, usage: 16 },
            { month: "Tháng 5", amount: 1400000, usage: 20 },
            { month: "Tháng 6", amount: 1350000, usage: 19 }
          ],
          recentTransactions: [
            { id: 1, date: "2024-01-15", description: "Bảo dưỡng định kỳ", amount: 1500000, category: "maintenance", status: "completed" },
            { id: 2, date: "2024-01-10", description: "Phí bảo hiểm tháng", amount: 250000, category: "insurance", status: "completed" },
            { id: 3, date: "2024-01-05", description: "Sạc điện trạm VinFast", amount: 320000, category: "charging", status: "completed" },
            { id: 4, date: "2024-01-02", description: "Phí đỗ xe tháng", amount: 500000, category: "parking", status: "pending" }
          ]
        });
        setLoading(false);
      }, 1500);
    };

    fetchExpenseData();
  }, []);

  const safeToLocaleString = (value) => {
    return (value || 0).toLocaleString('vi-VN');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard/coowner/financial"
                className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Theo dõi chi phí</h1>
                <p className="text-gray-600 mt-1">Quản lý và phân tích chi phí đồng sở hữu</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4" />
                <span>Lọc</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4" />
                <span>Xuất báo cáo</span>
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
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600">+12.5% so với năm trước</span>
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
                <TrendingDown className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-600">-5.2% so với tháng trước</span>
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
                {expenseData?.categories?.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                      <span className="text-sm font-medium text-gray-700">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{safeToLocaleString(category.amount)}đ</p>
                      <p className="text-xs text-gray-500">{category.percentage}%</p>
                    </div>
                  </div>
                ))}
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
                {expenseData?.monthlyData?.map((month, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{month.month}</span>
                    <div className="flex items-center gap-4">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(month.usage / 30) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-gray-900 w-20 text-right">
                        {safeToLocaleString(month.amount)}đ
                      </span>
                    </div>
                  </div>
                ))}
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
              {expenseData?.recentTransactions?.map((transaction) => (
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
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}