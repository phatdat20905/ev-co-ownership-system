// src/utils/toast.js
import { toast as toastify } from 'react-toastify';

/**
 * Re-export toast object for direct usage
 */
export const toast = toastify;

/**
 * Show success toast notification
 */
export const showSuccessToast = (message) => {
  toastify.success(message);
};

/**
 * Show error toast notification
 */
export const showErrorToast = (message) => {
  toastify.error(message);
};

/**
 * Show info toast notification
 */
export const showInfoToast = (message) => {
  toastify.info(message);
};

/**
 * Show warning toast notification
 */
export const showWarningToast = (message) => {
  toastify.warning(message);
};
