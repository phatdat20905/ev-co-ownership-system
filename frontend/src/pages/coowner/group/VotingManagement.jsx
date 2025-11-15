import { useState, useEffect } from "react";
import LoadingSkeleton from '../../../components/LoadingSkeleton';
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Vote,
  Plus,
  ThumbsUp,
  ThumbsDown,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Calendar,
  TrendingUp,
  AlertCircle,
  X,
  Filter,
  Search,
} from "lucide-react";
import userService from "../../../services/userService";
import { toast } from "../../../utils/toast";

const VotingManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [votes, setVotes] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groups, setGroups] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedVote, setSelectedVote] = useState(null);

  // Create vote form
  const [newVote, setNewVote] = useState({
    title: "",
    description: "",
    options: ["", ""],
    endDate: "",
    groupId: "",
  });

  useEffect(() => {
    fetchUserGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchGroupVotes(selectedGroup);
    }
  }, [selectedGroup]);

  const fetchUserGroups = async () => {
    try {
      const response = await userService.getUserGroups();
      const userGroups = response.data || [];
      setGroups(userGroups);
      if (userGroups.length > 0) {
        setSelectedGroup(userGroups[0].id);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast.error("Không thể tải danh sách nhóm");
    }
  };

  const fetchGroupVotes = async (groupId) => {
    try {
      setLoading(true);
      const response = await userService.getGroupVotes(groupId);
      setVotes(response.data || []);
    } catch (error) {
      console.error("Error fetching votes:", error);
      toast.error("Không thể tải danh sách bỏ phiếu");
      setVotes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVote = async () => {
    if (!newVote.title || !newVote.description || !newVote.endDate) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const validOptions = newVote.options.filter(opt => opt.trim() !== "");
    if (validOptions.length < 2) {
      toast.error("Cần ít nhất 2 lựa chọn");
      return;
    }

    try {
      await userService.createVote({
        groupId: selectedGroup,
        title: newVote.title,
        description: newVote.description,
        options: validOptions,
        endDate: newVote.endDate,
      });
      toast.success("Tạo bỏ phiếu thành công");
      setShowCreateModal(false);
      setNewVote({
        title: "",
        description: "",
        options: ["", ""],
        endDate: "",
        groupId: "",
      });
      fetchGroupVotes(selectedGroup);
    } catch (error) {
      console.error("Error creating vote:", error);
      toast.error(error.response?.data?.message || "Không thể tạo bỏ phiếu");
    }
  };

  const handleCastVote = async (voteId, optionIndex) => {
    try {
      await userService.castVote(voteId, { optionIndex });
      toast.success("Đã bỏ phiếu thành công");
      fetchGroupVotes(selectedGroup);
      setSelectedVote(null);
    } catch (error) {
      console.error("Error casting vote:", error);
      toast.error(error.response?.data?.message || "Không thể bỏ phiếu");
    }
  };

  const handleCloseVote = async (voteId) => {
    try {
      await userService.closeVote(voteId);
      toast.success("Đã kết thúc bỏ phiếu");
      fetchGroupVotes(selectedGroup);
    } catch (error) {
      console.error("Error closing vote:", error);
      toast.error("Không thể kết thúc bỏ phiếu");
    }
  };

  const addOption = () => {
    setNewVote({ ...newVote, options: [...newVote.options, ""] });
  };

  const removeOption = (index) => {
    if (newVote.options.length <= 2) {
      toast.error("Cần ít nhất 2 lựa chọn");
      return;
    }
    const newOptions = newVote.options.filter((_, i) => i !== index);
    setNewVote({ ...newVote, options: newOptions });
  };

  const updateOption = (index, value) => {
    const newOptions = [...newVote.options];
    newOptions[index] = value;
    setNewVote({ ...newVote, options: newOptions });
  };

  const filteredVotes = votes.filter((vote) => {
    const matchesSearch =
      vote.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vote.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || vote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <Clock className="w-4 h-4 text-blue-600" />;
      case "closed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "closed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const calculateResults = (vote) => {
    if (!vote.options) return [];
    const totalVotes = vote.totalVotes || 0;
    return vote.options.map((option, index) => ({
      option,
      votes: vote.results?.[index] || 0,
      percentage: totalVotes > 0 ? ((vote.results?.[index] || 0) / totalVotes) * 100 : 0,
    }));
  };

  const stats = {
    total: votes.length,
    active: votes.filter((v) => v.status === "active").length,
    closed: votes.filter((v) => v.status === "closed").length,
    participated: votes.filter((v) => v.hasVoted).length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              Bỏ phiếu nhóm
            </h1>
            <p className="text-gray-600">
              Tạo và tham gia bỏ phiếu cho các quyết định nhóm
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden lg:inline">Tạo bỏ phiếu</span>
          </button>
        </div>

        {/* Group Selector */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Chọn nhóm
          </label>
          <select
            value={selectedGroup || ""}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng số</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Vote className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đang diễn ra</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đã kết thúc</p>
                <p className="text-2xl font-bold text-gray-900">{stats.closed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đã tham gia</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.participated}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm bỏ phiếu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang diễn ra</option>
              <option value="closed">Đã kết thúc</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-6">
          <LoadingSkeleton.ListSkeleton items={4} />
        </div>
      )}

      {/* Votes List */}
      {!loading && (
        <div className="max-w-7xl mx-auto">
          {filteredVotes.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
              <Vote className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có bỏ phiếu nào
              </h3>
              <p className="text-gray-600 mb-6">
                Tạo bỏ phiếu mới để các thành viên nhóm quyết định
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tạo bỏ phiếu đầu tiên
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredVotes.map((vote) => (
                <motion.div
                  key={vote.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {vote.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {vote.description}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{vote.totalVotes || 0} phiếu</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Kết thúc:{" "}
                            {new Date(vote.endDate).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`flex items-center space-x-1 px-3 py-1 rounded-full border ${getStatusColor(
                          vote.status
                        )}`}
                      >
                        {getStatusIcon(vote.status)}
                        <span className="text-xs font-medium">
                          {vote.status === "active"
                            ? "Đang diễn ra"
                            : vote.status === "closed"
                            ? "Đã kết thúc"
                            : "Đã hủy"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Vote Options/Results */}
                  <div className="space-y-3 mb-4">
                    {calculateResults(vote).map((result, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">
                            {result.option}
                          </span>
                          <span className="text-sm text-gray-600">
                            {result.votes} phiếu ({result.percentage.toFixed(1)}
                            %)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${result.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedVote(vote)}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      disabled={vote.hasVoted || vote.status !== "active"}
                    >
                      {vote.hasVoted
                        ? "Đã bỏ phiếu"
                        : vote.status !== "active"
                        ? "Đã kết thúc"
                        : "Bỏ phiếu"}
                    </button>
                    {vote.isCreator && vote.status === "active" && (
                      <button
                        onClick={() => handleCloseVote(vote.id)}
                        className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                      >
                        Kết thúc
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Vote Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    Tạo bỏ phiếu mới
                  </h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiêu đề *
                  </label>
                  <input
                    type="text"
                    value={newVote.title}
                    onChange={(e) =>
                      setNewVote({ ...newVote, title: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="VD: Chọn màu sơn xe mới"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả *
                  </label>
                  <textarea
                    value={newVote.description}
                    onChange={(e) =>
                      setNewVote({ ...newVote, description: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Mô tả chi tiết về bỏ phiếu này"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời gian kết thúc *
                  </label>
                  <input
                    type="datetime-local"
                    value={newVote.endDate}
                    onChange={(e) =>
                      setNewVote({ ...newVote, endDate: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Các lựa chọn *
                    </label>
                    <button
                      onClick={addOption}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      + Thêm lựa chọn
                    </button>
                  </div>
                  <div className="space-y-2">
                    {newVote.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={`Lựa chọn ${index + 1}`}
                        />
                        {newVote.options.length > 2 && (
                          <button
                            onClick={() => removeOption(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateVote}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Tạo bỏ phiếu
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cast Vote Modal */}
      <AnimatePresence>
        {selectedVote && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl w-full max-w-lg"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    Bỏ phiếu
                  </h2>
                  <button
                    onClick={() => setSelectedVote(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {selectedVote.title}
                </h3>
                <p className="text-gray-600 text-sm mb-6">
                  {selectedVote.description}
                </p>

                <div className="space-y-3">
                  {selectedVote.options?.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleCastVote(selectedVote.id, index)}
                      className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">
                          {option}
                        </span>
                        <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VotingManagement;
