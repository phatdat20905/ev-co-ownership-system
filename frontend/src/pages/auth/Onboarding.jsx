import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Phone, MapPin, Calendar, ArrowRight, ArrowLeft, Check, Upload } from "lucide-react";
import { userService } from "../../services";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    address: '',
    city: '',
    avatar: null
  });

  const [avatarPreview, setAvatarPreview] = useState(null);

  const steps = [
    {
      id: 1,
      title: "Thông tin cá nhân",
      description: "Cho chúng tôi biết về bạn",
      icon: User
    },
    {
      id: 2,
      title: "Liên hệ & Địa chỉ",
      description: "Cách chúng tôi liên lạc với bạn",
      icon: MapPin
    },
    {
      id: 3,
      title: "Ảnh đại diện",
      description: "Tùy chọn - Có thể bỏ qua",
      icon: Upload
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showErrorToast('Chỉ chấp nhận file ảnh');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showErrorToast('Kích thước file không được vượt quá 5MB');
      return;
    }

    setFormData(prev => ({ ...prev, avatar: file }));

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.fullName) {
          showErrorToast('Vui lòng nhập họ tên');
          return false;
        }
        if (!formData.dateOfBirth) {
          showErrorToast('Vui lòng chọn ngày sinh');
          return false;
        }
        if (!formData.gender) {
          showErrorToast('Vui lòng chọn giới tính');
          return false;
        }
        return true;
      
      case 2:
        if (!formData.phone) {
          showErrorToast('Vui lòng nhập số điện thoại');
          return false;
        }
        if (!formData.address) {
          showErrorToast('Vui lòng nhập địa chỉ');
          return false;
        }
        return true;
      
      case 3:
        // Avatar is optional
        return true;
      
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSkipAvatar = async () => {
    await handleComplete();
  };

  const handleComplete = async () => {
    try {
      setLoading(true);

      // Update profile
      const profileData = {
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        isProfileComplete: true
      };

      const response = await userService.updateProfile(profileData);

      if (response.success) {
        // Upload avatar if provided
        if (formData.avatar) {
          try {
            await userService.uploadAvatar(formData.avatar);
          } catch (error) {
            console.error('Avatar upload failed:', error);
            // Don't fail the whole onboarding if avatar fails
          }
        }

        showSuccessToast('Hoàn tất thiết lập tài khoản!');
        
        // Redirect to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      }
    } catch (error) {
      showErrorToast(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-block mb-4"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full flex items-center justify-center">
              <User className="h-10 w-10 text-white" />
            </div>
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Chào mừng đến với EV Co-Ownership!
          </h1>
          <p className="text-gray-600">
            Hãy hoàn thiện thông tin của bạn để bắt đầu
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-8 relative">
          {/* Progress Line */}
          <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200">
            <motion.div
              className="h-full bg-sky-500"
              initial={{ width: "0%" }}
              animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {steps.map((step) => {
            const StepIcon = step.icon;
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <div key={step.id} className="flex-1 flex flex-col items-center relative">
                <motion.div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 relative z-10 ${
                    isCompleted
                      ? 'bg-sky-500 text-white'
                      : isCurrent
                      ? 'bg-sky-500 text-white'
                      : 'bg-white border-2 border-gray-300 text-gray-400'
                  }`}
                  animate={{
                    scale: isCurrent ? 1.1 : 1
                  }}
                >
                  {isCompleted ? (
                    <Check className="h-6 w-6" />
                  ) : (
                    <StepIcon className="h-6 w-6" />
                  )}
                </motion.div>
                <div className="text-center">
                  <p className={`text-sm font-medium ${isCurrent ? 'text-sky-600' : 'text-gray-500'}`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-400 hidden sm:block">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Form Card */}
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AnimatePresence mode="wait">
            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Nguyễn Văn A"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày sinh <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giới tính <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {['male', 'female', 'other'].map((gender) => (
                      <button
                        key={gender}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, gender }))}
                        className={`py-3 px-4 rounded-xl border-2 transition-all ${
                          formData.gender === gender
                            ? 'border-sky-500 bg-sky-50 text-sky-700 font-medium'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {gender === 'male' ? 'Nam' : gender === 'female' ? 'Nữ' : 'Khác'}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Contact & Address */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="0123456789"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Số nhà, tên đường, phường/xã"
                      rows={3}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thành phố
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Hà Nội, Hồ Chí Minh, Đà Nẵng..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 3: Avatar */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <p className="text-gray-600 mb-6">
                    Thêm ảnh đại diện để cá nhân hóa tài khoản của bạn
                  </p>
                  
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Avatar preview"
                          className="w-40 h-40 rounded-full object-cover border-4 border-sky-500"
                        />
                      ) : (
                        <div className="w-40 h-40 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center border-4 border-gray-200">
                          <User className="h-20 w-20 text-gray-400" />
                        </div>
                      )}
                      
                      <label
                        htmlFor="avatar-upload"
                        className="absolute bottom-0 right-0 w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-sky-600 transition-colors shadow-lg"
                      >
                        <Upload className="h-6 w-6 text-white" />
                      </label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </div>
                  </div>

                  <p className="text-sm text-gray-500">
                    Kích thước tối đa: 5MB • Định dạng: JPG, PNG, GIF
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            {currentStep > 1 && (
              <button
                onClick={handlePrevious}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                Quay lại
              </button>
            )}

            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-colors"
              >
                Tiếp tục
                <ArrowRight className="h-5 w-5" />
              </button>
            ) : (
              <>
                <button
                  onClick={handleSkipAvatar}
                  disabled={loading}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Bỏ qua
                </button>
                <button
                  onClick={handleComplete}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl hover:from-sky-600 hover:to-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Đang xử lý...' : 'Hoàn tất'}
                  <Check className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </motion.div>

        {/* Skip All Link */}
        {currentStep < 3 && (
          <div className="text-center mt-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Bỏ qua và hoàn thành sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
