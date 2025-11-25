// src/utils/toast.js
import { toast } from 'react-toastify';

const toastConfig = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

export const showToast = {
  success: (message) => toast.success(message, toastConfig),
  error: (message) => toast.error(message, toastConfig),
  warning: (message) => toast.warning(message, toastConfig),
  info: (message) => toast.info(message, toastConfig),
};

export const showApiError = (error) => {
  const message = error?.response?.data?.message || error?.message || 'An error occurred';
  toast.error(message, toastConfig);
};

export const showApiSuccess = (message = 'Operation completed successfully') => {
  toast.success(message, toastConfig);
};

// Convenience aliases to match common usage across pages
export const showSuccessToast = (message) => showToast.success(message);
export const showErrorToast = (message) => showToast.error(message);