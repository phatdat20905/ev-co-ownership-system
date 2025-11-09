import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  TrendingUp,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Zap,
  Target,
  Award,
  Clock,
  Users,
  RefreshCw,
} from "lucide-react";
import aiService from "../../../../services/ai.service";
import { toast } from "../../../../utils/toast";

const AIRecommendations = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("schedule");
  
  // AI Data States
  const [scheduleRecommendations, setScheduleRecommendations] = useState(null);
  const [costOptimization, setCostOptimization] = useState(null);
  const [usagePatterns, setUsagePatterns] = useState(null);
  const [behaviorInsights, setBehaviorInsights] = useState(null);

  useEffect(() => {
    fetchAllRecommendations();
  }, []);

  const fetchAllRecommendations = async () => {
    try {
      setLoading(true);
      const [schedule, cost, usage, behavior] = await Promise.all([
        aiService.getScheduleRecommendations().catch(() => ({ data: null })),
        aiService.getCostOptimization().catch(() => ({ data: null })),
        aiService.getUsagePatterns().catch(() => ({ data: null })),
        aiService.getBehaviorInsights().catch(() => ({ data: null })),
      ]);

      setScheduleRecommendations(schedule.data);
      setCostOptimization(cost.data);
      setUsagePatterns(usage.data);
      setBehaviorInsights(behavior.data);
    } catch (error) {
      console.error("Error fetching AI recommendations:", error);
      toast.error("Không thể tải đề xuất AI");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAllRecommendations();
    toast.info("Đang cập nhật đề xuất...");
  };

  const tabs = [
    { id: "schedule", label: "Lịch sử dụng", icon: <Calendar className="w-4 h-4" /> },
    { id: "cost", label: "Tối ưu chi phí", icon: <DollarSign className="w-4 h-4" /> },
    { id: "usage", label: "Phân tích sử dụng", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "behavior", label: "Hành vi", icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  Đề xuất AI
                </h1>
              </div>
              <p className="text-gray-600">
                Phân tích thông minh giúp tối ưu hóa việc sử dụng xe và chi phí
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden lg:inline">Làm mới</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl p-2 shadow-sm border border-gray-100">
            <div className="flex space-x-2 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Đang phân tích dữ liệu...</p>
          </div>
        )}

        {/* Content */}
        {!loading && (
          <div className="space-y-6">
            {/* Schedule Recommendations */}
            {activeTab === "schedule" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-3 mb-4">
                    <Calendar className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      Đề xuất lịch sử dụng tối ưu
                    </h2>
                  </div>
                  {scheduleRecommendations ? (
                    <div className="space-y-4">
                      {scheduleRecommendations.recommendations?.map((rec, index) => (
                        <div
                          key={index}
                          className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-all"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Zap className="w-5 h-5 text-yellow-500" />
                              <h3 className="font-semibold text-gray-900">
                                {rec.title}
                              </h3>
                            </div>
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {rec.confidence}% tin cậy
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3">{rec.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{rec.timeSlot}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <TrendingUp className="w-4 h-4" />
                              <span>Tiết kiệm {rec.savings}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>Chưa có đủ dữ liệu để phân tích</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Cost Optimization */}
            {activeTab === "cost" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-3 mb-4">
                    <DollarSign className="w-6 h-6 text-green-600" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      Tối ưu hóa chi phí
                    </h2>
                  </div>
                  {costOptimization ? (
                    <div className="space-y-6">
                      {/* Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-700 mb-1">Tiết kiệm tiềm năng</p>
                          <p className="text-2xl font-bold text-green-900">
                            {costOptimization.potentialSavings?.toLocaleString()} VND
                          </p>
                        </div>
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-700 mb-1">Chi phí hiện tại</p>
                          <p className="text-2xl font-bold text-blue-900">
                            {costOptimization.currentCost?.toLocaleString()} VND
                          </p>
                        </div>
                        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                          <p className="text-sm text-purple-700 mb-1">Hiệu quả</p>
                          <p className="text-2xl font-bold text-purple-900">
                            {costOptimization.efficiency}%
                          </p>
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div className="space-y-3">
                        <h3 className="font-semibold text-gray-900">Đề xuất cụ thể</h3>
                        {costOptimization.suggestions?.map((suggestion, index) => (
                          <div
                            key={index}
                            className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg"
                          >
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{suggestion.title}</p>
                              <p className="text-sm text-gray-600 mt-1">
                                {suggestion.description}
                              </p>
                              <p className="text-sm text-green-600 mt-2 font-medium">
                                Tiết kiệm: {suggestion.savingAmount?.toLocaleString()} VND/tháng
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>Chưa có dữ liệu chi phí để phân tích</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Usage Patterns */}
            {activeTab === "usage" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-3 mb-4">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      Phân tích mẫu sử dụng
                    </h2>
                  </div>
                  {usagePatterns ? (
                    <div className="space-y-6">
                      {/* Peak Hours */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">
                          Giờ cao điểm
                        </h3>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                          {usagePatterns.peakHours?.map((hour, index) => (
                            <div
                              key={index}
                              className="p-3 border border-gray-200 rounded-lg text-center"
                            >
                              <Clock className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                              <p className="font-medium text-gray-900">{hour.time}</p>
                              <p className="text-sm text-gray-600">
                                {hour.percentage}% sử dụng
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Common Routes */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">
                          Tuyến đường thường đi
                        </h3>
                        <div className="space-y-2">
                          {usagePatterns.commonRoutes?.map((route, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <Target className="w-5 h-5 text-purple-600" />
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {route.from} → {route.to}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {route.frequency} lần/tháng
                                  </p>
                                </div>
                              </div>
                              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                                {route.distance} km
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Statistics */}
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="p-4 border border-gray-200 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Quãng đường TB</p>
                          <p className="text-xl font-bold text-gray-900">
                            {usagePatterns.avgDistance} km
                          </p>
                        </div>
                        <div className="p-4 border border-gray-200 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Thời gian TB</p>
                          <p className="text-xl font-bold text-gray-900">
                            {usagePatterns.avgDuration} phút
                          </p>
                        </div>
                        <div className="p-4 border border-gray-200 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Tần suất</p>
                          <p className="text-xl font-bold text-gray-900">
                            {usagePatterns.frequency} lần/tuần
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>Chưa có đủ dữ liệu sử dụng để phân tích</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Behavior Insights */}
            {activeTab === "behavior" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-3 mb-4">
                    <Users className="w-6 h-6 text-indigo-600" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      Phân tích hành vi
                    </h2>
                  </div>
                  {behaviorInsights ? (
                    <div className="space-y-6">
                      {/* Driving Score */}
                      <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-gray-900">Điểm lái xe</h3>
                          <Award className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div className="flex items-end space-x-4">
                          <div className="text-5xl font-bold text-indigo-900">
                            {behaviorInsights.drivingScore}
                          </div>
                          <div className="text-gray-600 mb-2">/100</div>
                        </div>
                        <p className="text-sm text-indigo-700 mt-2">
                          {behaviorInsights.scoreDescription}
                        </p>
                      </div>

                      {/* Behavior Metrics */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {behaviorInsights.metrics?.map((metric, index) => (
                          <div
                            key={index}
                            className="p-4 border border-gray-200 rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium text-gray-900">{metric.name}</p>
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  metric.status === "good"
                                    ? "bg-green-100 text-green-800"
                                    : metric.status === "warning"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {metric.status === "good"
                                  ? "Tốt"
                                  : metric.status === "warning"
                                  ? "Cảnh báo"
                                  : "Cần cải thiện"}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                              <div
                                className={`h-2 rounded-full ${
                                  metric.status === "good"
                                    ? "bg-green-600"
                                    : metric.status === "warning"
                                    ? "bg-yellow-600"
                                    : "bg-red-600"
                                }`}
                                style={{ width: `${metric.value}%` }}
                              ></div>
                            </div>
                            <p className="text-sm text-gray-600">{metric.description}</p>
                          </div>
                        ))}
                      </div>

                      {/* Recommendations */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">
                          Đề xuất cải thiện
                        </h3>
                        <div className="space-y-2">
                          {behaviorInsights.improvements?.map((improvement, index) => (
                            <div
                              key={index}
                              className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg"
                            >
                              <Target className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                              <p className="text-gray-700">{improvement}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>Chưa có dữ liệu hành vi để phân tích</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIRecommendations;
