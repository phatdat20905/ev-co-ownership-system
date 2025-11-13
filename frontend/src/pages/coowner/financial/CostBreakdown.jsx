import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, PieChart, DollarSign, Users, Car, Battery, Shield, Calendar, Download, Filter, TrendingUp } from 'lucide-react';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';

export default function CostBreakdown() {
  const [timeRange, setTimeRange] = useState('month'); 
  const [selectedCategory, setSelectedCategory] = useState('all');

  const costData = {
    total: 3850000,
    previousPeriod: 3520000,
    change: '+9.4%',
    categories: [
      {
        id: 1,
        name: 'Sạc điện',
        amount: 1250000,
        percentage: 32.5,
        color: 'from-blue-500 to-cyan-500',
        icon: Battery,
        trend: 'up',
        usage: '450 kWh'
      },
      {
        id: 2,
        name: 'Bảo dưỡng',
        amount: 850000,
        percentage: 22.1,
        color: 'from-green-500 to-emerald-500',
        icon: Car,
        trend: 'down',
        usage: '2 lần'
      },
      {
        id: 3,
        name: 'Bảo hiểm',
        amount: 750000,
        percentage: 19.5,
        color: 'from-purple-500 to-pink-500',
        icon: Shield,
        trend: 'stable',
        usage: 'Tháng 1-12'
      },
      {
        id: 4,
        name: 'Đăng kiểm',
        amount: 450000,
        percentage: 11.7,
        color: 'from-orange-500 to-amber-500',
        icon: Calendar,
        trend: 'stable',
        usage: '1 năm'
      },
      {
        id: 5,
        name: 'Vệ sinh',
        amount: 300000,
        percentage: 7.8,
        color: 'from-gray-500 to-gray-600',
        icon: TrendingUp,
        trend: 'up',
        usage: '12 lần'
      },
      {
        id: 6,
        name: 'Khác',
        amount: 250000,
        percentage: 6.5,
        color: 'from-red-500 to-rose-500',
        icon: DollarSign,
        trend: 'up',
        usage: 'Phát sinh'
      }
    ],
    ownershipBreakdown: [
      { name: 'Nguyễn Văn A', percentage: 40, amount: 1540000, paid: true },
      { name: 'Trần Thị B', percentage: 30, amount: 1155000, paid: true },
      { name: 'Lê Văn C', percentage: 30, amount: 1155000, paid: false }
    ]
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return 'text-red-500';
      case 'down': return 'text-green-500';
      case 'stable': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return '↗';
      case 'down': return '↘';
      case 'stable': return '→';
      default: return '→';
    }
  };

  const filteredCategories = selectedCategory === 'all' 
    ? costData.categories 
    : costData.categories.filter(cat => cat.id === parseInt(selectedCategory));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <Header />
      
      <main className="pt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link
              to="/coowner/financial"
              className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700 mb-6 group transition-colors"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Quay lại Quản lý tài chính</span>
            </Link>
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                  Phân bổ Chi phí
                </h1>
                <p className="text-xl text-gray-600">
                  Theo dõi và phân tích chi phí đồng sở hữu
                </p>
              </div>
              
              <div className="flex gap-3">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                >
                  <option value="week">Tuần này</option>
                  <option value="month">Tháng này</option>
                  <option value="quarter">Quý này</option>
                </select>
                
                <button className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-2xl hover:bg-gray-50 transition-colors">
                  <Download className="w-4 h-4" />
                  <span>Xuất PDF</span>
                </button>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {costData.total.toLocaleString()} VNĐ
                    </p>
                    <p className="text-sm text-gray-600">Tổng chi phí</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${getTrendColor('up')}`}>
                      {costData.change}
                    </p>
                    <p className="text-sm text-gray-600">So với kỳ trước</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">3/3</p>
                    <p className="text-sm text-gray-600">Đã thanh toán</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cost Categories */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Phân loại chi phí</h2>
                  
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  >
                    <option value="all">Tất cả danh mục</option>
                    {costData.categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-4">
                  {filteredCategories.map((category, index) => {
                    const IconComponent = category.icon;
                    return (
                      <motion.div
                        key={category.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200/50 shadow-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl bg-gradient-to-r ${category.color} text-white shadow-lg`}>
                              <IconComponent className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900 text-lg">{category.name}</h3>
                              <p className="text-gray-600">{category.usage}</p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">
                              {category.amount.toLocaleString()} VNĐ
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600">{category.percentage}%</span>
                              <span className={`font-medium ${getTrendColor(category.trend)}`}>
                                {getTrendIcon(category.trend)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="mt-4">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full bg-gradient-to-r ${category.color}`}
                              style={{ width: `${category.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Ownership Breakdown */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 mt-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Phân bổ theo sở hữu</h2>
                
                <div className="space-y-4">
                  {costData.ownershipBreakdown.map((owner, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200/50 shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-sky-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                          {owner.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{owner.name}</h3>
                          <p className="text-gray-600">Tỷ lệ sở hữu: {owner.percentage}%</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">
                          {owner.amount.toLocaleString()} VNĐ
                        </p>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                          owner.paid 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {owner.paid ? 'Đã thanh toán' : 'Chờ thanh toán'}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Cost Distribution Chart */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-sky-600" />
                  Phân bổ chi phí
                </h3>
                
                <div className="space-y-4">
                  {costData.categories.map(category => (
                    <div key={category.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${category.color}`}></div>
                        <span className="text-sm text-gray-700">{category.name}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{category.percentage}%</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-sky-50 rounded-2xl border border-sky-200">
                  <p className="text-sm text-sky-700">
                    💡 <strong>Tiết kiệm:</strong> Sử dụng sạc vào giờ thấp điểm có thể giảm 15% chi phí điện.
                  </p>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">Hành động nhanh</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center gap-3 p-3 bg-white border border-gray-300 rounded-2xl hover:bg-gray-50 transition-colors">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span>Thanh toán ngay</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 bg-white border border-gray-300 rounded-2xl hover:bg-gray-50 transition-colors">
                    <Download className="w-5 h-5 text-blue-600" />
                    <span>Tải báo cáo</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 bg-white border border-gray-300 rounded-2xl hover:bg-gray-50 transition-colors">
                    <Filter className="w-5 h-5 text-purple-600" />
                    <span>Lọc chi phí</span>
                  </button>
                </div>
              </motion.div>

              {/* Financial Tips */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl p-6 text-white"
              >
                <h3 className="text-xl font-bold mb-4">Mẹo tiết kiệm</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Sạc xe vào ban đêm để tiết kiệm điện</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Bảo dưỡng định kỳ giảm chi phí sửa chữa</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Chia sẻ lịch trình để tối ưu chi phí</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}