import React, { useState } from 'react';
import CoownerLayout from '../../../components/layout/CoownerLayout';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Upload, FileText, CheckCircle, X, Download, Eye, ArrowLeft, AlertCircle } from 'lucide-react';
import LoadingSkeleton from '../../../components/LoadingSkeleton';

export default function DocumentUpload() {
  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: 'CMND_MatTruoc.pdf',
      type: 'cmnd',
      status: 'approved',
      uploadedDate: '2024-01-10',
      size: '2.5 MB'
    },
    {
      id: 2,
      name: 'CMND_MatSau.pdf',
      type: 'cmnd',
      status: 'approved',
      uploadedDate: '2024-01-10',
      size: '2.3 MB'
    },
    {
      id: 3,
      name: 'GiayPhepLaiXe.pdf',
      type: 'gplx',
      status: 'pending',
      uploadedDate: '2024-01-12',
      size: '1.8 MB'
    }
  ]);

  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files) => {
    setUploading(true);
    // Giả lập upload
    setTimeout(() => {
      const newFile = {
        id: documents.length + 1,
        name: files[0].name,
        type: 'other',
        status: 'pending',
        uploadedDate: new Date().toISOString().split('T')[0],
        size: `${(files[0].size / (1024 * 1024)).toFixed(1)} MB`
      };
      setDocuments(prev => [...prev, newFile]);
      setUploading(false);
    }, 2000);
  };

  const removeDocument = (id) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Đã duyệt';
      case 'pending': return 'Chờ duyệt';
      case 'rejected': return 'Từ chối';
      default: return 'Không xác định';
    }
  };

  const getDocumentTypeText = (type) => {
    switch (type) {
      case 'cmnd': return 'CMND/CCCD';
      case 'gplx': return 'Giấy phép lái xe';
      default: return 'Tài liệu khác';
    }
  };

  return (
    <CoownerLayout>
      <div className="container mx-auto px-4 max-w-7xl">
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
            
            <h1 className="text-4xl font-bold text-gray-900">
              Tải lên Tài liệu
            </h1>
            <p className="text-xl text-gray-600 mt-2">
              Quản lý CMND/CCCD, giấy phép lái xe và các tài liệu liên quan
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Upload Area */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 mb-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Tải lên tài liệu mới</h2>
                
                <div
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
                    dragActive 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-blue-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-gray-700 mb-2">
                    Kéo thả tài liệu vào đây
                  </p>
                  <p className="text-gray-500 mb-4">
                    hoặc
                  </p>
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleChange}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 cursor-pointer transition-colors"
                  >
                    <Upload className="w-5 h-5" />
                    Chọn tệp từ máy tính
                  </label>
                  <p className="text-sm text-gray-500 mt-4">
                    Hỗ trợ: PDF, JPG, PNG, DOC (Tối đa 10MB)
                  </p>
                </div>

                {uploading && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-3">
                      <LoadingSkeleton.Skeleton variant="circular" className="w-6 h-6 border-b-2 border-blue-600 bg-white" />
                      <p className="text-blue-700">Đang tải lên...</p>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Document List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Tài liệu đã tải lên</h2>
                
                {documents.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Chưa có tài liệu nào được tải lên</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {documents.map((doc, index) => (
                      <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue-200 hover:bg-blue-50/50 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <FileText className="w-8 h-8 text-blue-600" />
                          <div>
                            <h3 className="font-semibold text-gray-900">{doc.name}</h3>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-sm text-gray-600">{getDocumentTypeText(doc.type)}</span>
                              <span className="text-sm text-gray-600">{doc.size}</span>
                              <span className="text-sm text-gray-600">{doc.uploadedDate}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(doc.status)}`}>
                            {getStatusText(doc.status)}
                          </span>
                          
                          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <Eye className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <Download className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => removeDocument(doc.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Requirements */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Yêu cầu tài liệu</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">CMND/CCCD</p>
                      <p className="text-sm text-green-600">Đã tải lên</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-yellow-900">Giấy phép lái xe</p>
                      <p className="text-sm text-yellow-600">Chờ duyệt</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Mẹo tải lên</h3>
                <ul className="space-y-2 text-sm text-blue-700">
                  <li>• Đảm bảo tài liệu rõ nét, không bị mờ</li>
                  <li>• Quét/chụp đầy đủ cả 2 mặt (nếu có)</li>
                  <li>• Định dạng PDF được khuyến nghị</li>
                  <li>• Kích thước tệp không quá 10MB</li>
                </ul>
              </div>

              {/* Support */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Cần hỗ trợ?</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Nếu bạn gặp vấn đề khi tải lên tài liệu, vui lòng liên hệ:
                </p>
                <div className="space-y-2 text-sm">
                  <p className="text-blue-600">📞 1900 23 23 67</p>
                  <p className="text-blue-600">✉️ support@evcoownership.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CoownerLayout>
  );
}