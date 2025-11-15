// src/components/ai/AIRecommendations.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, DollarSign, Clock, MapPin, Battery, Car, ChevronRight, X, Lightbulb } from 'lucide-react';
import aiService from '../../services/aiService';

export default function AIRecommendations({ userId, context = 'dashboard' }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRec, setSelectedRec] = useState(null);

  useEffect(() => {
    loadRecommendations();
  }, [userId, context]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await aiService.getRecommendations({
        userId,
        context,
        limit: 5
      });
      
      setRecommendations(data.recommendations || []);
    } catch (err) {
      setError(err.message || 'Không thể tải gợi ý');
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationIcon = (type) => {
    const icons = {
      vehicle: <Car className="w-5 h-5" />,
      booking: <Clock className="w-5 h-5" />,
      route: <MapPin className="w-5 h-5" />,
      savings: <DollarSign className="w-5 h-5" />,
      efficiency: <Battery className="w-5 h-5" />,
      trend: <TrendingUp className="w-5 h-5" />,
      default: <Lightbulb className="w-5 h-5" />
    };

    return icons[type] || icons.default;
  };

  const getRecommendationColor = (type) => {
    const colors = {
      vehicle: 'bg-blue-100 text-blue-600',
      booking: 'bg-purple-100 text-purple-600',
      route: 'bg-green-100 text-green-600',
      savings: 'bg-yellow-100 text-yellow-600',
      efficiency: 'bg-sky-100 text-sky-600',
      trend: 'bg-pink-100 text-pink-600',
      default: 'bg-gray-100 text-gray-600'
    };

    return colors[type] || colors.default;
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      high: { label: 'Ưu tiên cao', color: 'bg-red-100 text-red-700' },
      medium: { label: 'Trung bình', color: 'bg-yellow-100 text-yellow-700' },
      low: { label: 'Thấp', color: 'bg-gray-100 text-gray-700' }
    };

    return badges[priority] || badges.low;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="text-center py-8">
          <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="text-center py-8">
          <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Chưa có gợi ý nào cho bạn</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Gợi ý thông minh</h2>
            <p className="text-sm text-gray-500">Được cá nhân hóa cho bạn</p>
          </div>
        </div>

        {/* Recommendations List */}
        <div className="space-y-3">
          {recommendations.map((rec, index) => {
            const priority = getPriorityBadge(rec.priority);
            const iconColor = getRecommendationColor(rec.type);
            
            return (
              <motion.div
                key={rec.id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedRec(rec)}
                className="group bg-gradient-to-r from-gray-50 to-white hover:from-purple-50 hover:to-pink-50 rounded-xl p-4 cursor-pointer transition-all hover:shadow-md border-2 border-transparent hover:border-purple-200"
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`p-2 rounded-lg ${iconColor} flex-shrink-0`}>
                    {getRecommendationIcon(rec.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                        {rec.title}
                      </h3>
                      {rec.priority && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${priority.color} font-medium flex-shrink-0`}>
                          {priority.label}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {rec.description}
                    </p>

                    {/* Stats/Metrics */}
                    {rec.metrics && (
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {rec.metrics.savings && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            <span>Tiết kiệm {rec.metrics.savings}đ</span>
                          </div>
                        )}
                        {rec.metrics.confidence && (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            <span>Độ tin cậy {rec.metrics.confidence}%</span>
                          </div>
                        )}
                        {rec.metrics.impact && (
                          <div className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            <span>Tác động {rec.metrics.impact}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 flex-shrink-0 transition-colors" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Refresh Button */}
        <button
          onClick={loadRecommendations}
          className="mt-4 w-full py-2 px-4 rounded-lg border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm"
        >
          Làm mới gợi ý
        </button>
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedRec && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRec(null)}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            >
              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start gap-3">
                      <div className={`p-3 rounded-xl ${getRecommendationColor(selectedRec.type)}`}>
                        {getRecommendationIcon(selectedRec.type)}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">
                          {selectedRec.title}
                        </h3>
                        {selectedRec.priority && (
                          <span className={`inline-block text-xs px-2 py-1 rounded-full ${getPriorityBadge(selectedRec.priority).color} font-medium`}>
                            {getPriorityBadge(selectedRec.priority).label}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedRec(null)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <p className="text-gray-700 leading-relaxed">
                      {selectedRec.description}
                    </p>
                  </div>

                  {/* Detailed Content */}
                  {selectedRec.details && (
                    <div className="mb-6 bg-gray-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Chi tiết</h4>
                      <div className="text-sm text-gray-700 whitespace-pre-wrap">
                        {selectedRec.details}
                      </div>
                    </div>
                  )}

                  {/* Metrics */}
                  {selectedRec.metrics && (
                    <div className="mb-6 grid grid-cols-3 gap-4">
                      {selectedRec.metrics.savings && (
                        <div className="bg-yellow-50 rounded-xl p-3 text-center">
                          <DollarSign className="w-6 h-6 text-yellow-600 mx-auto mb-1" />
                          <div className="text-lg font-bold text-gray-900">
                            {selectedRec.metrics.savings}đ
                          </div>
                          <div className="text-xs text-gray-600">Tiết kiệm</div>
                        </div>
                      )}
                      {selectedRec.metrics.confidence && (
                        <div className="bg-green-50 rounded-xl p-3 text-center">
                          <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-1" />
                          <div className="text-lg font-bold text-gray-900">
                            {selectedRec.metrics.confidence}%
                          </div>
                          <div className="text-xs text-gray-600">Độ tin cậy</div>
                        </div>
                      )}
                      {selectedRec.metrics.impact && (
                        <div className="bg-purple-50 rounded-xl p-3 text-center">
                          <Sparkles className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                          <div className="text-lg font-bold text-gray-900">
                            {selectedRec.metrics.impact}
                          </div>
                          <div className="text-xs text-gray-600">Tác động</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  {selectedRec.actions && selectedRec.actions.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900 mb-3">Hành động đề xuất</h4>
                      {selectedRec.actions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            if (action.callback) action.callback();
                            setSelectedRec(null);
                          }}
                          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
