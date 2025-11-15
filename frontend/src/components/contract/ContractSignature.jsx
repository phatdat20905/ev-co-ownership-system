// src/components/contract/ContractSignature.jsx
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, XCircle, Download, Eye, PenTool, User, Calendar, Shield } from 'lucide-react';
import contractService from '../../services/contractService';
import LoadingSkeleton from '../../components/LoadingSkeleton';

export default function ContractSignature({ contract, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signature, setSignature] = useState('');
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Signature pad functions
  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL();
      setSignature(dataUrl);
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignature('');
  };

  const handleSign = async () => {
    if (!signature) {
      setError('Vui lòng ký tên trước khi xác nhận');
      return;
    }

    try {
      setSigning(true);
      setError(null);

      await contractService.signContract(contract.id, {
        signature: signature,
        signedAt: new Date().toISOString()
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err.message || 'Không thể ký hợp đồng');
    } finally {
      setSigning(false);
    }
  };

  const handleDownload = async () => {
    try {
      setLoading(true);
      const blob = await contractService.downloadContractPDF(contract.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contract-${contract.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || 'Không thể tải hợp đồng');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    const statuses = {
      draft: {
        label: 'Nháp',
        color: 'bg-gray-100 text-gray-700',
        icon: <FileText className="w-4 h-4" />
      },
      pending: {
        label: 'Chờ ký',
        color: 'bg-yellow-100 text-yellow-700',
        icon: <PenTool className="w-4 h-4" />
      },
      signed: {
        label: 'Đã ký',
        color: 'bg-green-100 text-green-700',
        icon: <CheckCircle className="w-4 h-4" />
      },
      active: {
        label: 'Đang hiệu lực',
        color: 'bg-blue-100 text-blue-700',
        icon: <Shield className="w-4 h-4" />
      },
      expired: {
        label: 'Hết hạn',
        color: 'bg-red-100 text-red-700',
        icon: <XCircle className="w-4 h-4" />
      }
    };

    return statuses[status] || statuses.draft;
  };

  const statusInfo = getStatusInfo(contract.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Hợp đồng #{contract.id}
          </h2>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${statusInfo.color} text-sm font-medium`}>
            {statusInfo.icon}
            {statusInfo.label}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="p-2 rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-colors"
            title="Xem trước"
          >
            <Eye className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={handleDownload}
            disabled={loading}
            className="p-2 rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
            title="Tải xuống"
          >
            <Download className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Contract Info */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-5 h-5 text-sky-500" />
            <span className="text-sm font-medium text-gray-600">Bên A</span>
          </div>
          <div className="text-base font-semibold text-gray-900">
            {contract.partyA || 'Chưa xác định'}
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-5 h-5 text-purple-500" />
            <span className="text-sm font-medium text-gray-600">Bên B</span>
          </div>
          <div className="text-base font-semibold text-gray-900">
            {contract.partyB || 'Chưa xác định'}
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-gray-600">Ngày bắt đầu</span>
          </div>
          <div className="text-base font-semibold text-gray-900">
            {contract.startDate ? new Date(contract.startDate).toLocaleDateString('vi-VN') : 'Chưa xác định'}
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium text-gray-600">Ngày kết thúc</span>
          </div>
          <div className="text-base font-semibold text-gray-900">
            {contract.endDate ? new Date(contract.endDate).toLocaleDateString('vi-VN') : 'Chưa xác định'}
          </div>
        </div>
      </div>

      {/* Contract Content Preview */}
      {showPreview && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl max-h-64 overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Nội dung hợp đồng</h3>
          <div className="text-sm text-gray-700 whitespace-pre-wrap">
            {contract.content || 'Nội dung hợp đồng chưa được cập nhật'}
          </div>
        </div>
      )}

      {/* Signature Section */}
      {contract.status === 'pending' && (
        <div className="border-t-2 border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PenTool className="w-5 h-5 text-sky-500" />
            Ký hợp đồng
          </h3>

          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vẽ chữ ký của bạn
            </label>
            <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
              <canvas
                ref={canvasRef}
                width={600}
                height={200}
                className="w-full cursor-crosshair bg-white"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
            </div>
            <button
              onClick={clearSignature}
              className="mt-2 text-sm text-sky-600 hover:text-sky-700 font-medium"
            >
              Xóa chữ ký
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          <button
            onClick={handleSign}
            disabled={signing || !signature}
            className="w-full py-3 px-6 rounded-xl bg-sky-500 text-white font-semibold hover:bg-sky-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {signing ? (
              <>
                <LoadingSkeleton.Skeleton variant="circular" className="w-5 h-5" />
                Đang xử lý...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Xác nhận ký hợp đồng
              </>
            )}
          </button>
        </div>
      )}

      {/* Already Signed */}
      {contract.status === 'signed' && (
        <div className="border-t-2 border-gray-200 pt-6">
          <div className="bg-green-50 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div>
              <div className="font-semibold text-green-900">Hợp đồng đã được ký</div>
              <div className="text-sm text-green-700 mt-1">
                Ngày ký: {contract.signedAt ? new Date(contract.signedAt).toLocaleString('vi-VN') : 'Không xác định'}
              </div>
              {contract.signature && (
                <div className="mt-3 border-2 border-green-200 rounded-lg p-2 bg-white">
                  <img src={contract.signature} alt="Chữ ký" className="max-h-24" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
