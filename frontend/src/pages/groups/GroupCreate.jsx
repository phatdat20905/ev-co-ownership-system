import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGroupStore } from '../../stores/useGroupStore';
import { Users, Plus, X } from 'lucide-react';
import CoownerLayout from '../../components/layout/CoownerLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { toast } from 'react-toastify';

export default function GroupCreate() {
  const navigate = useNavigate();
  const createGroup = useGroupStore((state) => state.createGroup);
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  
  const [members, setMembers] = useState([
    { email: '', ownershipPercentage: 0, role: 'admin' }
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMemberChange = (index, field, value) => {
    const updatedMembers = [...members];
    if (field === 'ownershipPercentage') {
      updatedMembers[index][field] = Math.max(0, Math.min(100, parseFloat(value) || 0));
    } else {
      updatedMembers[index][field] = value;
    }
    setMembers(updatedMembers);
  };

  const addMember = () => {
    setMembers([...members, { email: '', ownershipPercentage: 0, role: 'member' }]);
  };

  const removeMember = (index) => {
    if (members.length > 1) {
      setMembers(members.filter((_, i) => i !== index));
    } else {
      toast.error('Nhóm phải có ít nhất 1 thành viên');
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên nhóm');
      return false;
    }

    // Check if all members have email
    const emptyEmails = members.filter(m => !m.email.trim());
    if (emptyEmails.length > 0) {
      toast.error('Vui lòng nhập email cho tất cả thành viên');
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = members.filter(m => !emailRegex.test(m.email));
    if (invalidEmails.length > 0) {
      toast.error('Email không hợp lệ');
      return false;
    }

    // Check duplicate emails
    const emails = members.map(m => m.email.toLowerCase());
    const duplicates = emails.filter((email, index) => emails.indexOf(email) !== index);
    if (duplicates.length > 0) {
      toast.error('Email không được trùng lặp');
      return false;
    }

    // Check ownership percentage
    const totalOwnership = members.reduce((sum, m) => sum + m.ownershipPercentage, 0);
    if (totalOwnership !== 100) {
      toast.error(`Tổng % sở hữu phải bằng 100% (hiện tại: ${totalOwnership}%)`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const groupData = {
        ...formData,
        members: members.map(m => ({
          email: m.email.trim(),
          ownershipPercentage: m.ownershipPercentage,
          role: m.role
        }))
      };

      const newGroup = await createGroup(groupData);
      toast.success('Tạo nhóm thành công!');
      navigate(`/groups/${newGroup.id}`);
    } catch (error) {
      toast.error(error.message || 'Không thể tạo nhóm');
    } finally {
      setLoading(false);
    }
  };

  const totalOwnership = members.reduce((sum, m) => sum + m.ownershipPercentage, 0);
  const ownershipValid = totalOwnership === 100;

  return (
    <CoownerLayout>
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => navigate('/groups')}
          className="mb-4"
        >
          ← Quay lại
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Tạo nhóm sở hữu chung</h1>
        <p className="mt-2 text-gray-600">
          Tạo nhóm mới để quản lý xe điện chung với các thành viên khác
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card title="Thông tin nhóm">
              <div className="space-y-4">
                <Input
                  label="Tên nhóm"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Nhóm xe VinFast VF8"
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Mô tả về nhóm và mục đích sử dụng..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>
              </div>
            </Card>

            <Card 
              title="Thành viên và % sở hữu"
              actions={
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  icon={Plus}
                  onClick={addMember}
                >
                  Thêm thành viên
                </Button>
              }
            >
              <div className="space-y-4">
                {members.map((member, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="h-10 w-10 bg-sky-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="h-5 w-5 text-sky-600" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <Input
                        label="Email"
                        type="email"
                        value={member.email}
                        onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                        placeholder="email@example.com"
                        required
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          label="% Sở hữu"
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={member.ownershipPercentage}
                          onChange={(e) => handleMemberChange(index, 'ownershipPercentage', e.target.value)}
                          placeholder="0"
                          required
                        />
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Vai trò
                          </label>
                          <select
                            value={member.role}
                            onChange={(e) => handleMemberChange(index, 'role', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                            disabled={index === 0}
                          >
                            <option value="admin">Quản trị viên</option>
                            <option value="member">Thành viên</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        icon={X}
                        onClick={() => removeMember(index)}
                        className="text-red-600 hover:text-red-700"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className={`mt-4 p-4 rounded-lg ${
                ownershipValid ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${
                    ownershipValid ? 'text-green-900' : 'text-amber-900'
                  }`}>
                    Tổng % sở hữu:
                  </span>
                  <span className={`text-xl font-bold ${
                    ownershipValid ? 'text-green-900' : 'text-amber-900'
                  }`}>
                    {totalOwnership}%
                  </span>
                </div>
                {!ownershipValid && (
                  <p className="text-xs text-amber-800 mt-2">
                    Tổng % sở hữu phải bằng 100%
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card title="Hướng dẫn">
              <div className="space-y-3 text-sm text-gray-700">
                <div>
                  <p className="font-semibold mb-1">1. Thông tin nhóm</p>
                  <p className="text-gray-600">
                    Đặt tên và mô tả rõ ràng cho nhóm của bạn
                  </p>
                </div>
                <div>
                  <p className="font-semibold mb-1">2. Thêm thành viên</p>
                  <p className="text-gray-600">
                    Mời các thành viên qua email. Mỗi thành viên sẽ nhận được lời mời tham gia nhóm
                  </p>
                </div>
                <div>
                  <p className="font-semibold mb-1">3. Phân bổ % sở hữu</p>
                  <p className="text-gray-600">
                    Xác định % sở hữu cho mỗi thành viên. Tổng phải bằng 100%
                  </p>
                </div>
                <div>
                  <p className="font-semibold mb-1">4. Vai trò</p>
                  <p className="text-gray-600">
                    Quản trị viên có quyền quản lý nhóm, thêm/xóa thành viên và xe
                  </p>
                </div>
              </div>
            </Card>

            <Card title="Lưu ý quan trọng">
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-amber-600">⚠️</span>
                  <p className="text-gray-700">
                    % sở hữu sẽ ảnh hưởng đến việc phân bổ chi phí và quyền sử dụng xe
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-amber-600">⚠️</span>
                  <p className="text-gray-700">
                    Thành viên sẽ cần xác nhận lời mời qua email trước khi tham gia
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-amber-600">⚠️</span>
                  <p className="text-gray-700">
                    Sau khi tạo nhóm, bạn có thể thêm xe và tạo hợp đồng điện tử
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <Button
                type="submit"
                className="w-full"
                isLoading={loading}
                disabled={!ownershipValid}
              >
                Tạo nhóm
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full mt-2"
                onClick={() => navigate('/groups')}
                disabled={loading}
              >
                Hủy
              </Button>
            </Card>
          </div>
        </div>
      </form>
    </CoownerLayout>
  );
}
