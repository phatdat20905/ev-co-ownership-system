import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { Upload, FileText, CheckCircle, X, Download, Eye, ArrowLeft, AlertCircle } from 'lucide-react';
import Header from '../../../../components/layout/Header';
import Footer from '../../../../components/layout/Footer';
import { contractAPI } from '../../../../api/contract';

export default function DocumentUpload() {
  const { contractId } = useParams();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (contractId) {
      fetchDocuments();
    }
  }, [contractId]);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await contractAPI.getDocuments(contractId);

      const normalize = (res) => {
        if (!res) return null;
        if (res.data !== undefined && res.data !== null) {
          if (res.data.success === true || res.success === true) {
            return res.data.data !== undefined ? res.data.data : res.data;
          }
          if (res.data.data !== undefined) return res.data.data;
          return res.data;
        }
        if (res.success === true && res.data !== undefined) return res.data;
        return res;
      };

      const docs = normalize(response) || [];
      setDocuments(docs);

      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
      setError('Không thể tải danh sách tài liệu. Vui lòng thử lại.');
      setLoading(false);
    }
  };

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

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert('Chỉ chấp nhận file PDF, JPG, hoặc PNG');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('Kích thước file không được vượt quá 10MB');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
  const formData = new FormData();
  // Backend expects field name 'document' (see contract-service documentRoutes middleware)
  formData.append('document', file);
  formData.append('documentName', file.name);
  formData.append('documentType', 'other'); // Can be 'cmnd', 'gplx', 'contract', etc.

      // Simulate progress (axios doesn't provide onUploadProgress by default)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await contractAPI.uploadDocument(contractId, formData);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Normalize response shapes
      const normalize = (res) => {
        if (!res) return null;
        if (res.data !== undefined && res.data !== null) {
          if (res.data.success === true || res.success === true) {
            return res.data;
          }
          if (res.data.data !== undefined) return { success: true, data: res.data.data };
          return res.data;
        }
        if (res.success === true) return res;
        return res;
      };

      const up = normalize(response);
      if (up && up.success) {
        // Refresh document list
        await fetchDocuments();
        alert('Tải lên tài liệu thành công!');
      } else {
        alert('Tải lên thất bại.');
      }

      setUploading(false);
      setUploadProgress(0);
    } catch (err) {
      console.error('Failed to upload document:', err);
      alert('Không thể tải lên tài liệu. Vui lòng thử lại.');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeDocument = async (documentId) => {
    if (!window.confirm('Bạn có chắc muốn xóa tài liệu này?')) return;

    try {
      const response = await contractAPI.deleteDocument(contractId, documentId);
      const resNorm = (response && response.data) ? response.data : response;
      if (resNorm && resNorm.success) {
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
        alert('Đã xóa tài liệu thành công!');
      } else {
        alert('Xóa tài liệu thất bại.');
      }
    } catch (err) {
      console.error('Failed to delete document:', err);
      alert('Không thể xóa tài liệu. Vui lòng thử lại.');
    }
  };

  const downloadDocument = async (documentId, fileName) => {
    try {
      const res = await contractAPI.downloadDocument(contractId, documentId);

      // res is expected to be a Blob (if file) or JSON blob (if backend returned downloadUrl)
      if (res instanceof Blob) {
        // If backend sent JSON (blob with JSON), parse it
        if (res.type && res.type.indexOf('application/json') !== -1) {
          const text = await res.text();
          try {
            const json = JSON.parse(text);
            const downloadUrl = json?.downloadUrl || json?.data?.downloadUrl || json?.document?.file_url;
            if (downloadUrl) {
              window.open(downloadUrl, '_blank');
              return;
            }
          } catch (err) {
            // fallthrough
          }
        }

        const url = window.URL.createObjectURL(res);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        return;
      }

      // If API returned JSON-like object
      const downloadUrl = res?.downloadUrl || res?.data?.downloadUrl || res?.document?.file_url || res?.data?.document?.file_url;
      if (downloadUrl) {
        window.open(downloadUrl, '_blank');
        return;
      }

      alert('Không tìm thấy tệp để tải xuống.');
    } catch (err) {
      console.error('Failed to download document:', err);
      alert('Không thể tải xuống tài liệu. Vui lòng thử lại.');
    }
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
      case 'cmnd':
      case 'cccd': return 'CMND/CCCD';
      case 'gplx': return 'Giấy phép lái xe';
      case 'contract': return 'Hợp đồng';
      case 'insurance': return 'Bảo hiểm';
      default: return 'Tài liệu khác';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="h-40 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Lỗi tải dữ liệu</h3>
                <p className="text-red-700 mb-4">{error}</p>
                <button
                  onClick={() => fetchDocuments()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Thử lại
                </button>
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
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <Link
              to="/dashboard/coowner/ownership"
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
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <p className="text-blue-700 font-medium">Đang tải lên...</p>
                      </div>
                      <span className="text-blue-700 font-semibold">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
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
                            <h3 className="font-semibold text-gray-900">{doc.fileName || doc.name}</h3>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-sm text-gray-600">{getDocumentTypeText(doc.documentType || doc.type)}</span>
                              <span className="text-sm text-gray-600">{doc.fileSize || doc.size}</span>
                              <span className="text-sm text-gray-600">
                                {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('vi-VN') : doc.uploadedDate}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(doc.status)}`}>
                            {getStatusText(doc.status)}
                          </span>
                          
                          <button 
                            onClick={() => downloadDocument(doc.id, doc.fileName || doc.name)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Tải xuống"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                          
                          <button 
                            onClick={() => removeDocument(doc.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa"
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
      </main>

      <Footer />
    </div>
  );
}