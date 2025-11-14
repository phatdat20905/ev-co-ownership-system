import { useEffect, useState } from 'react';
import { useGroupStore } from '../../stores/useGroupStore';
import { Link } from 'react-router-dom';
import { Plus, Users, Car, DollarSign } from 'lucide-react';
import CoownerLayout from '../../components/layout/CoownerLayout';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

export default function GroupList() {
  const groups = useGroupStore((state) => state.groups);
  const fetchUserGroups = useGroupStore((state) => state.fetchUserGroups);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGroups = async () => {
      try {
        await fetchUserGroups();
      } catch (error) {
        console.error('Failed to load groups:', error);
      } finally {
        setLoading(false);
      }
    };
    loadGroups();
  }, [fetchUserGroups]);

  if (loading) {
    return (
      <CoownerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
        </div>
      </CoownerLayout>
    );
  }

  return (
    <CoownerLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nhóm đồng sở hữu</h1>
          <p className="mt-2 text-gray-600">
            Quản lý các nhóm đồng sở hữu xe điện của bạn
          </p>
        </div>
        <Link to="/groups/create">
          <Button icon={Plus}>Tạo nhóm mới</Button>
        </Link>
      </div>

      {groups.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Users className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Chưa có nhóm</h3>
            <p className="mt-2 text-sm text-gray-600">
              Tạo nhóm đầu tiên để bắt đầu đồng sở hữu xe điện
            </p>
            <Link to="/groups/create" className="mt-6 inline-block">
              <Button icon={Plus}>Tạo nhóm đầu tiên</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Link
              key={group.id}
              to={`/groups/${group.id}`}
              className="block"
            >
              <Card className="hover:shadow-lg transition h-full">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{group.name}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {group.description || 'Không có mô tả'}
                </p>
                
                <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-1" />
                    {group.members?.length || 0} thành viên
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Car className="h-4 w-4 mr-1" />
                    {group.vehicles?.length || 0} xe
                  </div>
                </div>

                {/* Ownership percentage */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Tỷ lệ sở hữu của bạn:</span>
                    <span className="font-semibold text-sky-600">
                      {group.userOwnershipPercentage || 0}%
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </CoownerLayout>
  );
}
