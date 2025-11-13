import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileText, Download, Printer, Share2, CheckCircle, Clock, AlertCircle, ArrowLeft, Eye } from 'lucide-react';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';

export default function ContractViewer() {
  const [contract] = useState({
    id: 'CT-2024-001',
    title: 'Hợp đồng Đồng sở hữu Xe điện Tesla Model 3',
    status: 'active',
    signedDate: '2024-01-15',
    expirationDate: '2026-01-15',
    parties: [
      { name: 'Nguyễn Văn A', role: 'Đồng sở hữu', percentage: 40 },
      { name: 'Trần Thị B', role: 'Đồng sở hữu', percentage: 30 },
      { name: 'Lê Văn C', role: 'Đồng sở hữu', percentage: 30 },
    ],
    vehicle: {
      model: 'Tesla Model 3',
      year: 2023,
      vin: '5YJ3E1EAXPF123456',
      color: 'Trắng'
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'expired': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Đang hiệu lực';
      case 'pending': return 'Chờ ký kết';
      case 'expired': return 'Đã hết hạn';
      default: return 'Không xác định';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <Link
              to="/coowner/ownership"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Quay lại Quản lý quyền sở hữu
            </Link>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">
                  Hợp đồng Đồng sở hữu
                </h1>
                <p className="text-xl text-gray-600 mt-2">
                  {contract.title}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(contract.status)}`}>
                  {getStatusText(contract.status)}
                </span>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                {/* Contract Header */}
                <div className="border-b border-gray-200 pb-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{contract.title}</h2>
                      <p className="text-gray-600">Mã hợp đồng: {contract.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Ngày ký</p>
                      <p className="font-semibold text-gray-900">{contract.signedDate}</p>
                    </div>
                  </div>
                </div>

                {/* Contract Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin các bên</h3>
                    <div className="space-y-3">
                      {contract.parties.map((party, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{party.name}</p>
                            <p className="text-sm text-gray-600">{party.role}</p>
                          </div>
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            {party.percentage}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin xe</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Model:</span>
                        <span className="font-medium text-gray-900">{contract.vehicle.model}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Năm sản xuất:</span>
                        <span className="font-medium text-gray-900">{contract.vehicle.year}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Số VIN:</span>
                        <span className="font-medium text-gray-900">{contract.vehicle.vin}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Màu sắc:</span>
                        <span className="font-medium text-gray-900">{contract.vehicle.color}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contract Terms */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Điều khoản hợp đồng</h3>
                  <div className="space-y-4">
                    <div className="p-4 border border-gray-200 rounded-xl">
                      <h4 className="font-semibold text-gray-900 mb-2">1. Quyền sở hữu và sử dụng</h4>
                      <p className="text-gray-700">
                        Các bên đồng ý chia sẻ quyền sở hữu và sử dụng xe theo tỷ lệ đã thỏa thuận. 
                        Việc sử dụng xe sẽ được quản lý thông qua hệ thống đặt lịch của EV Co-ownership.
                      </p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-xl">
                      <h4 className="font-semibold text-gray-900 mb-2">2. Phân chia chi phí</h4>
                      <p className="text-gray-700">
                        Chi phí bảo dưỡng, bảo hiểm, sạc điện và các chi phí phát sinh khác sẽ được 
                        chia theo tỷ lệ sở hữu của từng bên.
                      </p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-xl">
                      <h4 className="font-semibold text-gray-900 mb-2">3. Thời hạn hợp đồng</h4>
                      <p className="text-gray-700">
                        Hợp đồng có hiệu lực từ ngày ký và sẽ hết hạn vào ngày {contract.expirationDate}. 
                        Các bên có thể gia hạn hợp đồng trước 30 ngày khi hết hạn.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Signature Section */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Chữ ký số</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {contract.parties.map((party, index) => (
                      <div key={index} className="text-center p-4 border border-gray-200 rounded-xl">
                        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="font-semibold text-gray-900">{party.name}</p>
                        <p className="text-sm text-gray-600">Đã ký ngày {contract.signedDate}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Actions */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tác vụ</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors">
                    <Download className="w-5 h-5" />
                    <span>Tải PDF</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors">
                    <Printer className="w-5 h-5" />
                    <span>In hợp đồng</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors">
                    <Share2 className="w-5 h-5" />
                    <span>Chia sẻ</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors">
                    <Eye className="w-5 h-5" />
                    <span>Xem lịch sử sửa đổi</span>
                  </button>
                </div>
              </div>

              {/* Contract Status */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Trạng thái</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">Đã ký kết</p>
                      <p className="text-sm text-green-600">Ngày {contract.signedDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">Còn hiệu lực</p>
                      <p className="text-sm text-blue-600">Đến {contract.expirationDate}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}