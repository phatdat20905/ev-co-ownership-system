// src/utils/toast.js
import { toast } from 'react-toastify';

/**
 * Show success toast notification
 */
export const showSuccessToast = (message) => {
  toast.success(message);
};

/**
 * Show error toast notification
 */
export const showErrorToast = (message) => {
  toast.error(message);
};

/**
 * Show info toast notification
 */
export const showInfoToast = (message) => {
  toast.info(message);
};

/**
 * Show warning toast notification
 */
export const showWarningToast = (message) => {
  toast.warning(message);
};
