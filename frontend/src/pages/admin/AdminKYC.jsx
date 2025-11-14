import { useEffect, useState } from 'react';
import { AlertTriangle, Search, Eye, CheckCircle } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import { toast } from 'react-toastify';

export default function AdminKYC() {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [kycRequests, setKycRequests] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Mock data - in real app fetch from adminService
        setKycRequests([
          {
            id: 1,
            userId: 234,
            userName: 'Nguyễn Văn A',
            email: 'nguyenvana@example.com',
            documentType: 'CCCD',
            documentNumber: '001234567890',
            status: 'pending',
            submittedAt: '2024-01-15T10:30:00Z'
          },
          {
            id: 2,
            userId: 235,
            userName: 'Trần Thị B',
            email: 'tranthib@example.com',
            documentType: 'Passport',
            documentNumber: 'A12345678',
            status: 'pending',
            submittedAt: '2024-01-14T14:20:00Z'
          },
          {
            id: 3,
            userId: 236,
            userName: 'Lê Văn C',
            email: 'levanc@example.com',
            documentType: 'CCCD',
            documentNumber: '001234567891',
            status: 'verified',
            submittedAt: '2024-01-13T09:15:00Z',
            verifiedAt: '2024-01-13T15:30:00Z'
          }
        ]);
      } catch (error) {
        console.error('Failed to load KYC requests:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleVerify = async (id) => {
    try {
      // In real app: await adminService.verifyKYC(id)
      toast.success('Đã xác thực KYC thành công');
      // Reload data
    } catch (error) {
      toast.error('Không thể xác thực KYC');
    }
  };

  const handleReject = async (id) => {
    try {
      // In real app: await adminService.rejectKYC(id, reason)
      toast.success('Đã từ chối yêu cầu KYC');
      // Reload data
    } catch (error) {
      toast.error('Không thể từ chối KYC');
    }
  };

  const filteredRequests = kycRequests.filter(req =>
    searchQuery === '' ||
    req.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      key: 'user',
      label: 'Người dùng',
      render: (req) => (
        <div>
          <p className="font-medium text-gray-900">{req.userName}</p>
          <p className="text-sm text-gray-500">{req.email}</p>
        </div>
      )
    },
    {
      key: 'document',
      label: 'Giấy tờ',
      render: (req) => (
        <div>
          <p className="text-gray-900">{req.documentType}</p>
          <p className="text-sm text-gray-500 font-mono">{req.documentNumber}</p>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (req) => (
        <Badge variant={
          req.status === 'verified' ? 'success' :
          req.status === 'rejected' ? 'danger' : 'warning'
        }>
          {req.status === 'verified' ? 'Đã xác thực' :
           req.status === 'rejected' ? 'Đã từ chối' : 'Chờ xác thực'}
        </Badge>
      )
    },
    {
      key: 'submittedAt',
      label: 'Ngày gửi',
      render: (req) => (
        <span className="text-sm text-gray-600">
          {new Date(req.submittedAt).toLocaleString('vi-VN')}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (req) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={Eye}
          >
            Xem
          </Button>
          {req.status === 'pending' && (
            <>
              <Button
                size="sm"
                variant="success"
                icon={CheckCircle}
                onClick={() => handleVerify(req.id)}
              >
                Duyệt
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleReject(req.id)}
              >
                Từ chối
              </Button>
            </>
          )}
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Xác thực KYC</h1>
        <p className="mt-2 text-gray-600">
          Quản lý yêu cầu xác thực danh tính người dùng
        </p>
      </div>

      <Card>
        <div className="mb-6">
          <Input
            icon={Search}
            placeholder="Tìm kiếm yêu cầu KYC..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Table columns={columns} data={filteredRequests} />
      </Card>
    </AdminLayout>
  );
}
