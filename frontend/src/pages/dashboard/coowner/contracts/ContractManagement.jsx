// src/pages/dashboard/coowner/contracts/ContractManagement.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Plus, Filter } from 'lucide-react';
import Header from '../../../../components/layout/Header';
import Footer from '../../../../components/layout/Footer';
import ContractSignature from '../../../../components/contract/ContractSignature';

export default function ContractManagement() {
  const [contracts, setContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, signed, active, expired
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - trong thực tế sẽ fetch từ API
    setTimeout(() => {
      setContracts([
        {
          id: 'CTR-2024-001',
          partyA: 'Công ty CP Xe Điện Xanh',
          partyB: 'Nguyễn Văn A',
          status: 'pending',
          startDate: '2024-02-01',
          endDate: '2025-02-01',
          content: `HỢP ĐỒNG ĐỒNG SỞ HỮU XE ĐIỆN

Bên A (Bên cung cấp): Công ty CP Xe Điện Xanh
Bên B (Bên sở hữu): Nguyễn Văn A

ĐIỀU 1: THÔNG TIN XE
- Loại xe: Tesla Model 3
- Biển số: 30A-12345
- Tỷ lệ sở hữu: 40%

ĐIỀU 2: QUYỀN VÀ NGHĨA VỤ
1. Bên B có quyền sử dụng xe theo lịch đã đặt
2. Bên B chịu trách nhiệm chi phí bảo dưỡng theo tỷ lệ sở hữu
3. Chi phí sửa chữa do lỗi người dùng sẽ do Bên B chịu hoàn toàn

ĐIỀU 3: THỜI HẠN HỢP ĐỒNG
Hợp đồng có hiệu lực từ ngày 01/02/2024 đến 01/02/2025.

ĐIỀU 4: ĐIỀU KHOẢN CHUNG
Hai bên cam kết thực hiện đúng các điều khoản đã thỏa thuận.`,
          createdAt: '2024-01-10'
        },
        {
          id: 'CTR-2024-002',
          partyA: 'Công ty CP Xe Điện Xanh',
          partyB: 'Nguyễn Văn A',
          status: 'signed',
          startDate: '2024-01-01',
          endDate: '2025-01-01',
          content: 'Nội dung hợp đồng đã ký...',
          signedAt: '2024-01-05T10:30:00',
          signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          createdAt: '2023-12-20'
        },
        {
          id: 'CTR-2023-058',
          partyA: 'Công ty CP Xe Điện Xanh',
          partyB: 'Nguyễn Văn A',
          status: 'active',
          startDate: '2023-06-01',
          endDate: '2024-06-01',
          content: 'Nội dung hợp đồng đang hiệu lực...',
          signedAt: '2023-05-28T14:20:00',
          createdAt: '2023-05-15'
        }
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const handleContractSigned = () => {
    // Reload contracts after signing
    alert('Hợp đồng đã được ký thành công!');
    setSelectedContract(null);
    // Refetch contracts
  };

  const filteredContracts = contracts.filter(contract => {
    if (filter === 'all') return true;
    return contract.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-cyan-50 flex flex-col">
        <Header />
        <main className="flex-grow pt-24 pb-12">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="animate-pulse space-y-6">
              <div className="h-12 bg-gray-200 rounded w-1/3"></div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-cyan-50 flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-7xl">
          {!selectedContract ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <Link
                    to="/dashboard/coowner"
                    className="p-2 rounded-lg hover:bg-white/80 transition-colors"
                  >
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                  </Link>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Quản lý hợp đồng</h1>
                    <p className="text-gray-600 mt-1">{filteredContracts.length} hợp đồng</p>
                  </div>
                </div>

                <button className="flex items-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold hover:from-sky-600 hover:to-cyan-600 transition-all">
                  <Plus className="w-5 h-5" />
                  Tạo hợp đồng mới
                </button>
              </div>

              {/* Filter */}
              <div className="flex gap-2 mb-6 overflow-x-auto">
                {[
                  { value: 'all', label: 'Tất cả' },
                  { value: 'pending', label: 'Chờ ký' },
                  { value: 'signed', label: 'Đã ký' },
                  { value: 'active', label: 'Đang hiệu lực' },
                  { value: 'expired', label: 'Hết hạn' }
                ].map(tab => (
                  <button
                    key={tab.value}
                    onClick={() => setFilter(tab.value)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                      filter === tab.value
                        ? 'bg-sky-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {tab.label}
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      filter === tab.value ? 'bg-white text-sky-600' : 'bg-gray-100'
                    }`}>
                      {contracts.filter(c => tab.value === 'all' || c.status === tab.value).length}
                    </span>
                  </button>
                ))}
              </div>

              {/* Contracts List */}
              <div className="space-y-4">
                {filteredContracts.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Không có hợp đồng nào
                    </h3>
                    <p className="text-gray-600">
                      Chưa có hợp đồng nào trong danh mục này
                    </p>
                  </div>
                ) : (
                  filteredContracts.map((contract, index) => (
                    <motion.div
                      key={contract.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setSelectedContract(contract)}
                      className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <FileText className="w-6 h-6 text-sky-600" />
                            <h3 className="text-xl font-semibold text-gray-900">
                              Hợp đồng {contract.id}
                            </h3>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                            <div>
                              <span className="text-gray-600">Bên A:</span>
                              <span className="ml-2 font-medium text-gray-900">{contract.partyA}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Bên B:</span>
                              <span className="ml-2 font-medium text-gray-900">{contract.partyB}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Ngày bắt đầu:</span>
                              <span className="ml-2 font-medium text-gray-900">
                                {new Date(contract.startDate).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Ngày kết thúc:</span>
                              <span className="ml-2 font-medium text-gray-900">
                                {new Date(contract.endDate).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          contract.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          contract.status === 'signed' ? 'bg-green-100 text-green-700' :
                          contract.status === 'active' ? 'bg-blue-100 text-blue-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {contract.status === 'pending' ? 'Chờ ký' :
                           contract.status === 'signed' ? 'Đã ký' :
                           contract.status === 'active' ? 'Đang hiệu lực' :
                           'Hết hạn'}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </>
          ) : (
            <>
              {/* Back Button */}
              <div className="mb-6">
                <button
                  onClick={() => setSelectedContract(null)}
                  className="flex items-center gap-2 text-sky-600 hover:text-sky-700 font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Quay lại danh sách hợp đồng
                </button>
              </div>

              {/* Contract Detail */}
              <ContractSignature
                contract={selectedContract}
                onSuccess={handleContractSigned}
              />
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
