import { useEffect, useState } from 'react';
import { useGroupStore } from '../../stores/groupStore';
import { Link } from 'react-router-dom';
import { Plus, Users } from 'lucide-react';

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
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Nhóm đồng sở hữu</h1>
          <Link
            to="/groups/create"
            className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition"
          >
            <Plus className="h-5 w-5" />
            Tạo nhóm mới
          </Link>
        </div>

        {groups.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Users className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Chưa có nhóm</h3>
            <p className="mt-2 text-sm text-gray-600">
              Tạo nhóm đầu tiên để bắt đầu đồng sở hữu xe điện
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <Link
                key={group.id}
                to={`/groups/${group.id}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
              >
                <h3 className="text-xl font-semibold text-gray-900">{group.name}</h3>
                <p className="mt-2 text-sm text-gray-600">{group.description}</p>
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-1" />
                  {group.members?.length || 0} thành viên
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
