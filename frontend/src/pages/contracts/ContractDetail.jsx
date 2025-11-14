import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContractStore } from '../../stores/useContractStore';
import { useGroupStore } from '../../stores/useGroupStore';
import { FileText, Download, FileSignature, CheckCircle, XCircle, Calendar, Users } from 'lucide-react';
import CoownerLayout from '../../components/layout/CoownerLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { toast } from 'react-toastify';

export default function ContractDetail() {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const currentContract = useContractStore((state) => state.currentContract);
  const fetchContract = useContractStore((state) => state.fetchContract);
  const signContract = useContractStore((state) => state.signContract);
  const groups = useGroupStore((state) => state.groups);
  const fetchGroups = useGroupStore((state) => state.fetchGroups);
  
  const [loading, setLoading] = useState(true);
  const [showSignModal, setShowSignModal] = useState(false);
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchContract(contractId),
          fetchGroups()
        ]);
      } catch (error) {
        console.error('Failed to load contract:', error);
        toast.error('Không thể tải thông tin hợp đồng');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [contractId, fetchContract, fetchGroups]);

  const handleSign = async () => {
    setSigning(true);
    try {
      await signContract(contractId);
      toast.success('Đã ký hợp đồng thành công');
      setShowSignModal(false);
      // Reload contract
      await fetchContract(contractId);
    } catch (error) {
      toast.error(error.message || 'Không thể ký hợp đồng');
    } finally {
      setSigning(false);
    }
  };

  const handleDownload = () => {
    // In real app, this would download the PDF
    toast.info('Tính năng tải xuống đang được phát triển');
  };

  if (loading) {
    return (
      <CoownerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
        </div>
      </CoownerLayout>
    );
  }

  if (!currentContract) {
    return (
      <CoownerLayout>
        <Card>
          <p className="text-center text-gray-600 py-12">Không tìm thấy thông tin hợp đồng</p>
        </Card>
      </CoownerLayout>
    );
  }

  const group = groups.find(g => g.id === currentContract.groupId);
  
  // Mock signatures data - in real app this comes from API
  const signatures = currentContract.signatures || [
    { userId: 1, userName: 'Nguyễn Văn A', signed: true, signedAt: '2024-01-15T10:30:00Z' },
    { userId: 2, userName: 'Trần Thị B', signed: true, signedAt: '2024-01-15T14:20:00Z' },
    { userId: 3, userName: 'Lê Văn C', signed: false, signedAt: null }
  ];

  const currentUserId = 3; // Mock - should come from auth store
  const currentUserSignature = signatures.find(s => s.userId === currentUserId);
  const canSign = currentContract.status === 'pending' && currentUserSignature && !currentUserSignature.signed;

  return (
    <CoownerLayout>
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => navigate('/contracts')}
          className="mb-4"
        >
          ← Quay lại
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {currentContract.title || 'Hợp đồng'}
            </h1>
            <p className="mt-2 text-gray-600">
              {currentContract.contractNumber || `#${currentContract.id}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {currentContract.status === 'signed' && (
              <Button
                variant="outline"
                icon={Download}
                onClick={handleDownload}
              >
                Tải xuống PDF
              </Button>
            )}
            {canSign && (
              <Button
                icon={FileSignature}
                onClick={() => setShowSignModal(true)}
              >
                Ký hợp đồng
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Thông tin hợp đồng">
            <div className="space-y-4">
              <InfoRow
                icon={FileText}
                label="Loại hợp đồng"
                value={
                  currentContract.type === 'co-ownership' ? 'Hợp đồng sở hữu chung' :
                  currentContract.type === 'cost-sharing' ? 'Hợp đồng chia sẻ chi phí' :
                  currentContract.type === 'usage-agreement' ? 'Thỏa thuận sử dụng' : currentContract.type
                }
              />
              <InfoRow
                icon={Users}
                label="Nhóm"
                value={group?.name || `Nhóm #${currentContract.groupId}`}
              />
              <InfoRow
                icon={Calendar}
                label="Ngày bắt đầu"
                value={currentContract.startDate ? new Date(currentContract.startDate).toLocaleDateString('vi-VN') : 'Chưa xác định'}
              />
              {currentContract.endDate && (
                <InfoRow
                  icon={Calendar}
                  label="Ngày kết thúc"
                  value={new Date(currentContract.endDate).toLocaleDateString('vi-VN')}
                />
              )}
            </div>
          </Card>

          {/* Contract Content */}
          <Card title="Nội dung hợp đồng">
            <div className="prose prose-sm max-w-none">
              {currentContract.content ? (
                <div dangerouslySetInnerHTML={{ __html: currentContract.content }} />
              ) : (
                <div className="p-8 bg-gray-50 rounded-lg">
                  <h3 className="font-bold mb-4">HỢP ĐỒNG SỞ HỮU CHUNG XE ĐIỆN</h3>
                  <p className="mb-4">Hôm nay, ngày {new Date().toLocaleDateString('vi-VN')}, chúng tôi gồm:</p>
                  
                  <h4 className="font-semibold mt-4 mb-2">Điều 1: Đối tượng hợp đồng</h4>
                  <p>Các bên đồng ý sở hữu chung xe điện với tỷ lệ phần trăm sở hữu được quy định cụ thể cho từng thành viên.</p>
                  
                  <h4 className="font-semibold mt-4 mb-2">Điều 2: Quyền và nghĩa vụ</h4>
                  <p>- Mỗi thành viên có quyền sử dụng xe theo tỷ lệ sở hữu và lịch đặt trước.</p>
                  <p>- Chi phí vận hành, bảo trì sẽ được chia theo tỷ lệ sở hữu hoặc mức độ sử dụng.</p>
                  
                  <h4 className="font-semibold mt-4 mb-2">Điều 3: Thời hạn hợp đồng</h4>
                  <p>Hợp đồng có hiệu lực từ ngày ký và không thời hạn cho đến khi có thỏa thuận chấm dứt.</p>
                  
                  <h4 className="font-semibold mt-4 mb-2">Điều 4: Điều khoản chung</h4>
                  <p>Mọi thay đổi đối với hợp đồng này phải được tất cả các bên đồng ý bằng văn bản.</p>
                </div>
              )}
            </div>
          </Card>

          {/* Signatures */}
          <Card title="Chữ ký điện tử">
            <div className="space-y-3">
              {signatures.map((sig) => (
                <div
                  key={sig.userId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-sky-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-sky-600">
                        {sig.userName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{sig.userName}</p>
                      {sig.signed && sig.signedAt && (
                        <p className="text-xs text-gray-500">
                          Đã ký: {new Date(sig.signedAt).toLocaleString('vi-VN')}
                        </p>
                      )}
                    </div>
                  </div>
                  {sig.signed ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">Đã ký</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-400">
                      <XCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">Chưa ký</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-sky-50 rounded-lg">
              <p className="text-sm text-sky-900">
                <strong>Tiến độ:</strong> {signatures.filter(s => s.signed).length}/{signatures.length} thành viên đã ký
              </p>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card title="Trạng thái">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Trạng thái hiện tại</p>
                <Badge
                  variant={
                    currentContract.status === 'signed' ? 'success' :
                    currentContract.status === 'pending' ? 'warning' :
                    currentContract.status === 'expired' ? 'danger' :
                    currentContract.status === 'cancelled' ? 'danger' : 'default'
                  }
                  className="text-base px-4 py-2"
                >
                  {currentContract.status === 'signed' ? 'Đã ký' :
                   currentContract.status === 'pending' ? 'Chờ ký' :
                   currentContract.status === 'expired' ? 'Hết hạn' :
                   currentContract.status === 'cancelled' ? 'Đã hủy' :
                   currentContract.status === 'draft' ? 'Nháp' : currentContract.status}
                </Badge>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Tạo lúc</p>
                <p className="text-gray-900">
                  {new Date(currentContract.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>

              {currentContract.updatedAt && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Cập nhật lúc</p>
                  <p className="text-gray-900">
                    {new Date(currentContract.updatedAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {canSign && (
            <Card>
              <div className="text-center">
                <FileSignature className="mx-auto h-12 w-12 text-sky-600 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Yêu cầu ký</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Bạn cần ký hợp đồng này để hoàn tất thủ tục
                </p>
                <Button
                  className="w-full"
                  onClick={() => setShowSignModal(true)}
                >
                  Ký ngay
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Sign Modal */}
      <Modal
        isOpen={showSignModal}
        onClose={() => setShowSignModal(false)}
        title="Xác nhận ký hợp đồng"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setShowSignModal(false)}
            >
              Hủy
            </Button>
            <Button
              isLoading={signing}
              onClick={handleSign}
            >
              Xác nhận ký
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Bạn xác nhận đã đọc và đồng ý với tất cả các điều khoản trong hợp đồng này?
          </p>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-900">
              <strong>Lưu ý:</strong> Chữ ký điện tử có giá trị pháp lý. 
              Vui lòng đọc kỹ nội dung hợp đồng trước khi ký.
            </p>
          </div>
        </div>
      </Modal>
    </CoownerLayout>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-gray-900 font-medium">{value}</p>
      </div>
    </div>
  );
}
