import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Users, UserPlus, Settings, Mail, Phone, Calendar, Car, MoreVertical, Edit, Trash2, Shield, Crown, Check, X, Send, UserCheck, UserX } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../../../../components/layout/Header";
import Footer from "../../../../components/layout/Footer";

export default function GroupManagement() {
  const [groupData, setGroupData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("members");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [memberToDelete, setMemberToDelete] = useState(null);

  useEffect(() => {
    const fetchGroupData = async () => {
      setTimeout(() => {
        setGroupData({
          groupName: "Nhóm Tesla Model 3 Premium",
          createdDate: "2024-01-15",
          totalMembers: 4,
          carInfo: {
            name: "Tesla Model 3",
            model: "2023 Long Range",
            licensePlate: "59A-123.45",
            status: "active"
          },
          members: [
            {
              id: 1,
              name: "Nguyễn Văn A",
              email: "nguyenvana@email.com",
              phone: "0912345678",
              joinDate: "2024-01-15",
              ownership: 40,
              role: "owner",
              status: "active",
              avatar: "NA"
            },
            {
              id: 2,
              name: "Trần Thị B",
              email: "tranthib@email.com",
              phone: "0912345679",
              joinDate: "2024-01-20",
              ownership: 30,
              role: "member",
              status: "active",
              avatar: "TB"
            },
            {
              id: 3,
              name: "Lê Văn C",
              email: "levanc@email.com",
              phone: "0912345680",
              joinDate: "2024-01-25",
              ownership: 20,
              role: "member",
              status: "active",
              avatar: "LC"
            },
            {
              id: 4,
              name: "Phạm Thị D",
              email: "phamthid@email.com",
              phone: "0912345681",
              joinDate: "2024-02-01",
              ownership: 10,
              role: "member",
              status: "pending",
              avatar: "PD"
            }
          ],
          groupRules: [
            "Tối đa 30 giờ sử dụng/tháng cho mỗi thành viên",
            "Đặt lịch trước 24 giờ cho các chuyến đi",
            "Vệ sinh xe sau khi sử dụng",
            "Báo cáo sự cố ngay khi phát hiện"
          ],
          recentActivities: [
            {
              id: 1,
              type: "member_joined",
              message: "Phạm Thị D đã tham gia nhóm",
              time: "2 ngày trước",
              user: "Phạm Thị D"
            },
            {
              id: 2,
              type: "vote_created",
              message: "Bỏ phiếu về việc nâng cấp ghế xe",
              time: "1 tuần trước",
              user: "Trần Thị B"
            },
            {
              id: 3,
              type: "payment_made",
              message: "Đã thanh toán phí bảo dưỡng tháng 1",
              time: "2 tuần trước",
              user: "Nguyễn Văn A"
            }
          ]
        });
        setLoading(false);
      }, 1500);
    };

    fetchGroupData();
  }, []);

  // CÁC HÀM QUẢN LÝ THÀNH VIÊN
  const handleInviteMember = () => {
    if (!inviteEmail) return;
    
    // Mock gửi lời mời
    console.log("Gửi lời mời đến:", inviteEmail);
    // Thêm thành viên pending
    const newMember = {
      id: Date.now(),
      name: "Thành viên mới",
      email: inviteEmail,
      phone: "Đang cập nhật",
      joinDate: new Date().toISOString().split('T')[0],
      ownership: 0,
      role: "member",
      status: "pending",
      avatar: "TM"
    };

    setGroupData(prev => ({
      ...prev,
      members: [...prev.members, newMember],
      totalMembers: prev.totalMembers + 1
    }));

    setInviteEmail("");
    setShowInviteModal(false);
  };

  const handleDeleteMember = (memberId) => {
    setGroupData(prev => ({
      ...prev,
      members: prev.members.filter(member => member.id !== memberId),
      totalMembers: prev.totalMembers - 1
    }));
    setShowDeleteModal(false);
    setMemberToDelete(null);
  };

  const handleUpdateRole = (memberId, newRole) => {
    setGroupData(prev => ({
      ...prev,
      members: prev.members.map(member => 
        member.id === memberId ? { ...member, role: newRole } : member
      )
    }));
    setEditingMember(null);
  };

  const handleApproveMember = (memberId) => {
    setGroupData(prev => ({
      ...prev,
      members: prev.members.map(member => 
        member.id === memberId ? { ...member, status: "active" } : member
      )
    }));
  };

  const handleRejectMember = (memberId) => {
    handleDeleteMember(memberId);
  };

  const handleEditRules = () => {
    // Mở modal chỉnh sửa quy định
    console.log("Mở chỉnh sửa quy định");
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'owner':
        return { color: 'bg-yellow-100 text-yellow-800', icon: Crown, text: 'Chủ sở hữu' };
      case 'admin':
        return { color: 'bg-blue-100 text-blue-800', icon: Shield, text: 'Quản trị' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: Users, text: 'Thành viên' };
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return { color: 'bg-green-100 text-green-800', text: 'Đang hoạt động' };
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800', text: 'Chờ xác nhận' };
      case 'inactive':
        return { color: 'bg-red-100 text-red-800', text: 'Ngừng hoạt động' };
      default:
        return { color: 'bg-gray-100 text-gray-800', text: 'Không xác định' };
    }
  };

  // Kiểm tra quyền - chỉ owner và admin có thể quản lý
  const canManageMembers = (currentUserRole) => {
    return ['owner', 'admin'].includes(currentUserRole);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-20 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentUserRole = "owner"; // Giả sử user hiện tại là owner

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
                <h1 className="text-3xl font-bold text-gray-900">Quản lý nhóm</h1>
                <p className="text-gray-600 mt-1">Quản lý thành viên và cài đặt nhóm</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={handleEditRules}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Cài đặt nhóm</span>
              </button>
              <button 
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Mời thành viên</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{groupData.groupName}</h2>
                    <p className="text-gray-600 mt-1">Tạo ngày {groupData.createdDate}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Car className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">{groupData.carInfo.name}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600">{groupData.totalMembers}</div>
                    <div className="text-sm text-blue-600">Thành viên</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <div className="text-2xl font-bold text-green-600">100%</div>
                    <div className="text-sm text-green-600">Tỷ lệ sở hữu</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-xl">
                    <div className="text-2xl font-bold text-purple-600">3</div>
                    <div className="text-sm text-purple-600">Hoạt động</div>
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-gray-200 mb-6">
                  <nav className="flex space-x-8">
                    {[
                      { id: 'members', name: 'Thành viên', count: groupData.members.length },
                      { id: 'rules', name: 'Quy định', count: groupData.groupRules.length },
                      { id: 'activities', name: 'Hoạt động', count: groupData.recentActivities.length }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {tab.name}
                        <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                {activeTab === 'members' && (
                  <div className="space-y-4">
                    {groupData.members.map((member) => {
                      const RoleIcon = getRoleBadge(member.role).icon;
                      const isPending = member.status === 'pending';
                      
                      return (
                        <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl flex items-center justify-center font-semibold text-lg">
                              {member.avatar}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900">{member.name}</h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(member.role).color}`}>
                                  <RoleIcon className="w-3 h-3 inline mr-1" />
                                  {getRoleBadge(member.role).text}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(member.status).color}`}>
                                  {getStatusBadge(member.status).text}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Mail className="w-4 h-4" />
                                  <span>{member.email}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Phone className="w-4 h-4" />
                                  <span>{member.phone}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>Tham gia: {member.joinDate}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">{member.ownership}%</div>
                            <div className="text-sm text-gray-600">Tỷ lệ sở hữu</div>
                            
                            {canManageMembers(currentUserRole) && (
                              <div className="flex items-center gap-2 mt-2">
                                {isPending ? (
                                  <>
                                    <button 
                                      onClick={() => handleApproveMember(member.id)}
                                      className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                                      title="Chấp nhận"
                                    >
                                      <UserCheck className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => handleRejectMember(member.id)}
                                      className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                      title="Từ chối"
                                    >
                                      <UserX className="w-4 h-4" />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button 
                                      onClick={() => setEditingMember(member)}
                                      className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                      title="Chỉnh sửa"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    {member.role !== 'owner' && (
                                      <button 
                                        onClick={() => {
                                          setMemberToDelete(member);
                                          setShowDeleteModal(true);
                                        }}
                                        className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                        title="Xoá thành viên"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeTab === 'rules' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Quy định nhóm</h3>
                      {canManageMembers(currentUserRole) && (
                        <button 
                          onClick={handleEditRules}
                          className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          Chỉnh sửa
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
                      {groupData.groupRules.map((rule, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                          <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                            {index + 1}
                          </div>
                          <p className="text-gray-700">{rule}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'activities' && (
                  <div className="space-y-4">
                    {groupData.recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-4 p-3 border border-gray-200 rounded-lg">
                        <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-800">{activity.message}</p>
                          <p className="text-sm text-gray-500 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Car Info */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">Thông tin xe</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Xe</label>
                    <p className="text-gray-900 font-semibold">{groupData.carInfo.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Model</label>
                    <p className="text-gray-900">{groupData.carInfo.model}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Biển số</label>
                    <p className="text-gray-900 font-mono">{groupData.carInfo.licensePlate}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Trạng thái</label>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Đang hoạt động
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">Hành động nhanh</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => setShowInviteModal(true)}
                    className="w-full flex items-center gap-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors"
                  >
                    <UserPlus className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900">Mời thành viên</div>
                      <div className="text-sm text-gray-600">Thêm thành viên mới</div>
                    </div>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-200 transition-colors">
                    <Mail className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="font-medium text-gray-900">Gửi thông báo</div>
                      <div className="text-sm text-gray-600">Thông báo cho nhóm</div>
                    </div>
                  </button>
                  <button 
                    onClick={handleEditRules}
                    className="w-full flex items-center gap-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-200 transition-colors"
                  >
                    <Settings className="w-5 h-5 text-purple-600" />
                    <div>
                      <div className="font-medium text-gray-900">Cài đặt nhóm</div>
                      <div className="text-sm text-gray-600">Quy định & Quyền</div>
                    </div>
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Modal Mời Thành Viên */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Mời thành viên</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email thành viên
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="nhập email thành viên..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Huỷ
                  </button>
                  <button
                    onClick={handleInviteMember}
                    disabled={!inviteEmail}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4 inline mr-2" />
                    Gửi lời mời
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Xác nhận Xoá */}
      <AnimatePresence>
        {showDeleteModal && memberToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">Xác nhận xoá</h3>
              <p className="text-gray-600 mb-6">
                Bạn có chắc muốn xoá thành viên <strong>{memberToDelete.name}</strong> khỏi nhóm?
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Huỷ
                </button>
                <button
                  onClick={() => handleDeleteMember(memberToDelete.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4 inline mr-2" />
                  Xoá thành viên
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Chỉnh sửa Role */}
      <AnimatePresence>
        {editingMember && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Phân quyền thành viên</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vai trò cho {editingMember.name}
                  </label>
                  <select 
                    defaultValue={editingMember.role}
                    onChange={(e) => handleUpdateRole(editingMember.id, e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="member">Thành viên</option>
                    <option value="admin">Quản trị viên</option>
                    {currentUserRole === 'owner' && <option value="owner">Chủ sở hữu</option>}
                  </select>
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setEditingMember(null)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}