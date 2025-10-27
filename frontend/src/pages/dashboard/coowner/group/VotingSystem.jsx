import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Vote, Plus, Clock, Users, CheckCircle, XCircle, TrendingUp, BarChart3, Calendar, MoreVertical } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../../../../components/layout/Header";
import Footer from "../../../../components/layout/Footer";

export default function VotingSystem() {
  const [votingData, setVotingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    const fetchVotingData = async () => {
      setTimeout(() => {
        setVotingData({
          activeVotes: [
            {
              id: 1,
              title: "Nâng cấp hệ thống âm thanh",
              description: "Đề xuất nâng cấp loa và hệ thống âm thanh với chi phí 8.000.000đ",
              createdBy: "Nguyễn Văn A",
              createdAt: "2024-01-28",
              endsAt: "2024-02-04",
              totalVotes: 3,
              requiredVotes: 3,
              options: [
                { id: 1, text: "Đồng ý", votes: 2, percentage: 67 },
                { id: 2, text: "Không đồng ý", votes: 1, percentage: 33 }
              ],
              status: "active",
              myVote: 1
            },
            {
              id: 2,
              title: "Thay lốp mới",
              description: "Thay thế 4 lốp xe với chi phí 12.000.000đ",
              createdBy: "Trần Thị B",
              createdAt: "2024-01-30",
              endsAt: "2024-02-06",
              totalVotes: 2,
              requiredVotes: 3,
              options: [
                { id: 1, text: "Đồng ý", votes: 1, percentage: 50 },
                { id: 2, text: "Không đồng ý", votes: 1, percentage: 50 }
              ],
              status: "active",
              myVote: null
            }
          ],
          completedVotes: [
            {
              id: 3,
              title: "Mua bảo hiểm mới",
              description: "Chuyển sang gói bảo hiểm cao cấp với chi phí 15.000.000đ/năm",
              createdBy: "Lê Văn C",
              createdAt: "2024-01-20",
              endsAt: "2024-01-27",
              totalVotes: 4,
              requiredVotes: 3,
              options: [
                { id: 1, text: "Đồng ý", votes: 3, percentage: 75 },
                { id: 2, text: "Không đồng ý", votes: 1, percentage: 25 }
              ],
              status: "passed",
              result: "Đã thông qua"
            },
            {
              id: 4,
              title: "Thay đổi lịch bảo dưỡng",
              description: "Chuyển lịch bảo dưỡng từ 15.000km sang 20.000km",
              createdBy: "Nguyễn Văn A",
              createdAt: "2024-01-15",
              endsAt: "2024-01-22",
              totalVotes: 4,
              requiredVotes: 3,
              options: [
                { id: 1, text: "Đồng ý", votes: 1, percentage: 25 },
                { id: 2, text: "Không đồng ý", votes: 3, percentage: 75 }
              ],
              status: "rejected",
              result: "Đã từ chối"
            }
          ]
        });
        setLoading(false);
      }, 1500);
    };

    fetchVotingData();
  }, []);

  const handleVote = (voteId, optionId) => {
    // In real app, this would be an API call
    console.log(`Voted for option ${optionId} in vote ${voteId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'passed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Đang bỏ phiếu';
      case 'passed': return 'Đã thông qua';
      case 'rejected': return 'Đã từ chối';
      default: return 'Không xác định';
    }
  };

  const votes = activeTab === 'active' ? votingData.activeVotes : votingData.completedVotes;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard/coowner/group"
                className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Hệ thống bỏ phiếu</h1>
                <p className="text-gray-600 mt-1">Đưa ra quyết định cùng nhau</p>
              </div>
            </div>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
              <span>Tạo phiếu bầu</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Phiếu đang mở</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {votingData.activeVotes.length}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Vote className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">Cần bỏ phiếu</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Đã hoàn thành</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {votingData.completedVotes.length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">Phiếu đã đóng</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tỷ lệ tham gia</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    85%
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">Trung bình</p>
            </motion.div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-4 mb-6">
            {[
              { id: 'active', name: 'Đang bỏ phiếu', count: votingData.activeVotes.length },
              { id: 'completed', name: 'Đã hoàn thành', count: votingData.completedVotes.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
                }`}
              >
                {tab.name}
                <span className="ml-2 bg-white/20 py-0.5 px-2 rounded-full text-sm">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Votes Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {votes.map((vote) => (
              <motion.div
                key={vote.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{vote.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{vote.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(vote.status)}`}>
                    {getStatusText(vote.status)}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>Bởi {vote.createdBy}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Kết thúc: {vote.endsAt}</span>
                  </div>
                </div>

                {/* Voting Options */}
                <div className="space-y-3 mb-4">
                  {vote.options.map((option) => (
                    <div key={option.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{option.text}</span>
                        <span className="text-sm text-gray-600">{option.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${option.percentage}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{option.votes} phiếu</span>
                        {vote.myVote === option.id && (
                          <span className="text-green-600 font-medium">✓ Bạn đã bầu chọn</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progress */}
                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="text-gray-600">
                    {vote.totalVotes}/{vote.requiredVotes} phiếu cần thiết
                  </span>
                  <span className="font-medium text-gray-900">
                    {Math.round((vote.totalVotes / vote.requiredVotes) * 100)}% hoàn thành
                  </span>
                </div>

                {/* Action Buttons */}
                {vote.status === 'active' && (
                  <div className="flex gap-3">
                    {vote.myVote === null ? (
                      <>
                        <button
                          onClick={() => handleVote(vote.id, 1)}
                          className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                          Đồng ý
                        </button>
                        <button
                          onClick={() => handleVote(vote.id, 2)}
                          className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                        >
                          Không đồng ý
                        </button>
                      </>
                    ) : (
                      <button className="w-full py-2 bg-gray-100 text-gray-600 rounded-lg font-medium">
                        Đã bỏ phiếu
                      </button>
                    )}
                  </div>
                )}

                {vote.status !== 'active' && (
                  <div className="text-center py-2 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      Kết quả: {vote.result}
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {votes.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100"
            >
              <Vote className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeTab === 'active' ? 'Không có phiếu bầu nào đang mở' : 'Chưa có phiếu bầu nào hoàn thành'}
              </h3>
              <p className="text-gray-600 mb-6">
                {activeTab === 'active' 
                  ? 'Tất cả các phiếu bầu hiện đã được xử lý hoặc chưa có phiếu bầu nào được tạo.'
                  : 'Các phiếu bầu đã hoàn thành sẽ xuất hiện ở đây.'
                }
              </p>
              {activeTab === 'active' && (
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Tạo phiếu bầu đầu tiên
                </button>
              )}
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}