import { motion } from "framer-motion";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Upload, 
  FileText,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { authService } from "../../services";
import { showSuccessToast, showErrorToast } from "../../utils/toast";
import LoadingSkeleton from '../../components/LoadingSkeleton';

export default function KYCStatus() {
  const [kycStatus, setKycStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resubmitting, setResubmitting] = useState(false);
  const navigate = useNavigate();

  // Form data for resubmission
  const [resubmitData, setResubmitData] = useState({
    idCardNumber: "",
    driverLicenseNumber: "",
  });

  const [kycFiles, setKycFiles] = useState({
    idCardFront: null,
    idCardBack: null,
    driverLicense: null,
    selfie: null,
  });

  useEffect(() => {
    fetchKYCStatus();
  }, []);

  const fetchKYCStatus = async () => {
    try {
      setLoading(true);
      const response = await authService.getKYCStatus();
      
      if (response.success) {
        setKycStatus(response.data);
        
        // Pre-fill form if resubmitting
        if (response.data.status !== 'not_submitted') {
          setResubmitData({
            idCardNumber: response.data.idCardNumber || "",
            driverLicenseNumber: response.data.driverLicenseNumber || "",
          });
        }
      }
    } catch (error) {
      showErrorToast(error.message || "Không thể tải trạng thái KYC");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setKycFiles(prev => ({
        ...prev,
        [name]: files[0]
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setResubmitData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleResubmit = async (e) => {
    e.preventDefault();

    if (!resubmitData.idCardNumber) {
      showErrorToast("Vui lòng nhập số CCCD/CMND");
      return;
    }

    if (!kycFiles.idCardFront || !kycFiles.idCardBack) {
      showErrorToast("Vui lòng tải lên ảnh mặt trước và sau CCCD/CMND");
      return;
    }

    if (!kycFiles.selfie) {
      showErrorToast("Vui lòng tải lên ảnh chân dung");
      return;
    }

    setResubmitting(true);
    try {
      const kycData = {
        idCardNumber: resubmitData.idCardNumber,
        driverLicenseNumber: resubmitData.driverLicenseNumber || null,
        idCardFront: kycFiles.idCardFront,
        idCardBack: kycFiles.idCardBack,
        driverLicense: kycFiles.driverLicense,
        selfie: kycFiles.selfie,
      };

      await authService.submitKYC(kycData);
      showSuccessToast("Nộp lại giấy tờ thành công! Vui lòng đợi xét duyệt.");
      
      // Reset files and reload status
      setKycFiles({
        idCardFront: null,
        idCardBack: null,
        driverLicense: null,
        selfie: null,
      });
      
      await fetchKYCStatus();
    } catch (error) {
      showErrorToast(error.message || "Không thể nộp lại giấy tờ");
    } finally {
      setResubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'not_submitted':
        return {
          icon: <Upload className="h-5 w-5" />,
          text: "Chưa nộp",
          color: "bg-gray-100 text-gray-700 border-gray-300"
        };
      case 'pending':
        return {
          icon: <Clock className="h-5 w-5" />,
          text: "Đang xét duyệt",
          color: "bg-yellow-100 text-yellow-700 border-yellow-300"
        };
      case 'approved':
        return {
          icon: <CheckCircle className="h-5 w-5" />,
          text: "Đã phê duyệt",
          color: "bg-green-100 text-green-700 border-green-300"
        };
      case 'rejected':
        return {
          icon: <XCircle className="h-5 w-5" />,
          text: "Bị từ chối",
          color: "bg-red-100 text-red-700 border-red-300"
        };
      default:
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          text: "Không xác định",
          color: "bg-gray-100 text-gray-700 border-gray-300"
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-cyan-50 flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12">
          <LoadingSkeleton.ProfileSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  const statusBadge = getStatusBadge(kycStatus?.verificationStatus || kycStatus?.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-cyan-50 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Trạng thái xác minh KYC
            </h1>
            <p className="text-gray-600">
              Kiểm tra tình trạng xét duyệt giấy tờ tùy thân của bạn
            </p>
          </div>

          {/* Status Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${statusBadge.color}`}>
                  {statusBadge.icon}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Trạng thái: {statusBadge.text}
                  </h2>
                  {kycStatus?.submittedAt && (
                    <p className="text-sm text-gray-500">
                      Nộp lúc: {new Date(kycStatus.submittedAt).toLocaleString('vi-VN')}
                    </p>
                  )}
                </div>
              </div>
              
              <button
                onClick={fetchKYCStatus}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
                title="Làm mới"
              >
                <RefreshCw className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Details */}
            {kycStatus?.status !== 'not_submitted' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-sm font-medium text-gray-600">Số CCCD/CMND</label>
                  <p className="text-gray-800 font-semibold">{kycStatus.idCardNumber || "N/A"}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Số GPLX</label>
                  <p className="text-gray-800 font-semibold">{kycStatus.driverLicenseNumber || "Chưa có"}</p>
                </div>

                {kycStatus.verifiedAt && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-600">Xét duyệt lúc</label>
                    <p className="text-gray-800 font-semibold">
                      {new Date(kycStatus.verifiedAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Rejection Reason */}
            {kycStatus?.verificationStatus === 'rejected' && kycStatus.rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-800 mb-1">Lý do từ chối</h3>
                    <p className="text-red-700">{kycStatus.rejectionReason}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Uploaded Documents Preview */}
            {kycStatus?.status !== 'not_submitted' && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Giấy tờ đã nộp
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {kycStatus.idCardFrontUrl && (
                    <div className="border rounded-lg p-2">
                      <img 
                        src={kycStatus.idCardFrontUrl} 
                        alt="CCCD mặt trước" 
                        className="w-full h-24 object-cover rounded mb-2"
                      />
                      <p className="text-xs text-gray-600 text-center">CCCD mặt trước</p>
                    </div>
                  )}
                  {kycStatus.idCardBackUrl && (
                    <div className="border rounded-lg p-2">
                      <img 
                        src={kycStatus.idCardBackUrl} 
                        alt="CCCD mặt sau" 
                        className="w-full h-24 object-cover rounded mb-2"
                      />
                      <p className="text-xs text-gray-600 text-center">CCCD mặt sau</p>
                    </div>
                  )}
                  {kycStatus.driverLicenseUrl && (
                    <div className="border rounded-lg p-2">
                      <img 
                        src={kycStatus.driverLicenseUrl} 
                        alt="GPLX" 
                        className="w-full h-24 object-cover rounded mb-2"
                      />
                      <p className="text-xs text-gray-600 text-center">GPLX</p>
                    </div>
                  )}
                  {kycStatus.selfieUrl && (
                    <div className="border rounded-lg p-2">
                      <img 
                        src={kycStatus.selfieUrl} 
                        alt="Chân dung" 
                        className="w-full h-24 object-cover rounded mb-2"
                      />
                      <p className="text-xs text-gray-600 text-center">Chân dung</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Resubmit Form (Only if rejected or not submitted) */}
          {(kycStatus?.verificationStatus === 'rejected' || kycStatus?.status === 'not_submitted') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <Upload className="h-5 w-5 text-sky-600" />
                {kycStatus?.status === 'not_submitted' ? 'Nộp giấy tờ' : 'Nộp lại giấy tờ'}
              </h2>

              <form onSubmit={handleResubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số CCCD/CMND <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="idCardNumber"
                      value={resubmitData.idCardNumber}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-400 outline-none"
                      placeholder="001234567890"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số GPLX (Tùy chọn)
                    </label>
                    <input
                      type="text"
                      name="driverLicenseNumber"
                      value={resubmitData.driverLicenseNumber}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-400 outline-none"
                      placeholder="123456789"
                    />
                  </div>
                </div>

                <div className="bg-sky-50 rounded-xl p-4 border-2 border-dashed border-sky-300">
                  <h4 className="font-semibold text-gray-800 mb-4">
                    Tải lên hình ảnh giấy tờ
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CCCD/CMND (Mặt trước) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="file"
                        name="idCardFront"
                        accept="image/*"
                        onChange={handleFileChange}
                        required
                        className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-sky-100 file:text-sky-700 hover:file:bg-sky-200 file:cursor-pointer"
                      />
                      {kycFiles.idCardFront && (
                        <p className="text-xs text-green-600 mt-1">✓ {kycFiles.idCardFront.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CCCD/CMND (Mặt sau) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="file"
                        name="idCardBack"
                        accept="image/*"
                        onChange={handleFileChange}
                        required
                        className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-sky-100 file:text-sky-700 hover:file:bg-sky-200 file:cursor-pointer"
                      />
                      {kycFiles.idCardBack && (
                        <p className="text-xs text-green-600 mt-1">✓ {kycFiles.idCardBack.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        GPLX (Tùy chọn)
                      </label>
                      <input
                        type="file"
                        name="driverLicense"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-sky-100 file:text-sky-700 hover:file:bg-sky-200 file:cursor-pointer"
                      />
                      {kycFiles.driverLicense && (
                        <p className="text-xs text-green-600 mt-1">✓ {kycFiles.driverLicense.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ảnh chân dung <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="file"
                        name="selfie"
                        accept="image/*"
                        onChange={handleFileChange}
                        required
                        className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-sky-100 file:text-sky-700 hover:file:bg-sky-200 file:cursor-pointer"
                      />
                      {kycFiles.selfie && (
                        <p className="text-xs text-green-600 mt-1">✓ {kycFiles.selfie.name}</p>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mt-3">
                    * Vui lòng tải lên ảnh rõ nét, đầy đủ thông tin. Định dạng: JPG, PNG. Dung lượng tối đa: 5MB/ảnh
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={resubmitting}
                  className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-sky-500 to-sky-600 text-white hover:from-sky-600 hover:to-sky-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resubmitting ? "Đang nộp..." : "Nộp giấy tờ"}
                </button>
              </form>
            </motion.div>
          )}

          {/* Info Banner */}
          {kycStatus?.verificationStatus === 'pending' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-800 mb-1">Đang chờ xét duyệt</h3>
                  <p className="text-yellow-700 text-sm">
                    Giấy tờ của bạn đang được xem xét. Thời gian xét duyệt thường từ 1-3 ngày làm việc.
                  </p>
                </div>
              </div>
            </div>
          )}

          {kycStatus?.verificationStatus === 'approved' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-800 mb-1">Xác minh thành công!</h3>
                  <p className="text-green-700 text-sm">
                    Tài khoản của bạn đã được xác minh. Bạn có thể sử dụng đầy đủ các tính năng của hệ thống.
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
