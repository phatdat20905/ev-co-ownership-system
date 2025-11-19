// src/utils/toast.js
import { toast } from 'react-toastify';

/**
 * Toast utility wrapper for consistent notifications across the app
 */

const defaultOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

export const showToast = {
  success: (message, options = {}) => {
    toast.success(message, { ...defaultOptions, ...options });
  },

  error: (message, options = {}) => {
    toast.error(message, { ...defaultOptions, autoClose: 5000, ...options });
  },

  warning: (message, options = {}) => {
    toast.warning(message, { ...defaultOptions, ...options });
  },

  info: (message, options = {}) => {
    toast.info(message, { ...defaultOptions, ...options });
  },

  promise: (promise, messages, options = {}) => {
    return toast.promise(
      promise,
      {
        pending: messages.pending || 'Đang xử lý...',
        success: messages.success || 'Thành công!',
        error: messages.error || 'Đã có lỗi xảy ra!'
      },
      { ...defaultOptions, ...options }
    );
  },

  loading: (message, options = {}) => {
    return toast.loading(message, { ...defaultOptions, ...options });
  },

  update: (toastId, options) => {
    toast.update(toastId, options);
  },

  dismiss: (toastId) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  }
};

// Helper to extract error message from API response
export const getErrorMessage = (error) => {
  if (error.response?.data?.error?.message) {
    return error.response.data.error.message;
  }
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'Đã có lỗi xảy ra. Vui lòng thử lại!';
};

export default showToast;
