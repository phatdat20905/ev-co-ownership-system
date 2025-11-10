import { motion } from "framer-motion";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import Footer from "../../components/layout/Footer";
import Header from "../../components/layout/Header";
import { authService, userService } from "../../services";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Token xác thực không hợp lệ');
        setLoading(false);
        return;
      }

      try {
        console.log('Starting email verification with token:', token);
        
        // Step 1: Verify email với auth service
        const verifyResponse = await authService.verifyEmail(token);
        console.log('Email verification response:', verifyResponse);
        
        if (!verifyResponse.success) {
          throw new Error(verifyResponse.message || 'Xác thực thất bại');
        }
        
        // Step 2: Lấy pending profile data từ localStorage
        const pendingProfileData = localStorage.getItem('pendingProfileData');
        console.log('Pending profile data:', pendingProfileData);
        
        if (pendingProfileData) {
          try {
            const profileData = JSON.parse(pendingProfileData);
            console.log('Parsed profile data:', profileData);
            
            // Lấy userId từ verifyResponse
            const userId = verifyResponse.data?.userId || 
                          verifyResponse.data?.user?.id ||
                          verifyResponse.data?.id;
            
            if (!userId) {
              console.error('No userId in verify response:', verifyResponse);
              throw new Error('Không tìm thấy userId sau khi verify');
            }
            
            // Thêm userId vào profileData
            profileData.userId = userId;
            
            console.log('Creating profile with data:', profileData);
            
            // Gọi API tạo profile (public endpoint)
            const createProfileResponse = await userService.createProfile(profileData);
            
            if (createProfileResponse.success) {
              console.log('Profile created successfully:', createProfileResponse.data);
              localStorage.removeItem('pendingProfileData');
              showSuccessToast('Email xác thực và hồ sơ tạo thành công!');
              setMessage('Email đã xác thực và hồ sơ đã được tạo thành công!');
            } else {
              throw new Error('Tạo profile thất bại');
            }
          } catch (profileError) {
            console.error('Profile creation error:', profileError);
            // Vẫn cho verify thành công, chỉ cảnh báo về profile
            showSuccessToast('Email đã xác thực! Vui lòng cập nhật hồ sơ sau khi đăng nhập.');
            setMessage('Email đã xác thực thành công! Vui lòng cập nhật hồ sơ trong tài khoản.');
          }
        } else {
          // Không có pending profile data
          showSuccessToast('Email đã được xác thực thành công!');
          setMessage('Email đã được xác thực thành công!');
        }
        
        setStatus('success');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error) {
        console.error('Email verification error:', error);
        setStatus('error');
        setMessage(error.message || 'Xác thực email thất bại. Token có thể đã hết hạn.');
        showErrorToast(error.message || 'Xác thực email thất bại');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-50 via-white to-sky-100">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative w-full max-w-md bg-white/70 backdrop-blur-xl border border-sky-100 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-10 text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-sky-100/50 via-transparent to-sky-200/40 rounded-3xl blur-2xl -z-10" />

          {loading && (
            <>
              <Loader2 className="mx-auto h-14 w-14 text-sky-600 mb-4 animate-spin" />
              <h2 className="text-2xl font-bold text-sky-700 mb-3">
                Đang xác thực email...
              </h2>
              <p className="text-gray-600">
                Vui lòng chờ trong giây lát
              </p>
            </>
          )}

          {!loading && status === 'success' && (
            <>
              <CheckCircle className="mx-auto h-14 w-14 text-green-600 mb-4" />
              <h2 className="text-2xl font-bold text-green-700 mb-3">
                Xác thực thành công!
              </h2>
              <p className="text-gray-600 mb-6">
                {message}
              </p>
              <p className="text-sm text-gray-500">
                Bạn sẽ được chuyển đến trang đăng nhập trong giây lát...
              </p>
              <Link 
                to="/login" 
                className="inline-block mt-4 text-sky-600 hover:underline font-medium"
              >
                Đăng nhập ngay
              </Link>
            </>
          )}

          {!loading && status === 'error' && (
            <>
              <XCircle className="mx-auto h-14 w-14 text-red-600 mb-4" />
              <h2 className="text-2xl font-bold text-red-700 mb-3">
                Xác thực thất bại
              </h2>
              <p className="text-gray-600 mb-6">
                {message}
              </p>
              <div className="space-y-3">
                <Link 
                  to="/login" 
                  className="block w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 shadow-md transition-all"
                >
                  Quay lại đăng nhập
                </Link>
                <p className="text-sm text-gray-500">
                  Cần gửi lại email xác thực?{" "}
                  <Link to="/register" className="text-sky-600 hover:underline">
                    Đăng ký lại
                  </Link>
                </p>
              </div>
            </>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}