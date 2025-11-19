import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Vote, Plus, Clock, Users, CheckCircle, XCircle, TrendingUp, BarChart3, Calendar, MoreVertical } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Header from "../../../../components/layout/Header";
import Footer from "../../../../components/layout/Footer";
import { useGroupStore } from "../../../../store/groupStore";
import { toast } from "react-toastify";

export default function VotingSystem() {
  const { groupId } = useParams();
  const { votes, fetchUserGroups, fetchGroupVotes, castVote, createVote, isLoading } = useGroupStore();
  const [activeTab, setActiveTab] = useState("active");
  const [showCreateVoteModal, setShowCreateVoteModal] = useState(false);
  const [voteTitle, setVoteTitle] = useState('');
  const [voteDescription, setVoteDescription] = useState('');
  const [voteType, setVoteType] = useState('other');
  const [voteDeadline, setVoteDeadline] = useState('');
  const [voteOptions, setVoteOptions] = useState(['', '']);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get groupId from URL or first group
        let targetGroupId = groupId;
        if (!targetGroupId) {
          await fetchUserGroups();
          const groups = useGroupStore.getState().groups;
          targetGroupId = groups[0]?.id;
        }
        
        if (targetGroupId) {
          await fetchGroupVotes(targetGroupId);
        }
      } catch (error) {
        console.error('Error fetching votes:', error);
        toast.error('Không thể tải danh sách bỏ phiếu');
      }
    };

    fetchData();
  }, [groupId, fetchUserGroups, fetchGroupVotes]);

  const handleOpenCreateVote = () => {
    setVoteTitle('');
    setVoteDescription('');
    setVoteType('other');
    setVoteDeadline('');
    setVoteOptions(['', '']);
    setShowCreateVoteModal(true);
  };

  const handleAddOption = () => {
    setVoteOptions([...voteOptions, '']);
  };

  const handleRemoveOption = (index) => {
    if (voteOptions.length > 2) {
      setVoteOptions(voteOptions.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...voteOptions];
    newOptions[index] = value;
    setVoteOptions(newOptions);
  };

  const handleCreateVote = async () => {
    if (!voteTitle.trim()) {
      toast.error('Vui lòng nhập tiêu đề bỏ phiếu');
      return;
    }

    if (!voteDeadline) {
      toast.error('Vui lòng chọn thời hạn bỏ phiếu');
      return;
    }

    const validOptions = voteOptions.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      toast.error('Cần ít nhất 2 lựa chọn');
      return;
    }

    try {
      let targetGroupId = groupId;
      if (!targetGroupId) {
        const groups = useGroupStore.getState().groups;
        targetGroupId = groups[0]?.id;
      }

      if (!targetGroupId) {
        toast.error('Không tìm thấy nhóm');
        return;
      }

      await createVote({
        groupId: targetGroupId,
        title: voteTitle.trim(),
        description: voteDescription.trim() || undefined,
        voteType,
        deadline: new Date(voteDeadline).toISOString(),
        options: validOptions
      });

      toast.success('Đã tạo bỏ phiếu thành công');
      setShowCreateVoteModal(false);
      
      // Refresh votes
      await fetchGroupVotes(targetGroupId);
    } catch (error) {
      console.error('Error creating vote:', error);
      toast.error(error.response?.data?.message || 'Không thể tạo bỏ phiếu');
    }
  };

  const handleVote = async (voteId, optionId) => {
    try {
      await castVote(voteId, optionId);
      toast.success('Đã bỏ phiếu thành công');
    } catch (error) {
      console.error('Error casting vote:', error);
      toast.error(error.response?.data?.message || 'Không thể bỏ phiếu');
    }
  };

  // Filter votes by status
  const activeVotes = votes.filter(v => v.status === 'open');
  const completedVotes = votes.filter(v => v.status === 'closed');

  if (isLoading) {
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

  const displayedVotes = activeTab === 'active' ? activeVotes : completedVotes;

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
            
            <button 
              onClick={handleOpenCreateVote}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
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
                    {activeVotes.length || 0}
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
                    {completedVotes.length}
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
                    {votes.length > 0 ? '85%' : '0%'}
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
              { id: 'active', name: 'Đang bỏ phiếu', count: activeVotes.length },
              { id: 'completed', name: 'Đã hoàn thành', count: completedVotes.length }
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
          {displayedVotes && displayedVotes.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {displayedVotes.map((vote) => {
                const totalVoteCount = vote.options?.reduce((sum, opt) => sum + (opt.voteCount || 0), 0) || 0;
                
                return (
                  <motion.div
                    key={vote.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{vote.title || 'Không có tiêu đề'}</h3>
                        <p className="text-gray-600 text-sm mb-3">{vote.description || 'Không có mô tả'}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(vote.status)}`}>
                        {getStatusText(vote.status)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>Loại: {vote.voteType || 'other'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Kết thúc: {vote.deadline ? new Date(vote.deadline).toLocaleDateString('vi-VN') : 'N/A'}</span>
                      </div>
                    </div>

                    {/* Voting Options */}
                    <div className="space-y-3 mb-4">
                      {vote.options && vote.options.length > 0 ? (
                        vote.options.map((option) => {
                          const percentage = totalVoteCount > 0 ? Math.round((option.voteCount / totalVoteCount) * 100) : 0;
                          
                          return (
                            <div key={option.id} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">{option.optionText}</span>
                                <span className="text-sm text-gray-600">{percentage}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>{option.voteCount || 0} phiếu</span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center text-gray-500 py-4">Không có lựa chọn nào</div>
                      )}
                    </div>

                    {/* Action Buttons - only for active votes */}
                    {vote.status === 'open' && vote.options && vote.options.length > 0 && (
                      <div className="flex flex-col gap-2">
                        {vote.options.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => handleVote(vote.id, option.id)}
                            className="py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          >
                            Chọn: {option.optionText}
                          </button>
                        ))}
                      </div>
                    )}

                    {vote.status === 'closed' && (
                      <div className="text-center py-2 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">
                          Đã đóng phiếu bỏ phiếu
                        </span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100"
            >
              <div className="flex flex-col items-center">
                <Vote className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {activeTab === 'active' ? 'Không có bỏ phiếu đang diễn ra' : 'Không có bỏ phiếu đã hoàn thành'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {activeTab === 'active' 
                    ? 'Hiện tại không có cuộc bỏ phiếu nào đang diễn ra.' 
                    : 'Chưa có cuộc bỏ phiếu nào được hoàn thành.'}
                </p>
              </div>
            </motion.div>
          )}

          {/* Old Empty State - Remove */}
          {displayedVotes.length === 0 && false && (
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

      {/* Create Vote Modal */}
      {showCreateVoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl p-6 w-full max-w-2xl my-8"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Tạo bỏ phiếu mới</h3>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={voteTitle}
                  onChange={(e) => setVoteTitle(e.target.value)}
                  placeholder="Nhập tiêu đề bỏ phiếu..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả (tùy chọn)
                </label>
                <textarea
                  value={voteDescription}
                  onChange={(e) => setVoteDescription(e.target.value)}
                  placeholder="Nhập mô tả chi tiết..."
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại bỏ phiếu <span className="text-red-500">*</span>
                </label>
                <select
                  value={voteType}
                  onChange={(e) => setVoteType(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="other">Khác</option>
                  <option value="upgrade">Nâng cấp</option>
                  <option value="maintenance">Bảo trì</option>
                  <option value="insurance">Bảo hiểm</option>
                  <option value="sell_vehicle">Bán xe</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời hạn <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={voteDeadline}
                  onChange={(e) => setVoteDeadline(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Các lựa chọn <span className="text-red-500">*</span> (tối thiểu 2)
                </label>
                <div className="space-y-2">
                  {voteOptions.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Lựa chọn ${index + 1}`}
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {voteOptions.length > 2 && (
                        <button
                          onClick={() => handleRemoveOption(index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  {voteOptions.length < 10 && (
                    <button
                      onClick={handleAddOption}
                      className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
                    >
                      + Thêm lựa chọn
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6 pt-4 border-t">
              <button
                onClick={() => setShowCreateVoteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateVote}
                disabled={!voteTitle.trim() || !voteDeadline || voteOptions.filter(o => o.trim()).length < 2}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Tạo bỏ phiếu
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
}