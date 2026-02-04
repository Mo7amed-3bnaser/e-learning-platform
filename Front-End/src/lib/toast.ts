import toast from 'react-hot-toast';

// تصميم موحد للـ toast
const toastStyles = {
  style: {
    background: '#fff',
    color: '#1f2937',
    padding: '16px',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
  },
  duration: 4000,
};

export const showSuccess = (message: string) => {
  toast.success(message, {
    ...toastStyles,
    icon: '✅',
  });
};

export const showError = (message: string) => {
  toast.error(message, {
    ...toastStyles,
    icon: '❌',
  });
};

export const showInfo = (message: string) => {
  toast(message, {
    ...toastStyles,
    icon: 'ℹ️',
  });
};

export const showWarning = (message: string) => {
  toast(message, {
    ...toastStyles,
    icon: '⚠️',
    style: {
      ...toastStyles.style,
      background: '#fff3cd',
      color: '#856404',
    },
  });
};

export const showLoading = (message: string) => {
  return toast.loading(message, toastStyles);
};

export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId);
};

// مساعد لمعالجة أخطاء الـ API
export const handleApiError = (error: unknown) => {
  const apiError = error as { response?: { data?: { message?: string } }; message?: string };
  const message =
    apiError?.response?.data?.message ||
    apiError?.message ||
    'حدث خطأ غير متوقع';
  showError(message);
};
