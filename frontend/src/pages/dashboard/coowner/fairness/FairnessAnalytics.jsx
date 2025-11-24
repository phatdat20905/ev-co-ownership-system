import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../../../store/authStore';
import { useAIStore, useGroupStore } from '../../../../store';
import showToast from '../../../../utils/toast';
import { BarChart3, RefreshCw, Clock, Info } from 'lucide-react';
import FairnessScoreGauge from '../../../../components/fairness/FairnessScoreGauge';
import UsageComparisonChart from '../../../../components/fairness/UsageComparisonChart';
import RecommendationList from '../../../../components/fairness/RecommendationList';
import MemberStatsCard from '../../../../components/fairness/MemberStatsCard';
import Header from '../../../../components/layout/Header';
import Footer from '../../../../components/layout/Footer';

const FairnessAnalytics = () => {
  const { user } = useAuthStore();
  const { groups, fetchUserGroups, isLoading: groupsLoading } = useGroupStore();
  const {
    currentAnalysis,
    loading,
    error,
    lastUpdated,
    analyzeFairness,
    fetchLatest,
    clearError
  } = useAIStore();

  const [timeRange, setTimeRange] = useState('month');
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  // Fetch user's groups and set the first active group as default
  useEffect(() => {
    const loadGroups = async () => {
      try {
        await fetchUserGroups();
      } catch (err) {
        console.error('Failed to fetch user groups:', err);
        showToast.error('Không thể tải danh sách nhóm của bạn');
      }
    };
    loadGroups();
  }, [fetchUserGroups]);

  // Set selected group when groups are loaded
  useEffect(() => {
    if (groups && groups.length > 0 && !selectedGroupId) {
      // Select the first active group
      const activeGroup = groups.find(g => g.isActive !== false) || groups[0];
      setSelectedGroupId(activeGroup.id);
    }
  }, [groups, selectedGroupId]);

  // Fetch latest analysis on mount
  useEffect(() => {
    if (selectedGroupId) {
      handleFetchLatest();
    }
  }, [selectedGroupId]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => clearError();
  }, []);

  const handleAnalyze = async () => {
    if (!selectedGroupId) {
      showToast.error('Vui lòng chọn nhóm');
      return;
    }

    try {
      await analyzeFairness({
        groupId: selectedGroupId,
        timeRange
      });
      showToast.success('Phân tích công bằng thành công!');
    } catch (err) {
      showToast.error(error || 'Không thể phân tích công bằng');
    }
  };

  const handleFetchLatest = async () => {
    if (!selectedGroupId) return;

    try {
      await fetchLatest(selectedGroupId);
    } catch (err) {
      // Silently fail for initial fetch (no data yet)
      if (!err.response || err.response.status !== 404) {
        console.error('Failed to fetch latest analysis:', err);
      }
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const timeRangeOptions = [
    { value: 'week', label: 'Tuần' },
    { value: 'month', label: 'Tháng' },
    { value: 'quarter', label: 'Quý' },
    { value: 'year', label: 'Năm' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800 overflow-hidden">
      <Header />

  <main className="flex-1 bg-gray-50 pt-24 py-8 px-4">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            Phân tích công bằng AI
          </h1>
          <p className="text-gray-600 mt-2">
            Phân tích mức độ công bằng trong việc sử dụng xe và nhận gợi ý từ AI
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap items-end gap-4">
            {/* Group Selector */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nhóm đồng sở hữu
              </label>
              <select
                value={selectedGroupId || ''}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                disabled={groupsLoading || !groups || groups.length === 0}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                {groupsLoading ? (
                  <option>Đang tải...</option>
                ) : groups && groups.length > 0 ? (
                  groups.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.groupName || `Nhóm ${group.id.slice(0, 8)}...`}
                    </option>
                  ))
                ) : (
                  <option>Không có nhóm</option>
                )}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Khoảng thời gian
              </label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {timeRangeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Đang phân tích...
                </>
              ) : (
                <>
                  <BarChart3 className="w-5 h-5" />
                  Phân tích ngay
                </>
              )}
            </button>

            <button
              onClick={handleFetchLatest}
              disabled={loading}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Tải lại
            </button>
          </div>

          {lastUpdated && (
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              Cập nhật lần cuối: {formatDate(lastUpdated)}
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-800">
              <Info className="w-5 h-5" />
              <span className="font-medium">Lỗi:</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!selectedGroupId && groups && groups.length === 0 && !groupsLoading ? (
          /* No Groups State */
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Bạn chưa tham gia nhóm nào
            </h3>
            <p className="text-gray-500 mb-6">
              Bạn cần tham gia một nhóm đồng sở hữu để sử dụng tính năng phân tích công bằng
            </p>
          </div>
        ) : currentAnalysis ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-sm text-gray-600 mb-1">Tổng số chuyến</div>
                <div className="text-3xl font-bold text-gray-900">
                  {currentAnalysis.fairness?.totalBookings || 0}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-sm text-gray-600 mb-1">Tổng giờ sử dụng</div>
                <div className="text-3xl font-bold text-gray-900">
                  {currentAnalysis.fairness?.totalUsageHours?.toFixed(1) || 0}h
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-sm text-gray-600 mb-1">Xung đột</div>
                <div className="text-3xl font-bold text-red-600">
                  {currentAnalysis.fairness?.conflicts || 0}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-sm text-gray-600 mb-1">Khoảng thời gian</div>
                <div className="text-lg font-semibold text-gray-900">
                  {currentAnalysis.period?.durationDays || 0} ngày
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {currentAnalysis.period?.range === 'week' && 'Tuần'}
                  {currentAnalysis.period?.range === 'month' && 'Tháng'}
                  {currentAnalysis.period?.range === 'quarter' && 'Quý'}
                  {currentAnalysis.period?.range === 'year' && 'Năm'}
                </div>
              </div>
            </div>

            {/* Fairness Score & Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Fairness Score Gauge */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Điểm công bằng tổng thể
                </h2>
                <FairnessScoreGauge
                  score={currentAnalysis.fairness?.overallScore || 0}
                  level={currentAnalysis.fairness?.level || 'fair'}
                />
              </div>

              {/* Usage Comparison Chart */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  So sánh mức sử dụng
                </h2>
                <UsageComparisonChart members={currentAnalysis.members || []} />
              </div>
            </div>

            {/* Member Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Thống kê từng thành viên
              </h2>
              <MemberStatsCard members={currentAnalysis.members || []} />
            </div>

            {/* Recommendations & Insights */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Đề xuất và Phân tích AI
              </h2>
              <RecommendationList
                recommendations={currentAnalysis.recommendations || []}
                insights={currentAnalysis.insights || []}
              />
            </div>
          </>
        ) : (
          /* Empty State */
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Chưa có dữ liệu phân tích
            </h3>
            <p className="text-gray-500 mb-6">
              Nhấn "Phân tích ngay" để bắt đầu phân tích công bằng cho nhóm của bạn
            </p>
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              <BarChart3 className="w-5 h-5" />
              Phân tích ngay
            </button>
          </div>
        )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FairnessAnalytics;
