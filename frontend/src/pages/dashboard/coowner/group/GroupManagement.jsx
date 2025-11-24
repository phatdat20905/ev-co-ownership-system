import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Users, UserPlus, Settings, Mail, Phone, Calendar, Car, MoreVertical, Edit, Trash2, Shield, Crown, Check, X, Send, UserCheck, UserX } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Header from "../../../../components/layout/Header";
import Footer from "../../../../components/layout/Footer";
import { useGroupStore } from "../../../../store";
import { useAuthStore } from "../../../../store/authStore";
import { toast } from "react-toastify";
import { notificationAPI } from "../../../../api/notification";
import { vehicleAPI } from "../../../../api/vehicle";

export default function GroupManagement() {
  const { groupId } = useParams();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("members");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [inviteUserId, setInviteUserId] = useState("");
  const [inviteIdentifier, setInviteIdentifier] = useState(""); // email or phone
  const [inviteOwnership, setInviteOwnership] = useState(10);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState(null);
  const [newRole, setNewRole] = useState('member');
  const [editingRules, setEditingRules] = useState('');
  const [searchingUser, setSearchingUser] = useState(false);
  const [foundUser, setFoundUser] = useState(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [vehicleData, setVehicleData] = useState(null);
  const [vehicleLoading, setVehicleLoading] = useState(false);
  
  const { groups, members, currentGroup, fetchUserGroups, fetchGroupById, fetchGroupMembers, addMember, removeMember, updateOwnership, updateMemberRole, updateGroupRules } = useGroupStore();
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Get groupId from URL or first group
        let targetGroupId = groupId;
        if (!targetGroupId) {
          await fetchUserGroups();
          const store = useGroupStore.getState();
          if (store.groups && store.groups.length > 0) {
            targetGroupId = store.groups[0].id;
          }
        }
        
        if (targetGroupId) {
          await Promise.all([
            fetchGroupById(targetGroupId),
            fetchGroupMembers(targetGroupId)
          ]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Không thể tải dữ liệu nhóm');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [groupId, fetchUserGroups, fetchGroupById, fetchGroupMembers]);

  // Get group data from store
  const groupData = currentGroup || (groups.length > 0 ? groups[0] : null);

  // Fetch vehicle data when group data is available
  useEffect(() => {
    const fetchVehicleData = async () => {
      if (!groupData?.id) {
        setVehicleData(null);
        return;
      }

      setVehicleLoading(true);
      try {
        const response = await vehicleAPI.getVehiclesByGroupId(groupData.id);
        // The API returns { vehicles: [...], pagination: {...} }
        if (response.data?.vehicles && response.data.vehicles.length > 0) {
          // Get the first vehicle for this group
          setVehicleData(response.data.vehicles[0]);
        } else {
          setVehicleData(null);
        }
      } catch (error) {
        console.error('Error fetching vehicle data:', error);
        setVehicleData(null);
      } finally {
        setVehicleLoading(false);
      }
    };

    fetchVehicleData();
  }, [groupData?.id]);

  // Get current user role in this group
  const getCurrentUserRole = () => {
    if (!groupData || !user) return 'member';
    if (groupData.createdBy === user.id) return 'owner';
    const currentMember = members.find(m => m.userId === user.id);
    return currentMember?.role || 'member';
  };

  const currentUserRole = getCurrentUserRole();

  // CÁC HÀM QUẢN LÝ THÀNH VIÊN
  
  // Tìm kiếm user theo email hoặc phone
  const handleSearchUser = async () => {
    if (!inviteIdentifier.trim()) {
      toast.error('Vui lòng nhập email hoặc số điện thoại');
      return;
    }

    setSearchingUser(true);
    try {
      const response = await fetch(`http://localhost:3000/api/v1/user/search?identifier=${encodeURIComponent(inviteIdentifier)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setFoundUser(data.data);
          setInviteUserId(data.data.id);
          toast.success(`Tìm thấy: ${data.data.fullName || data.data.email}`);
        } else {
          toast.error('Không tìm thấy người dùng');
          setFoundUser(null);
        }
      } else {
        toast.error('Không tìm thấy người dùng');
        setFoundUser(null);
      }
    } catch (error) {
      console.error('Error searching user:', error);
      toast.error('Lỗi tìm kiếm người dùng');
      setFoundUser(null);
    } finally {
      setSearchingUser(false);
    }
  };

  const handleInviteMember = async () => {
    if (!inviteUserId || !groupData) return;
    
    try {
      await addMember(groupData.id, {
        userId: inviteUserId,
        ownershipPercentage: parseFloat(inviteOwnership)
      });
      setInviteUserId("");
      setInviteIdentifier("");
      setFoundUser(null);
      setInviteOwnership(10);
      setShowInviteModal(false);
      toast.success('Đã thêm thành viên thành công');
      // Refresh members
      await fetchGroupMembers(groupData.id);
    } catch (error) {
      console.error('Error inviting member:', error);
      toast.error(error.response?.data?.message || 'Không thể gửi lời mời');
    }
  };

  const handleSendNotification = async () => {
    if (!notificationTitle.trim() || !notificationMessage.trim()) {
      toast.error('Vui lòng nhập đầy đủ tiêu đề và nội dung');
      return;
    }

    if (!groupData) return;

    try {
      // Gửi notification đến tất cả thành viên trong nhóm qua API wrapper
      await notificationAPI.sendBulkNotification({
        userIds: members.map(m => m.userId), // Changed from 'recipients' to 'userIds'
        title: notificationTitle,
        body: notificationMessage, // Changed from 'message' to 'body'
        data: { // Moved to 'data' field
          type: 'group_announcement',
          groupId: groupData.id,
          groupName: groupData.groupName
        }
      });

      setShowNotificationModal(false);
      setNotificationTitle('');
      setNotificationMessage('');
      toast.success('Đã gửi thông báo đến tất cả thành viên');
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error(error.response?.data?.message || 'Lỗi gửi thông báo');
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (!groupData) return;
    
    try {
      await removeMember(groupData.id, memberId);
      setShowDeleteModal(false);
      setMemberToDelete(null);
      toast.success('Đã xóa thành viên thành công');
      // Refresh members
      await fetchGroupMembers(groupData.id);
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error(error.response?.data?.message || 'Không thể xóa thành viên');
    }
  };

  const handleUpdateOwnership = async (memberId, newOwnership) => {
    if (!groupData) return;
    
    try {
      await updateOwnership(groupData.id, memberId, parseFloat(newOwnership));
      setEditingMember(null);
      toast.success('Đã cập nhật tỷ lệ sở hữu');
      // Refresh members
      await fetchGroupMembers(groupData.id);
    } catch (error) {
      console.error('Error updating ownership:', error);
      toast.error(error.response?.data?.message || 'Không thể cập nhật tỷ lệ sở hữu');
    }
  };

  const handleUpdateRole = async (memberId, newRoleValue) => {
    if (!groupData) return;
    
    try {
      await updateMemberRole(groupData.id, memberId, newRoleValue);
      setShowRoleModal(false);
      setMemberToEdit(null);
      setNewRole('member');
      toast.success('Đã cập nhật vai trò thành viên');
      // Refresh members
      await fetchGroupMembers(groupData.id);
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error(error.response?.data?.message || 'Không thể cập nhật vai trò');
    }
  };

  const openRoleModal = (member) => {
    setMemberToEdit(member);
    setNewRole(member.role);
    setShowRoleModal(true);
  };

  const handleApproveMember = (memberId) => {
    // Approve member functionality would require a backend approval workflow
    toast.info('Chức năng phê duyệt đang được phát triển');
  };

  const handleRejectMember = (memberId) => {
    handleDeleteMember(memberId);
  };

  const handleEditRules = () => {
    setEditingRules(groupData?.groupRules || '');
    setShowRulesModal(true);
  };

  const handleSaveRules = async () => {
    if (!groupData) return;
    
    try {
      await updateGroupRules(groupData.id, editingRules);
      setShowRulesModal(false);
      toast.success('Đã cập nhật quy định nhóm');
      // Refresh group data
      await fetchGroupById(groupData.id);
    } catch (error) {
      console.error('Error updating rules:', error);
      toast.error(error.response?.data?.message || 'Không thể cập nhật quy định');
    }
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
                    <h2 className="text-xl font-bold text-gray-900">{groupData?.groupName || 'Nhóm'}</h2>
                    <p className="text-gray-600 mt-1">Tạo ngày {groupData?.createdAt ? new Date(groupData.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</p>
                  </div>
                  {vehicleData && (
                    <div className="flex items-center gap-2">
                      <Car className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-600">{vehicleData.vehicleName || vehicleData.model || 'N/A'}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600">{members?.length || 0}</div>
                    <div className="text-sm text-blue-600">Thành viên</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <div className="text-2xl font-bold text-green-600">
                      {members?.reduce((sum, m) => sum + (m.ownershipPercentage || 0), 0) || 0}%
                    </div>
                    <div className="text-sm text-green-600">Tỷ lệ sở hữu</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-xl">
                    <div className="text-2xl font-bold text-purple-600">{members?.filter(m => m.status === 'active').length || 0}</div>
                    <div className="text-sm text-purple-600">Hoạt động</div>
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-gray-200 mb-6">
                  <nav className="flex space-x-8">
                    {[
                      { id: 'members', name: 'Thành viên', count: members?.length || 0 },
                      { id: 'rules', name: 'Quy định', count: groupData?.groupRules?.length || 0 },
                      { id: 'activities', name: 'Hoạt động', count: groupData?.recentActivities?.length || 0 }
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
                    {members && members.length > 0 ? (
                      members.map((member) => {
                        const RoleIcon = getRoleBadge(member.role).icon;
                        const isPending = member.status === 'pending';
                        
                        return (
                          <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4 flex-1">
                              {member.userProfile?.avatarUrl ? (
                                <img 
                                  src={member.userProfile.avatarUrl} 
                                  alt={member.userProfile.fullName}
                                  className="w-12 h-12 rounded-xl object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.userProfile?.fullName || 'User')}&size=200&background=random`;
                                  }}
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl flex items-center justify-center font-semibold text-lg">
                                  {member.userProfile?.fullName?.[0] || 'U'}
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-gray-900">{member.userProfile?.fullName || 'Unknown User'}</h3>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(member.role).color}`}>
                                    <RoleIcon className="w-3 h-3 inline mr-1" />
                                    {getRoleBadge(member.role).text}
                                  </span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(member.isActive ? 'active' : 'inactive').color}`}>
                                    {getStatusBadge(member.isActive ? 'active' : 'inactive').text}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>Tham gia: {new Date(member.joinedAt || member.createdAt).toLocaleDateString('vi-VN')}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-gray-500">ID: {member.userId.slice(0, 8)}...</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900">{member.ownershipPercentage || 0}%</div>
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
                                        title="Chỉnh sửa tỷ lệ sở hữu"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </button>
                                      {canManageMembers(currentUserRole) && member.role !== 'owner' && (
                                        <button 
                                          onClick={() => openRoleModal(member)}
                                          className="p-1 text-purple-600 hover:bg-purple-100 rounded transition-colors"
                                          title="Thay đổi vai trò"
                                        >
                                          <Shield className="w-4 h-4" />
                                        </button>
                                      )}
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
                      })
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        Chưa có thành viên nào
                      </div>
                    )}
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
                      {(groupData?.groupRules || []).map((rule, index) => (
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
                    {(groupData?.recentActivities || []).map((activity) => (
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
                  {vehicleLoading ? (
                    <div className="text-center text-gray-500 py-4">
                      <div className="animate-pulse">Đang tải thông tin xe...</div>
                    </div>
                  ) : vehicleData ? (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Tên xe</label>
                        <p className="text-gray-900 font-semibold">{vehicleData.vehicleName || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Hãng xe</label>
                        <p className="text-gray-900">{vehicleData.brand || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Model</label>
                        <p className="text-gray-900">{vehicleData.model || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Biển số</label>
                        <p className="text-gray-900 font-mono">{vehicleData.licensePlate || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Trạng thái</label>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          vehicleData.status === 'available' ? 'bg-green-100 text-green-800' : 
                          vehicleData.status === 'in_use' ? 'bg-blue-100 text-blue-800' : 
                          vehicleData.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {vehicleData.status === 'available' ? 'Sẵn sàng' : 
                           vehicleData.status === 'in_use' ? 'Đang sử dụng' : 
                           vehicleData.status === 'maintenance' ? 'Bảo trì' :
                           vehicleData.status === 'unavailable' ? 'Không khả dụng' :
                           'Không rõ'}
                        </span>
                      </div>
                      {vehicleData.year && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Năm sản xuất</label>
                          <p className="text-gray-900">{vehicleData.year}</p>
                        </div>
                      )}
                      {vehicleData.batteryCapacityKwh && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Dung lượng pin</label>
                          <p className="text-gray-900">{vehicleData.batteryCapacityKwh} kWh</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      Chưa có thông tin xe
                    </div>
                  )}
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
                  <button 
                    onClick={() => setShowNotificationModal(true)}
                    className="w-full flex items-center gap-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-200 transition-colors"
                  >
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
                    Email hoặc Số điện thoại
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inviteIdentifier}
                      onChange={(e) => setInviteIdentifier(e.target.value)}
                      placeholder="Nhập email hoặc số điện thoại..."
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleSearchUser()}
                    />
                    <button
                      onClick={handleSearchUser}
                      disabled={searchingUser || !inviteIdentifier.trim()}
                      className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {searchingUser ? 'Đang tìm...' : 'Tìm'}
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Ví dụ: user@example.com hoặc 0123456789</p>
                </div>

                {foundUser && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      {foundUser.avatarUrl ? (
                        <img 
                          src={foundUser.avatarUrl} 
                          alt={foundUser.fullName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                          {foundUser.fullName?.[0] || foundUser.email?.[0] || 'U'}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">{foundUser.fullName || 'N/A'}</p>
                        <p className="text-sm text-gray-600">{foundUser.email || foundUser.phoneNumber}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tỷ lệ sở hữu (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={inviteOwnership}
                    onChange={(e) => setInviteOwnership(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setShowInviteModal(false);
                      setInviteUserId("");
                      setInviteIdentifier("");
                      setFoundUser(null);
                      setInviteOwnership(10);
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Huỷ
                  </button>
                  <button
                    onClick={handleInviteMember}
                    disabled={!inviteUserId || !foundUser}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4 inline mr-2" />
                    Thêm thành viên
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
                Bạn có chắc muốn xoá thành viên <strong>{memberToDelete.User?.fullName || memberToDelete.User?.username || 'Unknown'}</strong> khỏi nhóm?
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

      {/* Modal Chỉnh sửa Role và Ownership */}
      <AnimatePresence>
        {editingMember && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Chỉnh sửa thành viên</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên: {editingMember.User?.fullName || editingMember.User?.username || 'Unknown'}
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vai trò
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tỷ lệ sở hữu (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    defaultValue={editingMember.ownershipPercentage}
                    onChange={(e) => {
                      const newOwnership = e.target.value;
                      setEditingMember({ ...editingMember, ownershipPercentage: newOwnership });
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setEditingMember(null)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => handleUpdateOwnership(editingMember.id, editingMember.ownershipPercentage)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Lưu thay đổi
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Edit Rules */}
      <AnimatePresence>
        {showRulesModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quy định nhóm</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung quy định
                  </label>
                  <textarea
                    value={editingRules}
                    onChange={(e) => setEditingRules(e.target.value)}
                    placeholder="Nhập quy định nhóm..."
                    rows="10"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Gợi ý quy định:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    <li>Quy định về thời gian sử dụng xe</li>
                    <li>Quy định về chi phí bảo trì và sửa chữa</li>
                    <li>Quy định về bảo hiểm và trách nhiệm</li>
                    <li>Quy định về chia sẻ chi phí nhiên liệu</li>
                    <li>Quy định về việc cho thuê xe</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => setShowRulesModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveRules}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Lưu quy định
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Role Update Modal */}
      <AnimatePresence>
        {showRoleModal && memberToEdit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Cập nhật vai trò</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Thành viên: <strong>{memberToEdit.userProfile?.fullName || 'N/A'}</strong>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vai trò mới
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="member">Thành viên</option>
                    <option value="admin">Quản trị viên</option>
                    {currentUserRole === 'owner' && <option value="owner">Chủ sở hữu</option>}
                  </select>
                  <p className="text-xs text-gray-500 mt-2">
                    {newRole === 'owner' && 'Chủ sở hữu có toàn quyền quản lý nhóm'}
                    {newRole === 'admin' && 'Quản trị viên có thể quản lý thành viên và nội dung'}
                    {newRole === 'member' && 'Thành viên chỉ có thể xem và tham gia hoạt động'}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => {
                    setShowRoleModal(false);
                    setMemberToEdit(null);
                    setNewRole('member');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleUpdateRole(memberToEdit.userId, newRole)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Cập nhật
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Notification Modal */}
      <AnimatePresence>
        {showNotificationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Gửi thông báo</h3>
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Thông báo sẽ được gửi đến <strong>{members?.length || 0} thành viên</strong> trong nhóm
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiêu đề <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={notificationTitle}
                    onChange={(e) => setNotificationTitle(e.target.value)}
                    placeholder="Nhập tiêu đề thông báo..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={notificationMessage}
                    onChange={(e) => setNotificationMessage(e.target.value)}
                    placeholder="Nhập nội dung thông báo..."
                    rows="5"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => {
                    setShowNotificationModal(false);
                    setNotificationTitle('');
                    setNotificationMessage('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSendNotification}
                  disabled={!notificationTitle.trim() || !notificationMessage.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4 inline mr-2" />
                  Gửi thông báo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}