import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams, useParams, useLocation, useNavigate } from 'react-router-dom';
import { Upload, FileText, CheckCircle, X, Download, Eye, ArrowLeft, AlertCircle } from 'lucide-react';
import Header from '../../../../components/layout/Header';
import Footer from '../../../../components/layout/Footer';
import { contractAPI } from '../../../../api/contract';
import { showToast } from '../../../../utils/toast';

export default function DocumentUpload() {
  const [searchParams] = useSearchParams();
  const params = useParams();
  const location = useLocation();

  const resolveContractId = () => {
    if (params && params.id) return params.id;
    const q = searchParams.get('id');
    if (q) return q;
    try {
      const parts = location.pathname.split('/').filter(Boolean);
      const idx = parts.findIndex(p => p === 'contract' || p === 'documents');
      // if path is /contract/{id}/documents or /documents/{id}
      if (idx >= 0 && parts.length > idx + 1) return parts[idx + 1];
    } catch (e) {}
    if (location && location.state && location.state.contractId) return location.state.contractId;
    return null;
  };

  const initialContractId = resolveContractId();
  const [resolvedId, setResolvedId] = useState(initialContractId);
  const navigate = useNavigate();

  useEffect(() => {
    const ensureContractId = async () => {
      if (resolvedId) return;

      try {
        const resp = await contractAPI.getUserContracts();
        if (resp && resp.success && Array.isArray(resp.data) && resp.data.length > 0) {
          const firstId = resp.data[0].id;
          setResolvedId(firstId);
          navigate(`${location.pathname}?id=${firstId}`, { replace: true });
          return;
        }
      } catch (e) {
        console.error('Error fetching user contracts for fallback id:', e);
      }

      showToast.error('Không tìm thấy hợp đồng nào. Vui lòng tạo hoặc chọn hợp đồng.');
      navigate('/dashboard/coowner/ownership', { replace: true });
    };

    ensureContractId();
  }, [resolvedId, navigate, location.pathname]);

  const [documents, setDocuments] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

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
    if (!resolvedId) {
      showToast.error('Không tìm thấy ID hợp đồng');
      return;
    }

    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showToast.error('Kích thước tệp không được vượt quá 10MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      showToast.error('Định dạng tệp không được hỗ trợ. Vui lòng chọn PDF, JPG, PNG hoặc DOC');
      return;
    }

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', 'other'); // Can be changed based on file type detection
      formData.append('documentName', file.name); // Changed from 'description' to 'documentName'

  const response = await contractAPI.uploadDocument(resolvedId, formData);
      
      if (response.success) {
        showToast.success('Tải lên tài liệu thành công');
        // Refresh documents list
  const docsResponse = await contractAPI.getDocuments(resolvedId);
        if (docsResponse.success) {
          setDocuments(docsResponse.data || []);
        }
      } else {
        showToast.error(response.message || 'Không thể tải lên tài liệu');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showToast.error('Có lỗi xảy ra khi tải lên tài liệu');
    } finally {
      setUploading(false);
    }
  };

  const removeDocument = async (documentId) => {
    if (!resolvedId) return;

    if (!window.confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) {
      return;
    }

    try {
  const response = await contractAPI.deleteDocument(resolvedId, documentId);
      if (response.success) {
        showToast.success('Xóa tài liệu thành công');
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      } else {
        showToast.error(response.message || 'Không thể xóa tài liệu');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showToast.error('Có lỗi xảy ra khi xóa tài liệu');
    }
  };

  const handleDownloadDocument = async (documentId, fileName) => {
    if (!resolvedId) return;

    try {
      const blob = await contractAPI.downloadDocument(resolvedId, documentId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || `document_${documentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showToast.success('Tải xuống tài liệu thành công');
    } catch (error) {
      console.error('Download error:', error);
      showToast.error('Không thể tải xuống tài liệu');
    }
  };

  const handleViewDocument = async (documentId) => {
    if (!resolvedId) return;

    try {
      // Call view endpoint which returns document info
      const response = await contractAPI.viewDocument(resolvedId, documentId);
      
      if (response.success && response.data?.viewUrl) {
        // Open document URL in new tab
        window.open(response.data.viewUrl, '_blank');
      } else {
        showToast.error('Không thể xem tài liệu');
      }
    } catch (error) {
      console.error('View error:', error);
      showToast.error('Có lỗi xảy ra khi xem tài liệu');
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
      case 'cmnd': return 'CMND/CCCD';
      case 'gplx': return 'Giấy phép lái xe';
      case 'identity': return 'CMND/CCCD';
      case 'license': return 'Giấy phép lái xe';
      case 'other': return 'Tài liệu khác';
      default: return type || 'Tài liệu';
    }
  };

  // Fetch documents
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!resolvedId) {
        // wait until resolvedId is set by fallback logic
        return;
      }

      try {
        setLoading(true);
        const response = await contractAPI.getDocuments(resolvedId);
        if (response.success) {
          setDocuments(response.data || []);
        } else {
          showToast.error(response.message || 'Không thể tải danh sách tài liệu');
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
        showToast.error('Có lỗi xảy ra khi tải tài liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [resolvedId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-20">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </main>
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
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
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
                            <h3 className="font-semibold text-gray-900">
                              {doc.document_name || doc.name || doc.fileName || 'Untitled'}
                            </h3>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-sm text-gray-600">
                                {getDocumentTypeText(doc.document_type || doc.type)}
                              </span>
                              <span className="text-sm text-gray-600">
                                {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : 
                                 doc.size || 'N/A'}
                              </span>
                              <span className="text-sm text-gray-600">
                                {doc.created_at ? new Date(doc.created_at).toLocaleDateString('vi-VN') :
                                 doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('vi-VN') : ''}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Remove status badge since API doesn't return status field */}
                          
                          <button 
                            onClick={() => handleViewDocument(doc.id)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Xem"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleDownloadDocument(doc.id, doc.document_name || doc.name || doc.fileName)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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