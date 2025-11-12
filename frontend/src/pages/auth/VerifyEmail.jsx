import { motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";
import LoadingSkeleton from '../../components/LoadingSkeleton';
import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import Footer from "../../components/layout/Footer";
import Header from "../../components/layout/Header";
import { authService } from "../../services";
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
        const verifyResponse = await authService.verifyEmail(token);

        if (!verifyResponse || !verifyResponse.success) {
          throw new Error(verifyResponse?.message || 'Xác thực thất bại');
        }

        setStatus('success');
        setMessage('Email của bạn đã được xác thực.');
        showSuccessToast('Xác thực email thành công! Vui lòng đăng nhập để tiếp tục.');
        // Redirect to login after a short delay
        setTimeout(() => navigate('/login'), 900);
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
              <LoadingSkeleton.Skeleton className="mx-auto h-14 w-14" variant="circular" />
              <h2 className="text-2xl font-bold text-sky-700 mb-3">Đang xác thực email...</h2>
              <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
            </>
          )}

          {!loading && status === 'success' && (
            <>
              <CheckCircle className="mx-auto h-14 w-14 text-green-600 mb-4" />
              <h2 className="text-2xl font-bold text-green-700 mb-3">Xác thực thành công!</h2>
              <p className="text-gray-600 mb-6">{message || 'Email đã được xác thực thành công!'}</p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <Link
                  to="/login"
                  className="inline-block py-2 px-4 rounded-xl text-white bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 font-medium"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/profile"
                  className="inline-block py-2 px-4 rounded-xl text-sky-600 border border-sky-200 hover:bg-sky-50 font-medium"
                >
                  Xem hồ sơ
                </Link>
              </div>
            </>
          )}

          {!loading && status === 'error' && (
            <>
              <XCircle className="mx-auto h-14 w-14 text-red-600 mb-4" />
              <h2 className="text-2xl font-bold text-red-700 mb-3">Xác thực thất bại</h2>
              <p className="text-gray-600 mb-6">{message || 'Xác thực email thất bại. Token có thể đã hết hạn.'}</p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <Link
                  to="/login"
                  className="inline-block py-2 px-4 rounded-xl text-white bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 font-medium"
                >
                  Đăng nhập
                </Link>
                <button
                  onClick={() => window.location.reload()}
                  className="inline-block py-2 px-4 rounded-xl text-sky-600 border border-sky-200 hover:bg-sky-50 font-medium"
                >
                  Thử lại
                </button>
              </div>
            </>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}